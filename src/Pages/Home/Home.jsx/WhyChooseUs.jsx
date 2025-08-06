import { motion } from "framer-motion";
import { FaTruck, FaGlobe, FaDollarSign, FaHeadset } from "react-icons/fa";

const WhyChooseUs = () => {
    const features = [
        {
            title: "Reliable Service",
            desc: "Consistent, on-time delivery you can count on.",
            icon: <FaTruck size={40} className="text-[#002E2E]" />,
        },
        {
            title: "Nationwide Reach",
            desc: "We deliver across cities and regions with speed.",
            icon: <FaGlobe size={40} className="text-[#002E2E]" />,
        },
        {
            title: "Affordable Rates",
            desc: "Top-tier service with competitive pricing.",
            icon: <FaDollarSign size={40} className="text-[#002E2E]" />,
        },
        {
            title: "24/7 Support",
            desc: "Our team is always here to help you.",
            icon: <FaHeadset size={40} className="text-[#002E2E]" />,
        },
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                when: "beforeChildren"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    return (
        <motion.div 
            className="bg-[#f3f5f6] py-12 px-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            variants={containerVariants}
        >
            <motion.h2
                className="text-3xl font-bold text-[#002E2E] mb-8 text-center"
                variants={itemVariants}
            >
                Why Choose Us
            </motion.h2>

            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto"
                variants={containerVariants}
            >
                {features.map((item, index) => (
                    <motion.div
                        key={index}
                        className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow"
                        variants={itemVariants}
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    >
                        <div className="mb-4">{item.icon}</div>
                        <h3 className="font-semibold text-[#002E2E] text-lg mb-2">
                            {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default WhyChooseUs;