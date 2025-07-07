import React from 'react';
import Banner from './Banner';
import OurServices from './OurServices';
import WhyChooseUs from './WhyChooseUs';
import ClientSlider from './ClientSlider';
import FeaturesSection from './FeaturesSection';
import BecomeMerchent from './BecomeMerchent';

const Home = () => {
    return (
        <div>

            <div

                data-aos="zoom-in"
                data-aos-offset="200"
                data-aos-delay=""
                data-aos-duration="1000"
                data-aos-easing="ease-in-out-sine"
                data-aos-mirror="true"
                data-aos-once="false"
                data-aos-anchor-placement="top-center"

            >
                <Banner></Banner>
            </div>

            <div




                className='my-16'>
                <WhyChooseUs></WhyChooseUs>
            </div>


            <div

                data-aos="fade-up"
                data-aos-offset="200"
                data-aos-delay="50"
                data-aos-duration="1000"
                data-aos-easing="ease-in-out"
                data-aos-mirror="true"
                data-aos-once="false"
            // data-aos-anchor-placement="top-center"


            >
                <OurServices ></OurServices>

            </div>


            <div

                data-aos="fade-up"
                data-aos-offset="200"
                data-aos-delay="50"
                data-aos-duration="1000"
                data-aos-easing="ease-in-out"
                data-aos-mirror="true"
                data-aos-once="false"
            // data-aos-anchor-placement="top-center"


            >
                <ClientSlider></ClientSlider>
            </div>



            <div


                data-aos="fade-up"
                data-aos-offset="200"
                data-aos-delay="50"
                data-aos-duration="1000"
                data-aos-easing="ease-in-out"
                data-aos-mirror="true"
                data-aos-once="false"
                data-aos-anchor-placement="top-center"


            >
                <FeaturesSection></FeaturesSection>
            </div>

            <div

                // data-aos="fade-up"
                // data-aos-offset="200"
                // data-aos-delay="50"
                // data-aos-duration="1000"
                // data-aos-easing="ease-in-out"
                // data-aos-mirror="true"
                // data-aos-once="false"
                // data-aos-anchor-placement="top-center"



            >



                <BecomeMerchent></BecomeMerchent>

            </div>



        </div>
    );
};

export default Home;