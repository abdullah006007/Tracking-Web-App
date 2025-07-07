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

    return (
        <div className="bg-[#f3f5f6] py-12 px-4">
            <h2


                className="text-3xl font-bold text-[#002E2E] mb-8">Why Choose Us</h2>
            <div

                data-aos="fade-up"
                data-aos-offset="200"
                data-aos-delay=""
                data-aos-duration="1000"
                data-aos-easing="ease-in-out"
                data-aos-mirror="true"
                data-aos-once="false"
                data-aos-anchor-placement="top-center"


                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {features.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-start"
                    >
                        <div className="mb-4">{item.icon}</div>
                        <h3 className="font-semibold text-[#002E2E] text-lg mb-2">
                            {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhyChooseUs;
