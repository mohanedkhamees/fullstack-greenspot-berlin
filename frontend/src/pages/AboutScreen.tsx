import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AboutScreen() {
  return (
    <div className="bg-gray-100 flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">About Us</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Willkommen bei <strong>Berlin Wandel by the WebSmithsProfis</strong>!
            </p>
            <p>
              Wir sind ein Team von Entwicklern, die sich auf die Erstellung
              innovativer Web-Anwendungen spezialisiert haben.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              Unser Team
            </h3>
            <p>
              Die WebSmithsProfis setzen sich aus erfahrenen Entwicklern
              zusammen, die leidenschaftlich daran arbeiten, benutzerfreundliche
              und moderne Web-Lösungen zu entwickeln.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              Impressum
            </h3>
            <p>
              <strong>Verantwortlich für den Inhalt:</strong>
              <br />
              WebSmithsProfis
              <br />
              HTW Berlin
              <br />
              Deutschland
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              Datenschutz
            </h3>
            <p>
              Der Schutz Ihrer persönlichen Daten ist uns wichtig. Wir
              verarbeiten Ihre Daten nur im Rahmen der gesetzlichen Bestimmungen
              und verwenden sie ausschließlich für die Bereitstellung unserer
              Dienstleistungen.
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Für weitere Informationen kontaktieren Sie uns bitte über die
              angegebenen Kontaktmöglichkeiten.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
