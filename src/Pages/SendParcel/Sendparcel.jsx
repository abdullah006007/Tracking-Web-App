import React from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { format } from "date-fns";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { useNavigate } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
import { motion } from "framer-motion";

const Sendparcel = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const { user } = useAuth();

  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const parcelType = watch("type");
  const weight = watch("weight");

  const southAfricanRegions = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
    "Mpumalanga", "North West", "Northern Cape", "Western Cape"
  ];

  const chineseRegions = [
    "Beijing", "Shanghai", "Tianjin", "Chongqing", "Guangdong", "Zhejiang",
    "Jiangsu", "Fujian", "Sichuan", "Hunan", "Hubei", "Henan", "Shandong",
    "Liaoning", "Jilin", "Heilongjiang"
  ];

  const generateTrackingNumber = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const calculateCost = (type, weight = 0) => {
    const baseCost = 50;
    if (type === "document") {
      return baseCost;
    } else {
      return baseCost + (Math.max(weight, 0.1) * 10);
    }
  };

  const onSubmit = async (data) => {
    const trackingNumber = generateTrackingNumber();
    const creationDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const cost = calculateCost(data.type, parseFloat(data.weight || 0));

    const parcelData = {
      ...data,
      trackingNumber,
      creationDate,
      status: "Processing",
      cost,
      paymentStatus: "Unpaid",
      deliveryStatus: [
        {
          status: "Processing",
          date: creationDate,
          location: "China",
          details: "Parcel registered in the system"
        }
      ]
    };

    try {
      const confirmResult = await Swal.fire({
        title: 'Confirm Parcel Submission?',
        html: `
          <div class="text-left">
            <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p><strong>Parcel Type:</strong> ${data.type}</p>
            <p><strong>From:</strong> ${data.senderRegion}, China</p>
            <p><strong>To:</strong> ${data.receiverRegion}, South Africa</p>
            <p><strong>Estimated Cost:</strong> $${cost.toFixed(2)}</p>
            <p><strong>Created At:</strong> ${creationDate}</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm & Save',
        cancelButtonText: 'Cancel'
      });

      if (!confirmResult.isConfirmed) return;

      Swal.fire({
        title: 'Processing...',
        text: 'Please wait while we save your parcel information',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const response = await axiosSecure.post('/parcels', parcelData);
      
      if (response.data.insertedId) {
        await Swal.fire({
          title: 'Parcel Created Successfully!',
          html: `
            <div class="text-left">
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              <p><strong>Total Cost:</strong> $${cost.toFixed(2)}</p>
              <p>Your parcel has been registered in our system.</p>
              <p>You will receive updates at: <strong>${data.userEmail}</strong></p>
              <p class="mt-4 font-semibold">Please proceed to payment to complete your booking.</p>
            </div>
          `,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Proceed to Payment',
          cancelButtonText: 'Pay Later'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(`/dashboard/payment/${response.data.insertedId}`);
          } else {
            navigate('/dashboard/myParcels');
          }
        });
        reset();
      } else {
        throw new Error('Failed to save parcel');
      }
    } catch (error) {
      console.error('Error creating parcel:', error);
      let errorMessage = 'Failed to create parcel. Please try again.';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'API endpoint not found. Please contact support.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto p-4 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl  font-bold mb-2 text-blue-800"
        >
          International Parcel Booking
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-gray-600"
        >
          China to South Africa Shipping
        </motion.p>
      </motion.div>

      {parcelType && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="alert alert-info mb-8 shadow-lg"
        >
          <div>
            <span className="font-semibold">Estimated Cost: ${calculateCost(parcelType, parseFloat(weight || 0)).toFixed(2)}</span>
            {parcelType === "non-document" && (
              <span className="text-sm block mt-1">($50 base + $10 per kg)</span>
            )}
            {parcelType === "document" && (
              <span className="text-sm block mt-1">(Flat rate $50 for documents)</span>
            )}
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-xl font-semibold mb-5 flex items-center gap-2"
          >
            <span className="text-blue-500">📧</span> Your Contact Information
          </motion.h2>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <label className="label">Email</label>
              <input
                type="email"
                value={user.email}
                readOnly
                {...register("userEmail", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className="input input-bordered w-full focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
              {errors.userEmail && <p className="text-red-500 mt-1">{errors.userEmail.message}</p>}
            </motion.div>
          </div>
        </motion.div>

        {/* Parcel Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-xl font-semibold mb-5 flex items-center gap-2"
          >
            <span className="text-blue-500">📦</span> Parcel Information
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <label className="label">Type</label>
              <select 
                {...register("type", { required: "Type is required" })} 
                className="select select-bordered w-full focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type...</option>
                <option value="document">Document</option>
                <option value="non-document">Non-Document</option>
              </select>
              {errors.type && <p className="text-red-500 mt-1">{errors.type.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <label className="label">Title/Description</label>
              <input
                {...register("title", { required: "Title is required" })}
                className="input input-bordered w-full focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Important documents"
              />
              {errors.title && <p className="text-red-500 mt-1">{errors.title.message}</p>}
            </motion.div>

            {parcelType === "non-document" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                viewport={{ once: true }}
                className="sm:col-span-2"
              >
                <label className="label">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register("weight", {
                    required: "Weight is required for non-documents",
                    min: { value: 0.1, message: "Weight must be at least 0.1 kg" }
                  })}
                  className="input input-bordered w-full focus:ring-2 focus:ring-blue-500"
                />
                {errors.weight && <p className="text-red-500 mt-1">{errors.weight.message}</p>}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Sender Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-xl font-semibold mb-5 flex items-center gap-2"
          >
            <span className="text-blue-500">🇨🇳</span> Sender Information (China)
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <label className="label">Full Name</label>
              <input 
                {...register("senderName", { required: "Name is required" })} 
                className="input input-bordered w-full focus:ring-2 focus:ring-blue-500" 
                placeholder="Sender's name" 
              />
              {errors.senderName && <p className="text-red-500 mt-1">{errors.senderName.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <label className="label">Contact Number</label>
              <input
                {...register("senderContact", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^[0-9+\- ]+$/,
                    message: "Invalid phone number"
                  }
                })}
                className="input input-bordered w-full focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. +86 123 4567 8910"
              />
              {errors.senderContact && <p className="text-red-500 mt-1">{errors.senderContact.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <label className="label">Region/Province</label>
              <select 
                {...register("senderRegion", { required: "Region is required" })} 
                className="select select-bordered w-full focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                {chineseRegions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.senderRegion && <p className="text-red-500 mt-1">{errors.senderRegion.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <label className="label">City</label>
              <input 
                {...register("senderCity", { required: "City is required" })} 
                className="input input-bordered w-full focus:ring-2 focus:ring-blue-500" 
                placeholder="e.g. Shanghai" 
              />
              {errors.senderCity && <p className="text-red-500 mt-1">{errors.senderCity.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              viewport={{ once: true }}
              className="sm:col-span-2"
            >
              <label className="label">Address</label>
              <input 
                {...register("senderAddress", { required: "Address is required" })} 
                className="input input-bordered w-full focus:ring-2 focus:ring-blue-500" 
                placeholder="Street, district..." 
              />
              {errors.senderAddress && <p className="text-red-500 mt-1">{errors.senderAddress.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              viewport={{ once: true }}
              className="sm:col-span-2"
            >
              <label className="label">Pickup Instructions</label>
              <textarea 
                {...register("pickupInstruction", { required: "Instructions required" })} 
                className="textarea textarea-bordered w-full focus:ring-2 focus:ring-blue-500" 
                rows={3} 
                placeholder="Any special instructions" 
              />
              {errors.pickupInstruction && <p className="text-red-500 mt-1">{errors.pickupInstruction.message}</p>}
            </motion.div>
          </div>
        </motion.div>

        {/* Receiver Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-xl font-semibold mb-5 flex items-center gap-2"
          >
            <span className="text-blue-500">🇿🇦</span> Receiver Information (South Africa)
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <label className="label">Full Name</label>
              <input 
                {...register("receiverName", { required: "Name is required" })} 
                className="input input-bordered w-full focus:ring-2 focus:ring-blue-500" 
                placeholder="Receiver's name" 
              />
              {errors.receiverName && <p className="text-red-500 mt-1">{errors.receiverName.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <label className="label">Contact Number</label>
              <input
                {...register("receiverContact", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^[0-9+\- ]+$/,
                    message: "Invalid phone number"
                  }
                })}
                className="input input-bordered w-full focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. +27 12 345 6789"
              />
              {errors.receiverContact && <p className="text-red-500 mt-1">{errors.receiverContact.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <label className="label">Province</label>
              <select 
                {...register("receiverRegion", { required: "Province is required" })} 
                className="select select-bordered w-full focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                {southAfricanRegions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.receiverRegion && <p className="text-red-500 mt-1">{errors.receiverRegion.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <label className="label">City</label>
              <input 
                {...register("receiverCity", { required: "City is required" })} 
                className="input input-bordered w-full focus:ring-2 focus:ring-blue-500" 
                placeholder="e.g. Johannesburg" 
              />
              {errors.receiverCity && <p className="text-red-500 mt-1">{errors.receiverCity.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              viewport={{ once: true }}
              className="sm:col-span-2"
            >
              <label className="label">Address</label>
              <input 
                {...register("receiverAddress", { required: "Address is required" })} 
                className="input input-bordered w-full focus:ring-2 focus:ring-blue-500" 
                placeholder="Street address..." 
              />
              {errors.receiverAddress && <p className="text-red-500 mt-1">{errors.receiverAddress.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              viewport={{ once: true }}
              className="sm:col-span-2"
            >
              <label className="label">Delivery Instructions (Optional)</label>
              <textarea 
                {...register("deliveryInstruction")} 
                className="textarea textarea-bordered w-full focus:ring-2 focus:ring-blue-500" 
                rows={3} 
                placeholder="Any delivery instructions" 
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <motion.button
            type="submit"
            className="btn btn-primary px-10 py-4 text-lg font-semibold shadow-lg"
            whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(0, 98, 255, 0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            Submit Parcel
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Sendparcel;