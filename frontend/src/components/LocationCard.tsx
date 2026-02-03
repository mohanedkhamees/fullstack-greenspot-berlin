import type { Location } from "../domain/location";
import { getImageUrl } from "../utils/validation";
import LikeButton from "./LikeButton";

interface LocationCardProps {
  location: Location;
  likes: number;
  dislikes: number;
  isNeedsReview?: boolean;
  onLike: () => void;
  onDislike: () => void;
  onSelect: () => void;
  onRemoveFromNeedsReview?: () => void;
}

export default function LocationCard({
  location,
  likes,
  dislikes,
  isNeedsReview = false,
  onLike,
  onDislike,
  onSelect,
  onRemoveFromNeedsReview,
}: LocationCardProps) {
  const imgSrc = getImageUrl(location.images?.[0]?.image);

  return (
    <div
      className={`rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow cursor-pointer ${
        isNeedsReview
          ? "bg-yellow-50 border-2 border-yellow-400"
          : "bg-white"
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect();
        }
      }}
    >
      {isNeedsReview && (
        <div className="bg-yellow-400 text-yellow-900 px-4 py-1 text-sm font-semibold flex items-center justify-between">
          <span>Needs Review</span>
          {onRemoveFromNeedsReview && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemoveFromNeedsReview();
              }}
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded ml-2"
              title="Aus Needs Review entfernen"
            >
              ✕ Entfernen
            </button>
          )}
        </div>
      )}
      <div className="w-full aspect-[16/9] bg-gray-200 overflow-hidden flex items-center justify-center">
        <img src={imgSrc} alt={location.title} className="max-w-full max-h-full object-contain" />
      </div>

      <div className="p-4 flex flex-col gap-2 flex-grow">
        <h2 className="text-lg font-bold text-gray-900">{location.title}</h2>
        <p className="text-gray-700 text-sm">
          {location.street}, {location.zip} {location.city}
        </p>
        <p className="text-gray-600 text-sm">
          <span className="font-semibold">Kategorie:</span> {location.category}
        </p>
        <p className="text-gray-600 text-sm line-clamp-2">{location.description}</p>

        <div className="flex gap-2 mt-3">
          <LikeButton
            label="👍 Like"
            count={likes}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLike();
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded-lg"
          />
          <LikeButton
            label="👎 Dislike"
            count={dislikes}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDislike();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
