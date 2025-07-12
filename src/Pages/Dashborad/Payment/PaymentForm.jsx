import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import Spinner from '../../../Shared/Spinner';

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { parcelId } = useParams()
    const axiosSecure = useAxiosSecure()


    //   tanstack part
    const { isPending, data: parcelInfo = {} } = useQuery({
        queryKey: ['parcels', parcelId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/parcels/${parcelId}`)
            return res.data

        }
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (isPending) {
        return <Spinner></Spinner>
    }
    console.log(parcelInfo);
    const amount = parcelInfo.cost
    const amountCents = amount * 100





    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        const card = elements.getElement(CardElement);
        if (!card) return;

        setIsProcessing(true);
        setErrorMessage('');
        setSuccessMessage('');

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card,
        });

        if (error) {
            console.error('Stripe error:', error);
            setErrorMessage(error.message);
        } else {
            console.log('PaymentMethod:', paymentMethod);
            setSuccessMessage('Payment method created successfully!');
            // Optional: send `paymentMethod.id` to backend for further payment processing
        }

        //step:2  create payment intent 
        const res = await axiosSecure.post('/create-payment-intent', {
            amountCents,
            parcelId
        })


        console.log('res from intent', res);


        const clientSecret = res.data.clientSecret

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: 'Jenny Rosen',
                },
            },
        });


        if (result.error) {
            console.log(result.error.message);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                console.log('Payment succeeded!');
                console.log(result);
            }
        }




        // console.log('res from intent', res);






        setIsProcessing(false);
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto"
            >
                <CardElement className="p-4 border rounded-xl" />
                <button
                    type="submit"
                    className="btn btn-primary w-full text-black"
                    disabled={!stripe || isProcessing}
                >
                    {isProcessing ? 'Processing...' : `Pay Now $${amount}`}
                </button>

                {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
                {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}
            </form>
        </div>
    );
};

export default PaymentForm;
