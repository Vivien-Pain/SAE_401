import React from "react";
import Icons_Profiles from "../Icons/Icons_Logo";

interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
  return (
    <div className="flex flex-col items-center w-full border-b border-teal-100 bg-white shadow-md">
      {/* Logo */}
      <div className="flex w-full justify-center items-center py-3">
        <Icons_Profiles />
      </div>

      {/* Texte de bienvenue */}
      <div className="mt-4 text-center">
        <p className="text-xl text-gray-600 font-medium -mt-6 mb-2 tracking-wide">
          Bienvenue,{" "}
          <span className="text-purple-500 font-bold">
            {username || "Chargement..."}
          </span>{" "}
          !
        </p>
      </div>
    </div>
  );
};

export default Header;
