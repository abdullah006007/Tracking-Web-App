import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { useNavigate, useLocation } from 'react-router-dom';
import Spinner from '../../../Shared/Spinner';
import { motion } from 'framer-motion';

const MyParcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: parcels = [], refetch, isLoading, isRefetching } = useQuery({
    queryKey: ['my-parcels', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels?email=${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentSuccess = queryParams.get('payment_success');
    
    if (paymentSuccess === 'true') {
      Swal.fire({
        title: 'Payment Successful!',
        text: 'Your payment has been processed successfully.',
        icon: 'success'
      }).then(() => {
        navigate(location.pathname, { replace: true });
        refetch();
      });
    }
  }, [location, navigate, refetch]);

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete the parcel!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosSecure.delete(`/parcels/${id}`);
          await refetch();
          Swal.fire(
            'Deleted!',
            'Your parcel has been deleted.',
            'success'
          );
        } catch (error) {
          Swal.fire(
            'Error!',
            error.response?.data?.message || 'Failed to delete the parcel.',
            'error'
          );
        }
      }
    });
  };

  const handlePay = (id) => {
    navigate(`/dashboard/payment/${id}`);
  };

  const handleView = (parcel) => {
    setSelectedParcel(parcel);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedParcel(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return 'badge-success';
      case 'Processing':
        return 'badge-info';
      case 'Delivered':
        return 'badge-primary';
      case 'Cancelled':
        return 'badge-error';
      default:
        return 'badge-warning';
    }
  };

  if (isLoading || isRefetching) {
    return <Spinner></Spinner>
  }

  if (!parcels.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <motion.h2 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-2xl font-semibold mb-4"
        >
          📦 My Parcels
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600"
        >
          You don't have any parcels yet.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6"
    >
      <motion.h2 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8"
      >
        📦 My Parcels
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-x-auto bg-white rounded-xl shadow-lg"
      >
        <table className="table w-full">
          <thead className="bg-gray-100">
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Title</th>
              <th>Cost</th>
              <th>Created At</th>
              <th>Tracking ID</th>
              <th>Status</th>
              <th>Payment</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map((parcel, index) => (
              <motion.tr
                key={parcel._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td>{index + 1}</td>
                <td>
                  <div className="flex flex-col">
                    <span>{parcel.type === 'document' ? 'Document' : 'Non-document'}</span>
                    {parcel.type === 'non-document' && parcel.weight && (
                      <span className="text-xs text-gray-500">{parcel.weight} kg</span>
                    )}
                  </div>
                </td>
                <td>{parcel.title}</td>
                <td>${parcel.cost?.toFixed(2) || '0.00'}</td>
                <td>{new Date(parcel.creationDate).toLocaleDateString()}</td>
                <td className="font-mono text-xs">{parcel.trackingNumber}</td>
                <td>
                  <span className={`badge ${getStatusBadge(parcel.status)}`}>
                    {parcel.status || 'Pending'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${parcel.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                    {parcel.paymentStatus || 'Unpaid'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleView(parcel)}
                      className="btn btn-xs btn-outline btn-primary"
                    >
                      View
                    </motion.button>
                    {parcel.paymentStatus !== 'Paid' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePay(parcel._id)} 
                        className="btn btn-xs btn-outline btn-success"
                      >
                        Pay
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(parcel._id)}
                      className="btn btn-xs btn-outline btn-error"
                      disabled={parcel.status === 'Delivered' || parcel.paymentStatus === 'Paid'}
                    >
                      Delete
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Parcel Details Modal */}
      {isModalOpen && selectedParcel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Parcel Details</h3>
                <button
                  onClick={closeModal}
                  className="btn btn-circle btn-ghost"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Sender Information */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-blue-50 p-5 rounded-lg"
                >
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>🇨🇳</span> Sender Information
                  </h4>
                  <div className="space-y-3">
                    <p><span className="font-medium">Name:</span> {selectedParcel.senderName}</p>
                    <p><span className="font-medium">Contact:</span> {selectedParcel.senderContact}</p>
                    <p><span className="font-medium">Address:</span> {selectedParcel.senderAddress}, {selectedParcel.senderCity}, {selectedParcel.senderRegion}</p>
                    <p><span className="font-medium">Pickup Instructions:</span> {selectedParcel.pickupInstruction}</p>
                  </div>
                </motion.div>

                {/* Receiver Information */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-green-50 p-5 rounded-lg"
                >
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>🇿🇦</span> Receiver Information
                  </h4>
                  <div className="space-y-3">
                    <p><span className="font-medium">Name:</span> {selectedParcel.receiverName}</p>
                    <p><span className="font-medium">Contact:</span> {selectedParcel.receiverContact}</p>
                    <p><span className="font-medium">Address:</span> {selectedParcel.receiverAddress}, {selectedParcel.receiverCity}, {selectedParcel.receiverRegion}</p>
                    {selectedParcel.deliveryInstruction && (
                      <p><span className="font-medium">Delivery Instructions:</span> {selectedParcel.deliveryInstruction}</p>
                    )}
                  </div>
                </motion.div>

                {/* Parcel Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-yellow-50 p-5 rounded-lg md:col-span-2"
                >
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>📦</span> Parcel Information
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="font-medium">Type</p>
                      <p>{selectedParcel.type === 'document' ? 'Document' : 'Non-document'}</p>
                      {selectedParcel.type === 'non-document' && selectedParcel.weight && (
                        <p className="text-sm text-gray-600">{selectedParcel.weight} kg</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Title</p>
                      <p>{selectedParcel.title}</p>
                    </div>
                    <div>
                      <p className="font-medium">Cost</p>
                      <p>${selectedParcel.cost?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Created At</p>
                      <p>{new Date(selectedParcel.creationDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Tracking ID</p>
                      <p className="font-mono">{selectedParcel.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium">Status</p>
                      <span className={`badge ${getStatusBadge(selectedParcel.status)}`}>
                        {selectedParcel.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MyParcels;