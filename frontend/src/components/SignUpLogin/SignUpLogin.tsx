import { useState } from "react";
import SignUp from "../SignUp/SignUpForm";
import Login from "../Login/LoginForm";

function App() {
  const [isSignUp, setIsSignUp] = useState<boolean | null>(null);

  const handleSignUpClick = () => {
    setIsSignUp(true);
  };

  const handleLoginClick = () => {
    setIsSignUp(false);
  };

  const switchToLogin = () => {
    setIsSignUp(false);
  };

  const switchToSignUp = () => {
    setIsSignUp(true);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        {/* Header logo/titre si besoin */}
        <div className="flex justify-center mb-6">
          {/* Tu peux ajouter ici ton logo */}
        </div>

        {isSignUp === null && (
          <div className="flex flex-col space-y-4">
            {/* Bouton Inscription */}
            <button
              onClick={handleSignUpClick}
              className="p-3 rounded-md font-medium bg-purple-500 text-white text-base hover:bg-purple-600 transition-colors"
            >
              Inscription
            </button>

            {/* Bouton Connexion */}
            <button
              onClick={handleLoginClick}
              className="p-3 rounded-md font-medium bg-purple-500 text-white text-base hover:bg-purple-600 transition-colors"
            >
              Connexion
            </button>
          </div>
        )}

        {/* Formulaire Inscription */}
        {isSignUp === true && <SignUp onSwitchToLogin={switchToLogin} />}

        {/* Formulaire Connexion */}
        {isSignUp === false && <Login onSwitchToSignUp={switchToSignUp} />}
      </div>
    </div>
  );
}

export default App;
