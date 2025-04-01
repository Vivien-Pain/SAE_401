import { Link, useNavigate } from "react-router-dom";

interface NavBarProps {
  openPostForm: () => void;
  username: string | null;
  profilePicture: string | null; // Ajout de la propriété pour l'image de profil
  onRefresh: () => Promise<void>;
}

const NavBar = ({ openPostForm, username, profilePicture, onRefresh }: NavBarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Suppression du token
    navigate("/"); // Redirection vers la page de connexion
  };

  return (
    <div className="fixed bottom-0 w-full bg-white py-4 px-6 shadow-lg flex justify-between items-center">
      <div className="flex justify-between items-center w-full max-w-xs mx-auto">
        
        <Link to="/" className="flex justify-center items-center">
          <img src="/assets/Home.png" alt="Home" className="w-6 h-6 md:w-8 md:h-8 cursor-pointer" />
        </Link>

        <button onClick={openPostForm} className="flex justify-center items-center">
          <img src="/assets/Post.png" alt="Post" className="w-6 h-6 md:w-8 md:h-8 cursor-pointer" />
        </button>

        <button onClick={onRefresh} className="flex justify-center items-center">
          <img src="/assets/reload.png" alt="Rafraîchir" className="w-6 h-6 md:w-8 md:h-8 cursor-pointer" />
        </button>

        {username ? (
          <Link to={`/profile/${username}`} className="flex justify-center items-center">
            <img
              src={profilePicture || "/assets/Logo.png"} // Utilisation de l'image de profil ou d'une image par défaut
              alt="Profile"
              className="w-6 h-6 md:w-8 md:h-8 cursor-pointer rounded-full" // Ajout de `rounded-full` pour un effet circulaire
            />
          </Link>
        ) : (
          <p className="text-gray-500">Chargement...</p>
        )}

        <button onClick={handleLogout} className="flex justify-center items-center">
          <img src="/assets/logout.png" alt="Déconnexion" className="w-6 h-6 md:w-8 md:h-8 cursor-pointer" />
        </button>
      </div>
    </div>
  );
};

export default NavBar;