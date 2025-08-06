import { motion } from "framer-motion";
import { FaShippingFast, FaMapMarkedAlt, FaWarehouse, FaMoneyBillWave, FaBuilding, FaUndoAlt } from "react-icons/fa";

const services = [
    {
        title: "Express & Standard Delivery",
        description: "We deliver parcels from china to in South Africa",
        icon: <FaShippingFast className="text-4xl text-primary mb-4" />
    },
    {
        title: "Nationwide Delivery",
        description: "We deliver parcels nationwide with home delivery in every district, ensuring your products reach customers within 48–72 hours.",
        icon: <FaMapMarkedAlt className="text-4xl text-primary mb-4" />
    },
    {
        title: "Fulfillment Solution",
        description: "We also offer customized service with inventory management support, online order processing, packaging, and after sales support.",
        icon: <FaWarehouse className="text-4xl text-primary mb-4" />
    },
    {
        title: "Cash on Home Delivery",
        description: "100% cash on delivery anywhere in South Africa with guaranteed safety of your product.",
        icon: <FaMoneyBillWave className="text-4xl text-primary mb-4" />
    },
    {
        title: "Corporate Service / Contract In Logistics",
        description: "Customized corporate services which includes warehouse and inventory management support.",
        icon: <FaBuilding className="text-4xl text-primary mb-4" />
    },
    {
        title: "Parcel Return",
        description: "Through our reverse logistics facility we allow end customers to return or exchange their products with online business merchants.",
        icon: <FaUndoAlt className="text-4xl text-primary mb-4" />
    }
];

const OurServices = () => {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                when: "beforeChildren"
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, rotateX: 15 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                duration: 0.7,
                ease: [0.25, 0.1, 0.25, 1]
            }
        },
        hover: {
            y: -10,
            boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.3 }
        }
    };

    return (
        <motion.section 
            className="py-16 px-4 md:px-10 lg:px-20 bg-base-100"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            variants={containerVariants}
        >
            <motion.div 
                className="text-center mb-10"
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.6 }
                    }
                }}
            >
                <h2 className="text-3xl font-bold mb-4">Our Services</h2>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                    Enjoy fast, reliable parcel delivery with real-time tracking and zero hassle. From personal packages to business shipments — we deliver on time, every time.
                </p>
            </motion.div>

            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
            >
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        className="card bg-base-200 shadow-md hover:shadow-xl transition-all"
                        variants={cardVariants}
                        whileHover="hover"
                        viewport={{ once: true }}
                    >
                        <div className="card-body items-center text-center">
                            {service.icon}
                            <h3 className="card-title text-xl font-semibold mb-2">{service.title}</h3>
                            <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.section>
    );
};

export default OurServices;