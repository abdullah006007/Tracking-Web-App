import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FaSearch, 
  FaCheck, 
  FaTimes,
  FaTruck,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaWarehouse,
  FaBoxOpen
} from 'react-icons/fa';
import { GiDeliveryDrone, GiProcessor } from 'react-icons/gi';
import { MdSecurity, MdUpdate, MdOutlineAssignmentTurnedIn } from 'react-icons/md';
import { RiLoader4Fill, RiInboxUnarchiveFill } from 'react-icons/ri';
import { BsBoxSeam, BsClock, BsCheck2Circle } from 'react-icons/bs';
import { motion } from 'framer-motion';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import Spinner from '../../../Shared/Spinner';

const TrackParcelPublic = () => {
  const axiosPublic = useAxiosPublic();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submittedTracking, setSubmittedTracking] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // Complete status configuration
  const allStatuses = [
    { value: "order_confirmed", label: "Order Confirmed", icon: <BsCheck2Circle className="text-white" />, color: "bg-blue-500" },
    { value: "quality_inspection", label: "Quality Inspection", icon: "🔍", color: "bg-purple-500" },
    { value: "passed_inspection", label: "Passed Inspection", icon: <FaCheck className="text-white" />, color: "bg-green-500" },
    { value: "packed_for_warehouse", label: "Packed for Warehouse", icon: <FaBoxOpen className="text-white" />, color: "bg-yellow-500" },
    { value: "arrived_at_warehouse", label: "At Warehouse", icon: <FaWarehouse className="text-white" />, color: "bg-orange-500" },
    { value: "awaiting_departure", label: "Awaiting Departure", icon: <BsClock className="text-white" />, color: "bg-amber-500" },
    { value: "international_shipping", label: "International Shipping", icon: <GiDeliveryDrone className="text-white" />, color: "bg-sky-500" },
    { value: "arrived_at_customs", label: "At Customs", icon: <MdSecurity className="text-white" />, color: "bg-indigo-500" },
    { value: "clearance_finished", label: "Clearance Finished", icon: <MdOutlineAssignmentTurnedIn className="text-white" />, color: "bg-teal-500" },
    { value: "arrived_at_local_warehouse", label: "At Local Warehouse", icon: <FaWarehouse className="text-white" />, color: "bg-cyan-500" },
    { value: "local_quality_check", label: "Quality Check", icon: <FaCheck className="text-white" />, color: "bg-emerald-500" },
    { value: "awaiting_courier", label: "Awaiting Courier", icon: <FaTruck className="text-white" />, color: "bg-lime-500" },
    { value: "in_transit", label: "In Transit", icon: <FaTruck className="text-white" />, color: "bg-blue-500" },
    { value: "delivered", label: "Delivered", icon: <FaCheck className="text-white" />, color: "bg-green-500" },
    { value: "cancelled", label: "Cancelled", icon: <FaTimes className="text-white" />, color: "bg-red-500" }
  ];

  // Fetch tracking info with auto-refresh
  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['trackParcelPublic', submittedTracking],
    queryFn: async () => {
      if (!submittedTracking) return null;
      try {
        const res = await axiosPublic.get(`/parcels/tracking/${submittedTracking}`);
        if (!res.data.success) {
          throw new Error(res.data.message || 'Failed to fetch tracking information');
        }
        setLastUpdated(new Date().toLocaleTimeString());
        return res.data;
      } catch (err) {
        // Handle different error cases
        if (err.response?.status === 404) {
          throw new Error('Tracking number not found. Please verify your tracking number.');
        }
        throw new Error(err.response?.data?.message || 'Failed to fetch tracking information');
      }
    },
    enabled: !!submittedTracking,
    refetchInterval: 30000,
    retry: false,
    staleTime: 10000
  });

  const parcel = response?.data;

  useEffect(() => {
    if (submittedTracking) {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [submittedTracking, refetch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSubmittedTracking(trackingNumber.trim());
    }
  };

  const getCurrentStatusIndex = () => {
    if (!parcel?.deliveryStatus) return -1;
    const lastStatus = parcel.deliveryStatus[parcel.deliveryStatus.length - 1]?.status;
    return allStatuses.findIndex(s => s.value === lastStatus);
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Search Form */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-xl shadow-lg mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Track Your Package</h1>
        <p className="text-blue-100 mb-6">Enter your tracking number to get real-time updates</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-blue-300" />
            </div>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-0 rounded-lg bg-white/90 focus:ring-2 focus:ring-white focus:bg-white transition-all duration-300 placeholder-blue-300"
              placeholder="Enter your tracking number"
              required
            />
          </div>
          <motion.button
            type="submit"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center justify-center gap-2 shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GiDeliveryDrone size={20} />
            Track Package
          </motion.button>
        </form>
      </div>

      {/* Results */}
      {isError && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm"
        >
          <div className="flex items-center">
            <FaInfoCircle className="text-red-500 mr-2" />
            <p className="text-red-700 font-medium">{error.message}</p>
          </div>
        </motion.div>
      )}

      {parcel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Parcel Summary */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Shipment Details</h2>
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-gray-600">Tracking ID: <span className="font-mono font-semibold bg-blue-50 px-2 py-1 rounded">{parcel.trackingNumber}</span></p>
                  {parcel.estimatedDelivery && (
                    <p className="text-gray-600">Est. Delivery: <span className="font-semibold">
                      {new Date(parcel.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span></p>
                  )}
                  <p className="text-sm text-gray-500 flex items-center">
                    <RiLoader4Fill className="animate-spin mr-1" />
                    Last updated: {lastUpdated}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="mt-6">
              <h3 className="font-bold text-gray-800 mb-4">Delivery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                      <GiDeliveryDrone size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Shipping Method</p>
                      <p className="font-medium">{parcel.courier || 'Standard Shipping'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                      <MdUpdate size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Status</p>
                      <p className="font-medium">
                        {allStatuses.find(s => s.value === parcel.deliveryStatus[parcel.deliveryStatus.length - 1]?.status)?.label || 'Processing'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Status Timeline */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Delivery Progress</h2>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-8">
                {allStatuses.map((status, index) => {
                  const isCompleted = index < getCurrentStatusIndex();
                  const isCurrent = index === getCurrentStatusIndex();
                  const hasOccurred = parcel.deliveryStatus?.some(s => s.status === status.value);
                  
                  return (
                    <motion.div 
                      key={status.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start"
                    >
                      <div className="relative z-10">
                        {isCurrent ? (
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              boxShadow: [
                                `0 0 0 0 rgba(59, 130, 246, 0.7)`,
                                `0 0 0 10px rgba(59, 130, 246, 0)`,
                                `0 0 0 0 rgba(59, 130, 246, 0)`
                              ]
                            }}
                            transition={{
                              duration: 1.5,
                              ease: "easeOut",
                              repeat: Infinity,
                              repeatDelay: 0.5
                            }}
                            className={`flex-shrink-0 h-10 w-10 rounded-full ${status.color} flex items-center justify-center text-white shadow-md`}
                          >
                            {status.icon}
                          </motion.div>
                        ) : isCompleted ? (
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full ${status.color} flex items-center justify-center text-white shadow-md`}>
                            {status.icon}
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow-md">
                            <BsClock className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-6 pb-8">
                        <div className="flex items-center">
                          <p className={`font-semibold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                            {status.label}
                          </p>
                          {isCurrent && (
                            <motion.span
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                            >
                              Active
                            </motion.span>
                          )}
                        </div>
                        {hasOccurred ? (
                          <>
                            <p className="text-sm text-gray-600 mt-1">
                              {parcel.deliveryStatus.find(s => s.status === status.value)?.description || 
                               `Package ${status.label.toLowerCase()}`}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(parcel.deliveryStatus.find(s => s.status === status.value)?.date).toLocaleString('en-US', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {parcel.deliveryStatus.find(s => s.status === status.value)?.location && (
                              <div className="flex items-center text-sm text-gray-500 mt-2">
                                <FaMapMarkerAlt className="mr-1 text-gray-400" />
                                <span>{parcel.deliveryStatus.find(s => s.status === status.value)?.location}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-400 mt-1">
                            {isCurrent ? 'This step is currently in progress' : 'This step will occur next'}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!parcel && !isError && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center"
        >
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-blue-50 rounded-full inline-block mb-4">
              <GiDeliveryDrone className="text-blue-500" size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Track Your Shipment</h2>
            <p className="text-gray-600 mb-6">Enter your tracking number above to see real-time updates on your package's journey.</p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-left rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaInfoCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Where to find your tracking number</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Check your order confirmation email or the shipping confirmation from the seller.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TrackParcelPublic;