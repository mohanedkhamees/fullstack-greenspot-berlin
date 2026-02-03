import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAppSelector } from "../store/hooks";
import { fetchLocations } from "../domain/API";
import type { Location } from "../domain/location";
import { getImageUrl } from "../utils/validation";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Fix for default marker icons in react-leaflet
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Yellow/orange icon for needs review locations
const needsReviewIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const needsReviewIds = useAppSelector((state) => state.needsReview.locationIds);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchLocations();
        setLocations(data);
      } catch (err: any) {
        setError(err.message || "Fehler beim Laden der Locations");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Calculate center of all locations or default to Berlin
  const centerLat =
    locations.length > 0
      ? locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length
      : 52.52;
  const centerLng =
    locations.length > 0
      ? locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length
      : 13.405;

  return (
    <div className="bg-gray-100 flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="mb-4">
          <Link
            to="/locations"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Zurück zur Liste
          </Link>
        </div>

        {loading && <p className="text-center mt-8">Lade Karte...</p>}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-[600px] w-full">
              <MapContainer
                center={[centerLat, centerLng]}
                zoom={locations.length > 0 ? 12 : 10}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((loc) => {
                  const imgSrc = getImageUrl(loc.images?.[0]?.image);
                  const isNeedsReview = needsReviewIds.includes(loc._id);

                  return (
                    <Marker
                      key={loc._id}
                      position={[loc.latitude, loc.longitude]}
                      icon={isNeedsReview ? needsReviewIcon : defaultIcon}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          {isNeedsReview && (
                            <div className="mb-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-sm font-semibold">
                              Needs Review
                            </div>
                          )}
                          <div className="w-full mb-2 rounded overflow-hidden">
                            <img
                              src={imgSrc}
                              alt={loc.title}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                          <h3 className="font-bold text-lg mb-2">{loc.title}</h3>
                          <p className="text-sm text-gray-700 mb-2">
                            {loc.street}, {loc.zip} {loc.city}
                          </p>
                          <Link
                            to={`/locations/${loc._id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                          >
                            Details anzeigen →
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
