import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createLocation } from "../domain/API";
import { useAuth } from "../auth/AuthContext";
import {
  validateTextField,
  validateBerlinZipCode,
  getTextFieldError,
  getZipCodeError,
} from "../utils/validation";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CreateNewLocationScreen() {
  const [formData, setFormData] = useState({
    title: "",
    longitude: "",
    latitude: "",
    date: new Date().getTime().toString(),
    category: "",
    description: "",
    street: "",
    zip: "",
    city: "",
    country: "Deutschland",
    user: "",
    danger: "",
    time_category: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    const errors: Record<string, string> = { ...validationErrors };

    if (name === "title" || name === "street" || name === "city" || name === "category" || name === "description") {
      const error = getTextFieldError(
        value,
        name === "title"
          ? "Titel"
          : name === "street"
            ? "Straße"
            : name === "city"
              ? "Stadt"
              : name === "category"
                ? "Kategorie"
                : "Beschreibung"
      );
      if (error) {
        errors[name] = error;
      } else {
        delete errors[name];
      }
    }

    if (name === "zip") {
      const error = getZipCodeError(value);
      if (error) {
        errors.zip = error;
      } else {
        delete errors.zip;
      }
    }

    setValidationErrors(errors);
  };

  const buildAddressQuery = () => {
    const parts = [
      formData.street,
      formData.zip,
      formData.city,
      formData.country,
    ].filter((part) => part.trim().length > 0);
    return parts.join(", ");
  };

  const resolveCoordsFromAddress = async () => {
    const query = buildAddressQuery();
    if (!query) {
      throw new Error("Bitte geben Sie eine Adresse an");
    }
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "de" },
    });
    if (!res.ok) {
      throw new Error("Geocoding fehlgeschlagen");
    }
    const data = await res.json();
    if (!data || data.length === 0) {
      throw new Error("Adresse nicht gefunden");
    }
    return { lat: data[0].lat, lon: data[0].lon };
  };

  const resolveAddressFromCoords = async (lat: string, lon: string) => {
    if (!lat || !lon) {
      throw new Error("Bitte geben Sie Breiten- und Längengrad an");
    }
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "de" },
    });
    if (!res.ok) {
      throw new Error("Reverse-Geocoding fehlgeschlagen");
    }
    const data = await res.json();
    if (!data || !data.address) {
      throw new Error("Adresse nicht gefunden");
    }
    const address = data.address;
    const street = [address.road, address.house_number]
      .filter(Boolean)
      .join(" ");
    return {
      street: street || formData.street,
      zip: address.postcode || formData.zip,
      city: address.city || address.town || address.village || formData.city,
      country: address.country || formData.country,
    };
  };

  const handleAddressToCoords = async () => {
    setGeoError("");
    setGeoLoading(true);
    try {
      const result = await resolveCoordsFromAddress();
      setFormData((prev) => ({
        ...prev,
        latitude: result.lat,
        longitude: result.lon,
      }));
    } catch (err: any) {
      setGeoError(err.message || "Geocoding fehlgeschlagen");
    } finally {
      setGeoLoading(false);
    }
  };

  const handleCoordsToAddress = async () => {
    setGeoError("");
    setGeoLoading(true);
    try {
      const result = await resolveAddressFromCoords(
        formData.latitude,
        formData.longitude
      );
      setFormData((prev) => ({
        ...prev,
        street: result.street,
        zip: result.zip,
        city: result.city,
        country: result.country,
      }));
    } catch (err: any) {
      setGeoError(err.message || "Reverse-Geocoding fehlgeschlagen");
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setGeoError("");

    try {
      let latitudeValue = formData.latitude;
      let longitudeValue = formData.longitude;
      if ((!latitudeValue || !longitudeValue) && buildAddressQuery()) {
        const resolved = await resolveCoordsFromAddress();
        latitudeValue = resolved.lat;
        longitudeValue = resolved.lon;
      }

      const locationData = {
        title: formData.title,
        longitude: parseFloat(longitudeValue),
        latitude: parseFloat(latitudeValue),
        date: parseInt(formData.date),
        category: formData.category,
        description: formData.description,
        street: formData.street,
        zip: parseInt(formData.zip, 10),
        city: formData.city,
        country: formData.country,
        user: formData.user || user?.username || "Unknown",
        danger: formData.danger,
        time_category: formData.time_category,
        tags: [],
      };

      // Validation
      const errors: Record<string, string> = {};

      if (!formData.title || !validateTextField(formData.title)) {
        errors.title = getTextFieldError(formData.title, "Titel");
      }
      if (!formData.street || !validateTextField(formData.street)) {
        errors.street = getTextFieldError(formData.street, "Straße");
      }
      if (!formData.city || !validateTextField(formData.city)) {
        errors.city = getTextFieldError(formData.city, "Stadt");
      }
      if (!formData.zip || !validateBerlinZipCode(formData.zip)) {
        errors.zip = getZipCodeError(formData.zip);
      }
      if (!formData.category || !validateTextField(formData.category)) {
        errors.category = getTextFieldError(formData.category, "Kategorie");
      }
      if (!formData.description || !validateTextField(formData.description)) {
        errors.description = getTextFieldError(formData.description, "Beschreibung");
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        throw new Error("Bitte korrigieren Sie die Validierungsfehler");
      }

      if (isNaN(locationData.longitude) || isNaN(locationData.latitude)) {
        throw new Error("Ungültige Koordinaten");
      }
      if (!locationData.danger || !locationData.time_category) {
        throw new Error("Bitte wählen Sie Gefahr und Zeitkategorie aus");
      }

      const newLocation = await createLocation(
        locationData,
        user?.role || "",
        imageFile
      );
      navigate(`/locations/${newLocation._id}`);
    } catch (err: any) {
      setError(err.message || "Fehler beim Erstellen der Location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="mb-4">
          <button
            onClick={() => navigate("/locations")}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Zurück zur Liste
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Neue Location erstellen
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {geoError && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
              {geoError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Titel <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {validationErrors.title && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Breitengrad <span className="text-red-500">*</span>
                </label>
                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Längengrad <span className="text-red-500">*</span>
                </label>
                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  required
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddressToCoords}
                disabled={geoLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adresse → Koordinaten
              </button>
              <button
                type="button"
                onClick={handleCoordsToAddress}
                disabled={geoLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Koordinaten → Adresse
              </button>
            </div>

            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                Straße <span className="text-red-500">*</span>
              </label>
              <input
                id="street"
                name="street"
                type="text"
                required
                value={formData.street}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.street
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {validationErrors.street && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                  PLZ <span className="text-red-500">*</span>
                </label>
                <input
                  id="zip"
                  name="zip"
                  type="text"
                  required
                  value={formData.zip}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.zip
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {validationErrors.zip && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.zip}</p>
                )}
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Stadt <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.city
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {validationErrors.city && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Kategorie <span className="text-red-500">*</span>
              </label>
              <input
                id="category"
                name="category"
                type="text"
                required
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.category
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {validationErrors.category && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {validationErrors.description && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="danger" className="block text-sm font-medium text-gray-700 mb-1">
                  Gefahr <span className="text-red-500">*</span>
                </label>
                <select
                  id="danger"
                  name="danger"
                  required
                  value={formData.danger}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte wählen</option>
                  <option value="All good!">All good!</option>
                  <option value="Warning">Warning</option>
                  <option value="High">High</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label htmlFor="time_category" className="block text-sm font-medium text-gray-700 mb-1">
                  Zeitkategorie <span className="text-red-500">*</span>
                </label>
                <select
                  id="time_category"
                  name="time_category"
                  required
                  value={formData.time_category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte wählen</option>
                  <option value="permanent">permanent</option>
                  <option value="semi-permanent">semi-permanent</option>
                  <option value="temporary">temporary</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Foto (optional)
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                }}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Wenn kein Foto hochgeladen wird, wird das Standardbild verwendet.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Wird gespeichert..." : "Speichern"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/locations")}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
