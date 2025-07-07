import { FaTruck, FaShieldAlt, FaHeadset } from 'react-icons/fa';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 flex gap-6 shadow-sm">
    <div className="text-4xl text-primary">{icon}</div>
    <div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  </div>
);

export default function FeaturesSection() {
  return (
    <div className="bg-gray-100 py-10 px-4 md:px-20 space-y-6">
      <FeatureCard
        icon={<FaTruck />}
        title="Live Parcel Tracking"
        description="Stay updated in real-time with our live parcel tracking feature. From pick-up to delivery, monitor your shipment’s journey and get instant status updates for complete peace of mind."
      />
      <FeatureCard
        icon={<FaShieldAlt />}
        title="100% Safe Delivery"
        description="We ensure your parcels are handled with the utmost care and delivered securely to their destination. Our reliable process guarantees safe and damage-free delivery every time."
      />
      <FeatureCard
        icon={<FaHeadset />}
        title="24/7 Call Center Support"
        description="Our dedicated support team is available around the clock to assist you with any questions, updates, or delivery concerns—anytime you need us."
      />
    </div>
  );
}
