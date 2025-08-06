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
    // { value: "cancelled", label: "Cancelled", icon: <FaTimes className="text-white" />, color: "bg-red-500" }
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
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 rounded-xl shadow-2xl mb-8"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-white mb-2"
        >
          Track Your Package
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-blue-100 mb-6 text-lg"
        >
          Enter your tracking number to get real-time updates
        </motion.p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative flex-grow"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-blue-300" />
            </div>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-4 border-0 rounded-lg bg-white/90 focus:ring-2 focus:ring-white focus:bg-white transition-all duration-300 placeholder-blue-300 text-lg"
              placeholder="Enter your tracking number"
              required
            />
          </motion.div>
          <motion.button
            type="submit"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 flex items-center justify-center gap-2 shadow-lg text-lg"
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GiDeliveryDrone size={24} />
            Track Package
          </motion.button>
        </form>
      </motion.div>

      {/* Results */}
      {isError && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Parcel Summary */}
          <div className="p-8 border-b bg-gray-50">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Shipment Details</h2>
                <div className="flex flex-wrap items-center gap-4">
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="text-gray-600"
                  >
                    Tracking ID: <span className="font-mono font-semibold bg-blue-50 px-3 py-1.5 rounded-md">{parcel.trackingNumber}</span>
                  </motion.p>
                  {parcel.estimatedDelivery && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="text-gray-600"
                    >
                      Est. Delivery: <span className="font-semibold">
                        {new Date(parcel.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </motion.p>
                  )}
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="text-sm text-gray-500 flex items-center"
                  >
                    <RiLoader4Fill className="animate-spin mr-1" />
                    Last updated: {lastUpdated}
                  </motion.p>
                </div>
              </div>
            </motion.div>

            {/* Delivery Information */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-8"
            >
              <h3 className="font-bold text-gray-800 mb-5 text-xl">Delivery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                      <GiDeliveryDrone size={22} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Shipping Method</p>
                      <p className="font-medium text-lg">{parcel.courier || 'Standard Shipping'}</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                      <MdUpdate size={22} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Status</p>
                      <p className="font-medium text-lg">
                        {allStatuses.find(s => s.value === parcel.deliveryStatus[parcel.deliveryStatus.length - 1]?.status)?.label || 'Processing'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Delivery Status Timeline */}
          <div className="p-8">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-gray-800 mb-8"
            >
              Delivery Progress
            </motion.h2>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-10">
                {allStatuses.map((status, index) => {
                  const isCompleted = index < getCurrentStatusIndex();
                  const isCurrent = index === getCurrentStatusIndex();
                  const hasOccurred = parcel.deliveryStatus?.some(s => s.status === status.value);
                  
                  return (
                    <motion.div 
                      key={status.value}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
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
                            className={`flex-shrink-0 h-12 w-12 rounded-full ${status.color} flex items-center justify-center text-white shadow-lg`}
                          >
                            {status.icon}
                          </motion.div>
                        ) : isCompleted ? (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`flex-shrink-0 h-12 w-12 rounded-full ${status.color} flex items-center justify-center text-white shadow-lg`}
                          >
                            {status.icon}
                          </motion.div>
                        ) : (
                          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow-lg">
                            <BsClock className="text-gray-500" size={18} />
                          </div>
                        )}
                      </div>
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="ml-8 pb-10"
                      >
                        <div className="flex items-center">
                          <p className={`text-lg font-semibold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                            {status.label}
                          </p>
                          {isCurrent && (
                            <motion.span
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="ml-3 text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                            >
                              Active
                            </motion.span>
                          )}
                        </div>
                        {hasOccurred ? (
                          <>
                            <p className="text-gray-600 mt-2">
                              {parcel.deliveryStatus.find(s => s.status === status.value)?.description || 
                               `Package ${status.label.toLowerCase()}`}
                            </p>
                            <p className="text-sm text-gray-400 mt-3">
                              {new Date(parcel.deliveryStatus.find(s => s.status === status.value)?.date).toLocaleString('en-US', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {parcel.deliveryStatus.find(s => s.status === status.value)?.location && (
                              <div className="flex items-center text-gray-500 mt-2">
                                <FaMapMarkerAlt className="mr-2 text-gray-400" />
                                <span>{parcel.deliveryStatus.find(s => s.status === status.value)?.location}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-400 mt-2">
                            {isCurrent ? 'This step is currently in progress' : 'This step will occur next'}
                          </p>
                        )}
                      </motion.div>
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden p-10 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-5 bg-blue-50 rounded-full inline-block mb-6"
            >
              <GiDeliveryDrone className="text-blue-500" size={50} />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-gray-800 mb-3"
            >
              Track Your Shipment
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-gray-600 mb-8 text-lg"
            >
              Enter your tracking number above to see real-time updates on your package's journey.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-blue-50 border-l-4 border-blue-400 p-5 text-left rounded-lg"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaInfoCircle className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-medium text-blue-800">Where to find your tracking number</h3>
                  <p className="text-blue-700 mt-2">
                    Check your order confirmation email or the shipping confirmation from the seller.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TrackParcelPublic;