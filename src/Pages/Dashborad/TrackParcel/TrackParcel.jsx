import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FaSearch, FaCheck, FaTimes, FaTruck, 
  FaMapMarkerAlt, FaInfoCircle, FaWarehouse,
  FaBoxOpen, FaExternalLinkAlt, FaSpinner
} from 'react-icons/fa';
import { GiDeliveryDrone, GiProcessor } from 'react-icons/gi';
import { MdSecurity, MdUpdate, MdOutlineAssignmentTurnedIn } from 'react-icons/md';
import { motion } from 'framer-motion';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import Spinner from '../../../Shared/Spinner';

const TrackParcelPublic = () => {
  const axiosPublic = useAxiosPublic();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submittedTracking, setSubmittedTracking] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const statusConfig = [
    { value: "order_confirmed", label: "Order Confirmed", icon: <FaCheck />, color: "bg-blue-500" },
    // ... other statuses ...
    { value: "awaiting_courier", label: "With Courier", icon: <FaTruck />, color: "bg-blue-500" },
    { value: "in_transit", label: "In Transit", icon: <FaTruck />, color: "bg-blue-500" },
    { value: "delivered", label: "Delivered", icon: <FaCheck />, color: "bg-green-500" }
  ];

  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['trackParcelPublic', submittedTracking],
    queryFn: async () => {
      if (!submittedTracking) return null;
      const res = await axiosPublic.get(`/parcels/tracking/${submittedTracking}`);
      setLastUpdated(new Date().toLocaleTimeString());
      return res.data;
    },
    enabled: !!submittedTracking,
    refetchInterval: 30000
  });

  const parcel = response?.data;

  const getStatusIndex = () => {
    if (!parcel?.deliveryStatus) return -1;
    const lastStatus = parcel.deliveryStatus[parcel.deliveryStatus.length - 1]?.status;
    return statusConfig.findIndex(s => s.value === lastStatus);
  };

  const shouldShowCourierTracking = () => {
    return parcel?.courierTrackingCode && 
           ['awaiting_courier', 'in_transit', 'delivered'].includes(
             parcel.deliveryStatus?.slice(-1)[0]?.status
           );
  };

  const formatCourierEvents = () => {
    if (!parcel?.courierTrackingInfo?.events) return [];
    return parcel.courierTrackingInfo.events.map(event => ({
      ...event,
      isProof: event.data?.type === 'proof-of-delivery'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSubmittedTracking(trackingNumber.trim());
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Search Form */}
      <div className="bg-blue-500 p-6 rounded-xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Track Your Package</h1>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/90 focus:bg-white"
              placeholder="Enter tracking number"
              required
            />
          </div>
          <button 
            type="submit" 
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold"
          >
            Track
          </button>
        </form>
      </div>

      {/* Error Message */}
      {isError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <FaInfoCircle className="text-red-500 mr-2" />
            <p className="text-red-700">{error.message}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {parcel && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Parcel Summary */}
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold mb-4">Shipment Details</h2>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-blue-50 px-3 py-2 rounded-md">
                <p className="text-sm text-gray-600">Tracking ID</p>
                <p className="font-mono font-semibold">{parcel.trackingNumber}</p>
              </div>
              {parcel.estimatedDelivery && (
                <div className="bg-blue-50 px-3 py-2 rounded-md">
                  <p className="text-sm text-gray-600">Est. Delivery</p>
                  <p>{new Date(parcel.estimatedDelivery).toLocaleDateString()}</p>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <MdUpdate className="mr-1" /> 
                Last updated: {lastUpdated}
              </div>
            </div>

            {/* Courier Tracking Section */}
            {shouldShowCourierTracking() && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaTruck className="mr-2 text-blue-500" /> 
                    Courier Tracking
                  </h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {parcel.courierTrackingInfo?.courier || 'Courier Service'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <p className="font-medium">{parcel.courierTrackingCode}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-sm text-gray-500">Current Status</p>
                    <p className="font-medium capitalize">
                      {parcel.courierTrackingInfo?.status?.replace(/_/g, ' ') || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-sm text-gray-500">Last Update</p>
                    <p className="font-medium">
                      {parcel.courierTrackingInfo?.lastUpdate ? 
                        new Date(parcel.courierTrackingInfo.lastUpdate).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Tracking History */}
                {parcel.courierTrackingInfo?.events?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tracking History</h4>
                    <div className="space-y-3">
                      {formatCourierEvents().map((event, i) => (
                        <div key={i} className="bg-white p-3 rounded-md border-l-4 border-blue-400">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium capitalize">{event.status.replace(/_/g, ' ')}</p>
                              <p className="text-sm text-gray-600 mt-1">{event.message}</p>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(event.date).toLocaleString()}
                            </p>
                          </div>
                          {event.source && (
                            <p className="text-sm mt-2 flex items-center">
                              <FaMapMarkerAlt className="mr-1" /> {event.source}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Delivery Progress</h2>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-8">
                {statusConfig.map((status, index) => {
                  const isCompleted = index < getStatusIndex();
                  const isCurrent = index === getStatusIndex();
                  const hasOccurred = parcel.deliveryStatus?.some(s => s.status === status.value);

                  return (
                    <div key={status.value} className="flex items-start">
                      <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center 
                        ${isCurrent ? status.color : isCompleted ? status.color : 'bg-gray-200'}`}>
                        {status.icon}
                      </div>
                      <div className="ml-6 pb-8">
                        <p className={`text-lg font-medium ${isCurrent ? 'text-blue-600' : 
                          isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                          {status.label}
                        </p>
                        {hasOccurred ? (
                          <>
                            <p className="text-gray-600 mt-1">
                              {parcel.deliveryStatus.find(s => s.status === status.value)?.details}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(
                                parcel.deliveryStatus.find(s => s.status === status.value)?.date
                              ).toLocaleString()}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-400 mt-1">
                            {isCurrent ? 'In progress' : 'Pending'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackParcelPublic;