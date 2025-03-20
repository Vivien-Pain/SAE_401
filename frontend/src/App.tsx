import { useState } from 'react';
import SignUp from './components/SignUp/SignUpForm';
import Login from './components/Login/LoginForm';


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
        <h1 className="text-3xl font-bold text-center mb-4 text-blue-600">Instagram</h1>
        
        {isSignUp === null && (
          <div className="flex flex-col space-y-4">
            <button
              className="bg-blue-500 text-white p-3 rounded-md"
              onClick={handleSignUpClick}
            >
              Inscription
            </button>
            <button
              className="bg-gray-300 text-black p-3 rounded-md"
              onClick={handleLoginClick}
            >
              Connexion
            </button>
          </div>
        )}

        
        {isSignUp === true && <SignUp onSwitchToLogin={switchToLogin} />}
        {isSignUp === false && <Login onSwitchToSignUp={switchToSignUp} />}
      </div>
    </div>
  );
}

export default App;
