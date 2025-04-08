// SignUp.tsx
import { useState } from "react";
import {
  signUpContainer,
  SignUpTitle,
  signUpForm,
  signUpInput,
  passwordStrengthText,
  passwordErrorsList,
  errorMessageText,
  submitButton,
  signUpFooter,
  switchToLoginButton,
} from "./SignUpFormStyles";

// Import du composant Button (pour le bouton “S’inscrire”)
import { Button } from "../../ui/Bouton/Bouton";
import Icons_Profiles from "../../ui/Icons/Icons_Logo"; // Import du composant Icons_Profiles

// Import du composant Icons_Profiles


const SignUp = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Validation du mot de passe
  const validatePassword = (password: string) => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Le mot de passe doit comporter au moins 8 caractères.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une majuscule.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une minuscule.");
    }
    if (!/\d/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un chiffre.");
    }
    if (!/[@$!%*?&_-]/.test(password)) {
      errors.push(
        "Le mot de passe doit contenir au moins un caractère spécial (ex. @, $, !, %, etc.)."
      );
    }
    return errors;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    const errors = validatePassword(newPassword);
    setPasswordErrors(errors);

    if (errors.length === 0) {
      setPasswordStrength("Mot de passe fort");
    } else {
      setPasswordStrength("Mot de passe faible");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !username || !password) {
      setErrorMessage("Tous les champs sont requis.");
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
      setErrorMessage("Veuillez entrer un email valide.");
      return;
    }

    if (passwordErrors.length > 0) {
      setErrorMessage("Le mot de passe ne respecte pas les critères de sécurité.");
      return;
    }

    // Création de l'utilisateur
    const registerData = { email, username, password };

    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        throw new Error("Impossible de s'inscrire, veuillez réessayer.");
      }

      const data = await response.json();
      console.log("Utilisateur inscrit:", data);

      // Si l'inscription réussit, rediriger vers la page de connexion
      alert("Inscription réussie !");
      onSwitchToLogin();
    } catch (error) {
      setErrorMessage("Erreur lors de l'inscription, veuillez réessayer.");
    }
  };

  return (
    <div className={signUpContainer()}>
    <Icons_Profiles className={SignUpTitle()} />
      <form onSubmit={handleSubmit} className={signUpForm()}>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className={signUpInput()}
          />
        </div>

        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nom d'utilisateur"
            required
            className={signUpInput()}
          />
        </div>

        <div>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Mot de passe"
            required
            className={signUpInput()}
          />
          <p className={passwordStrengthText()}>{passwordStrength}</p>
          <ul className={passwordErrorsList()}>
            {passwordErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>

        {errorMessage && (
          <p className={errorMessageText()}>{errorMessage}</p>
        )}

        {/* Bouton “S'inscrire” via <Button> */}
        <Button
          type="submit"
          className={submitButton()}
          variant="purple"
          size="md"
        >
          S'inscrire
        </Button>
      </form>

      <div className={signUpFooter()}>
        <p className="text-sm">
          Vous avez déjà un compte ?{" "}
          {/* Bouton “Se connecter” rétabli comme avant (bouton natif) */}
          <button
            onClick={onSwitchToLogin}
            className={switchToLoginButton()}
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
