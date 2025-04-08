import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../ui/Bouton/Bouton";
import Icons_Profiles from "../../ui/Icons/Icons_Logo";

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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      {/* Logo */}
      <Icons_Profiles className="w-20 h-20 mb-6" />

      {/* Formulaire de connexion */}
      <form
        onSubmit={handleSubmit}
        className="w-80 space-y-4 bg-white p-6 rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Connexion</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {errorMessage && (
          <p className="text-red-500 text-sm text-center">{errorMessage}</p>
        )}

        {/* Bouton de connexion */}
        <Button type="submit" className="w-full" variant="purple" size="md">
          Connexion
        </Button>
      </form>

      {/* Lien vers inscription */}
      <p className="mt-4 text-sm text-gray-600">
        Pas encore de compte ?{" "}
        <button
          onClick={onSwitchToSignUp}
          className="text-purple-500 hover:underline"
        >
          Inscris-toi
        </button>
      </p>
    </div>
  );
};

export default Login;
