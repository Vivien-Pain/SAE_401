import { Link } from "react-router-dom"; // Si tu utilises react-router-dom pour la navigation

interface NavBarProps {
  openPostForm: () => void;  // Ajout de la prop pour ouvrir le formulaire
}

const NavBar = ({ openPostForm }: NavBarProps) => {
  return (
    <div className="fixed bottom-0 w-full bg-white py-4 px-6 shadow-lg flex justify-between items-center">
      <div className="flex justify-between items-center w-full max-w-xs mx-auto">
        {/* Icône Home */}
        <Link to="/" className="flex justify-center items-center">
          <img
            src="/assets/Home.png"
            alt="Home"
            className="w-6 h-6 md:w-8 md:h-8 cursor-pointer"
          />
        </Link>

        {/* Bouton "+" pour ouvrir le formulaire de post */}
        <button onClick={openPostForm} className="flex justify-center items-center">
          <img
            src="/assets/Post.png"
            alt="Post"
            className="w-6 h-6 md:w-8 md:h-8 cursor-pointer"
          />
        </button>

        {/* Icône Messages */}
        <Link to="/messages" className="flex justify-center items-center">
          <img
            src="/assets/Message.png"
            alt="Messages"
            className="w-6 h-6 md:w-8 md:h-8 cursor-pointer"
          />
        </Link>

        {/* Icône Profile */}
        <Link to="/profile" className="flex justify-center items-center">
          <img
            src="/assets/Logo.png"
            alt="Profile"
            className="w-6 h-6 md:w-8 md:h-8 cursor-pointer"
          />
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
