import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaSearch, FaUserSlash, FaUserCheck, FaUserEdit, FaFilter } from "react-icons/fa";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import Spinner from "../../../Shared/Spinner";

const ActiveRiders = () => {
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
  const [actionLoading, setActionLoading] = useState(false);

  const {
    data: responseData = {},
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["all-riders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/riders/active");
      return res.data;
    },
  });

  const riders = responseData.data || [];

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    const actionMap = {
      active: {
        title: "Deactivate this rider?",
        text: "The rider will no longer be able to receive new parcels.",
        confirmText: "Yes, deactivate",
        success: "Rider has been deactivated",
      },
      inactive: {
        title: "Activate this rider?",
        text: "The rider will be able to receive new parcels again.",
        confirmText: "Yes, activate",
        success: "Rider has been activated",
      },
    };

    const action = actionMap[currentStatus];

    const result = await Swal.fire({
      title: action.title,
      text: action.text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: action.confirmText,
      cancelButtonText: "Cancel",
      confirmButtonColor: newStatus === "active" ? "#10B981" : "#EF4444",
      cancelButtonColor: "#6B7280",
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await axiosSecure.patch(`/riders/${id}/status`, { status: newStatus });
        Swal.fire("Success!", action.success, "success");
        refetch();
      } catch (error) {
        console.error(error);
        Swal.fire(
          "Error",
          error.response?.data?.message || "Failed to update rider status",
          "error"
        );
      } finally {
        setActionLoading(false);
      }
    }
  };

  const filteredRiders = riders
    .filter((rider) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        rider.name?.toLowerCase().includes(searchLower) ||
        rider.email?.toLowerCase().includes(searchLower) ||
        rider.phone?.toLowerCase().includes(searchLower) ||
        rider.district?.toLowerCase().includes(searchLower) ||
        rider.region?.toLowerCase().includes(searchLower)
      );
    })
    .filter((rider) => {
      if (statusFilter === "all") return true;
      return rider.status === statusFilter;
    });

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow">
        <div className="text-center py-8">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Error Loading Riders
          </h2>
          <p className="text-gray-700 mb-4">
            {error.message || "Failed to load rider data"}
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Riders Management ({riders.length})
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search riders..."
                className="input input-bordered pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-outline">
                <FaFilter className="mr-2" />
                Status: {statusFilter === "all" ? "All" : statusFilter}
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <button onClick={() => setStatusFilter("all")}>All Riders</button>
                </li>
                <li>
                  <button onClick={() => setStatusFilter("active")}>Active Only</button>
                </li>
                <li>
                  <button onClick={() => setStatusFilter("inactive")}>Inactive Only</button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {riders.length === 0 ? (
          <div className="text-center py-10">
            <FaUserEdit className="mx-auto text-4xl text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700">
              No riders found
            </h3>
            <p className="text-gray-500">
              There are currently no riders in the system
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiders.map((rider) => (
                  <tr key={rider._id} className="hover:bg-gray-50">
                    <td className="font-medium">{rider.name}</td>
                    <td>
                      <div className="flex flex-col">
                        <span>{rider.email}</span>
                        <span className="text-sm text-gray-500">
                          {rider.phone}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span>{rider.district}</span>
                        <span className="text-sm text-gray-500">
                          {rider.region}
                        </span>
                      </div>
                    </td>
                    <td>
                      {rider.bike_brand ? (
                        <div className="flex flex-col">
                          <span>{rider.bike_brand}</span>
                          <span className="text-sm text-gray-500">
                            {rider.bike_registration || "No plate"}
                          </span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          rider.status === "active"
                            ? "badge-success"
                            : "badge-warning"
                        } text-white`}
                      >
                        {rider.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleStatusChange(rider._id, rider.status)}
                          className={`btn btn-sm ${
                            rider.status === "active"
                              ? "btn-warning"
                              : "btn-success"
                          }`}
                          disabled={actionLoading}
                        >
                          {rider.status === "active" ? (
                            <>
                              <FaUserSlash className="mr-1" /> Deactivate
                            </>
                          ) : (
                            <>
                              <FaUserCheck className="mr-1" /> Activate
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRiders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <div className="text-gray-500 flex flex-col items-center">
                        <FaSearch className="text-3xl mb-2" />
                        <p>No riders match your search criteria</p>
                        {statusFilter !== "all" && (
                          <button 
                            onClick={() => setStatusFilter("all")}
                            className="btn btn-sm btn-ghost mt-2"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveRiders;