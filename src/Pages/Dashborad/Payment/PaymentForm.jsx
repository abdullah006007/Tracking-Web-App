import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import Spinner from '../../../Shared/Spinner';
import useAuth from '../../../Hooks/useAuth';
import Swal from 'sweetalert2';

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { parcelId } = useParams();
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const navigate = useNavigate();

    // tanstack query with error handling
    const { isPending, data: parcelInfo = {}, isError } = useQuery({
        queryKey: ['parcels', parcelId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/parcels/${parcelId}`);
            return res.data;
        },
        retry: 2
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (isPending) {
        return <Spinner></Spinner>;
    }

    if (isError) {
        return <div className="text-red-500 text-center p-4">Failed to load parcel details</div>;
    }

    const amount = parcelInfo.cost;
    const amountCents = Math.round(amount * 100);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setErrorMessage('Payment system is not ready. Please try again.');
            return;
        }

        const card = elements.getElement(CardElement);
        if (!card) {
            setErrorMessage('Please complete your card details.');
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        try {
            // Step 1: Create payment intent
            const { data: intentData } = await axiosSecure.post('/create-payment-intent', {
                amountCents,
                parcelId
            });

            if (!intentData?.clientSecret) {
                throw new Error('Failed to initialize payment');
            }

            // Step 2: Confirm card payment
            const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
                intentData.clientSecret,
                {
                    payment_method: {
                        card,
                        billing_details: {
                            name: user?.displayName || 'Customer',
                            email: user?.email || 'unknown@example.com'
                        },
                    },
                }
            );

            if (paymentError) {
                throw paymentError;
            }

            if (paymentIntent?.status === 'succeeded') {
                // Step 3: Record payment in database
                const paymentData = {
                    parcelId: parcelInfo._id,
                    trackingNumber: parcelInfo.trackingNumber,
                    amount: amount,
                    userEmail: user.email,
                    paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
                    transactionId: paymentIntent.id,
                };

                const { data: paymentResult } = await axiosSecure.post('/payments', paymentData);
                
                if (paymentResult?.success) {
                    await Swal.fire({
                        title: 'Payment Successful!',
                        text: `Your payment of $${amount.toFixed(2)} was processed successfully.`,
                        icon: 'success',
                        confirmButtonText: 'View Parcels',
                    });
                    navigate('/dashboard/my-parcels?payment_success=true', { replace: true });
                } else {
                    throw new Error('Payment completed but record failed');
                }
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            setErrorMessage(error.message || 'Payment failed. Please try again.');
            Swal.fire({
                title: 'Payment Failed',
                text: error.message || 'There was an issue processing your payment',
                icon: 'error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto"
            >
                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Payment Details</h2>
                    <p className="text-gray-600 mb-1">Tracking #: {parcelInfo.trackingNumber}</p>
                    <p className="text-gray-600">Amount to pay: ${amount.toFixed(2)}</p>
                </div>
                
                <div className="p-4 border rounded-xl bg-gray-50">
                    <CardElement 
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                            hidePostalCode: true
                        }}
                    />
                </div>
                
                <button
                    type="submit"
                    className="btn btn-primary w-full text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!stripe || isProcessing}
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        `Pay $${amount.toFixed(2)}`
                    )}
                </button>

                {errorMessage && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {errorMessage}
                    </div>
                )}
            </form>
        </div>
    );
};

export default PaymentForm;