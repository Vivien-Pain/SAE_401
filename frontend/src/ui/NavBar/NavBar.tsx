import { Link, useNavigate } from "react-router-dom";

import Icons_Maison from "../Icons/icons_Maison";
import Icons_Modal from "../Icons/Icons_Modal";
import Icons_Reload from "../Icons/Icons_Reload";
import Icons_Profile from "../Icons/Icons_Profile";
import Icons_Deco from "../Icons/icons_Deco";

interface NavBarProps {
  openPostForm: () => void;
  username: string | null;
  profilePicture: string | null;
  onRefresh: () => Promise<void>;
}

const NavBar = ({
  openPostForm,
  username,
  profilePicture,
  onRefresh,
}: NavBarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-50 shadow-xl">
      <div className="flex justify-around items-center max-w-md mx-auto w-full">
        {/* Accueil */}
        <Link
          to="/"
          className="flex flex-col items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
        >
          <Icons_Maison className="w-6 h-6 text-gray-700" />
        </Link>

        {/* Ouvrir création de post */}
        <button
          onClick={openPostForm}
          className="flex flex-col items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
        >
          <Icons_Modal className="w-6 h-6 text-gray-700" />
        </button>

        {/* Rafraîchir */}
        <button
          onClick={onRefresh}
          className="flex flex-col items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
        >
          <Icons_Reload className="w-6 h-6 text-gray-700" />
        </button>

        {/* Profil utilisateur */}
        {username ? (
          <Link
            to={`/profile/${username}`}
            className="flex flex-col items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400"
              />
            ) : (
              <Icons_Profile className="w-6 h-6 text-gray-700" />
            )}
          </Link>
        ) : (
          <p className="text-gray-400">...</p>
        )}

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
        >
          <Icons_Deco className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default NavBar;
