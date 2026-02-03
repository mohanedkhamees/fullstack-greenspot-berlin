import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-blue-400 text-white px-6 py-4 shadow-md">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-2">
          <img src="/logo1.png" alt="Logo" className="w-15 h-20" />
          <Link to="/locations" className="text-white hover:text-gray-200">
            <h1 className="text-2xl font-bold">
              Berlin Wandel by the WebSmithsProfis By Mohaned
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}
