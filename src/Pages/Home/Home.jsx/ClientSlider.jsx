import Marquee from "react-fast-marquee";

// Import images directly
import amazon from "../../../../public/brands/amazon.png";
import amazonVector from "../../../../public/brands/amazon_vector.png";
import casio from "../../../../public/brands/casio.png";
import moonstar from "../../../../public/brands/moonstar.png";
import randstad from "../../../../public/brands/randstad.png";
import start from "../../../../public/brands/start.png";

const logos = [
  amazon,
  amazonVector,
  casio,
  moonstar,
  randstad,
  start,
];

const ClientSlider = () => {
  return (
    <div className="py-10 bg-[#f3f5f6]">
      <div className="mx-auto w-96 mb-10 font-bold">
        <h2 className="text-black">
          We've helped thousands of sales teams
        </h2>
      </div>

      <Marquee speed={50} gradient={false} direction="right">
        {logos.map((logo, idx) => (
          <img
            key={idx}
            src={logo}
            alt={`client-logo-${idx}`}
            className="h-6 mx-24"
          />
        ))}
      </Marquee>
    </div>
  );
};

export default ClientSlider;