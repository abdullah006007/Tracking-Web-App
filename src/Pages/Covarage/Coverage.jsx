import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MdLocationOn } from "react-icons/md";
import { renderToStaticMarkup } from "react-dom/server";
import { Link, useLoaderData } from "react-router";

// Create custom icon using React icon
const customIcon = new L.DivIcon({
    html: renderToStaticMarkup(
        <MdLocationOn style={{ color: "red", fontSize: "32px" }} />
    ),
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// Component to expose map instance to parent
function MapController({ mapRef }) {
    const map = useMap();
    mapRef.current = map;
    return null;
}

export default function Coverage() {
    const serviceCenters = useLoaderData();
    const mapRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Store actual Leaflet marker instances
    const markerInstances = useRef({});

    const handleSearch = () => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return;

        const match = serviceCenters.find(center =>
            center.district.toLowerCase().includes(term)
        );

        if (match && mapRef.current) {
            const latlng = [match.latitude, match.longitude];
            mapRef.current.flyTo(latlng, 10, { duration: 1 });

            // Open popup if marker exists
            const marker = markerInstances.current[match.district];
            if (marker) {
                marker.openPopup();
            }
        }
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-center">
                We are available in {serviceCenters.length} districts across South Africa
            </h1>

            <div className="flex justify-center gap-2">
                <input
                    type="text"
                    placeholder="Search for a district..."
                    className="input input-bordered w-full max-w-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                    }}
                />
                <button
                    className="btn btn-primary text-black"
                    onClick={handleSearch}
                >
                    Search
                </button>
            </div>

            <div className="h-[500px] w-full mt-6 rounded-xl shadow-lg overflow-hidden">
                <MapContainer
                    center={[-30.5595, 22.9375]}
                    zoom={5}
                    className="h-full w-full"
                >
                    <MapController mapRef={mapRef} />

                    <TileLayer
                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {serviceCenters.map((center) => (
                        <Marker
                            key={center.district}
                            position={[center.latitude, center.longitude]}
                            icon={customIcon}
                            eventHandlers={{
                                add: (e) => {
                                    markerInstances.current[center.district] = e.target;
                                },
                            }}
                        >
                            <Popup>
                                <div className="space-y-1">
                                    <div className="font-bold text-lg">{center.district}</div>
                                    {center.seat && (
                                        <div className="text-sm">Seat: {center.seat}</div>
                                    )}
                                    {center.province && (
                                        <div className="text-sm">Province: {center.province}</div>
                                    )}
                                    {center.covered_areas && center.covered_areas.length > 0 && (
                                        <div className="text-sm">
                                            Areas: {center.covered_areas.slice(0, 3).join(", ")}
                                            {center.covered_areas.length > 3 && "..."}
                                        </div>
                                    )}
                                    <Link
                                        to={`/centers/${center.district.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="text-blue-600 hover:underline text-sm block"
                                    >
                                  
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
