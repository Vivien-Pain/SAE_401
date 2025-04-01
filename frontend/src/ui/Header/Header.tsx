interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
 

  return (
    <div className="flex flex-col items-center w-full border-b border-gray-300 bg-white">
      <div className="flex w-full justify-center py-3">
        <h2 className="text-lg font-semibold pb-2 text-black">Pour vous</h2>
      </div>

      <div className="relative w-full flex justify-center mt-2">
        <div className="h-1 w-16 bg-black"></div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600">Bienvenue, {username || "Chargement..."}!</p>
      </div>
    </div>
  );
};

export default Header;
