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
    { value: '8+', label: 'Years Experience', icon: <FaChartLine className="text-3xl" /> },
    { value: '500+', label: 'Satisfied Clients', icon: <FaHandshake className="text-3xl" /> },
    { value: '3', label: 'China Warehouses', icon: <FaWarehouse className="text-3xl" /> },
    { value: '3', label: 'SA Warehouses', icon: <MdStorage className="text-3xl" /> }
  ];

  const services = [
    { 
      icon: <GiCargoShip className="text-4xl" />, 
      title: 'Sea Freight', 
      description: 'Reliable ocean shipping with weekly departures from China to South Africa.' 
    },
    { 
      icon: <MdAirplanemodeActive className="text-4xl" />, 
      title: 'Air Freight', 
      description: 'Fast and secure air cargo services for time-sensitive shipments.' 
    },
    { 
      icon: <FaWarehouse className="text-4xl" />, 
      title: 'Warehousing', 
      description: 'Storage facilities in Guangzhou, Yiwu, Shenzhen, Durban, Johannesburg, and Cape Town.' 
    },
    { 
      icon: <MdOutlineLocalShipping className="text-4xl" />, 
      title: 'Last Mile Delivery', 
      description: 'Nationwide delivery network across South Africa.' 
    },
    { 
      icon: <FaShieldAlt className="text-4xl" />, 
      title: 'Customs Clearance', 
      description: 'Professional support for smooth import/export processes.' 
    },
    { 
      icon: <FaGlobeAmericas className="text-4xl" />, 
      title: 'Cross-Bridge Solutions', 
      description: 'Specialized in China-Africa trade with cultural understanding.' 
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
            Bridging China and Africa Through Logistics
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto"
          >
            20% faster, 20% cheaper, 20% better service
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white transform skew-y-1 -mb-8"></div>
      </div>

      {/* Founder's Story */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">A Chinese Entrepreneur's Journey in South Africa</h2>
            <p className="text-gray-600 mb-4 text-lg">
              In 2015, Jack Mabaso set off alone on a journey to South Africa. He had no team, no capital — just determination and a one-way ticket to Johannesburg. In his early twenties, driven by curiosity and ambition, Jack set out to make a life for himself in a foreign land.
            </p>
            <p className="text-gray-600 mb-4 text-lg">
              When he first arrived, Jack didn't jump straight into business. He started from the ground up — working as a translator, a middleman for China–Africa trade, helping South African friends source goods from China, and connecting local youths with opportunities.
            </p>
            <p className="text-gray-600 text-lg">
              Locals fondly began calling him "the guy who can get anything from China." Through this experience, Jack recognized a growing problem: While trade demand was booming, there was a serious lack of fast, safe, and reliable logistics channels.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="bg-blue-100 p-12 rounded-xl text-blue-600">
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

      {/* Company Story */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Founding 20percent</h2>
            <p className="text-gray-600 mb-4 text-lg">
              In 2020, as the global pandemic disrupted logistics worldwide, Jack decided it was time to stop acting as a middleman — and start building a direct shipping route from China to South Africa.
            </p>
            <p className="text-gray-600 mb-4 text-lg">
              The name 20percent represents his challenge to the industry: "I want to be 20% faster, 20% cheaper, and 20% better in service."
            </p>
            <p className="text-gray-600 text-lg">
              From doing everything himself, 20percent has grown into a full-service cross-border logistics company with warehouses in China and South Africa, dedicated freight channels, and a professional team.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="bg-blue-100 p-12 rounded-xl text-blue-600">
              <GiCargoShip className="text-8xl" />
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
              Specialized China-Africa logistics solutions
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
            <div className="bg-blue-100 p-12 rounded-xl text-blue-600">
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
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Unique Advantages</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <FaShieldAlt className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Dual-Cultural Understanding</h3>
                  <p className="text-gray-600">
                    We speak both Chinese efficiency and South African business culture.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <FaGlobeAmericas className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Strategic Locations</h3>
                  <p className="text-gray-600">
                    Warehouses in key Chinese manufacturing hubs and major South African cities.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <FaClock className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Consistent Weekly Departures</h3>
                  <p className="text-gray-600">
                    Reliable shipping schedules you can count on.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-800 mb-6"
          >
            More Than Logistics - Building Bridges
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-4xl mx-auto"
          >
            "I'm not just a freight agent. I'm the bridge of trust between two worlds. At 20percent, we're delivering opportunities, dreams, and the power to transform lives through reliable China-Africa logistics."
          </motion.p>
          <p className="text-lg font-semibold mt-4 text-gray-700">- Jack Mabaso, Founder</p>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Simplify Your China-Africa Shipping?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the 20percent difference in cross-border logistics.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-800 px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Get Your Free Quote
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default About;