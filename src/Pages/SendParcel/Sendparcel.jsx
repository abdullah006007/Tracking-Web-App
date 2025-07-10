// File: ParcelForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";

const Sendparcel = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const [showConfirm, setShowConfirm] = useState(false);
  const [cost, setCost] = useState(0);
  const [formData, setFormData] = useState(null);

  const parcelType = watch("type");

  const calculateCost = (data) => {
    let base = data.type === "document" ? 50 : 100;
    let weightCost =
      data.type === "non-document" ? Number(data.weight || 0) * 10 : 0;
    let serviceCharge = 0;

    if (data.senderServiceCenter && data.receiverServiceCenter) {
      serviceCharge = 20;
    }

    return base + weightCost + serviceCharge;
  };

  const onSubmit = (data) => {
    const deliveryCost = calculateCost(data);
    setCost(deliveryCost);
    setFormData(data);
    toast.success(`Delivery cost: $${deliveryCost}`);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    const finalData = {
      ...formData,
      creation_date: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    };
    console.log("Parcel Saved:", finalData);
    toast.success("Parcel Info Saved!");
    setShowConfirm(false);
    reset();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <Toaster />
      <h1 className="text-3xl font-bold mb-2 text-center">Parcel Booking Form</h1>
      <p className="text-lg text-gray-600 mb-6 text-center">Fill in the details below</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Parcel Info */}
        <div className="bg-base-200 p-4 sm:p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">📦 Parcel Info</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">Type</label>
              <select {...register("type", { required: true })} className="select select-bordered">
                <option value="">Select type</option>
                <option value="document">Document</option>
                <option value="non-document">Non-Document</option>
              </select>
              {errors.type && <span className="text-red-500">Type is required</span>}
            </div>

            <div className="form-control">
              <label className="label">Title</label>
              <input {...register("title", { required: true })} className="input input-bordered" />
              {errors.title && <span className="text-red-500">Title is required</span>}
            </div>

            {parcelType === "non-document" && (
              <div className="form-control sm:col-span-2">
                <label className="label">Weight (kg)</label>
                <input type="number" step="0.1" {...register("weight")} className="input input-bordered" />
              </div>
            )}
          </div>
        </div>

        {/* Sender Info */}
        <div className="bg-base-200 p-4 sm:p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">👤 Sender Info</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input defaultValue="John Doe" {...register("senderName", { required: true })} className="input input-bordered w-full" />
              {errors.senderName && <span className="text-red-500">Name is required</span>}
            </div>

            <div>
              <label className="label">Contact</label>
              <input {...register("senderContact", { required: true })} className="input input-bordered w-full" />
              {errors.senderContact && <span className="text-red-500">Contact is required</span>}
            </div>

            <div>
              <label className="label">Region</label>
              <select {...register("senderRegion", { required: true })} className="select select-bordered w-full">
                <option value="">Select region</option>
                <option value="north">North</option>
                <option value="south">South</option>
              </select>
              {errors.senderRegion && <span className="text-red-500">Region is required</span>}
            </div>

            <div>
              <label className="label">Service Center</label>
              <select {...register("senderServiceCenter", { required: true })} className="select select-bordered w-full">
                <option value="">Select center</option>
                <option value="A">Center A</option>
                <option value="B">Center B</option>
              </select>
              {errors.senderServiceCenter && <span className="text-red-500">Service center is required</span>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input {...register("senderAddress", { required: true })} className="input input-bordered w-full" />
              {errors.senderAddress && <span className="text-red-500">Address is required</span>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Pickup Instruction</label>
              <textarea {...register("pickupInstruction", { required: true })} className="textarea textarea-bordered w-full" />
              {errors.pickupInstruction && <span className="text-red-500">Instruction is required</span>}
            </div>
          </div>
        </div>

        {/* Receiver Info */}
        <div className="bg-base-200 p-4 sm:p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">📥 Receiver Info</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input {...register("receiverName", { required: true })} className="input input-bordered w-full" />
              {errors.receiverName && <span className="text-red-500">Name is required</span>}
            </div>

            <div>
              <label className="label">Contact</label>
              <input {...register("receiverContact", { required: true })} className="input input-bordered w-full" />
              {errors.receiverContact && <span className="text-red-500">Contact is required</span>}
            </div>

            <div>
              <label className="label">Region</label>
              <select {...register("receiverRegion", { required: true })} className="select select-bordered w-full">
                <option value="">Select region</option>
                <option value="north">North</option>
                <option value="south">South</option>
              </select>
              {errors.receiverRegion && <span className="text-red-500">Region is required</span>}
            </div>

            <div>
              <label className="label">Service Center</label>
              <select {...register("receiverServiceCenter", { required: true })} className="select select-bordered w-full">
                <option value="">Select center</option>
                <option value="A">Center A</option>
                <option value="B">Center B</option>
              </select>
              {errors.receiverServiceCenter && <span className="text-red-500">Service center is required</span>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input {...register("receiverAddress", { required: true })} className="input input-bordered w-full" />
              {errors.receiverAddress && <span className="text-red-500">Address is required</span>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Delivery Instruction</label>
              <textarea {...register("deliveryInstruction", { required: true })} className="textarea textarea-bordered w-full" />
              {errors.deliveryInstruction && <span className="text-red-500">Instruction is required</span>}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button className="btn btn-primary text-white px-6 py-2 mt-6">Submit</button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed bottom-10 right-5 sm:right-10 bg-base-200 p-4 rounded-xl shadow-lg z-50">
          <p className="text-lg font-medium mb-2">Confirm submission?</p>
          <p className="mb-4">Delivery cost: <strong>${cost}</strong></p>
          <div className="flex justify-end gap-2">
            <button onClick={handleConfirm} className="btn btn-success btn-sm">Confirm</button>
            <button onClick={() => setShowConfirm(false)} className="btn btn-error btn-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sendparcel;
