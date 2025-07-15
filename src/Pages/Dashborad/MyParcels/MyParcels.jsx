import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { useNavigate, useLocation } from 'react-router-dom';
import Spinner from '../../../Shared/Spinner';

const MyParcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: parcels = [], refetch, isLoading, isRefetching } = useQuery({
    queryKey: ['my-parcels', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels?email=${user?.email}`, 
      
        
        
       );
      return res.data;
    },
    enabled: !!user?.email,
    refetchOnWindowFocus: true, // Add this to refetch when window regains focus
  });

  // Check for payment success in URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentSuccess = queryParams.get('payment_success');
    
    if (paymentSuccess === 'true') {
      Swal.fire({
        title: 'Payment Successful!',
        text: 'Your payment has been processed successfully.',
        icon: 'success'
      }).then(() => {
        // Remove the query param and refetch data
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

  const handleView = (id) => {
    navigate(`/dashboard/parcel-details/${id}`);
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
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold mb-2">📦 My Parcels</h2>
        <p className="text-gray-600">You don't have any parcels yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">📦 My Parcels</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
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
              <tr key={parcel._id} className="hover:bg-gray-50">
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
                    <button 
                      onClick={() => handleView(parcel._id)}
                      className="btn btn-xs btn-outline btn-primary"
                    >
                      View
                    </button>
                    {parcel.paymentStatus !== 'Paid' && (
                      <button 
                        onClick={() => handlePay(parcel._id)} 
                        className="btn btn-xs btn-outline btn-success"
                      >
                        Pay
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(parcel._id)}
                      className="btn btn-xs btn-outline btn-error"
                      disabled={parcel.status === 'Delivered' || parcel.paymentStatus === 'Paid'}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyParcels;