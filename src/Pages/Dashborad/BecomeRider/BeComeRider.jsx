import React, { useState } from 'react';
import useAuth from '../../../Hooks/useAuth';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';

const BecomeRider = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const [formData, setFormData] = useState({
        age: '',
        region: '',
        district: '',
        phone: '',
        vehicleType: 'motor-bike', // default value
        bikeBrand: '',
        bikeRegistration: '',
        otherVehicleInfo: '',
        otherInfo: '',
    });

    const [loading, setLoading] = useState(false);

    const vehicleTypes = [
        { value: 'motor-bike', label: 'Motor Bike' },
        { value: 'bicycle', label: 'Bicycle' },
        { value: 'hand-carry', label: 'Hand Carry' },
        { value: 'pickup-truck', label: 'Pickup Truck' },
        { value: 'china-south-africa', label: 'China-South Africa' },
        { value: 'other', label: 'Other' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Trim all fields to avoid accidental spaces
        const trimmedData = {
            age: formData.age.trim(),
            region: formData.region.trim(),
            district: formData.district.trim(),
            phone: formData.phone.trim(),
            vehicleType: formData.vehicleType,
            bikeBrand: formData.bikeBrand.trim(),
            bikeRegistration: formData.bikeRegistration.trim(),
            otherVehicleInfo: formData.otherVehicleInfo.trim(),
            otherInfo: formData.otherInfo.trim(),
        };

        const { age, region, district, phone } = trimmedData;

        if (!age || !region || !district || !phone) {
            Swal.fire('Error', 'Please fill all required fields', 'error');
            return;
        }

        // Validate age is number between 18 and 70
        const ageNum = Number(age);
        if (isNaN(ageNum)) {  // Added missing closing parenthesis
            Swal.fire('Error', 'Age must be a valid number', 'error');
            return;
        }
        if (ageNum < 18 || ageNum > 70) {
            Swal.fire('Error', 'Age must be between 18 and 70', 'error');
            return;
        }

        // Validate bike info if vehicle is motor-bike
        if (trimmedData.vehicleType === 'motor-bike' && !trimmedData.bikeBrand) {
            Swal.fire('Error', 'Please provide your bike brand', 'error');
            return;
        }

        const riderApplication = {
            name: user?.displayName || '',
            email: user?.email || '',
            age: ageNum,
            region,
            district,
            phone,
            vehicle_type: trimmedData.vehicleType,
            bike_brand: trimmedData.bikeBrand,
            bike_registration: trimmedData.bikeRegistration,
            other_vehicle_info: trimmedData.otherVehicleInfo,
            other_info: trimmedData.otherInfo,
            status: 'pending',
            applied_at: new Date().toISOString(),
        };

        setLoading(true);

        try {
            const response = await axiosSecure.post('/riders', riderApplication);

            if (response.data?.insertedId || response.data?.success) {
                Swal.fire('Success', 'Your rider application is submitted!', 'success');
                setFormData({
                    age: '',
                    region: '',
                    district: '',
                    phone: '',
                    vehicleType: 'motor-bike',
                    bikeBrand: '',
                    bikeRegistration: '',
                    otherVehicleInfo: '',
                    otherInfo: '',
                });
            } else {
                Swal.fire('Error', 'Submission failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Submit error:', error);
            Swal.fire(
                'Error',
                error.response?.data?.message || error.message || 'Failed to submit application',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
            <h2 className="text-2xl font-semibold mb-6 text-center">Become a Rider</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name (readonly) */}
                <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <input
                        type="text"
                        value={user?.displayName || ''}
                        readOnly
                        className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
                    />
                </div>

                {/* Email (readonly) */}
                <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
                    />
                </div>

                {/* Age */}
                <div>
                    <label className="block mb-1 font-medium">
                        Age <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="18"
                        max="70"
                        required
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Enter your age"
                    />
                </div>

                {/* Region and District */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block mb-1 font-medium">
                            Region <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="region"
                            value={formData.region}
                            onChange={handleChange}
                            required
                            className="w-full border px-3 py-2 rounded"
                            placeholder="Enter your region"
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block mb-1 font-medium">
                            District <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            required
                            className="w-full border px-3 py-2 rounded"
                            placeholder="Enter your district"
                        />
                    </div>
                </div>

                {/* Phone Number */}
                <div>
                    <label className="block mb-1 font-medium">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Enter your phone number"
                    />
                    <small className="text-gray-500">Include country code e.g., +880</small>
                </div>

                {/* Vehicle Type */}
                <div>
                    <label className="block mb-1 font-medium">
                        Vehicle Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        required
                        className="w-full border px-3 py-2 rounded"
                    >
                        {vehicleTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Bike Brand (shown only for motor-bike) */}
                {formData.vehicleType === 'motor-bike' && (
                    <div>
                        <label className="block mb-1 font-medium">
                            Bike Brand <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="bikeBrand"
                            value={formData.bikeBrand}
                            onChange={handleChange}
                            required={formData.vehicleType === 'motor-bike'}
                            className="w-full border px-3 py-2 rounded"
                            placeholder="e.g., Yamaha, Honda, etc."
                        />
                    </div>
                )}

                {/* Bike Registration (shown only for motor-bike) */}
                {formData.vehicleType === 'motor-bike' && (
                    <div>
                        <label className="block mb-1 font-medium">
                            Bike Registration Number
                        </label>
                        <input
                            type="text"
                            name="bikeRegistration"
                            value={formData.bikeRegistration}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded"
                            placeholder="e.g., DHK-12345"
                        />
                    </div>
                )}

                {/* Other Vehicle Info (shown for non-motor-bike vehicles) */}
                {formData.vehicleType !== 'motor-bike' && (
                    <div>
                        <label className="block mb-1 font-medium">
                            Vehicle Information
                        </label>
                        <input
                            type="text"
                            name="otherVehicleInfo"
                            value={formData.otherVehicleInfo}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded"
                            placeholder={`Describe your ${vehicleTypes.find(t => t.value === formData.vehicleType)?.label.toLowerCase()}`}
                        />
                    </div>
                )}

                {/* Other Relevant Information */}
                <div>
                    <label className="block mb-1 font-medium">Additional Information</label>
                    <textarea
                        name="otherInfo"
                        value={formData.otherInfo}
                        onChange={handleChange}
                        rows="3"
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Any additional info you want to share"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 rounded font-semibold transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {loading ? 'Submitting...' : 'Submit Application'}
                </button>
            </form>
        </div>
    );
};

export default BecomeRider;