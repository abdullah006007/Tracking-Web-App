import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaTruck, 
  FaGlobeAmericas, 
  FaWarehouse, 
  FaChartLine,
  FaHandshake,
  FaUsers,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaClock
} from 'react-icons/fa';
import { GiDeliveryDrone, GiCargoShip } from 'react-icons/gi';
import { MdOutlineLocalShipping, MdAirplanemodeActive, MdStorage } from 'react-icons/md';
import { RiTeamFill } from 'react-icons/ri';
import useAxiosPublic from '../../Hooks/useAxiosPublic';

const About = () => {
  const axiosPublic = useAxiosPublic();
  const stats = [
    { value: '15+', label: 'Years Experience', icon: <FaChartLine className="text-3xl" /> },
    { value: '500+', label: 'Happy Clients', icon: <FaHandshake className="text-3xl" /> },
    { value: '50+', label: 'Team Members', icon: <FaUsers className="text-3xl" /> },
    { value: '24/7', label: 'Support', icon: <FaTruck className="text-3xl" /> }
  ];

  const services = [
    { 
      icon: <MdOutlineLocalShipping className="text-4xl" />, 
      title: 'Road Freight', 
      description: 'Efficient transportation across cities and countries with our modern fleet.' 
    },
    { 
      icon: <GiCargoShip className="text-4xl" />, 
      title: 'Ocean Freight', 
      description: 'Global shipping solutions with competitive rates and reliable schedules.' 
    },
    { 
      icon: <MdAirplanemodeActive className="text-4xl" />, 
      title: 'Air Freight', 
      description: 'Fast and secure air cargo services for time-sensitive shipments.' 
    },
    { 
      icon: <FaWarehouse className="text-4xl" />, 
      title: 'Warehousing', 
      description: 'State-of-the-art storage facilities with advanced inventory management.' 
    },
    { 
      icon: <GiDeliveryDrone className="text-4xl" />, 
      title: 'Last Mile', 
      description: 'Precision delivery to your customers\' doorstep with real-time tracking.' 
    },
    { 
      icon: <FaGlobeAmericas className="text-4xl" />, 
      title: 'Global Network', 
      description: 'Worldwide logistics solutions through our extensive partner network.' 
    }
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-800 to-blue-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Delivering Excellence Worldwide
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto"
          >
            Your trusted partner in global logistics and supply chain solutions
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white transform skew-y-1 -mb-8"></div>
      </div>

      {/* Our Story */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4 text-lg">
              Founded in 2008, SwiftLogix began as a small regional logistics provider with just five trucks and a vision to revolutionize the freight industry.
            </p>
            <p className="text-gray-600 mb-4 text-lg">
              Today, we've grown into a global logistics powerhouse, serving clients across six continents with innovative supply chain solutions.
            </p>
            <p className="text-gray-600 text-lg">
              Our journey has been fueled by a commitment to reliability, transparency, and customer satisfaction.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="bg-blue-100 p-12 rounded-full text-blue-600">
              <RiTeamFill className="text-8xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-700 text-white py-16">
        <div className="container mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            By The Numbers
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-blue-800 rounded-xl shadow-lg"
              >
                <div className="flex justify-center mb-4 text-blue-300">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
                <p className="text-blue-200">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-4 text-lg">
              To simplify global commerce by providing seamless, technology-driven logistics solutions.
            </p>
            <p className="text-gray-600 mb-4 text-lg">
              We believe in building partnerships, not just client relationships.
            </p>
            <p className="text-gray-600 text-lg">
              Our team works tirelessly to ensure your goods move efficiently across the globe.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="bg-blue-100 p-12 rounded-full text-blue-600">
              <MdStorage className="text-8xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Services */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Comprehensive Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              End-to-end logistics solutions for modern businesses
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-blue-600 mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="bg-blue-100 p-12 rounded-full text-blue-600">
              <FaMapMarkedAlt className="text-8xl" />
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Why Choose Us?</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <FaShieldAlt className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Reliable Network</h3>
                  <p className="text-gray-600">
                    Extensive carrier network for efficient routing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <FaGlobeAmericas className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Global Reach</h3>
                  <p className="text-gray-600">
                    Capabilities in over 150 countries worldwide.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <FaClock className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Real-time Tracking</h3>
                  <p className="text-gray-600">
                    Complete visibility of your shipments 24/7.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-20 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto px-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Supply Chain?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Partner with us for logistics solutions that drive your business forward.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-800 px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Get a Free Quote
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default About;