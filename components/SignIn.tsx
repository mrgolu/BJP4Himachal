

import React, { useState, useEffect } from 'react';

interface SignInProps {
  onAdminLogin: (password: string) => Promise<void>;
  onGuestContinue: () => void;
  error: string | null;
}

const SignIn: React.FC<SignInProps> = ({ onAdminLogin, onGuestContinue, error }) => {
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // If an error is passed down from the parent, it means login failed.
    if (error) {
      setIsLoggingIn(false);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    await onAdminLogin(password);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/BJP_logo_with_circle.svg" alt="BJP Logo" className="h-20 w-20 mx-auto object-contain"/>
          <h1 className="text-3xl font-extrabold text-gray-800 mt-4">
            BJP Himachal Pradesh
          </h1>
          <p className="text-md text-gray-600 font-semibold">News Portal</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password-input" className="sr-only">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-bjp-orange focus:border-transparent"
              placeholder="Admin Password"
              required
              aria-describedby="password-error"
              disabled={isLoggingIn}
            />
          </div>

          {error && (
            <p id="password-error" className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-bjp-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bjp-orange transition duration-300 disabled:bg-orange-300"
            >
              {isLoggingIn ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or
            </span>
          </div>
        </div>

        <div>
          <button
            onClick={onGuestContinue}
            disabled={isLoggingIn}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-lg font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bjp-orange transition duration-300 disabled:bg-gray-100"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;