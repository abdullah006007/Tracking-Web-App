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
    const [courierGuyCode, setCourierGuyCode] = useState("");
    const queryClient = useQueryClient();

    const statusOptions = [
        { value: "order_confirmed", label: "Order Confirmed", icon: "✓", color: "bg-blue-100" },
        { value: "quality_inspection", label: "Quality Inspection", icon: "🔍", color: "bg-purple-100" },
        { value: "passed_inspection", label: "Passed Inspection", icon: "✅", color: "bg-green-100" },
        { value: "packed_for_warehouse", label: "Packed for Warehouse", icon: "📦", color: "bg-yellow-100" },
        { value: "arrived_at_warehouse", label: "Arrived at Warehouse", icon: "🏭", color: "bg-orange-100" },
        { value: "awaiting_departure", label: "Awaiting Departure", icon: "⏳", color: "bg-amber-100" },
        { value: "international_shipping", label: "International Shipping", icon: "✈️", color: "bg-sky-100" },
        { value: "arrived_at_customs", label: "Arrived at Customs", icon: "🛃", color: "bg-indigo-100" },
        { value: "clearance_finished", label: "Clearance Finished", icon: "🟢", color: "bg-teal-100" },
        { value: "arrived_at_local_warehouse", label: "At Local Warehouse", icon: "🏠", color: "bg-cyan-100" },
        { value: "local_quality_check", label: "Local Quality Check", icon: "✔️", color: "bg-emerald-100" },
        { value: "awaiting_courier", label: "Awaiting Courier", icon: "🚚", color: "bg-lime-100" },
        { value: "in_transit", label: "In Transit", icon: <FaTruckLoading />, color: "bg-blue-100" },
        { value: "delivered", label: "Delivered", icon: <FaCheck />, color: "bg-green-100" },
    ];

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const getCurrentDeliveryStatus = (parcel) => {
        if (!parcel?.deliveryStatus || !Array.isArray(parcel.deliveryStatus) || parcel.deliveryStatus.length === 0) {
            return "order_confirmed";
        }
        return parcel.deliveryStatus[parcel.deliveryStatus.length - 1].status.toLowerCase();
    };

    const { data: allParcels = [], isLoading: isLoadingParcels } = useQuery({
        queryKey: ["allParcels"],
        queryFn: async () => {
            const res = await axiosSecure.get("/parcels");
            return Array.isArray(res.data) ? res.data.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate)) : [];
        },
        retry: 2,
    });

    const filteredParcels = allParcels.filter(parcel => {
        const paymentFilter = showPaidParcels ? true : parcel.paymentStatus !== "Paid";
        const searchFilter = debouncedSearchTerm
            ? parcel.trackingNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              parcel.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            : true;
        return paymentFilter && searchFilter;
    });

    const { data: ridersData = [], isLoading: isLoadingRiders } = useQuery({
        queryKey: ["allRiders"],
        queryFn: async () => {
            const res = await axiosSecure.get("/riders/active");
            return Array.isArray(res.data) ? res.data : [];
        },
        retry: 2,
    });

    const { mutateAsync: updateParcel, isPending: isUpdating } = useMutation({
        mutationFn: async ({ parcelId, action, payload }) => {
            let endpoint, data;
            if (action === "assignRider") {
                endpoint = `/parcels/${parcelId}/assign-rider`;
                data = {
                    riderId: payload.rider._id,
                    riderName: payload.rider.name,
                    riderPhone: payload.rider.phone,
                };
            } else if (action === "updateStatus") {
                endpoint = `/parcels/${parcelId}/status`;
                data = {
                    status: payload.status,
                    date: new Date().toISOString(),
                    location: payload.location,
                    details: payload.details,
                    changedBy: "admin",
                    CourierGuyCode: payload.CourierGuyCode,
                };
            } else if (action === "deleteParcel") {
                endpoint = `/parcels/${parcelId}`;
                return await axiosSecure.delete(endpoint);
            }
            const res = await axiosSecure.patch(endpoint, data);
            return res.data;
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
                setCourierGuyCode("");
            } else if (variables.action === "deleteParcel") {
                successMessage = "Parcel deleted successfully!";
            }
            Swal.fire({
                title: "Success!",
                text: successMessage,
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
        },
        onError: (error) => {
            Swal.fire({
                title: "Error!",
                text: error.message,
                icon: "error",
                confirmButtonText: "OK",
            });
        },
    });

    const getStatusLocation = (status) => {
        const locations = {
            order_confirmed: "China",
            quality_inspection: "China",
            passed_inspection: "China",
            packed_for_warehouse: "China",
            arrived_at_warehouse: "Foreign Trade Warehouse (China)",
            awaiting_departure: "Foreign Trade Warehouse (China)",
            international_shipping: "In Transit (International)",
            arrived_at_customs: "Local Warehouse",
            clearance_finished: "Local Warehouse",
            arrived_at_local_warehouse: "Local Warehouse",
            local_quality_check: "Local Warehouse",
            awaiting_courier: "Local Warehouse",
            in_transit: "Local Delivery",
            delivered: "Delivered to Recipient",
        };
        return locations[status] || "In Process";
    };

    const assignRider = async (parcelId, rider) => {
        await updateParcel({
            parcelId,
            action: "assignRider",
            payload: { rider },
        });
    };

    const openStatusModal = (parcel) => {
        setSelectedParcel(parcel);
        setSelectedStatus(getCurrentDeliveryStatus(parcel));
        setCourierGuyCode(parcel.CourierGuyCode || "");
        setIsStatusModalOpen(true);
    };

    const handleStatusUpdate = async (status) => {
        const statusInfo = statusOptions.find((s) => s.value === status);
        let html = `
            <div class="text-left">
                <p>Change status to <strong>"${statusInfo?.label}"</strong>?</p>
                <div class="mt-2 p-2 ${statusInfo?.color} rounded-md">
                    <p class="text-sm">Location: ${getStatusLocation(status)}</p>
                    ${selectedParcel?.paymentStatus !== "Paid" && status === "delivered"
                        ? '<p class="text-sm text-red-500 mt-1">Note: This parcel has not been paid yet!</p>'
                        : ""}
                </div>
            </div>
        `;
        if (status === "awaiting_courier") {
            html += `
                <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Courier Guy Code</label>
                    <input
                        type="text"
                        id="courierGuyInput"
                        class="input input-bordered w-full"
                        placeholder="Enter Courier Guy tracking code"
                        value="${courierGuyCode}"
                    />
                    ${selectedParcel?.CourierGuyCode
                        ? `
                        <div class="mt-2 bg-blue-50 p-3 rounded-md">
                            <h4 class="font-medium">Current Courier Guy Code</h4>
                            <p class="text-sm">${selectedParcel.CourierGuyCode}</p>
                        </div>
                    `
                        : ""}
                </div>
            `;
        }

        const result = await Swal.fire({
            title: "Confirm Status Update",
            html,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update",
            cancelButtonText: "Cancel",
            preConfirm: () => {
                if (status === "awaiting_courier") {
                    const input = document.getElementById("courierGuyInput");
                    setCourierGuyCode(input.value);
                    return input.value;
                }
                return null;
            },
        });

        if (result.isConfirmed) {
            await updateParcel({
                parcelId: selectedParcel._id,
                action: "updateStatus",
                payload: {
                    status,
                    location: getStatusLocation(status),
                    details: `Status updated to: ${statusInfo?.label}`,
                    changedBy: "admin",
                    CourierGuyCode: status === "awaiting_courier" ? result.value : undefined,
                },
            });
        }
    };

    const handleDeleteParcel = async (parcel) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            html: `
                <div class="text-left">
                    <p>You are about to delete this parcel:</p>
                    <div class="mt-2 p-2 bg-red-50 rounded-md">
                        <p class="font-medium">${parcel.title}</p>
                        <p class="text-sm">Tracking ID: ${parcel.trackingNumber}</p>
                        <p class="text-sm">Status: ${formatDeliveryStatus(parcel.deliveryStatus)}</p>
                        ${parcel.paymentStatus === "Paid" ? '<p class="text-sm text-red-500">Warning: This is a paid parcel!</p>' : ""}
                    </div>
                    <p class="mt-2 text-red-600">This action cannot be undone!</p>
                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            await updateParcel({
                parcelId: parcel._id,
                action: "deleteParcel",
            });
        }
    };

    const formatDeliveryStatus = (statusArray) => {
        if (!statusArray || !Array.isArray(statusArray) || statusArray.length === 0) {
            return "Order Confirmed";
        }
        const lastStatus = statusArray[statusArray.length - 1].status.toLowerCase();
        const statusInfo = statusOptions.find((s) => s.value === lastStatus);
        return statusInfo?.label || lastStatus.replace(/_/g, " ");
    };

    const getStatusBadgeColor = (status) => {
        const statusInfo = statusOptions.find((s) => s.value === status);
        return statusInfo?.color || "bg-gray-100";
    };

    if (isLoadingParcels || isLoadingRiders) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="mt-4 text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Parcel Management</h2>
                            <p className="text-sm text-gray-500 mt-1">Manage parcels and delivery statuses</p>
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
                                {filteredParcels.length} {filteredParcels.length === 1 ? "parcel" : "parcels"}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 max-w-md relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            className="input input-bordered w-full pl-10"
                            placeholder="Search by tracking number or title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                onClick={() => setSearchTerm("")}
                            >
                                <FaTimes className="text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {filteredParcels.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="alert alert-info max-w-2xl mx-auto">
                            <FaInfoCircle className="h-6 w-6" />
                            <div>
                                <h3 className="font-bold">No parcels found</h3>
                                <p className="text-sm">
                                    {debouncedSearchTerm ? "No parcels match your search." : "No parcels available."}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcel Info</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courier Guy Code</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredParcels.map((parcel) => (
                                    <tr key={parcel._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                    {parcel.trackingNumber}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{parcel.title}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {parcel.senderRegion} → {parcel.receiverRegion}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className={`badge ${parcel.paymentStatus === "Paid" ? "badge-success" : "badge-warning"} gap-2`}>
                                                <FaMoneyBillWave />
                                                {parcel.paymentStatus}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className={`badge ${getStatusBadgeColor(getCurrentDeliveryStatus(parcel))}`}>
                                                {formatDeliveryStatus(parcel.deliveryStatus)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {parcel.assigned_rider_name ? (
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">{parcel.assigned_rider_name}</div>
                                                    <div className="text-gray-500 text-xs">{parcel.assigned_rider_phone}</div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Not assigned</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {parcel.CourierGuyCode ? (
                                                <div className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                    {parcel.CourierGuyCode}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Not set</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDeleteParcel(parcel)}
                                                    className="btn btn-xs btn-error btn-outline"
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
                                                        className="btn btn-xs btn-primary"
                                                        disabled={isUpdating}
                                                    >
                                                        <FaMotorcycle />
                                                        Assign
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openStatusModal(parcel)}
                                                    className="btn btn-xs btn-outline"
                                                >
                                                    Update Status
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isAssignModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-3xl">
                        <h3 className="text-lg font-bold mb-4">Assign Rider for: {selectedParcel?.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="label text-sm font-medium text-gray-500">Tracking ID</label>
                                <p className="font-mono text-sm">{selectedParcel?.trackingNumber}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="label text-sm font-medium text-gray-500">Route</label>
                                <p className="text-sm">{selectedParcel?.senderRegion} → {selectedParcel?.receiverRegion}</p>
                            </div>
                        </div>
                        <select
                            className="select select-bordered w-full mb-6"
                            value={selectedRider?._id || ""}
                            onChange={(e) => setSelectedRider(ridersData.find((r) => r._id === e.target.value) || null)}
                        >
                            <option value="">Select a rider</option>
                            {ridersData.map((rider) => (
                                <option key={rider._id} value={rider._id}>
                                    {rider.name} - {rider.phone} ({rider.district})
                                </option>
                            ))}
                        </select>
                        <div className="modal-action">
                            <button
                                className="btn btn-primary"
                                onClick={() => assignRider(selectedParcel._id, selectedRider)}
                                disabled={!selectedRider || isUpdating}
                            >
                                {isUpdating ? <span className="loading loading-spinner"></span> : "Assign Rider"}
                            </button>
                            <button className="btn" onClick={() => setIsAssignModalOpen(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isStatusModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <h3 className="text-lg font-bold mb-4">Update Status for: {selectedParcel?.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="label text-sm font-medium text-gray-500">Tracking ID</label>
                                <p className="font-mono text-sm">{selectedParcel?.trackingNumber}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="label text-sm font-medium text-gray-500">Current Status</label>
                                <p className="badge">{formatDeliveryStatus(selectedParcel?.deliveryStatus)}</p>
                            </div>
                            {selectedParcel?.CourierGuyCode && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="label text-sm font-medium text-gray-500">Courier Guy Code</label>
                                    <p className="font-mono text-sm">{selectedParcel.CourierGuyCode}</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {statusOptions.map((status) => (
                                <div
                                    key={status.value}
                                    onClick={() => handleStatusUpdate(status.value)}
                                    className={`p-3 rounded-lg cursor-pointer ${status.value === selectedStatus ? "ring-2 ring-blue-500" : "hover:bg-gray-50"} ${status.color}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{status.icon}</span>
                                        <div>
                                            <p className="font-medium">{status.label}</p>
                                            <p className="text-xs text-gray-600">Location: {getStatusLocation(status.value)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setIsStatusModalOpen(false)}>
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