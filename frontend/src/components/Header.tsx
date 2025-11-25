export const Header: React.FC = () => {
  return (
    
   <header className="bg-gray-800 text-white px-6 py-4 shadow-md">
  <div className="flex flex-col items-center justify-center">
    <div className="flex items-center gap-2">
      <img src="./asssets/logo.png" className="w-7 h-7" />
      <h1 className="text-2xl font-bold">
        Berlin Wandel by the WebSmithsProfis
      </h1>
    </div>
  </div>
</header>
  );
};
