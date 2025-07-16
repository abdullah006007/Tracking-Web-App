import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaMotorcycle, FaCheck, FaTimes, FaTruckLoading } from "react-icons/fa";
import { useState } from "react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";

const AssignRider = () => {
    const axiosSecure = useAxiosSecure();
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [selectedRider, setSelectedRider] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    // Helper function to get the current delivery status
    const getCurrentDeliveryStatus = (parcel) => {
        if (!parcel.deliveryStatus || !Array.isArray(parcel.deliveryStatus) || parcel.deliveryStatus.length === 0) {
            return "pending";
        }
        const lastStatus = parcel.deliveryStatus[parcel.deliveryStatus.length - 1];
        return lastStatus.status.toLowerCase();
    };

    // Fetch parcels that are paid and not delivered or cancelled
    const {
        data: parcels = [],
        isLoading: isLoadingParcels,
        isError: isParcelsError,
        error: parcelsError,
    } = useQuery({
        queryKey: ["assignableParcels"],
        queryFn: async () => {
            const res = await axiosSecure.get("/parcels");
            if (!res.data) throw new Error("Failed to fetch parcels");
            const data = Array.isArray(res.data) ? res.data : [];
            return data
                .filter(parcel => (
                    parcel.paymentStatus === "Paid" &&
                    !["delivered", "cancelled"].includes(getCurrentDeliveryStatus(parcel))
                ))
                .sort((a, b) => new Date(a.creationDate) - new Date(b.creationDate));
        },
        retry: 2,
    });

    // Fetch all active riders
    const {
        data: ridersData = [],
        isLoading: isLoadingRiders,
        isError: isRidersError,
        error: ridersError,
    } = useQuery({
        queryKey: ["allRiders"],
        queryFn: async () => {
            const res = await axiosSecure.get("/riders/active");
            if (!res.data) throw new Error("Failed to fetch riders");
            return Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
        },
        retry: 2,
    });

    // Mutation for parcel updates
    const { mutateAsync: updateParcel, isPending: isUpdating } = useMutation({
        mutationFn: async ({ parcelId, action, payload }) => {
            try {
                let endpoint = "";
                let data = {};

                if (action === "assignRider") {
                    endpoint = `/parcels/${parcelId}/assign-rider`;
                    data = {
                        riderId: payload.rider._id,
                        riderName: payload.rider.name,
                        riderPhone: payload.rider.phone
                    };
                } else {
                    endpoint = `/parcels/${parcelId}/status`;
                    data = {
                        status: payload.status,
                        date: new Date().toISOString(),
                        location: "In transit",
                        details: `Status changed to ${payload.status}`,
                        changedBy: "admin"
                    };
                }

                const res = await axiosSecure.patch(endpoint, data);
                return res.data;
            } catch (error) {
                const errorMessage = error.response?.data?.message ||
                    error.message ||
                    "Failed to update parcel";
                throw new Error(errorMessage);
            }
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["assignableParcels"]);
            Swal.fire({
                title: "Success!",
                text: variables.action === "assignRider"
                    ? "Rider assigned successfully!"
                    : "Delivery status updated successfully!",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
            if (variables.action === "assignRider") {
                setIsModalOpen(false);
                setSelectedParcel(null);
                setSelectedRider(null);
            }
        },
        onError: (error) => {
            Swal.fire({
                title: "Error!",
                text: error.message,
                icon: "error",
                confirmButtonText: "OK"
            });
        },
    });

    // Function to assign rider
    const assignRider = async (parcelId, rider) => {
        try {
            await updateParcel({
                parcelId,
                action: "assignRider",
                payload: { rider }
            });
        } catch (error) {
            console.error("Failed to assign rider:", error);
        }
    };

    // Function to handle status update
    const handleStatusUpdate = (parcelId, status) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You are about to change the status to "${status.replace('_', ' ')}"`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!"
        }).then((result) => {
            if (result.isConfirmed) {
                updateParcel({
                    parcelId,
                    action: "updateStatus",
                    payload: { status }
                });
            }
        });
    };

    // Format delivery status for display
    const formatDeliveryStatus = (statusArray) => {
        if (!statusArray || !Array.isArray(statusArray) || statusArray.length === 0) {
            return "pending";
        }
        const lastStatus = statusArray[statusArray.length - 1];
        return lastStatus.status.toLowerCase().replace('_', ' ');
    };

    // Loading and error states
    if (isLoadingParcels || isLoadingRiders) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (isParcelsError || isRidersError) {
        return (
            <div className="alert alert-error max-w-2xl mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h3 className="font-bold">Error loading data!</h3>
                    <div className="text-xs">{parcelsError?.message || ridersError?.message}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Parcel Management</h2>

            {parcels.length === 0 ? (
                <div className="alert alert-info max-w-2xl mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>No parcels available for management.</span>
                </div>
            ) : (
                <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
                    <table className="table">
                        <thead>
                            <tr className="bg-base-200">
                                <th>Tracking ID</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>From/To</th>
                                <th>Cost</th>
                                <th>Status</th>
                                <th>Assigned Rider</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parcels.map((parcel) => {
                                const currentStatus = getCurrentDeliveryStatus(parcel);
                                const statusDisplay = formatDeliveryStatus(parcel.deliveryStatus);

                                return (
                                    <tr key={parcel._id}>
                                        <td className="font-mono">{parcel.trackingNumber}</td>
                                        <td>{parcel.title}</td>
                                        <td className="capitalize">{parcel.type}</td>
                                        <td>
                                            <div className="text-xs">
                                                <div><span className="font-semibold">From:</span> {parcel.senderRegion}</div>
                                                <div><span className="font-semibold">To:</span> {parcel.receiverRegion}</div>
                                            </div>
                                        </td>
                                        <td>৳{parcel.cost?.toFixed(2)}</td>
                                        <td>
                                            <span className={`badge badge-sm ${currentStatus === "pending" ? "badge-warning" :
                                                currentStatus === "in_transit" ? "badge-info" :
                                                    currentStatus === "delivered" ? "badge-success" :
                                                        currentStatus === "cancelled" ? "badge-error" : "badge-neutral"
                                                }`}>
                                                {statusDisplay}
                                            </span>
                                        </td>
                                        <td>
                                            {parcel.assigned_rider_name ? (
                                                <div className="text-xs">
                                                    <div className="font-semibold">{parcel.assigned_rider_name}</div>
                                                    <div>{parcel.assigned_rider_phone}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-xs">Not assigned</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-2">
                                                {!parcel.assigned_rider_id && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedParcel(parcel);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="btn btn-sm btn-primary"
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? (
                                                            <span className="loading loading-spinner loading-xs"></span>
                                                        ) : (
                                                            <>
                                                                <FaMotorcycle className="mr-1" />
                                                                Assign Rider
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                {currentStatus !== "delivered" && currentStatus !== "cancelled" && (
                                                    <div className="dropdown dropdown-top dropdown-end">
                                                        <label
                                                            tabIndex={0}
                                                            className="btn btn-sm btn-accent"
                                                            disabled={isUpdating}
                                                        >
                                                            {isUpdating ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : "Update Status"}
                                                        </label>
                                                        <ul
                                                            tabIndex={0}
                                                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                                                        >
                                                            <li>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(parcel._id, "in_transit")}
                                                                    disabled={currentStatus === "in_transit"}
                                                                >
                                                                    <FaTruckLoading /> In Transit
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(parcel._id, "delivered")}
                                                                >
                                                                    <FaCheck /> Delivered
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(parcel._id, "cancelled")}
                                                                >
                                                                    <FaTimes /> Cancel
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Assign Rider Modal */}
                    {isModalOpen && (
                        <div className="modal modal-open">
                            <div className="modal-box max-w-2xl">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                >
                                    ✕
                                </button>

                                <h3 className="text-lg font-bold mb-4">
                                    Assign Rider for: <span className="text-primary">{selectedParcel?.title}</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="font-semibold">Tracking ID:</p>
                                        <p className="font-mono">{selectedParcel?.trackingNumber}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Route:</p>
                                        <p>{selectedParcel?.senderRegion} → {selectedParcel?.receiverRegion}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Parcel Type:</p>
                                        <p className="capitalize">{selectedParcel?.type}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Delivery Cost:</p>
                                        <p>৳{selectedParcel?.cost?.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="form-control w-full mb-6">
                                    <label className="label">
                                        <span className="label-text">Select Rider</span>
                                    </label>
                                    <select
                                        className="select select-bordered"
                                        value={selectedRider?._id || ""}
                                        onChange={(e) => {
                                            const riderId = e.target.value;
                                            const rider = ridersData.find(r => r._id === riderId) || null;
                                            setSelectedRider(rider);
                                        }}
                                        disabled={isLoadingRiders}
                                    >
                                        <option value="">Select a rider</option>
                                        {ridersData.map(rider => (
                                            <option key={rider._id} value={rider._id}>
                                                {rider.name} - {rider.phone} ({rider.district})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedRider && (
                                    <div className="bg-base-200 p-4 rounded-lg mb-6">
                                        <h4 className="font-bold mb-3 text-lg">Rider Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p><span className="font-semibold">Name:</span> {selectedRider.name}</p>
                                                <p><span className="font-semibold">Phone:</span> {selectedRider.phone}</p>
                                            </div>
                                            <div>
                                                <p><span className="font-semibold">District:</span> {selectedRider.district}</p>
                                                <p><span className="font-semibold">Vehicle:</span> {selectedRider.vehicleType} ({selectedRider.vehicleNumber})</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="modal-action">
                                    <button
                                        className="btn btn-primary"
                                        disabled={!selectedRider || isUpdating}
                                        onClick={() => {
                                            if (selectedParcel && selectedRider) {
                                                assignRider(selectedParcel._id, selectedRider);
                                            }
                                        }}
                                    >
                                        {isUpdating ? (
                                            <span className="loading loading-spinner"></span>
                                        ) : "Confirm Assignment"}
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="btn"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AssignRider;