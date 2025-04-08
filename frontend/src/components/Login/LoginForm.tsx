// Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import du composant Button
import { Button } from "../../ui/Bouton/Bouton";
import Icons_Profiles from "../../ui/Icons/Icons_Logo"; // Import du composant Icons_Profiles

// Import des styles CVA
import {
  loginContainer,
  loginTitle,
  loginForm,
  loginInput,
  errorMessageText,
  loginButton,
  signupText,
  switchSignupButton,
} from "./LoginFormStyles";


const Login = ({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Veuillez remplir tous les champs.");
      return;
    }

    const loginData = { email, password };

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Email ou mot de passe incorrect");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/home");
      } else {
        setErrorMessage("Aucun token reçu, connexion échouée.");
      }
    } catch (error: any) {
      console.error("Erreur de connexion :", error);
      setErrorMessage(
        error.message || "Impossible de se connecter. Veuillez réessayer."
      );
    }
  };

  return (
    <div className={loginContainer()}>
      <Icons_Profiles className={loginTitle()} />

      <form onSubmit={handleSubmit} className={loginForm()}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={loginInput()}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={loginInput()}
        />

        {errorMessage && <p className={errorMessageText()}>{errorMessage}</p>}

        {/* Bouton de connexion via notre composant Button */}
        <Button
          type="submit"
          className={loginButton()}
          variant="purple"
          size="md"
        >
          Connexion
        </Button>
      </form>

      <p className={signupText()}>
        Pas encore de compte ?{" "}
        {/* Bouton “Inscris-toi” rétabli comme avant (bouton natif) */}
        <button
          onClick={onSwitchToSignUp}
          className={switchSignupButton()}
        >
          Inscris-toi
        </button>
      </p>
    </div>
  );
};

export default Login;
