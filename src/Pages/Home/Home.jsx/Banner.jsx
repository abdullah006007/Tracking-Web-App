import React, { useState, useEffect } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import image1 from "../../../assets/banner/banner1.png";
import image2 from "../../../assets/banner/banner2.png";
import image3 from "../../../assets/banner/banner3.png";
import { Carousel } from 'react-responsive-carousel';
import { Link } from 'react-router-dom'; // Note: Changed from 'react-router' to 'react-router-dom'
import Spinner from '../../../Shared/Spinner';

const Banner = () => {
    const [imagesLoaded, setImagesLoaded] = useState(false);

    useEffect(() => {
        // Preload images
        const loadImages = async () => {
            const images = [image1, image2, image3];
            const promises = images.map((image) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = image;
                    img.onload = resolve;
                    img.onerror = reject;
                });
            });

            try {
                await Promise.all(promises);
                setImagesLoaded(true);
            } catch (error) {
                console.error("Error loading images:", error);
                // You might want to handle this error case differently
                setImagesLoaded(true); // Still show carousel even if some images fail
            }
        };

        loadImages();
    }, []);

    if (!imagesLoaded) {
        return <Spinner />;
    }

    return (
        <div>
            <Carousel autoPlay={true} infiniteLoop={true} interval={3000} showThumbs={false}>
                <div>
                    <img src={image1} alt="Banner 1" />
                    <p className="legend">
                        <Link to="track-parcel"><button className='cursor-pointer'>Track now</button></Link>
                    </p>
                </div>
                <div>
                    <img src={image2} alt="Banner 2" />
                    <p className="legend">
                        <Link to="track-parcel"><button className='cursor-pointer'>Track now</button></Link>
                    </p>
                </div>
                <div>
                    <img src={image3} alt="Banner 3" />
                    <p className="legend">
                        <Link to="track-parcel"><button className='cursor-pointer'>Track now</button></Link>
                    </p>
                </div>
            </Carousel>
        </div>
    );
};

export default Banner;