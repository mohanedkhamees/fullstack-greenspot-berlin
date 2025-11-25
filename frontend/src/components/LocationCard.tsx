import { useState } from "react";
import type { Location } from "../domain/location";

export function LocationCard({ location }: { location: Location }) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  
  const hasImage =
    location.images &&
    location.images.length > 0 &&
    location.images[0].image &&
    location.images[0].image !== "null";

  const imgSrc = hasImage
    ? `http://localhost:8000/images/${location.images[0].image}`
    : `http://localhost:8000/images/No-Image.jpg`;

  
  const formattedDate = location.date
    ? new Date(location.date).toLocaleDateString("de-DE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">

    <div className="w-full aspect-[16/9] bg-gray-200 overflow-hidden flex items-center justify-center">
  <img
    src={imgSrc}
    alt={location.title}
    className="max-w-full max-h-full object-contain"
  />
</div>

      
      <div className="p-4 flex flex-col gap-2 flex-grow">

        <h2 className="text-lg font-bold text-gray-900">{location.title}</h2>

        <p className="text-gray-700 text-sm">
          {location.street}, {location.zip} {location.city}
        </p>

        <p className="text-gray-600 text-sm">
          <span className="font-semibold">Category:</span> {location.category}
        </p>
        <p className="text-gray-600 text-sm">
          <span className="font-semibold">Description:</span> {location.description}
        </p>
                
        <div className=" text-sm text-gray-700 space-y-1">

          <p>
            <span className="font-semibold">User:</span> {location.user}
          </p>

          <p>
            <span className="font-semibold">Danger:</span> {location.danger}
          </p>

          <p>
            <span className="font-semibold">Time category:</span>{" "}
            {location.time_category}
          </p>

          <p>
            <span className="font-semibold">Date:</span> {formattedDate}
          </p>

          <p>
            <span className="font-semibold">Coordinates:</span>{" "}
            {location.latitude}, {location.longitude}
          </p>

          {location.tags && location.tags.length > 0 && (
            <p>
              <span className="font-semibold">Tags:</span>{" "}
              {location.tags.join(", ")}
            </p>
          )}
        </div>


        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setLikes((n) => n + 1)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded-lg"
          >
            👍 Like ({likes})
          </button>

          <button
            onClick={() => setDislikes((n) => n + 1)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded-lg"
          >
            👎 Dislike ({dislikes})
          </button>
        </div>
      </div>
    </div>
  );
}
