import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { 
  FaBox, FaBoxOpen, FaShippingFast, FaUsers, 
  FaMoneyBillWave, FaChartLine, FaChartPie, 
  FaChartBar, FaUserPlus, FaCalendarAlt,
  FaCheckCircle, FaTimesCircle, FaExchangeAlt,
  FaTruck, FaMapMarkerAlt, FaInfoCircle
} from 'react-icons/fa';
import { GiDeliveryDrone } from 'react-icons/gi';
import { MdSecurity, MdUpdate, MdOutlineAssignmentTurnedIn } from 'react-icons/md';
import { FiRefreshCw } from 'react-icons/fi';
import { RiLoader4Fill } from 'react-icons/ri';
import { BsClock, BsCheck2Circle } from 'react-icons/bs';
import Spinner from '../../../Shared/Spinner';
import DashboardCard from './DashboardCard';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement,
  Title,
  Filler
);

const Dash_Home = () => {
  const axiosSecure = useAxiosSecure();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [courierStats, setCourierStats] = useState({
    inTransit: 0,
    delivered: 0,
    outForDelivery: 0
  });

  // ShipLogic API bearer token
  const BEARER_TOKEN = "e625e493e8b542eeafdf82a60212c8a6";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosSecure.get('/admin/dashboard-stats');
      setStats(response.data);
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
      
      // Fetch Courier Guy stats if we have parcels
      if (response.data?.parcels?.total > 0) {
        fetchCourierStats();
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchCourierStats = async () => {
    try {
      // Get all parcels with CourierGuyCode
      const parcelsResponse = await axiosSecure.get('/parcels');
      const parcelsWithCourierCode = parcelsResponse.data.filter(
        p => p.CourierGuyCode && ['in_transit', 'delivered'].includes(p.status)
      );

      if (parcelsWithCourierCode.length === 0) return;

      // Fetch tracking info for each parcel
      const trackingPromises = parcelsWithCourierCode.map(async (parcel) => {
        try {
          const response = await fetch(
            `https://api.shiplogic.com/v2/tracking/shipments?tracking_reference=${encodeURIComponent(parcel.CourierGuyCode)}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (!response.ok) {
            console.error(`Failed to fetch tracking for ${parcel.CourierGuyCode}`);
            return null;
          }
          
          return await response.json();
        } catch (error) {
          console.error(`Error fetching tracking for ${parcel.CourierGuyCode}:`, error);
          return null;
        }
      });

      const trackingResults = await Promise.all(trackingPromises);
      
      // Count statuses
      const stats = {
        inTransit: 0,
        delivered: 0,
        outForDelivery: 0
      };

      trackingResults.forEach(result => {
        if (result?.shipments?.[0]?.status) {
          const status = result.shipments[0].status;
          if (status === 'in-transit') stats.inTransit++;
          else if (status === 'delivered') stats.delivered++;
          else if (status === 'out-for-delivery') stats.outForDelivery++;
        }
      });

      setCourierStats(stats);
    } catch (error) {
      console.error('Error fetching courier stats:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [axiosSecure]);

  if (loading && !stats) return <Spinner />;
  if (error) return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
        <button 
          onClick={fetchDashboardData}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );

  // Safely get values with fallbacks
  const parcelStats = stats?.parcels || {
    total: 0,
    delivered: 0,
    inTransit: 0,
    processing: 0,
    cancelled: 0,
    awaiting_courier: 0
  };

  const userStats = stats?.users || { total: 0, newThisMonth: 0 };
  const revenueStats = stats?.revenue || { total: 0 };
  const monthlyStats = stats?.monthlyStats || [];
  const userGrowth = stats?.userGrowth || [];
  const recentActivity = stats?.recentActivity || [];

  // Calculate average revenue per parcel
  const avgRevenuePerParcel = revenueStats.total / Math.max(1, parcelStats.total);

  // Adjust delivered and inTransit counts with Courier Guy data
  const adjustedParcelStats = {
    ...parcelStats,
    delivered: courierStats.delivered > 0 ? courierStats.delivered : parcelStats.delivered,
    inTransit: courierStats.inTransit + courierStats.outForDelivery > 0 
      ? courierStats.inTransit + courierStats.outForDelivery 
      : parcelStats.inTransit
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Status colors
  const statusColors = {
    delivered: 'bg-green-100 text-green-800',
    inTransit: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    outForDelivery: 'bg-orange-100 text-orange-800',
    awaiting_courier: 'bg-purple-100 text-purple-800'
  };

  // Chart data configurations
  const statusPieData = {
    labels: ['Delivered', 'In Transit', 'Out for Delivery', 'Processing', 'Awaiting Courier', 'Cancelled'],
    datasets: [
      {
        data: [
          adjustedParcelStats.delivered,
          courierStats.inTransit,
          courierStats.outForDelivery,
          adjustedParcelStats.processing,
          parcelStats.awaiting_courier,
          adjustedParcelStats.cancelled
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(156, 163, 175, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1,
        hoverOffset: 15
      }
    ]
  };

  const monthlyBarData = {
    labels: monthlyStats.map(month => month.month || ''),
    datasets: [
      {
        label: 'Parcels',
        data: monthlyStats.map(month => month.count || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(59, 130, 246, 1)'
      }
    ]
  };

  const userLineData = {
    labels: userGrowth.map(entry => entry.month || ''),
    datasets: [
      {
        label: 'New Users',
        data: userGrowth.map(entry => entry.count || 0),
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)'
      }
    ]
  };

  // User growth doughnut chart
  const userDoughnutData = {
    labels: ['Existing Users', 'New This Month'],
    datasets: [{
      data: [userStats.total - userStats.newThisMonth, userStats.newThisMonth],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(167, 139, 250, 0.8)'
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(167, 139, 250, 1)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-600">Comprehensive analytics and insights for your parcel management system</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <span className="text-sm text-gray-500 mr-3">
              Last updated: {lastUpdated || 'Never'}
            </span>
            <button
              onClick={fetchDashboardData}
              className="flex items-center bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
        >
          <DashboardCard
            title="Total Parcels"
            value={adjustedParcelStats.total}
            icon={<FaBox className="text-blue-500 text-2xl" />}
            change={((adjustedParcelStats.total - (monthlyStats[0]?.count || 0)) / (monthlyStats[0]?.count || 1) * 100).toFixed(1)}
            loading={loading}
            variants={itemVariants}
            description="All parcels in the system"
          />
          <DashboardCard
            title="Total Users"
            value={userStats.total}
            icon={<FaUsers className="text-purple-500 text-2xl" />}
            change={((userStats.total - (userGrowth[0]?.count || 0)) / (userGrowth[0]?.count || 1) * 100).toFixed(1)}
            loading={loading}
            variants={itemVariants}
            description={`${userStats.newThisMonth} new this month`}
          />
          <DashboardCard
            title="Total Revenue"
            value={`$${revenueStats.total.toFixed(2)}`}
            icon={<FaMoneyBillWave className="text-green-500 text-2xl" />}
            change={15} // Example change percentage
            loading={loading}
            variants={itemVariants}
            description={`Avg: $${avgRevenuePerParcel.toFixed(2)} per parcel`}
          />
          <DashboardCard
            title="Delivered"
            value={adjustedParcelStats.delivered}
            icon={<FaCheckCircle className="text-emerald-500 text-2xl" />}
            change={((adjustedParcelStats.delivered - (monthlyStats[0]?.count || 0)) / (monthlyStats[0]?.count || 1) * 100).toFixed(1)}
            loading={loading}
            variants={itemVariants}
            description={`${((adjustedParcelStats.delivered / adjustedParcelStats.total) * 100).toFixed(1)}% success rate`}
          />
        </motion.div>

        {/* Second Row Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
        >
          <DashboardCard
            title="In Transit"
            value={adjustedParcelStats.inTransit}
            icon={<FaTruck className="text-blue-500 text-2xl" />}
            change={((adjustedParcelStats.inTransit - (monthlyStats[0]?.count || 0)) / (monthlyStats[0]?.count || 1) * 100).toFixed(1)}
            loading={loading}
            variants={itemVariants}
            description="Currently being transported"
          />
          <DashboardCard
            title="Out for Delivery"
            value={courierStats.outForDelivery}
            icon={<GiDeliveryDrone className="text-orange-500 text-2xl" />}
            change={0} // No historical data for comparison
            loading={loading}
            variants={itemVariants}
            description="With delivery driver"
          />
          <DashboardCard
            title="Processing"
            value={adjustedParcelStats.processing}
            icon={<FaExchangeAlt className="text-yellow-500 text-2xl" />}
            change={((adjustedParcelStats.processing - (monthlyStats[0]?.count || 0)) / (monthlyStats[0]?.count || 1) * 100).toFixed(1)}
            loading={loading}
            variants={itemVariants}
            description="In warehouse processing"
          />
          <DashboardCard
            title="Awaiting Courier"
            value={parcelStats.awaiting_courier}
            icon={<FaShippingFast className="text-purple-500 text-2xl" />}
            change={((parcelStats.awaiting_courier - (monthlyStats[0]?.count || 0)) / (monthlyStats[0]?.count || 1) * 100).toFixed(1)}
            loading={loading}
            variants={itemVariants}
            description="Ready for courier pickup"
          />
        </motion.div>

        {/* Third Row Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
        >
          <DashboardCard
            title="Cancelled"
            value={adjustedParcelStats.cancelled}
            icon={<FaTimesCircle className="text-red-500 text-2xl" />}
            change={((adjustedParcelStats.cancelled - (monthlyStats[0]?.count || 0)) / (monthlyStats[0]?.count || 1) * 100).toFixed(1)}
            loading={loading}
            variants={itemVariants}
            description={`${((adjustedParcelStats.cancelled / adjustedParcelStats.total) * 100).toFixed(1)}% cancellation rate`}
          />
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Pie Chart */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Parcel Status Distribution</h3>
              <div className="flex items-center">
                <FaChartPie className="text-blue-500 mr-2" />
                <span className="text-sm text-gray-500">Real-time</span>
              </div>
            </div>
            <div className="relative h-64">
              <Pie 
                data={statusPieData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: '#1F2937',
                      titleColor: '#F9FAFB',
                      bodyColor: '#F9FAFB',
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = Math.round((value / total) * 100);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  },
                  cutout: '65%'
                }} 
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {statusPieData.labels.map((label, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: statusPieData.datasets[0].backgroundColor[index] }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {label}: <span className="font-medium">{statusPieData.datasets[0].data[index]}</span>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* User Growth Doughnut Chart */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">User Growth</h3>
              <div className="flex items-center">
                <FaUsers className="text-purple-500 mr-2" />
                <span className="text-sm text-gray-500">Monthly</span>
              </div>
            </div>
            <div className="relative h-64">
              <Doughnut 
                data={userDoughnutData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: '#1F2937',
                      titleColor: '#F9FAFB',
                      bodyColor: '#F9FAFB',
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = Math.round((value / total) * 100);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  },
                  cutout: '65%'
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg">
                <div className="text-indigo-600 font-medium">Total Users</div>
                <div className="text-2xl font-bold">{userStats.total}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-purple-600 font-medium">New This Month</div>
                <div className="text-2xl font-bold">{userStats.newThisMonth}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full Width Bar Chart */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Monthly Parcel Volume</h3>
            <div className="flex items-center">
              <FaCalendarAlt className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-500">Last 6 months</span>
            </div>
          </div>
          <div className="h-80">
            <Bar 
              data={monthlyBarData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: '#1F2937',
                    titleColor: '#F9FAFB',
                    bodyColor: '#F9FAFB',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                      title: function(context) {
                        return context[0].label;
                      },
                      label: function(context) {
                        return `Parcels: ${context.raw}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      drawBorder: false,
                      color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                      stepSize: 1
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }} 
            />
          </div>
        </motion.div>

        {/* Full Width Line Chart */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">User Growth Trend</h3>
            <div className="flex items-center">
              <FaChartLine className="text-purple-500 mr-2" />
              <span className="text-sm text-gray-500">Last 6 months</span>
            </div>
          </div>
          <div className="h-80">
            <Line 
              data={userLineData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: '#1F2937',
                    titleColor: '#F9FAFB',
                    bodyColor: '#F9FAFB',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                      title: function(context) {
                        return context[0].label;
                      },
                      label: function(context) {
                        return `New Users: ${context.raw}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      drawBorder: false,
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                },
                elements: {
                  point: {
                    radius: 5,
                    hoverRadius: 7,
                    backgroundColor: '#8B5CF6',
                    borderColor: '#fff',
                    borderWidth: 2
                  }
                }
              }} 
            />
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${index % 2 === 0 ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                      {index % 2 === 0 ? <FaShippingFast className="h-4 w-4" /> : <FaExchangeAlt className="h-4 w-4" />}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activity to display
              </div>
            )}
          </div>
        </motion.div>

        {/* Detailed Stats Section */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Detailed Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parcel Status Breakdown */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <FaBox className="mr-2 text-blue-500" />
                Parcel Status Breakdown
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Delivered</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{adjustedParcelStats.delivered}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors.delivered}`}>
                      {((adjustedParcelStats.delivered / adjustedParcelStats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Transit</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{adjustedParcelStats.inTransit}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors.inTransit}`}>
                      {((adjustedParcelStats.inTransit / adjustedParcelStats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Out for Delivery</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{courierStats.outForDelivery}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors.outForDelivery}`}>
                      {((courierStats.outForDelivery / adjustedParcelStats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Processing</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{adjustedParcelStats.processing}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors.processing}`}>
                      {((adjustedParcelStats.processing / adjustedParcelStats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Awaiting Courier</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{parcelStats.awaiting_courier}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors.awaiting_courier}`}>
                      {((parcelStats.awaiting_courier / adjustedParcelStats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cancelled</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{adjustedParcelStats.cancelled}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors.cancelled}`}>
                      {((adjustedParcelStats.cancelled / adjustedParcelStats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <FaMoneyBillWave className="mr-2 text-green-500" />
                Financial Overview
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="font-medium">${revenueStats.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Revenue per Parcel</span>
                  <span className="font-medium">${avgRevenuePerParcel.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Potential Revenue (Delivered)</span>
                  <span className="font-medium">${(avgRevenuePerParcel * adjustedParcelStats.delivered).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lost Revenue (Cancelled)</span>
                  <span className="font-medium">${(avgRevenuePerParcel * adjustedParcelStats.cancelled).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dash_Home;