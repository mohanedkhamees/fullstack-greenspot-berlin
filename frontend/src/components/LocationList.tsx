import { useEffect, useState } from "react";
import type { Location } from "../domain/location";
import { LocationCard } from "./LocationCard";

const API = "http://localhost:8000";

export function LocationList() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/locations`);
        if (!res.ok) throw new Error("Failed to load locations");
        const data = await res.json();
        setLocations(data);
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error)
    return <p className="text-center mt-8 text-red-600">{error}</p>;

  return (
    <main className="container mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Locations</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <LocationCard key={loc._id} location={loc} />
        ))}
      </div>
    </main>
  );
}
