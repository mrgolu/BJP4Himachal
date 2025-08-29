
import React, { useState, useEffect } from 'react';

interface SignInProps {
  onAdminLogin: (email: string, password: string) => Promise<void>;
  onUserSignIn: (name: string) => Promise<void>;
  error: string | null;
  onResendConfirmation: (email: string) => Promise<string>;
}

const SignIn: React.FC<SignInProps> = ({ onAdminLogin, onUserSignIn, error, onResendConfirmation }) => {
  const [email, setEmail] = useState('kartikthakur937@gmail.com');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGuestLoggingIn, setIsGuestLoggingIn] = useState(false);
  
  const [showResendLink, setShowResendLink] = useState(false);
  const [resendStatusMessage, setResendStatusMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // If an error is passed down from the parent, it means login failed.
    if (error) {
      setIsLoggingIn(false);
      setIsGuestLoggingIn(false);
      if (error.toLowerCase().includes('email not confirmed')) {
        setShowResendLink(true);
      } else {
        setShowResendLink(false);
      }
    } else {
       setShowResendLink(false);
    }
    // Clear previous login attempts' resend message
    setResendStatusMessage('');
  }, [error]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn || isGuestLoggingIn) return;
    setIsLoggingIn(true);
    await onAdminLogin(email, password);
  };
  
  const handleResendClick = async () => {
      if (!email) {
          setResendStatusMessage('Please enter the admin email address above first.');
          return;
      }
      setIsResending(true);
      const message = await onResendConfirmation(email);
      setResendStatusMessage(message);
      setIsResending(false);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn || isGuestLoggingIn || !name.trim()) return;
    setIsGuestLoggingIn(true);
    await onUserSignIn(name);
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
        
        <form className="space-y-4" onSubmit={handleAdminSubmit}>
           <div>
            <label htmlFor="email-input" className="sr-only">Email</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-bjp-orange focus:border-transparent bg-gray-100"
              placeholder="Admin Email"
              required
              aria-describedby="password-error"
              disabled={true}
            />
          </div>
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
              disabled={isLoggingIn || isGuestLoggingIn}
            />
          </div>

          {error && (
            <p id="password-error" className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}

          {showResendLink && (
            <div className="text-center text-sm space-y-2">
                <button
                    type="button"
                    onClick={handleResendClick}
                    disabled={isResending}
                    className="font-medium text-bjp-orange hover:text-orange-700 focus:outline-none disabled:text-gray-500"
                >
                    {isResending ? 'Sending...' : 'Resend confirmation email'}
                </button>
                {resendStatusMessage && <p className="text-gray-600">{resendStatusMessage}</p>}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoggingIn || isGuestLoggingIn}
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
                'Admin Sign In'
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

        <form className="space-y-4" onSubmit={handleUserSubmit}>
           <div>
            <label htmlFor="name-input" className="sr-only">Your Name</label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-bjp-orange focus:border-transparent"
              placeholder="Enter your name to continue"
              required
              disabled={isLoggingIn || isGuestLoggingIn}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoggingIn || isGuestLoggingIn || !name.trim()}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-lg font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bjp-orange transition duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {isGuestLoggingIn ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entering...
                </>
              ) : 'Enter as User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
