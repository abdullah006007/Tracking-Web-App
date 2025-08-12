import React from 'react';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, value, icon, change, loading, variants }) => {
  const changeColor = change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500';
  const changeIcon = change > 0 ? '↑' : change < 0 ? '↓' : '';

  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center"
      variants={variants}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-opacity-20 p-3 rounded-full mr-4" style={{ backgroundColor: icon.props.className.includes('blue') ? 'rgba(59, 130, 246, 0.2)' : 
                                                                                   icon.props.className.includes('purple') ? 'rgba(139, 92, 246, 0.2)' : 
                                                                                   icon.props.className.includes('green') ? 'rgba(16, 185, 129, 0.2)' : 
                                                                                   'rgba(245, 158, 11, 0.2)' }}>
        {React.cloneElement(icon, { className: `${icon.props.className} text-xl` })}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-800">
            {value}
          </p>
        )}
        {typeof change === 'number' && (
          <div className={`text-xs mt-1 ${changeColor}`}>
            {changeIcon} {Math.abs(change)}% {change !== 0 && 'from last month'}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardCard;