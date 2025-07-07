import { FaShippingFast, FaMapMarkedAlt, FaWarehouse, FaMoneyBillWave, FaBuilding, FaUndoAlt } from "react-icons/fa";

const services = [
    {
        title: "Express & Standard Delivery",
        description: "We deliver parcels within 24–72 hours in Dhaka, Chittagong, Sylhet, Khulna, and Rajshahi. Express delivery available in Dhaka within 4–6 hours from pick-up to drop-off.",
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
        description: "100% cash on delivery anywhere in Bangladesh with guaranteed safety of your product.",
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
    return (
        <section className="py-16 px-4 md:px-10 lg:px-20 bg-base-100">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4">Our Services</h2>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                    Enjoy fast, reliable parcel delivery with real-time tracking and zero hassle. From personal packages to business shipments — we deliver on time, every time.
                </p>
            </div>



            <div

                



                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => (
                    <div


                    data-aos="flip-up"
                data-aos-offset="200"
                data-aos-delay="50"
                data-aos-duration="1000"
                data-aos-easing="ease-in-out"
                data-aos-mirror="true"
                data-aos-once="false"
                data-aos-anchor-placement="top-center"
                    
                    
                    
                    key={index} className="card bg-base-200 shadow-md hover:shadow-xl transition duration-300">
                        <div className="card-body items-center text-center">
                            {service.icon}
                            <h3 className="card-title text-xl font-semibold mb-2">{service.title}</h3>
                            <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default OurServices;
