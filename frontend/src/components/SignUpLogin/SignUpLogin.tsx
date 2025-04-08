// App.tsx
import { useState } from "react";
import SignUp from "../SignUp/SignUpForm";
import Login from "../Login/LoginForm";

// 1) Import de la librairie CVA
import { cva, type VariantProps } from "class-variance-authority";

// 2) Définition de nos styles de bouton via cva()
const buttonVariants = cva(
  // Classes de base, communes à tous les boutons
  "p-3 rounded-md font-medium transition-colors focus:outline-none",
  {
    // Définition des variantes
    variants: {
      variant: {
        purple: "bg-purple-500 text-white hover:bg-purple-600",
       
      },
      size: {
        sm: "text-sm px-2 py-1",
        md: "text-base px-4 py-2",
      },
    },
    // Valeurs par défaut
    defaultVariants: {
      variant: "purple",
      size: "md",
    },
  }
);

// 3) On peut typer un peu plus si on veut un composant “ButtonCVA”
interface ButtonCVAProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * Petit composant interne pour illustrer l'utilisation de cva()
 * On l'utilise pour "Inscription" et "Connexion"
 */
function ButtonCVA({ variant, size, className, ...props }: ButtonCVAProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}

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
      <div className="flex justify-center mb-6">
        {/* Optionnel : Logo ou titre */}
      </div>

      {/* Choix initial: ni login ni signup affiché */}
      {isSignUp === null && (
        <div className="flex flex-col space-y-4">
        {/* Bouton “Inscription” via cva */}
        <ButtonCVA
          onClick={handleSignUpClick}
          variant="purple"
          size="md"
        >
          Inscription
        </ButtonCVA>

        {/* Bouton “Connexion” via cva */}
        <ButtonCVA
          onClick={handleLoginClick}
          variant="purple"
          size="md"
        >
          Connexion
        </ButtonCVA>
        </div>
      )}

      {/* Formulaire d’inscription */}
      {isSignUp === true && <SignUp onSwitchToLogin={switchToLogin} />}

      {/* Formulaire de connexion */}
      {isSignUp === false && <Login onSwitchToSignUp={switchToSignUp} />}
      </div>
    </div>
  );
}

export default App;
