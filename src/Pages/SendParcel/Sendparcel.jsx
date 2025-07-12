// File: Sendparcel.jsx
import React from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { format } from "date-fns";
import useAxiosSecure from "../../Hooks/useAxiosSecure";

const Sendparcel = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const axiosSecure = useAxiosSecure();
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
    const baseCost = 50; // Base cost in USD
    if (type === "document") {
      return baseCost;
    } else {
      // For non-documents, add $10 per kg
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
      console.log(response.data);
  
      if (response.data.insertedId) {
        await Swal.fire({
          title: 'Parcel Created Successfully!',
          html: `
            <div class="text-left">
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              <p><strong>Total Cost:</strong> $${cost.toFixed(2)}</p>
              <p>Your parcel has been registered in our system.</p>
              <p>You will receive updates at: <strong>${data.userEmail}</strong></p>
              <p class="mt-4 font-semibold">You can track your parcel using the tracking number.</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'OK'
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
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-2 text-center">International Parcel Booking</h1>
      <p className="text-lg text-gray-600 mb-6 text-center">China to South Africa Shipping</p>

      {parcelType && (
        <div className="alert alert-info mb-6">
          <div>
            <span>Estimated Cost: ${calculateCost(parcelType, parseFloat(weight || 0)).toFixed(2)}</span>
            {parcelType === "non-document" && (
              <span className="text-sm block mt-1">($50 base + $10 per kg)</span>
            )}
            {parcelType === "document" && (
              <span className="text-sm block mt-1">(Flat rate $50 for documents)</span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Contact */}
        <div className="bg-base-200 p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">📧 Your Contact Information</h2>
          <label className="label">Email</label>
          <input
            type="email"
            {...register("userEmail", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            className="input input-bordered w-full"
            placeholder="your@email.com"
          />
          {errors.userEmail && <p className="text-red-500">{errors.userEmail.message}</p>}
        </div>

        {/* Parcel Info */}
        <div className="bg-base-200 p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">📦 Parcel Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select {...register("type", { required: "Type is required" })} className="select select-bordered">
                <option value="">Select type...</option>
                <option value="document">Document</option>
                <option value="non-document">Non-Document</option>
              </select>
              {errors.type && <p className="text-red-500">{errors.type.message}</p>}
            </div>

            <div>
              <label className="label">Title/Description</label>
              <input
                {...register("title", { required: "Title is required" })}
                className="input input-bordered"
                placeholder="e.g. Important documents"
              />
              {errors.title && <p className="text-red-500">{errors.title.message}</p>}
            </div>

            {parcelType === "non-document" && (
              <div className="sm:col-span-2">
                <label className="label">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register("weight", {
                    required: "Weight is required for non-documents",
                    min: { value: 0.1, message: "Weight must be at least 0.1 kg" }
                  })}
                  className="input input-bordered"
                />
                {errors.weight && <p className="text-red-500">{errors.weight.message}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Sender Info */}
        <div className="bg-base-200 p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">🇨🇳 Sender Information (China)</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input {...register("senderName", { required: "Name is required" })} className="input input-bordered w-full" placeholder="Sender's name" />
              {errors.senderName && <p className="text-red-500">{errors.senderName.message}</p>}
            </div>

            <div>
              <label className="label">Contact Number</label>
              <input
                {...register("senderContact", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^[0-9+\- ]+$/,
                    message: "Invalid phone number"
                  }
                })}
                className="input input-bordered w-full"
                placeholder="e.g. +86 123 4567 8910"
              />
              {errors.senderContact && <p className="text-red-500">{errors.senderContact.message}</p>}
            </div>

            <div>
              <label className="label">Region/Province</label>
              <select {...register("senderRegion", { required: "Region is required" })} className="select select-bordered w-full">
                <option value="">Select...</option>
                {chineseRegions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.senderRegion && <p className="text-red-500">{errors.senderRegion.message}</p>}
            </div>

            <div>
              <label className="label">City</label>
              <input {...register("senderCity", { required: "City is required" })} className="input input-bordered w-full" placeholder="e.g. Shanghai" />
              {errors.senderCity && <p className="text-red-500">{errors.senderCity.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input {...register("senderAddress", { required: "Address is required" })} className="input input-bordered w-full" placeholder="Street, district..." />
              {errors.senderAddress && <p className="text-red-500">{errors.senderAddress.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Pickup Instructions</label>
              <textarea {...register("pickupInstruction", { required: "Instructions required" })} className="textarea textarea-bordered w-full" rows={3} placeholder="Any special instructions" />
              {errors.pickupInstruction && <p className="text-red-500">{errors.pickupInstruction.message}</p>}
            </div>
          </div>
        </div>

        {/* Receiver Info */}
        <div className="bg-base-200 p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">🇿🇦 Receiver Information (South Africa)</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input {...register("receiverName", { required: "Name is required" })} className="input input-bordered w-full" placeholder="Receiver's name" />
              {errors.receiverName && <p className="text-red-500">{errors.receiverName.message}</p>}
            </div>

            <div>
              <label className="label">Contact Number</label>
              <input
                {...register("receiverContact", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^[0-9+\- ]+$/,
                    message: "Invalid phone number"
                  }
                })}
                className="input input-bordered w-full"
                placeholder="e.g. +27 12 345 6789"
              />
              {errors.receiverContact && <p className="text-red-500">{errors.receiverContact.message}</p>}
            </div>

            <div>
              <label className="label">Province</label>
              <select {...register("receiverRegion", { required: "Province is required" })} className="select select-bordered w-full">
                <option value="">Select...</option>
                {southAfricanRegions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.receiverRegion && <p className="text-red-500">{errors.receiverRegion.message}</p>}
            </div>

            <div>
              <label className="label">City</label>
              <input {...register("receiverCity", { required: "City is required" })} className="input input-bordered w-full" placeholder="e.g. Johannesburg" />
              {errors.receiverCity && <p className="text-red-500">{errors.receiverCity.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input {...register("receiverAddress", { required: "Address is required" })} className="input input-bordered w-full" placeholder="Street address..." />
              {errors.receiverAddress && <p className="text-red-500">{errors.receiverAddress.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Delivery Instructions (Optional)</label>
              <textarea {...register("deliveryInstruction")} className="textarea textarea-bordered w-full" rows={3} placeholder="Any delivery instructions" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="text-center">
          <button type="submit" className="btn btn-primary px-8 py-3 text-lg">Submit Parcel</button>
        </div>
      </form>
    </div>
  );
};

export default Sendparcel;