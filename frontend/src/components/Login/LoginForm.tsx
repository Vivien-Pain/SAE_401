import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Veuillez remplir tous les champs.");
      return;
    }

   
    console.log("Connexion réussie !");
    navigate("/home"); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Se connecter</h1>
      <form onSubmit={handleSubmit} className="w-80 space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border rounded-md"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border rounded-md"
        />
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-md">
          Connexion
        </button>
      </form>
      <p className="mt-4">
        Pas encore de compte ?{" "}
        <button onClick={onSwitchToSignUp} className="text-blue-500">
          Inscris-toi
        </button>
      </p>
    </div>
  );
};

export default Login;
