import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FaSearch, 
  FaCheck, 
  FaTruck,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaWarehouse,
  FaBoxOpen,
  FaBarcode,
  FaUser,
  FaClock
} from 'react-icons/fa';
import { GiDeliveryDrone } from 'react-icons/gi';
import { MdSecurity, MdUpdate, MdOutlineAssignmentTurnedIn } from 'react-icons/md';
import { RiLoader4Fill } from 'react-icons/ri';
import { BsClock, BsCheck2Circle } from 'react-icons/bs';
import { motion } from 'framer-motion';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import Spinner from '../../../Shared/Spinner';

const TrackParcelPublic = () => {
  const axiosPublic = useAxiosPublic();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submittedTracking, setSubmittedTracking] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // ShipLogic API bearer token
  const BEARER_TOKEN = "e625e493e8b542eeafdf82a60212c8a6";

  // Status configuration
  const allStatuses = [
    { value: "order_confirmed", label: "Order Confirmed", icon: <BsCheck2Circle className="text-white" />, color: "bg-blue-500" },
    { value: "quality_inspection", label: "Quality Inspection", icon: <FaSearch className="text-white" />, color: "bg-purple-500" },
    { value: "passed_inspection", label: "Passed Inspection", icon: <FaCheck className="text-white" />, color: "bg-green-500" },
    { value: "packed_for_warehouse", label: "Packed for Warehouse", icon: <FaBoxOpen className="text-white" />, color: "bg-yellow-500" },
    { value: "arrived_at_warehouse", label: "At Warehouse", icon: <FaWarehouse className="text-white" />, color: "bg-orange-500" },
    { value: "awaiting_departure", label: "Awaiting Departure", icon: <BsClock className="text-white" />, color: "bg-amber-500" },
    { value: "international_shipping", label: "International Shipping", icon: <GiDeliveryDrone className="text-white" />, color: "bg-sky-500" },
    { value: "arrived_at_customs", label: "At Customs", icon: <MdSecurity className="text-white" />, color: "bg-indigo-500" },
    { value: "clearance_finished", label: "Clearance Finished", icon: <MdOutlineAssignmentTurnedIn className="text-white" />, color: "bg-teal-500" },
    { value: "arrived_at_local_warehouse", label: "At Local Warehouse", icon: <FaWarehouse className="text-white" />, color: "bg-cyan-500" },
    { value: "local_quality_check", label: "Quality Check", icon: <FaCheck className="text-white" />, color: "bg-emerald-500" },
    { value: "awaiting_courier", label: "Awaiting Courier", icon: <FaClock className="text-white" />, color: "bg-indigo-500", description: "Waiting for courier pickup (2-3 days)" },
  ];

  // Enhanced Courier Guy status configuration
  const courierStatusConfig = {
    "submitted": {
      label: "Order Received",
      icon: <FaCheck className="text-white" />,
      color: "bg-gray-500",
      description: "Order has been received by courier"
    },
    "collected": {
      label: "Picked Up",
      icon: <FaTruck className="text-white" />,
      color: "bg-blue-500",
      description: "Package has been collected"
    },
    "in-transit": {
      label: "In Transit",
      icon: <GiDeliveryDrone className="text-white" />,
      color: "bg-yellow-500",
      description: "Package is on the way"
    },
    "at-destination-hub": {
      label: "At Facility",
      icon: <FaWarehouse className="text-white" />,
      color: "bg-purple-500",
      description: "At local distribution center"
    },
    "out-for-delivery": {
      label: "Out for Delivery",
      icon: <FaTruck className="text-white" />,
      color: "bg-orange-500",
      description: "With delivery driver"
    },
    "delivered": {
      label: "Delivered",
      icon: <BsCheck2Circle className="text-white" />,
      color: "bg-green-500",
      description: "Successfully delivered"
    }
  };

  const courierStatusDisplayNames = {
    ...courierStatusConfig,
    "awaiting_courier": {
      label: "Awaiting Courier",
      description: "Waiting for courier pickup (2-3 days)"
    }
  };

  // Fetch parcel info from backend
  const { data: parcelResponse, isLoading: isParcelLoading, isError: isParcelError, error: parcelError, refetch } = useQuery({
    queryKey: ['trackParcelPublic', submittedTracking],
    queryFn: async () => {
      if (!submittedTracking) return null;
      const res = await axiosPublic.get(`/parcels/tracking/${submittedTracking}`);
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch tracking information');
      }
      setLastUpdated(new Date().toLocaleTimeString());
      return res.data;
    },
    enabled: !!submittedTracking,
    refetchInterval: 30000,
    retry: false,
    staleTime: 10000
  });

  const parcel = parcelResponse?.data;

  // Helper functions
  const getCurrentStatusIndex = () => {
    if (!parcel?.deliveryStatus) return -1;
    const lastStatus = parcel.deliveryStatus[parcel.deliveryStatus.length - 1]?.status;
    return allStatuses.findIndex(s => s.value === lastStatus);
  };

  const shouldShowCourierTrackingSection = () => {
    if (!parcel) return false;
    const currentStatus = parcel.deliveryStatus[parcel.deliveryStatus.length - 1]?.status;
    return ['awaiting_courier', 'in_transit', 'delivered'].includes(currentStatus) && !!parcel.CourierGuyCode;
  };

  // Fetch Courier Guy tracking info from ShipLogic API
  const { data: courierResponse, isLoading: isCourierLoading } = useQuery({
    queryKey: ['courierTracking', parcel?.CourierGuyCode],
    queryFn: async () => {
      if (!parcel?.CourierGuyCode) return null;
      const response = await fetch(`https://api.shiplogic.com/v2/tracking/shipments?tracking_reference=${encodeURIComponent(parcel.CourierGuyCode)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Unable to track package');
      }
      return await response.json();
    },
    enabled: !!parcel?.CourierGuyCode && shouldShowCourierTrackingSection(),
    retry: false,
    staleTime: 10000
  });

  const shipment = courierResponse?.shipments?.[0];
  const recipientName = shipment?.recipient_name || 'Not available';

  useEffect(() => {
    if (submittedTracking) {
      const interval = setInterval(() => refetch(), 30000);
      return () => clearInterval(interval);
    }
  }, [submittedTracking, refetch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSubmittedTracking(trackingNumber.trim());
    }
  };

  // Format dates for display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Not available';
      let date = new Date(dateString);
      if (isNaN(date.getTime())) {
        date = new Date(dateString.replace('Z', ''));
      }
      if (isNaN(date.getTime())) {
        const [datePart, timePart] = dateString.split('T');
        if (datePart) {
          date = new Date(datePart + (timePart ? 'T' + timePart.split('.')[0] : ''));
        }
      }
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return dateString;
      }
      const options = { 
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString;
    }
  };

  // Format Courier Guy tracking events for display
  const formatCourierTrackingEvents = () => {
    if (!shipment?.tracking_events) return [];
    return shipment.tracking_events
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(event => ({
        date: event.date,
        status: event.status,
        location: event.source,
        message: event.message,
        isProofOfDelivery: event.data?.type === 'proof-of-delivery-images'
      }));
  };

  if (isParcelLoading || isCourierLoading) return <Spinner />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Search Form */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 rounded-xl shadow-2xl mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Track Your Package</h1>
        <p className="text-blue-100 mb-6 text-lg">Enter your tracking number to get real-time updates</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
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
          </div>
          <motion.button
            type="submit"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 flex items-center justify-center gap-2 shadow-lg text-lg"
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
          >
            <GiDeliveryDrone size={24} /> Track Package
          </motion.button>
        </form>
      </motion.div>

      {/* Error Message */}
      {isParcelError && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm"
        >
          <div className="flex items-center">
            <FaInfoCircle className="text-red-500 mr-2" />
            <p className="text-red-700 font-medium">{parcelError.message}</p>
          </div>
        </motion.div>
      )}

      {/* Parcel Details */}
      {parcel && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Parcel Summary */}
          <div className="p-8 border-b bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Shipment Details</h2>
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-gray-600">
                    Tracking ID: <span className="font-mono font-semibold bg-blue-50 px-3 py-1.5 rounded-md">{parcel.trackingNumber}</span>
                  </p>
                  {parcel.estimatedDelivery && (
                    <p className="text-gray-600">
                      Est. Delivery: <span className="font-semibold">
                        {new Date(parcel.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </p>
                  )}
                  <p className="text-sm text-gray-500 flex items-center">
                    <RiLoader4Fill className="animate-spin mr-1" /> Last updated: {lastUpdated}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="mt-8">
              <h3 className="font-bold text-gray-800 mb-5 text-xl">Delivery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                      <GiDeliveryDrone size={22} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Shipping Method</p>
                      <p className="font-medium text-lg">{shipment?.service_level_name || parcel.courier || 'Standard Shipping'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                      <MdUpdate size={22} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Status</p>
                      <p className="font-medium text-lg">
                        {shipment?.status 
                          ? courierStatusConfig[shipment.status]?.label || shipment.status.replace(/-/g, ' ')
                          : allStatuses.find(s => s.value === parcel.deliveryStatus[parcel.deliveryStatus.length - 1]?.status)?.label || 'Processing'}
                      </p>
                    </div>
                  </div>
                </div>
                {shouldShowCourierTrackingSection() && (
                  <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                        <FaBarcode size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Courier Guy Tracking Code</p>
                        <p className="font-medium text-lg">{parcel.CourierGuyCode}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Status Timeline */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Delivery Progress</h2>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-10">
                {allStatuses.map((status, index) => {
                  const isCompleted = index < getCurrentStatusIndex();
                  const isCurrent = index === getCurrentStatusIndex();
                  const hasOccurred = parcel.deliveryStatus?.some(s => s.status === status.value);
                  const isAwaitingCourier = status.value === 'awaiting_courier';

                  return (
                    <div key={status.value}>
                      <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-start"
                      >
                        <div className="relative z-10">
                          {isCurrent ? (
                            <motion.div
                              animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.7)", "0 0 0 10px rgba(59, 130, 246, 0)", "0 0 0 0 rgba(59, 130, 246, 0)"] }}
                              transition={{ duration: 1.5, ease: "easeOut", repeat: Infinity, repeatDelay: 0.5 }}
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
                        <motion.div whileHover={{ x: 5 }} className="ml-8 pb-10">
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
                                {parcel.deliveryStatus.find(s => s.status === status.value)?.details || `Package ${status.label.toLowerCase()}`}
                              </p>
                              <p className="text-sm text-gray-400 mt-3">
                                {new Date(parcel.deliveryStatus.find(s => s.status === status.value)?.date).toLocaleString('en-US', {
                                  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                              {parcel.deliveryStatus.find(s => s.status === status.value)?.location && (
                                <div className="flex items-center text-sm text-gray-500 mt-2">
                                  <FaMapMarkerAlt className="mr-2 text-gray-400" /> {parcel.deliveryStatus.find(s => s.status === status.value)?.location}
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-gray-400 mt-2">
                              {isCurrent ? 'This step is currently in progress' : `This step will occur next`}
                            </p>
                          )}
                        </motion.div>
                      </motion.div>

                      {/* Courier Tracking Section - Show right after Awaiting Courier status */}
                      {isAwaitingCourier && shouldShowCourierTrackingSection() && (
                        <div className="ml-20 mb-10">
                          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            {/* Status Progress Tracker */}
                            <div className="mb-8">
                              <div className="relative">
                                {/* Progress Line */}
                                <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -translate-y-1/2"></div>
                                
                                {/* Status Indicators */}
                                <div className="relative flex justify-between">
                                  {Object.entries(courierStatusConfig).map(([statusKey, statusData], index) => {
                                    const isActive = shipment?.status === statusKey;
                                    const isCompleted = shipment?.status === 'delivered' || 
                                                      (shipment?.status === 'out-for-delivery' && index < 5) ||
                                                      (shipment?.status === 'at-destination-hub' && index < 4) ||
                                                      (shipment?.status === 'in-transit' && index < 3) ||
                                                      (shipment?.status === 'collected' && index < 2) ||
                                                      (shipment?.status === 'submitted' && index < 1);

                                    return (
                                      <div key={statusKey} className="flex flex-col items-center z-10">
                                        <motion.div
                                          animate={isActive ? {
                                            scale: [1, 1.2, 1],
                                            boxShadow: ["0 0 0 0 rgba(99, 102, 241, 0.7)", "0 0 0 10px rgba(99, 102, 241, 0)", "0 0 0 0 rgba(99, 102, 241, 0)"]
                                          } : {}}
                                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                          className={`h-10 w-10 rounded-full flex items-center justify-center ${isActive ? 'ring-4 ring-indigo-300 ' + statusData.color : isCompleted ? statusData.color : 'bg-gray-300'} mb-2`}
                                        >
                                          {statusData.icon}
                                        </motion.div>
                                        <p className={`text-xs font-medium text-center ${isActive ? 'text-indigo-600 font-bold' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                          {statusData.label}
                                        </p>
                                        {isActive && (
                                          <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute top-12 mt-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full whitespace-nowrap"
                                          >
                                            Current Status
                                          </motion.div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Current Status Description */}
                              {shipment?.status && (
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                  className="mt-6 text-center"
                                >
                                  <p className="text-lg font-medium text-gray-800">
                                    {courierStatusConfig[shipment.status]?.label || shipment.status}
                                  </p>
                                  <p className="text-gray-600 mt-1">
                                    {courierStatusConfig[shipment.status]?.description || 'Package is in transit'}
                                  </p>
                                  {shipment.status === 'awaiting_courier' && (
                                    <p className="text-sm text-indigo-600 mt-2">
                                      <FaClock className="inline mr-1" /> Expected to be received within 2-3 days
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </div>

                            {/* Recipient Information */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                              <div className="flex items-center">
                                <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                                  <FaUser size={16} />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Recipient</p>
                                  <p className="font-medium text-gray-800">{recipientName}</p>
                                </div>
                              </div>
                            </div>

                            {/* Tracking Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                                <p className="font-medium text-gray-800">{parcel.CourierGuyCode}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500 mb-1">Last Location</p>
                                <p className="font-medium text-gray-800">
                                  {shipment?.tracking_events?.[0]?.source || 'N/A'}
                                </p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                                <p className="font-medium text-gray-800">
                                  {shipment?.estimated_delivery_date ? formatDate(shipment.estimated_delivery_date) : 'N/A'}
                                </p>
                              </div>
                            </div>

                            {/* Tracking History */}
                            <div className="mt-6">
                              <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center">
                                <MdUpdate className="mr-2" /> Tracking History
                              </h4>
                              <div className="space-y-3">
                                {formatCourierTrackingEvents().length > 0 ? (
                                  formatCourierTrackingEvents().map((event, index) => {
                                    const statusConfig = courierStatusConfig[event.status] || {};
                                    const isCurrent = index === 0;
                                    
                                    return (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-4 rounded-lg border-l-4 ${isCurrent ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}
                                      >
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                                          <div className="mb-2 sm:mb-0">
                                            <div className="flex items-center">
                                              <div className={`p-1 rounded-full ${statusConfig.color || 'bg-gray-300'} mr-2`}>
                                                {statusConfig.icon || <FaTruck className="text-white text-xs" />}
                                              </div>
                                              <p className={`font-medium ${isCurrent ? 'text-indigo-800' : 'text-gray-800'}`}>
                                                {courierStatusConfig[event.status]?.label || event.status?.replace(/-/g, ' ')}
                                              </p>
                                            </div>
                                            {event.message && (
                                              <p className="text-sm text-gray-600 mt-1">{event.message}</p>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-500 whitespace-nowrap sm:ml-4 sm:text-right">
                                            {formatDate(event.date)}
                                          </p>
                                        </div>
                                        {event.location && (
                                          <div className="flex items-center text-sm text-gray-500 mt-2">
                                            <FaMapMarkerAlt className="mr-2 text-gray-400" /> 
                                            <span>{event.location}</span>
                                          </div>
                                        )}
                                        {isCurrent && (
                                          <div className="mt-2 text-xs text-indigo-600 font-medium flex items-center">
                                            <RiLoader4Fill className="animate-spin mr-1" /> ACTIVE STATUS
                                          </div>
                                        )}
                                      </motion.div>
                                    );
                                  })
                                ) : (
                                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                                    <p>No tracking events available yet.</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-gray-400 mt-6 text-center">
                              Tracking information provided by ShipLogic API
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!parcel && !isParcelError && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden p-10 text-center"
        >
          <div className="max-w-md mx-auto">
            <motion.div whileHover={{ scale: 1.05 }} className="p-5 bg-blue-50 rounded-full inline-block mb-6">
              <GiDeliveryDrone className="text-blue-500" size={50} />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Track Your Shipment</h2>
            <p className="text-gray-600 mb-8 text-lg">Enter your tracking number above to see real-time updates on your package's journey.</p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-5 text-left rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaInfoCircle className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-medium text-blue-800">Where to find your tracking number</h3>
                  <p className="text-blue-700 mt-2">Check your order confirmation email or the shipping confirmation from the seller.</p>
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