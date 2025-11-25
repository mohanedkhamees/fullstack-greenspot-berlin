import "./App.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LocationList } from "./components/LocationList";

export default function App() {
  return (
    <div className=" bg-gray-100 flex flex-col">
      <Header />

      <main className="container mx-auto px-6 py-8 flex-1">
        

        <LocationList />
      </main>

      <Footer />
    </div>
  );
}

