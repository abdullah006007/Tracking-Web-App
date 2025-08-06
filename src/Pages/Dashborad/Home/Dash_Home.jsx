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

  // Safely get values with fallbacks
  const parcelStats = stats.parcels || {
    total: 0,
    delivered: 0,
    inTransit: 0,
    processing: 0,
    cancelled: 0
  };

  const userStats = stats.users || { total: 0 };
  const revenueStats = stats.revenue || { total: 0 };
  const monthlyStats = stats.monthlyStats || [];
  const userGrowth = stats.userGrowth || [];

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
          parcelStats.delivered,
          parcelStats.inTransit,
          parcelStats.processing,
          parcelStats.cancelled
        ],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#F59E0B',
          '#EF4444'
        ],
        borderWidth: 0,
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
        backgroundColor: '#3B82F6',
        borderRadius: 6
      }
    ]
  };

  const userLineData = {
    labels: userGrowth.map(entry => entry.month || ''),
    datasets: [
      {
        label: 'New Users',
        data: userGrowth.map(entry => entry.count || 0),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Custom pie chart plugin to display numbers inside segments
  const pieChartPlugins = [{
    id: 'pieChartNumbers',
    beforeDraw: function(chart) {
      if (chart.config.type !== 'pie') return;
      
      const ctx = chart.ctx;
      const width = chart.width;
      const height = chart.height;
      const fontSize = (height / 114).toFixed(2);
      
      ctx.restore();
      ctx.font = `${fontSize}em sans-serif`;
      ctx.textBaseline = "middle";
      
      const centerX = width / 2;
      const centerY = height / 2;
      const text = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
      
      // Draw total in center
      ctx.fillStyle = '#4B5563';
      ctx.textAlign = 'center';
      ctx.fillText(text, centerX, centerY - 10);
      ctx.font = `${(fontSize * 0.5).toFixed(2)}em sans-serif`;
      ctx.fillText('Total Parcels', centerX, centerY + 10);
      ctx.save();
    },
    afterDatasetsDraw: function(chart) {
      if (chart.config.type !== 'pie') return;
      
      const ctx = chart.ctx;
      const meta = chart.getDatasetMeta(0);
      
      meta.data.forEach((element, index) => {
        // Get segment info
        const { x, y, startAngle, endAngle, outerRadius } = element;
        const value = chart.data.datasets[0].data[index];
        const label = chart.data.labels[index];
        
        // Calculate position for the number
        const midAngle = startAngle + (endAngle - startAngle) / 2;
        const posX = x + Math.cos(midAngle) * (outerRadius * 0.7);
        const posY = y + Math.sin(midAngle) * (outerRadius * 0.7);
        
        // Draw the number
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(value, posX, posY);
        
        // Draw indicator line
        const lineLength = outerRadius * 0.1;
        const lineX = x + Math.cos(midAngle) * (outerRadius - lineLength);
        const lineY = y + Math.sin(midAngle) * (outerRadius - lineLength);
        
        ctx.beginPath();
        ctx.moveTo(lineX, lineY);
        ctx.lineTo(
          x + Math.cos(midAngle) * (outerRadius * 0.9),
          y + Math.sin(midAngle) * (outerRadius * 0.9)
        );
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }];

  return (
    <motion.div
      className="p-4 md:p-6 space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md flex items-center"
          variants={itemVariants}
          whileHover="hover"
          variants={cardVariants}
        >
          <div className="bg-green-100 p-4 rounded-full mr-4">
            <FaBox className="text-green-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Parcels</h3>
            <p className="text-2xl font-bold text-gray-800">
              {parcelStats.total}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md flex items-center"
          variants={itemVariants}
          whileHover="hover"
          variants={cardVariants}
        >
          <div className="bg-blue-100 p-4 rounded-full mr-4">
            <FaUsers className="text-blue-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <p className="text-2xl font-bold text-gray-800">
              {userStats.total}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md flex items-center"
          variants={itemVariants}
          whileHover="hover"
          variants={cardVariants}
        >
          <div className="bg-purple-100 p-4 rounded-full mr-4">
            <FaMoneyBillWave className="text-purple-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-800">
              ${revenueStats.total.toFixed(2)}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md flex items-center"
          variants={itemVariants}
          whileHover="hover"
          variants={cardVariants}
        >
          <div className="bg-yellow-100 p-4 rounded-full mr-4">
            <FaShippingFast className="text-yellow-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium">In Transit</h3>
            <p className="text-2xl font-bold text-gray-800">
              {parcelStats.inTransit}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Pie Chart */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Parcel Status Distribution</h3>
          <div className="relative h-80">
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
              plugins={pieChartPlugins}
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

        {/* Bar Chart */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Parcel Volume</h3>
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
                    titleFont: {
                      size: 14,
                      weight: 'bold'
                    },
                    bodyFont: {
                      size: 12
                    },
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
                      display: false
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

        {/* Line Chart - Full Width */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-md lg:col-span-2"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth</h3>
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
                    titleFont: {
                      size: 14,
                      weight: 'bold'
                    },
                    bodyFont: {
                      size: 12
                    },
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
                      display: false
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
      </div>
    </motion.div>
  );
};

export default Dash_Home;