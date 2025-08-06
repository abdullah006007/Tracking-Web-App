import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaMotorcycle, FaCheck, FaTimes, FaTruckLoading, FaInfoCircle, FaMoneyBillWave, FaTrash, FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";

const AssignRider = () => {
    const axiosSecure = useAxiosSecure();
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [selectedRider, setSelectedRider] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [showPaidParcels, setShowPaidParcels] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const queryClient = useQueryClient();

    // All possible status options in order
    const statusOptions = [
        { value: "order_confirmed", label: "Order confirmed", icon: "✓", color: "bg-blue-100" },
        { value: "quality_inspection", label: "Sent to quality inspection", icon: "🔍", color: "bg-purple-100" },
        { value: "passed_inspection", label: "Passed quality inspection", icon: "✅", color: "bg-green-100" },
        { value: "packed_for_warehouse", label: "Pack and ship to warehouse", icon: "📦", color: "bg-yellow-100" },
        { value: "arrived_at_warehouse", label: "Arrived at warehouse", icon: "🏭", color: "bg-orange-100" },
        { value: "awaiting_departure", label: "Awaiting departure", icon: "⏳", color: "bg-amber-100" },
        { value: "international_shipping", label: "International Shipping", icon: "✈️", color: "bg-sky-100" },
        { value: "arrived_at_customs", label: "Arrival at customs", icon: "🛃", color: "bg-indigo-100" },
        { value: "clearance_finished", label: "Clearance finished", icon: "🟢", color: "bg-teal-100" },
        { value: "arrived_at_local_warehouse", label: "At local warehouse", icon: "🏠", color: "bg-cyan-100" },
        { value: "local_quality_check", label: "Quality check completed", icon: "✔️", color: "bg-emerald-100" },
        { value: "awaiting_courier", label: "Waiting for courier", icon: "🚚", color: "bg-lime-100" },
        { value: "in_transit", label: "In Transit", icon: <FaTruckLoading />, color: "bg-blue-100" },
        { value: "delivered", label: "Delivered", icon: <FaCheck />, color: "bg-green-100" },
    ];

    // Debounce search term
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    // Helper function to get the current delivery status
    const getCurrentDeliveryStatus = (parcel) => {
        if (!parcel.deliveryStatus || !Array.isArray(parcel.deliveryStatus) || parcel.deliveryStatus.length === 0) {
            return "order_confirmed";
        }
        const lastStatus = parcel.deliveryStatus[parcel.deliveryStatus.length - 1];
        return lastStatus.status.toLowerCase();
    };

    // Fetch all parcels (both paid and unpaid)
    const {
        data: allParcels = [],
        isLoading: isLoadingParcels,
        isError: isParcelsError,
        error: parcelsError,
    } = useQuery({
        queryKey: ["allParcels"],
        queryFn: async () => {
            const res = await axiosSecure.get("/parcels");
            if (!res.data) throw new Error("Failed to fetch parcels");
            const data = Array.isArray(res.data) ? res.data : [];
            return data.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
        },
        retry: 2,
    });

    // Filter parcels based on showPaidParcels state and search term
    const filteredParcels = allParcels.filter(parcel => {
        // Apply payment status filter
        const paymentFilter = showPaidParcels ? true : parcel.paymentStatus !== "Paid";
        
        // Apply search filter if search term exists
        const searchFilter = debouncedSearchTerm 
            ? parcel.trackingNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
              parcel.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            : true;
        
        return paymentFilter && searchFilter;
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
                let endpoint, data;

                if (action === "assignRider") {
                    endpoint = `/parcels/${parcelId}/assign-rider`;
                    data = {
                        riderId: payload.rider._id,
                        riderName: payload.rider.name,
                        riderPhone: payload.rider.phone
                    };
                } else if (action === "updateStatus") {
                    endpoint = `/parcels/${parcelId}/status`;
                    data = {
                        status: payload.status,
                        date: new Date().toISOString(),
                        location: payload.location || getStatusLocation(payload.status),
                        details: payload.details || `Status updated to ${payload.status.replace(/_/g, ' ')}`,
                        changedBy: "admin"
                    };
                } else if (action === "deleteParcel") {
                    endpoint = `/parcels/${parcelId}`;
                    return await axiosSecure.delete(endpoint);
                }

                const res = await axiosSecure.patch(endpoint, data);
                return res.data;
            } catch (error) {
                console.error('Update failed:', {
                    error: error.response?.data || error.message,
                    config: error.config
                });
                throw error;
            }
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["allParcels"]);
            let successMessage = "";

            if (variables.action === "assignRider") {
                successMessage = "Rider assigned successfully!";
                setIsAssignModalOpen(false);
                setSelectedParcel(null);
                setSelectedRider(null);
            } else if (variables.action === "updateStatus") {
                successMessage = "Delivery status updated successfully!";
                setIsStatusModalOpen(false);
                setSelectedParcel(null);
                setSelectedStatus(null);
            } else if (variables.action === "deleteParcel") {
                successMessage = "Parcel deleted successfully!";
            }

            Swal.fire({
                title: "Success!",
                text: successMessage,
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
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

    // Helper function to determine location based on status
    const getStatusLocation = (status) => {
        switch (status) {
            case "order_confirmed":
            case "quality_inspection":
            case "passed_inspection":
            case "packed_for_warehouse":
                return "China";
            case "arrived_at_warehouse":
            case "awaiting_departure":
                return "Foreign Trade Warehouse (China)";
            case "international_shipping":
                return "In Transit (International)";
            case "arrived_at_customs":
            case "clearance_finished":
            case "arrived_at_local_warehouse":
            case "local_quality_check":
            case "awaiting_courier":
                return "Local Warehouse";
            case "in_transit":
                return "Local Delivery";
            case "delivered":
                return "Delivered to Recipient";
            default:
                return "In Process";
        }
    };

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

    // Function to open status modal
    const openStatusModal = (parcel) => {
        setSelectedParcel(parcel);
        setSelectedStatus(getCurrentDeliveryStatus(parcel));
        setIsStatusModalOpen(true);
    };

    // Function to handle status update
    const handleStatusUpdate = async (status) => {
        const statusInfo = statusOptions.find(s => s.value === status);

        try {
            const result = await Swal.fire({
                title: "Confirm Status Update",
                html: `
                    <div class="text-left">
                        <p>Change status to <strong>"${statusInfo?.label}"</strong>?</p>
                        <div class="mt-2 p-2 ${statusInfo?.color} rounded-md">
                            <p class="text-sm">Location: ${getStatusLocation(status)}</p>
                            ${selectedParcel?.paymentStatus !== "Paid" && status === "delivered" ?
                        '<p class="text-sm text-red-500 mt-1">Note: This parcel has not been paid yet!</p>' : ''
                    }
                        </div>
                    </div>
                `,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, update",
                cancelButtonText: "Cancel"
            });

            if (result.isConfirmed) {
                await updateParcel({
                    parcelId: selectedParcel._id,
                    action: "updateStatus",
                    payload: {
                        status: status,
                        location: getStatusLocation(status),
                        details: `Status updated to: ${statusInfo?.label}`,
                        changedBy: "admin"
                    }
                });
            }
        } catch (error) {
            if (error !== "cancel" && error !== "close") {
                console.error('Status update error:', error);
                Swal.fire({
                    title: "Update Failed",
                    html: `
                    <div class="text-left">
                        <p>${error.message}</p>
                        ${process.env.NODE_ENV === 'development' && error.response?.data ?
                            `<pre class="text-xs mt-2">${JSON.stringify(error.response.data, null, 2)}</pre>` : ''
                        }
                    </div>
                `,
                    icon: "error"
                });
            }
        }
    };

    // Function to delete parcel
    const handleDeleteParcel = async (parcel) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                html: `
                    <div class="text-left">
                        <p>You are about to delete this parcel:</p>
                        <div class="mt-2 p-2 bg-red-50 rounded-md">
                            <p class="font-medium">${parcel.title}</p>
                            <p class="text-sm">Tracking ID: ${parcel.trackingNumber}</p>
                            <p class="text-sm">Status: ${formatDeliveryStatus(parcel.deliveryStatus)}</p>
                            ${parcel.paymentStatus === "Paid" ?
                        '<p class="text-sm text-red-500">Warning: This is a paid parcel!</p>' : ''
                    }
                        </div>
                        <p class="mt-2 text-red-600">This action cannot be undone!</p>
                    </div>
                `,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel"
            });

            if (result.isConfirmed) {
                await updateParcel({
                    parcelId: parcel._id,
                    action: "deleteParcel"
                });
            }
        } catch (error) {
            console.error('Delete failed:', error);
            Swal.fire({
                title: "Delete Failed",
                text: error.message,
                icon: "error"
            });
        }
    };

    // Format delivery status for display
    const formatDeliveryStatus = (statusArray) => {
        if (!statusArray || !Array.isArray(statusArray) || statusArray.length === 0) {
            return "Order confirmed";
        }
        const lastStatus = statusArray[statusArray.length - 1];
        const statusInfo = statusOptions.find(s => s.value === lastStatus.status.toLowerCase());
        return statusInfo?.label || lastStatus.status.toLowerCase().replace(/_/g, ' ');
    };

    // Get badge color based on status
    const getStatusBadgeColor = (status) => {
        const statusInfo = statusOptions.find(s => s.value === status);
        return statusInfo?.color || "bg-gray-100";
    };

    // Loading and error states
    if (isLoadingParcels || isLoadingRiders) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-gray-600">Loading parcel data...</p>
                </div>
            </div>
        );
    }

    if (isParcelsError || isRidersError) {
        return (
            <div className="alert alert-error max-w-2xl mx-auto rounded-lg shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h3 className="font-bold">Error loading data!</h3>
                    <div className="text-xs">{parcelsError?.message || ridersError?.message}</div>
                    <button
                        className="btn btn-sm btn-outline mt-2"
                        onClick={() => queryClient.refetchQueries(["allParcels", "allRiders"])}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-4 md:p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Parcel Management</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage all parcels and delivery statuses
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="label cursor-pointer gap-2">
                                <span className="label-text">Show all parcels</span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={showPaidParcels}
                                    onChange={() => setShowPaidParcels(!showPaidParcels)}
                                />
                            </label>
                            <div className="badge badge-info gap-2">
                                <FaInfoCircle />
                                {filteredParcels.length} {filteredParcels.length === 1 ? "parcel" : "parcels"} shown
                            </div>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="mt-4">
                        <div className="relative max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Search by tracking number or title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setSearchTerm("")}
                                >
                                    <FaTimes className="text-gray-400 hover:text-gray-500 cursor-pointer" />
                                </button>
                            )}
                        </div>
                        {debouncedSearchTerm && (
                            <p className="mt-1 text-xs text-gray-500">
                                Showing results for: <span className="font-medium">"{debouncedSearchTerm}"</span>
                            </p>
                        )}
                    </div>
                </div>

                {filteredParcels.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="alert alert-info max-w-2xl mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h3 className="font-bold">No parcels found</h3>
                                <p className="text-sm">
                                    {debouncedSearchTerm 
                                        ? "No parcels match your search criteria." 
                                        : "No parcels match the current filters."}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcel Info</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rider</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredParcels.map((parcel) => {
                                    const currentStatus = getCurrentDeliveryStatus(parcel);
                                    const statusDisplay = formatDeliveryStatus(parcel.deliveryStatus);
                                    const statusInfo = statusOptions.find(s => s.value === currentStatus);

                                    return (
                                        <tr key={parcel._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="font-mono text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                        {parcel.trackingNumber}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 line-clamp-1">{parcel.title}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {parcel.senderRegion} → {parcel.receiverRegion}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className={`badge gap-2 ${parcel.paymentStatus === "Paid" ? "badge-success" : "badge-warning"}`}>
                                                    {parcel.paymentStatus === "Paid" ? (
                                                        <>
                                                            <FaMoneyBillWave />
                                                            Paid
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaMoneyBillWave />
                                                            Unpaid
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo?.color} ${statusInfo?.color.includes('red') || statusInfo?.color.includes('green') ? 'text-white' : 'text-gray-800'}`}>
                                                    {statusDisplay}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {parcel.assigned_rider_name ? (
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900 line-clamp-1">{parcel.assigned_rider_name}</div>
                                                        <div className="text-gray-500 text-xs">{parcel.assigned_rider_phone}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Not assigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDeleteParcel(parcel)}
                                                        className="btn btn-xs md:btn-sm btn-error btn-outline"
                                                        title="Delete parcel"
                                                    >
                                                        <FaTrash />
                                                    </button>

                                                    {!parcel.assigned_rider_id && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedParcel(parcel);
                                                                setIsAssignModalOpen(true);
                                                            }}
                                                            className="btn btn-xs md:btn-sm btn-primary"
                                                            disabled={isUpdating}
                                                        >
                                                            {isUpdating ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <>
                                                                    <FaMotorcycle className="mr-1 text-black" />
                                                                    Assign
                                                                </>
                                                            )}
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => openStatusModal(parcel)}
                                                        className="btn btn-xs md:btn-sm btn-outline"
                                                    >
                                                        Update Status
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Assign Rider Modal */}
            {isAssignModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-3xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">
                                Assign Rider for: <span className="text-primary">{selectedParcel?.title}</span>
                            </h3>
                            <button
                                onClick={() => setIsAssignModalOpen(false)}
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="label text-sm font-medium text-gray-500">Tracking ID</label>
                                <p className="font-mono text-sm text-gray-900">{selectedParcel?.trackingNumber}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="label text-sm font-medium text-gray-500">Route</label>
                                <p className="text-sm text-gray-900">{selectedParcel?.senderRegion} → {selectedParcel?.receiverRegion}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="label text-sm font-medium text-gray-500">Parcel Type</label>
                                <p className="text-sm capitalize text-gray-900">{selectedParcel?.type}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="label text-sm font-medium text-gray-500">Payment Status</label>
                                <p className="text-sm text-gray-900">
                                    <span className={`badge ${selectedParcel?.paymentStatus === "Paid" ? "badge-success" : "badge-warning"}`}>
                                        {selectedParcel?.paymentStatus}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="label">
                                <span className="label-text">Select Rider</span>
                                <span className="label-text-alt">{ridersData.length} available riders</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
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
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Rider Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label label-text p-0">Name</label>
                                        <p className="font-medium">{selectedRider.name}</p>
                                    </div>
                                    <div>
                                        <label className="label label-text p-0">Phone</label>
                                        <p className="font-medium">{selectedRider.phone}</p>
                                    </div>
                                    <div>
                                        <label className="label label-text p-0">District</label>
                                        <p className="font-medium">{selectedRider.district}</p>
                                    </div>
                                    <div>
                                        <label className="label label-text p-0">Vehicle</label>
                                        <p className="font-medium">{selectedRider.vehicleType} ({selectedRider.vehicleNumber})</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="modal-action">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (selectedParcel && selectedRider) {
                                        assignRider(selectedParcel._id, selectedRider);
                                    }
                                }}
                                disabled={!selectedRider || isUpdating}
                            >
                                {isUpdating ? (
                                    <span className="loading loading-spinner"></span>
                                ) : "Confirm Assignment"}
                            </button>
                            <button
                                className="btn"
                                onClick={() => setIsAssignModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {isStatusModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">
                                Update Status for: <span className="text-primary">{selectedParcel?.title}</span>
                            </h3>
                            <button
                                onClick={() => setIsStatusModalOpen(false)}
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="label text-sm font-medium text-gray-500">Tracking ID</label>
                                    <p className="font-mono text-sm text-gray-900">{selectedParcel?.trackingNumber}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="label text-sm font-medium text-gray-500">Current Status</label>
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedStatus)}`}>
                                        {formatDeliveryStatus(selectedParcel?.deliveryStatus)}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="label text-sm font-medium text-gray-500">Payment Status</label>
                                    <p className="text-sm">
                                        <span className={`badge ${selectedParcel?.paymentStatus === "Paid" ? "badge-success" : "badge-warning"}`}>
                                            {selectedParcel?.paymentStatus}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {statusOptions.map((status) => (
                                    <div
                                        key={status.value}
                                        onClick={() => handleStatusUpdate(status.value)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all ${status.value === selectedStatus ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'} ${status.color}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">
                                                {typeof status.icon === 'string' ? status.icon : status.icon}
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-medium">{status.label}</p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Location: {getStatusLocation(status.value)}
                                                </p>
                                            </div>
                                            {status.value === selectedStatus && (
                                                <span className="text-blue-500">Current</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-action">
                            <button
                                className="btn"
                                onClick={() => setIsStatusModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignRider;