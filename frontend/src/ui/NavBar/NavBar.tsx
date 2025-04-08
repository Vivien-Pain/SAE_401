// NavBar.tsx

import { Link, useNavigate } from "react-router-dom";

// Icônes
import Icons_Maison from "../Icons/icons_Maison";
import Icons_Modal from "../Icons/Icons_Modal";
import Icons_Reload from "../Icons/Icons_Reload";
import Icons_Profile from "../Icons/Icons_Profile";
import Icons_Deco from "../Icons/icons_Deco";

// On importe les classes CVA
import {
  navBarContainer,
  navBarContent,
  navBarButton,
  navBarProfileImage,
  navBarIcon,
} from "./NavBarStyles";

interface NavBarProps {
  openPostForm: () => void;
  username: string | null;
  profilePicture: string | null;
  onRefresh: () => Promise<void>;
}

const NavBar = ({ openPostForm, username, profilePicture, onRefresh }: NavBarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    // On applique nos classes CVA
    <div
      // Par défaut, position = "bottom" et theme = "light"
      // On peut remplacer ces valeurs si besoin :
      // className={navBarContainer({ position: "top", theme: "dark" })}
      className={navBarContainer()}
    >
      <div className={navBarContent()}>
        {/* Bouton Accueil */}
        <Link to="/" className={navBarButton()}>
          <Icons_Maison className={navBarIcon()} />
        </Link>

        {/* Bouton pour ouvrir la création de post */}
        <button onClick={openPostForm} className={navBarButton()}>
          <Icons_Modal className={navBarIcon()} />
        </button>

        {/* Bouton pour rafraîchir le fil de posts */}
        <button onClick={onRefresh} className={navBarButton()}>
          <Icons_Reload className={navBarIcon()} />
        </button>

        {/* Accès profil si connecté */}
        {username ? (
          <Link to={`/profile/${username}`} className={navBarButton()}>
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className={navBarProfileImage()}
              />
            ) : (
              <Icons_Profile className={navBarIcon()} />
            )}
          </Link>
        ) : (
          <p className="text-gray-400">...</p>
        )}

        {/* Déconnexion */}
        <button onClick={handleLogout} className={navBarButton()}>
          <Icons_Deco className={navBarIcon()} />
        </button>
      </div>
    </div>
  );
};

export default NavBar;
