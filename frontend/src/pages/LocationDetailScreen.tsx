import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getLocationById, deleteLocation } from "../domain/API";
import type { Location } from "../domain/location";
import { useAuth } from "../auth/AuthContext";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { markAsNeedsReview, unmarkAsNeedsReview } from "../store/needsReviewSlice";
import { getImageUrl } from "../utils/validation";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function LocationDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const needsReviewIds = useAppSelector((state) => state.needsReview.locationIds);

  useEffect(() => {
    if (!id) {
      setError("Keine Location-ID angegeben");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const data = await getLocationById(id);
        setLocation(data);
      } catch (err: any) {
        setError(err.message || "Fehler beim Laden der Location");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const formattedDate = location?.date
    ? new Date(location.date).toLocaleDateString("de-DE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const handleDelete = async () => {
    if (!location) return;
    const confirmed = window.confirm("Möchten Sie diese Location wirklich löschen?");
    if (!confirmed) return;
    try {
      await deleteLocation(location._id, user?.username || "");
      navigate("/locations");
    } catch (err: any) {
      alert(err.message || "Fehler beim Löschen der Location");
    }
  };

  // Only the creator of the location can edit/delete (each admin only their own)
  const hasReadWritePermission = location
    ? location.user === user?.username
    : false;

  const isNeedsReview = location ? needsReviewIds.includes(location._id) : false;

  const handleToggleNeedsReview = () => {
    if (!location || !hasReadWritePermission) return;
    if (isNeedsReview) {
      dispatch(unmarkAsNeedsReview(location._id));
    } else {
      dispatch(markAsNeedsReview(location._id));
    }
  };

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

        {loading && <p className="text-center mt-8">Lade Location...</p>}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {!loading && !error && location && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="w-full aspect-[16/9] bg-gray-200 overflow-hidden flex items-center justify-center">
              <img
                src={getImageUrl(location.images?.[0]?.image)}
                alt={location.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="p-6">
              {isNeedsReview && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                  Diese Location wurde als "Needs review" markiert
                </div>
              )}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {location.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-700 text-lg mb-2">
                    <span className="font-semibold">Adresse:</span>
                    <br />
                    {location.street}
                    <br />
                    {location.zip} {location.city}
                    <br />
                    {location.country}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700 text-lg mb-2">
                    <span className="font-semibold">Koordinaten:</span>
                    <br />
                    Breite: {location.latitude}
                    <br />
                    Länge: {location.longitude}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-gray-700">
                  <span className="font-semibold">Kategorie:</span> {location.category}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Beschreibung:</span> {location.description}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Benutzer:</span> {location.user}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Gefahr:</span> {location.danger}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Zeitkategorie:</span> {location.time_category}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Datum:</span> {formattedDate}
                </p>
                {location.tags && location.tags.length > 0 && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Tags:</span>{" "}
                    {location.tags.map((tag) => tag.tag).join(", ")}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-300 flex flex-wrap gap-2">
                {hasReadWritePermission && (
                  <>
                    <Link
                      to={`/locations/${location._id}/edit`}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-md"
                    >
                      Bearbeiten
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md"
                    >
                      Löschen
                    </button>
                  </>
                )}
                {hasReadWritePermission && (
                  <button
                    onClick={handleToggleNeedsReview}
                    className={`font-semibold py-2 px-4 rounded-md ${
                      isNeedsReview
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {isNeedsReview ? "✓ Needs Review entfernen" : "Als Needs Review markieren"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
