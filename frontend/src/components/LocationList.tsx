import type { Location } from "../domain/location";
import LocationCard from "./LocationCard";

interface LocationListProps {
  locations: Location[];
  loading: boolean;
  error: string;
  reactions: Record<string, { likes: number; dislikes: number }>;
  needsReviewIds?: string[];
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onSelect: (id: string) => void;
  onRemoveFromNeedsReview?: (id: string) => void;
}

export default function LocationList({
  locations,
  loading,
  error,
  reactions,
  needsReviewIds = [],
  onLike,
  onDislike,
  onSelect,
  onRemoveFromNeedsReview,
}: LocationListProps) {
  if (loading) return <p className="text-center mt-8">Lade Locations...</p>;
  if (error)
    return <p className="text-center mt-8 text-red-600">{error}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {locations.map((loc) => (
        <LocationCard
          key={loc._id}
          location={loc}
          likes={reactions[loc._id]?.likes || 0}
          dislikes={reactions[loc._id]?.dislikes || 0}
          isNeedsReview={needsReviewIds.includes(loc._id)}
          onLike={() => onLike(loc._id)}
          onDislike={() => onDislike(loc._id)}
          onSelect={() => onSelect(loc._id)}
          onRemoveFromNeedsReview={
            onRemoveFromNeedsReview
              ? () => onRemoveFromNeedsReview(loc._id)
              : undefined
          }
        />
      ))}
      {locations.length === 0 && (
        <p className="text-center text-gray-500 mt-8 col-span-full">
          Keine Locations gefunden.
        </p>
      )}
    </div>
  );
}
