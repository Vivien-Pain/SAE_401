const Header = () => {
    return (
      <div className="flex flex-col items-center w-full border-b border-gray-300 bg-white">
        <div className="flex w-full justify-center py-3">
          {/* Onglet "Pour vous" */}
          <h2 className="text-lg font-semibold pb-2 text-black">Pour vous</h2>
        </div>
  
        {/* Barre d'indication sous l'onglet */}
        <div className="relative w-full flex justify-center">
          <div className="h-1 w-16 bg-black"></div>
        </div>
      </div>
    );
  };
  
  export default Header;
  