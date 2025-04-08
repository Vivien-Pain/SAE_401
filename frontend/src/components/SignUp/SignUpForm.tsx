import { useState } from "react";
import { Button } from "../../ui/Bouton/Bouton";
import Icons_Profiles from "../../ui/Icons/Icons_Logo";

const SignUp = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

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
      setErrorMessage(
        "Le mot de passe ne respecte pas les critères de sécurité."
      );
      return;
    }

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

      alert("Inscription réussie !");
      onSwitchToLogin();
    } catch (error) {
      setErrorMessage("Erreur lors de l'inscription, veuillez réessayer.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <Icons_Profiles className="w-20 h-20 mb-6" />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 w-full max-w-sm bg-white p-6 rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Créer un compte</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nom d'utilisateur"
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Mot de passe"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p
            className={`mt-1 text-sm ${passwordStrength === "Mot de passe fort" ? "text-green-500" : "text-red-500"}`}
          >
            {passwordStrength}
          </p>
          <ul className="text-xs text-red-500 list-disc ml-5 mt-1 space-y-1">
            {passwordErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center">{errorMessage}</p>
        )}

        <Button type="submit" className="w-full" variant="purple" size="md">
          S'inscrire
        </Button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        Vous avez déjà un compte ?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-purple-500 hover:underline"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
};

export default SignUp;
