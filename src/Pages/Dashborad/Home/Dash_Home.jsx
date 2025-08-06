import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { FaBox, FaBoxOpen, FaShippingFast, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import Spinner from '../../../Shared/Spinner';

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
  Title
);

const Dash_Home = () => {
  const axiosSecure = useAxiosSecure();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosSecure.get('/admin/dashboard-stats');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [axiosSecure]);

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!stats) return <div className="p-4">No data available</div>;

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

  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  // Chart data configurations
  const statusPieData = {
    labels: ['Delivered', 'In Transit', 'Processing', 'Cancelled'],
    datasets: [
      {
        data: [
          stats.parcels.delivered,
          stats.parcels.inTransit,
          stats.parcels.processing,
          stats.parcels.cancelled
        ],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#F59E0B',
          '#EF4444'
        ],
        borderWidth: 0
      }
    ]
  };

  const monthlyBarData = {
    labels: stats.monthlyStats.map(month => month.month),
    datasets: [
      {
        label: 'Parcels',
        data: stats.monthlyStats.map(month => month.count),
        backgroundColor: '#3B82F6',
        borderRadius: 6
      }
    ]
  };

  const userLineData = {
    labels: stats.userGrowth.map(entry => entry.month),
    datasets: [
      {
        label: 'New Users',
        data: stats.userGrowth.map(entry => entry.count),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  return (
    <motion.div
      className="p-4 md:p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Your existing JSX remains the same, just replace the chart components */}
      
      {/* Replace PieChart with Pie */}
      <div className="h-64">
        <Pie 
          data={statusPieData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right'
              }
            }
          }} 
        />
      </div>

      {/* Replace BarChart with Bar */}
      <div className="h-64">
        <Bar 
          data={monthlyBarData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: false
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

      {/* Replace LineChart with Line */}
      <div className="h-64">
        <Line 
          data={userLineData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: false
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
  );
};

export default Dash_Home;