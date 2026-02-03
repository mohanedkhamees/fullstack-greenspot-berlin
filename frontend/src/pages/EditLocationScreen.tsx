import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getLocationById, updateLocation } from "../domain/API";
import type { Location } from "../domain/location";
import { useAuth } from "../auth/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  validateTextField,
  validateBerlinZipCode,
  getTextFieldError,
  getZipCodeError,
} from "../utils/validation";

export default function EditLocationScreen() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    longitude: "",
    latitude: "",
    date: "",
    category: "",
    description: "",
    street: "",
    zip: "",
    city: "",
    country: "",
    user: "",
    danger: "",
    time_category: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

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
        if (data.user !== user?.username) {
          setError("Zugriff verweigert. Nur der Ersteller kann diese Location bearbeiten.");
          setLoading(false);
          return;
        }
        setFormData({
          title: data.title || "",
          longitude: String(data.longitude ?? ""),
          latitude: String(data.latitude ?? ""),
          date: String(data.date ?? ""),
          category: data.category || "",
          description: data.description || "",
          street: data.street || "",
          zip: data.zip ? String(data.zip) : "",
          city: data.city || "",
          country: data.country || "",
          user: data.user || "",
          danger: data.danger || "",
          time_category: data.time_category || "",
        });
      } catch (err: any) {
        setError(err.message || "Fehler beim Laden der Location");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user?.username]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    const errors: Record<string, string> = { ...validationErrors };

    if (name === "title" || name === "street" || name === "city" || name === "category" || name === "description") {
      const error = getTextFieldError(value, name === "title" ? "Titel" : name === "street" ? "Straße" : name === "city" ? "Stadt" : name === "category" ? "Kategorie" : "Beschreibung");
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

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!location) return;

    // Validate all required fields
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
      return;
    }

    setActionError("");
    setSaving(true);
    try {
      if (!formData.danger || !formData.time_category) {
        throw new Error("Bitte wählen Sie Gefahr und Zeitkategorie aus");
      }

      const updated = await updateLocation(
        location._id,
        {
          title: formData.title,
          longitude: parseFloat(formData.longitude),
          latitude: parseFloat(formData.latitude),
          date: formData.date ? parseInt(formData.date, 10) : Date.now(),
          category: formData.category,
          description: formData.description,
          street: formData.street,
          zip: parseInt(formData.zip, 10),
          city: formData.city,
          country: formData.country,
          user: formData.user || user?.username || "",
          danger: formData.danger,
          time_category: formData.time_category,
          tags: [],
        },
        user?.username || ""
      );
      navigate(`/locations/${updated._id}`);
    } catch (err: any) {
      setActionError(err.message || "Fehler beim Speichern der Location");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-100 flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="mb-4">
          <Link
            to={location ? `/locations/${location._id}` : "/locations"}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Zurück zur Location
          </Link>
        </div>

        {loading && <p className="text-center mt-8">Lade Location...</p>}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {!loading && !error && location && (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Location bearbeiten
            </h2>

            {actionError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
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
                  <p className="text-sm font-medium text-gray-700 mb-1">Breitengrad</p>
                  <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                    {location.latitude}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Längengrad</p>
                  <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                    {location.longitude}
                  </p>
                </div>
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

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Speichern..." : "Änderungen speichern"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/locations/${location._id}`)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
