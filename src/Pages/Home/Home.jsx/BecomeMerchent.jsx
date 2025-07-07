import React from 'react';
import location from '../../../assets/location-merchant.png'

const BecomeMerchent = () => {
    return (
        <div className='text-white my-16'>

            <div className="bg-no-repeat bg-[#03373D] bg-[url('assets/be-a-merchant-bg.png')] rounded-4xl p-20">
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <div data-aos="fade-up-right"

                        data-aos-offset="200"
                        data-aos-delay="50"
                        data-aos-duration="1000"
                        data-aos-mirror="true"
                        data-aos-once="false"
                        data-aos-anchor-placement="top-center"


                    >
                        <img
                            src={location}
                            className="max-w-sm rounded-lg shadow-2xl"
                        />
                    </div>
                    <div data-aos="fade-up-left"

                        data-aos-offset="200"
                        data-aos-delay="50"
                        data-aos-duration="1000"
                        data-aos-mirror="true"
                        data-aos-once="false"
                        data-aos-anchor-placement="top-center"



                    >
                        <h1 className="text-5xl font-bold">Merchant and Customer Satisfaction is Our First Priority</h1>
                        <p className="py-6">
                            We offer the lowest delivery charge with the highest value along with 100%
                            safety of your product. Courier delivers your parcels in every corner
                            right on time.
                        </p>
                        <button className="btn btn-primary rounded-full text-black">Become a Merchant</button>
                        <button className="btn btn-primary rounded-full ml-5 btn-outline">Become a Merchant</button>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default BecomeMerchent;