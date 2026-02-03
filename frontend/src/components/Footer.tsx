import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-4 mt-10">
      <div className="flex justify-center gap-6 text-sm">
        <Link to="/about" className="hover:text-white">
          About
        </Link>
        <Link to="/about" className="hover:text-white">
          Imprint
        </Link>
        <Link to="/about" className="hover:text-white">
          Privacy Information
        </Link>
      </div>
      <p className="text-center text-xs mt-2">
        © {new Date().getFullYear()} Berlin Wandel by the WebSmithsProfis
      </p>
    </footer>
  );
}
