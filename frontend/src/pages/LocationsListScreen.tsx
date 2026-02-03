import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { clearAll, unmarkAsNeedsReview } from "../store/needsReviewSlice";
import { fetchLocations } from "../domain/API";
import type { Location } from "../domain/location";
import LocationList from "../components/LocationList";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function LocationsListScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reactions, setReactions] = useState<Record<string, { likes: number; dislikes: number }>>({});
  const [showNeedsReviewBasket, setShowNeedsReviewBasket] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleClearNeedsReview = () => {
    const confirmed = window.confirm(
      "Möchten Sie wirklich alle Locations aus dem Needs Review Basket entfernen?"
    );
    if (confirmed) {
      dispatch(clearAll());
      setShowNeedsReviewBasket(false);
    }
  };

  const displayName = user?.name || user?.username || "Gast";
  const needsReviewLocations = locations.filter((loc) =>
    needsReviewIds.includes(loc._id)
  );
  const hasNeedsReviewItems = needsReviewIds.length > 0;

  return (
    <div className="bg-gray-100 flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome, {displayName}
            </h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate("/locations/map")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md"
            >
              Karte anzeigen
            </button>
            <button
              onClick={() => setShowNeedsReviewBasket((prev) => !prev)}
              className={`font-semibold py-2 px-4 rounded-md ${
                showNeedsReviewBasket
                  ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
                  : "bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
              }`}
            >
              Needs Review Basket ({needsReviewIds.length})
            </button>
            {isAdmin() && (
              <button
                onClick={() => navigate("/locations/add")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
              >
                Location hinzufügen
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>

        {showNeedsReviewBasket && (
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-yellow-900">
                Needs Review Basket ({needsReviewIds.length})
              </h3>
              {hasNeedsReviewItems && (
                <button
                  onClick={handleClearNeedsReview}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md text-sm"
                >
                  Alle löschen
                </button>
              )}
            </div>
            {hasNeedsReviewItems ? (
              <LocationList
                locations={needsReviewLocations}
                loading={false}
                error=""
                reactions={reactions}
                needsReviewIds={needsReviewIds}
                onLike={(id) =>
                  setReactions((prev) => {
                    const current = prev[id] || { likes: 0, dislikes: 0 };
                    return { ...prev, [id]: { ...current, likes: current.likes + 1 } };
                  })
                }
                onDislike={(id) =>
                  setReactions((prev) => {
                    const current = prev[id] || { likes: 0, dislikes: 0 };
                    return { ...prev, [id]: { ...current, dislikes: current.dislikes + 1 } };
                  })
                }
                onSelect={(id) => navigate(`/locations/${id}`)}
                onRemoveFromNeedsReview={(id) => dispatch(unmarkAsNeedsReview(id))}
              />
            ) : (
              <p className="text-yellow-800 text-center py-6">
                Keine Locations im Needs Review Basket.
              </p>
            )}
          </div>
        )}

        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Alle Locations ({locations.length})
        </h3>
        <LocationList
          locations={locations}
          loading={loading}
          error={error}
          reactions={reactions}
          needsReviewIds={needsReviewIds}
          onLike={(id) =>
            setReactions((prev) => {
              const current = prev[id] || { likes: 0, dislikes: 0 };
              return { ...prev, [id]: { ...current, likes: current.likes + 1 } };
            })
          }
          onDislike={(id) =>
            setReactions((prev) => {
              const current = prev[id] || { likes: 0, dislikes: 0 };
              return { ...prev, [id]: { ...current, dislikes: current.dislikes + 1 } };
            })
          }
          onSelect={(id) => navigate(`/locations/${id}`)}
        />
      </main>
      <Footer />
    </div>
  );
}
