import React from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import image1 from "../../../assets/banner/banner1.png"
import image2 from "../../../assets/banner/banner2.png"
import image3 from "../../../assets/banner/banner3.png"
import { Carousel } from 'react-responsive-carousel';

const Banner = () => {
    return (
        <div>

            <Carousel autoPlay={true} infiniteLoop={true} interval={3000} showThumbs={false}>
                <div>
                    <img src={image1} />
                    <p className="legend"> <button className='cursor-pointer'>Track now</button> </p>
                </div>
                <div>
                    <img src={image2} />
                    <p className="legend"><button className='cursor-pointer'>Track now</button></p>
                </div>
                <div>
                    <img src={image3} />
                    <p className="legend"><button className='cursor-pointer'>Track now</button></p>
                </div>
            </Carousel>

        </div>
    );
};

export default Banner;