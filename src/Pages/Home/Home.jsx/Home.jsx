import React from 'react';
import Banner from './Banner';
import OurServices from './OurServices';
import WhyChooseUs from './WhyChooseUs';
import ClientSlider from './ClientSlider';
import FeaturesSection from './FeaturesSection';
import BecomeMerchent from './BecomeMerchent';

const Home = () => {
    return (
        <div className="overflow-hidden">
            
            {/* Banner with zoom-in effect */}
            <div
                data-aos="zoom-in-up"
                data-aos-offset="100"
                data-aos-delay="100"
                data-aos-duration="800"
                data-aos-easing="ease-out-cubic"
                data-aos-once="true"
            >
                <Banner />
            </div>

            {/* WhyChooseUs with staggered fade-up for children */}
            <div className="my-16">
                <WhyChooseUs />
            </div>

            {/* OurServices with fade-up and slight delay */}
            <div
                data-aos="fade-up"
                data-aos-offset="150"
                data-aos-delay="150"
                data-aos-duration="600"
                data-aos-easing="ease-out-back"
                data-aos-once="true"
            >
                <OurServices />
            </div>

            {/* ClientSlider with slide-up effect */}
            <div
                data-aos="fade-up"
                data-aos-offset="150"
                data-aos-delay="200"
                data-aos-duration="700"
                data-aos-easing="ease-out-quad"
                data-aos-once="true"
            >
                <ClientSlider />
            </div>

            {/* FeaturesSection with flip-up effect */}
            <div
                data-aos="fade-up"
                data-aos-offset="200"
                data-aos-delay="100"
                data-aos-duration="800"
                data-aos-easing="ease-out-expo"
                data-aos-once="true"
            >
                <FeaturesSection />
            </div>

            {/* BecomeMerchant with subtle fade-in */}
            <div
                data-aos="fade-in"
                data-aos-offset="100"
                data-aos-delay="300"
                data-aos-duration="1000"
                data-aos-easing="ease-out-quart"
                data-aos-once="true"
            >
                <BecomeMerchent />
            </div>

        </div>
    );
};

export default Home;