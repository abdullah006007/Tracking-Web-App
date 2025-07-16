import React, { useState } from "react";
import Swal from "sweetalert2";
import {
    FaCheck,
    FaTimes,
    FaEye,
    FaTrash,
    FaUserClock,
    FaCalendarAlt,
    FaPhone,
    FaEnvelope,
    FaUser,
    FaMapMarkerAlt,
} from "react-icons/fa";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../../../Shared/Spinner";


export default function PendingRiders() {
    const [selectedRider, setSelectedRider] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const axiosSecure = useAxiosSecure();

    const {
        isLoading,
        isError,
        data: responseData = {},
        error,
        refetch,
    } = useQuery({
        queryKey: ["pending-riders"],
        queryFn: async () => {
            const res = await axiosSecure.get("/riders/pending");
            return res.data;
        },
    });

    const riders = responseData.data || [];

    const openModal = (rider) => {
        setSelectedRider(rider);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedRider(null);
    };

    const approveRider = async (id, email) => {
        const result = await Swal.fire({
            title: "Approve Rider?",
            text: "Are you sure you want to approve this rider?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Approve",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#10B981",
            cancelButtonColor: "#EF4444",
        });

        if (result.isConfirmed) {
            setActionLoading(true);
            try {
                // Send the email in the request body
                await axiosSecure.put(`/riders/${id}/approve`, { email });
                Swal.fire("Approved!", "Rider has been approved and role updated.", "success");
                refetch();
                closeModal();
            } catch (error) {
                console.error(error);
                Swal.fire("Error", error.response?.data?.message || "Failed to approve rider.", "error");
            } finally {
                setActionLoading(false);
            }
        }
    };



    const rejectRider = async (id) => {
        const result = await Swal.fire({
            title: "Reject Application?",
            text: "Are you sure you want to reject this rider's application?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Reject",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
        });

        if (result.isConfirmed) {
            setActionLoading(true);
            try {
                await axiosSecure.put(`/riders/${id}/reject`);
                Swal.fire("Rejected", "Rider application has been rejected.", "success");
                refetch();
                closeModal();
            } catch (error) {
                console.error(error);
                Swal.fire("Error", error.response?.data?.message || "Failed to reject rider.", "error");
            } finally {
                setActionLoading(false);
            }
        }
    };

    const deleteRider = async (id) => {
        const result = await Swal.fire({
            title: "Delete Application?",
            text: "This will permanently delete the rider's application. Are you sure?",
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
        });

        if (result.isConfirmed) {
            setActionLoading(true);
            try {
                await axiosSecure.delete(`/riders/${id}`);
                Swal.fire("Deleted!", "Rider application has been deleted.", "success");
                refetch();
                closeModal();
            } catch (error) {
                console.error(error);
                Swal.fire("Error", error.response?.data?.message || "Failed to delete rider.", "error");
            } finally {
                setActionLoading(false);
            }
        }
    };

    const formatDate = (dateString) => {
        try {
            if (!dateString) return "N/A";
            const date = new Date(dateString);
            return isNaN(date.getTime())
                ? "N/A"
                : date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });
        } catch {
            return "N/A";
        }
    };

    if (isLoading) return <Spinner></Spinner>;

    if (isError) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">
                        Error Loading Riders
                    </h2>
                    <p className="text-gray-700 mb-4">
                        {error?.message || "Failed to load rider data"}
                    </p>
                    <button
                        onClick={refetch}
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FaUserClock className="mr-2 text-blue-600" />
                        Pending Riders
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {riders.length} Pending
                    </span>
                </div>

                {riders.length === 0 ? (
                    <div className="text-center py-10">
                        <FaUserClock className="mx-auto text-4xl text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-700">
                            No pending riders found
                        </h3>
                        <p className="text-gray-500">
                            All rider applications have been processed
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left">Name</th>
                                    <th className="py-3 px-4 text-left">Contact</th>
                                    <th className="py-3 px-4 text-left">Location</th>
                                    <th className="py-3 px-4 text-left">Application Date</th>
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {riders.map((rider) => (
                                    <tr key={rider._id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium">
                                            {rider.name || "N/A"}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900">{rider.email}</span>
                                                <span className="flex items-center text-sm text-gray-500 mt-1">
                                                    <FaPhone className="mr-2 text-blue-500" />
                                                    {rider.phone || "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="flex items-center text-sm">
                                                <FaMapMarkerAlt className="mr-2 text-red-500" />
                                                {rider.district || rider.region || "N/A"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="flex items-center text-sm">
                                                <FaCalendarAlt className="mr-2 text-green-500" />
                                                {formatDate(rider.createdAt)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => openModal(rider)}
                                                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100"
                                                    title="View Details"
                                                    disabled={actionLoading}
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => approveRider(rider._id, rider.email)}
                                                    className="p-2 rounded-full text-green-600 hover:bg-green-100"
                                                    title="Approve"
                                                    disabled={actionLoading}
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button
                                                    onClick={() => rejectRider(rider._id, rider.email)}
                                                    className="p-2 rounded-full text-red-600 hover:bg-red-100"
                                                    title="Reject"
                                                    disabled={actionLoading}
                                                >
                                                    <FaTimes />
                                                </button>
                                                <button
                                                    onClick={() => deleteRider(rider._id)}
                                                    className="p-2 rounded-full text-red-800 hover:bg-red-100"
                                                    title="Delete"
                                                    disabled={actionLoading}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {modalOpen && selectedRider && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                                        <FaUser className="text-blue-600 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-800">
                                            {selectedRider.name || "N/A"}
                                        </h3>
                                        <p className="text-sm text-gray-500">Rider Application Details</p>
                                    </div>
                                </div>
                                <button
                                    className="text-gray-600 hover:text-gray-900"
                                    onClick={closeModal}
                                    disabled={actionLoading}
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="text-gray-700 font-semibold mb-3 border-b pb-1">Personal Info</h4>
                                    <div className="space-y-2">
                                        <p className="flex items-center text-sm">
                                            <FaUser className="mr-2 text-gray-500" />
                                            <span className="font-medium">Name:</span> {selectedRider.name || "N/A"}
                                        </p>
                                        <p className="flex items-center text-sm">
                                            <FaEnvelope className="mr-2 text-gray-500" />
                                            <span className="font-medium">Email:</span> {selectedRider.email}
                                        </p>
                                        <p className="flex items-center text-sm">
                                            <FaPhone className="mr-2 text-gray-500" />
                                            <span className="font-medium">Phone:</span> {selectedRider.phone || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-gray-700 font-semibold mb-3 border-b pb-1">Location & Vehicle</h4>
                                    <div className="space-y-2">
                                        <p className="flex items-center text-sm">
                                            <FaMapMarkerAlt className="mr-2 text-gray-500" />
                                            <span className="font-medium">Region:</span> {selectedRider.region || "N/A"}
                                        </p>
                                        <p className="flex items-center text-sm">
                                            <FaMapMarkerAlt className="mr-2 text-gray-500" />
                                            <span className="font-medium">District:</span> {selectedRider.district || "N/A"}
                                        </p>
                                        {selectedRider.bike_brand && (
                                            <p className="flex items-center text-sm">
                                                <span className="font-medium">Bike:</span> {selectedRider.bike_brand} ({selectedRider.bike_registration || "No plate"})
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                                <button
                                    className="btn btn-error btn-outline"
                                    onClick={() => deleteRider(selectedRider._id)}
                                    disabled={actionLoading}
                                >
                                    <FaTrash className="mr-1" /> Delete
                                </button>
                                <button
                                    className="btn btn-error"
                                    onClick={() => rejectRider(selectedRider._id)}
                                    disabled={actionLoading}
                                >
                                    <FaTimes className="mr-1" /> Reject
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={() => approveRider(selectedRider._id)}
                                    disabled={actionLoading}
                                >
                                    <FaCheck className="mr-1" /> Approve
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}