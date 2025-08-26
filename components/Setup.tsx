
import React, { useState } from 'react';

interface SetupProps {
  onSetupComplete: (password: string) => Promise<void>;
  error: string | null;
}

const Setup: React.FC<SetupProps> = ({ onSetupComplete, error }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (password.length < 4) {
      setFormError("Password must be at least 4 characters long.");
      return;
    }
    setFormError(null);
    setIsSettingUp(true);
    await onSetupComplete(password);
  };

   React.useEffect(() => {
    if (error) {
      setIsSettingUp(false);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/BJP_logo_with_circle.svg" alt="BJP Logo" className="h-20 w-20 mx-auto object-contain"/>
          <h1 className="text-3xl font-extrabold text-gray-800 mt-4">
            Welcome to the Portal
          </h1>
          <p className="text-md text-gray-600 font-semibold">Admin Account Setup</p>
          <p className="text-sm text-gray-500 mt-2">This is a one-time setup. Please create a secure password to manage the news portal.</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password-input" className="sr-only">New Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-bjp-orange focus:border-transparent"
              placeholder="New Admin Password"
              required
              aria-describedby="form-error"
              disabled={isSettingUp}
            />
          </div>

          <div>
            <label htmlFor="confirm-password-input" className="sr-only">Confirm Password</label>
            <input
              id="confirm-password-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-bjp-orange focus:border-transparent"
              placeholder="Confirm Password"
              required
              aria-describedby="form-error"
              disabled={isSettingUp}
            />
          </div>

          {(formError || error) && (
            <p id="form-error" className="text-sm text-red-600 text-center" role="alert">
              {formError || error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isSettingUp}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-bjp-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bjp-green transition duration-300 disabled:bg-green-300"
            >
              {isSettingUp ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                </>
              ) : (
                'Save Password & Continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Setup;
