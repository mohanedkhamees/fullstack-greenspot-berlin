export const Footer: React.FC = () => {
  return (
      <footer className="bg-gray-900 text-gray-300 py-4 mt-10">
      <div className="flex justify-center gap-6 text-sm">
        <a href="#" className="hover:text-white">About Us</a>
        <a href="#" className="hover:text-white">Legal Notice</a>
      </div>
      <p className="text-center text-xs mt-2">
        © {new Date().getFullYear()} Berlin Wandel by the WebSmithsProfis
      </p>
    </footer>
  );
};
