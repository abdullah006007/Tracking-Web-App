import Marquee from "react-fast-marquee";

const logos = [
  "../../../../public/brands/amazon.png",
  "../../../../public/brands/amazon_vector.png",
  "../../../../public/brands/casio.png",
  "../../../../public/brands/moonstar.png",
  "../../../../public/brands/randstad.png",
  "../../../../public/brands/start.png",
];

const ClientSlider = () => {
  return (

    
    
    <div className="py-10 bg-[#f3f5f6]">

        <div className="mx-auto w-96 mb-10 font-bold">
            <h2 className="text-black ">
                We've helped thousands of sales teams
            </h2>
        </div>





      <Marquee speed={50} gradient={false} direction="right">
        {logos.map((logo, idx) => (
          <img
            key={idx}
            src={logo}
            alt={`client-logo-${idx}`}
            className="h-6  mx-24 "
          />
        ))}
      </Marquee>
    </div>
  );
};

export default ClientSlider;
