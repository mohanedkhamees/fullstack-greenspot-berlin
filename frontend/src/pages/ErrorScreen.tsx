import { useLocation, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ErrorScreen() {
  const location = useLocation();
  const errorMessage =
    (location.state as any)?.message || "Ein unerwarteter Fehler ist aufgetreten.";

  return (
    <div className="bg-gray-100 flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8 flex-1 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Fehler</h2>
          <p className="text-gray-700 mb-6">{errorMessage}</p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/locations"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
            >
              Zur Locations-Liste
            </Link>
            <Link
              to="/login"
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md"
            >
              Zum Login
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
