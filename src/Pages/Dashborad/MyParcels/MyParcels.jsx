import { useQuery } from '@tanstack/react-query';
import React from 'react';
import Swal from 'sweetalert2';
import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { useNavigate } from 'react-router';

const MyParcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const { data: parcels = [], refetch, isLoading } = useQuery({
    queryKey: ['my-parcels', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels?email=${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email
  });

  const handleDelete = (id) => {
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
          Swal.fire(
            'Deleted!',
            'Your parcel has been deleted.',
            'success'
          );
          refetch();
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

  if (isLoading) {
    return <div className="text-center py-8">Loading your parcels...</div>;
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
    <div>
      <h2 className="text-2xl font-semibold mb-4">📦 My Parcels</h2>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full text-sm">
          <thead className="bg-base-200 text-base-content">
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Title</th>
              <th>Cost</th>
              <th>Created At</th>
              <th>Tracking ID</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map((parcel, index) => (
              <tr key={parcel._id}>
                <td>{index + 1}</td>
                <td>
                  {parcel.type === 'document' ? 'Document' : 'Non-document'}
                  {parcel.type === 'non-document' && parcel.weight && (
                    <span className="text-xs block">({parcel.weight} kg)</span>
                  )}
                </td>
                <td>{parcel.title}</td>
                <td>${parcel.cost?.toFixed(2) || '0.00'}</td>
                <td>{new Date(parcel.creationDate).toLocaleString()}</td>
                <td className="font-mono text-xs">{parcel.trackingNumber}</td>
                <td>
                  <span className={`badge ${getStatusBadge(parcel.status)}`}>
                    {parcel.status || 'Pending'}
                  </span>
                </td>
                <td className="flex gap-2 justify-center">
                  <button 
                    onClick={() => handleView(parcel._id)}
                    className="btn btn-sm btn-outline btn-primary"
                  >
                    View
                  </button>
                  {parcel.status !== 'Paid' && (
                    <button 
                      onClick={() => handlePay(parcel._id)} 
                      className="btn btn-sm btn-outline btn-success"
                      disabled={parcel.status === 'Paid'}
                    >
                      {parcel.status === 'Paid' ? 'Paid' : 'Pay'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(parcel._id)}
                    className="btn btn-sm btn-outline btn-error"
                    disabled={parcel.status === 'Delivered'}
                  >
                    Delete
                  </button>
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