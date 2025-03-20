import { useState } from 'react';

const SignUp = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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
      errors.push("Le mot de passe doit contenir au moins un caractère spécial (par exemple @, $, !, %, etc.).");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();


    if (!email || !username || !password) {
      setErrorMessage('Tous les champs sont requis.');
      return;
    }

  
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
      setErrorMessage('Veuillez entrer un email valide.');
      return;
    }

    if (passwordErrors.length > 0) {
      setErrorMessage('Le mot de passe ne respecte pas les critères de sécurité.');
      return;
    }

   
    setErrorMessage('');
    console.log('Inscription réussie!');
    
 
    alert('Inscription réussie !'); 
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nom d'utilisateur"
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Mot de passe"
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <p className="text-sm text-gray-600 mt-1">{passwordStrength}</p>
          <ul className="text-sm text-red-500 mt-2">
            {passwordErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white p-3 rounded-md mt-4"
        >
          S'inscrire
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm">
          Vous avez déjà un compte ?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-500 font-medium"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
