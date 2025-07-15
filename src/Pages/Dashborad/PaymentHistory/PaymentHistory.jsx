import { useQuery } from '@tanstack/react-query';
import React from 'react';
import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import Spinner from '../../../Shared/Spinner';

const PaymentHistory = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payment-history', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/payments?email=${user?.email}`);
      return res.data;
    },
    // enabled: !!user?.email,
  });

  if (isLoading) {
    return <Spinner></Spinner>
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold mb-2">💳 Payment History</h2>
        <p className="text-gray-600">No payment records found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">💳 Payment History</h2>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full text-sm">
          <thead className="bg-base-200 text-base-content">
            <tr>
              <th>#</th>
              <th>Tracking Number</th>
              <th>Amount</th>

              <th>Transaction ID</th>
              <th>Status</th>
              <th>Paid At</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment._id}>
                <td>{index + 1}</td>
                <td className="font-mono text-xs">{payment.trackingNumber}</td>
                <td>${payment.amount?.toFixed(2)}</td>
      
                <td className="font-mono text-xs">
                    
                    {payment.transactionId}
                    
                    
                    </td>
                <td>
                  <span
                    className={`badge ${
                      payment.status === 'Success'
                        ? 'badge-success'
                        : 'badge-error'
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td>{new Date(payment.paid_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
