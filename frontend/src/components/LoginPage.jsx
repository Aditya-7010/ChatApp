import React, { useState } from 'react';
import { Lock, LogIn, UserPlus, User, MessageSquare } from 'lucide-react';  

function LoginPage({ onLogin }) {
  // NEW STATE: Are we logging in or registering?
  const [isLoginMode, setIsLoginMode] = useState(true); 
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // DYNAMIC URL: Choose the endpoint based on the mode
    const endpoint = isLoginMode 
      ? 'http://127.0.0.1:8000/api/accounts/login/' 
      : 'http://127.0.0.1:8000/api/accounts/register/';

    try {
      const response = await fetch(endpoint, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Log the user in for both scenarios
        onLogin({ name: username, ...data });
      } else {
        // Error handling
        setError(data.error || data.detail || 'Something went wrong. Please try again.');
        
        // If registering and the username is taken, Django sends it in an array
        if (data.username) {
          setError(`Username error: ${data.username[0]}`);
        }
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError('Network error. Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Dynamic Header */}
        <div className="bg-indigo-600 p-8 text-center transition-colors">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <MessageSquare className="text-indigo-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isLoginMode ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-indigo-100 mt-2">
            {isLoginMode ? 'Sign in to continue to ChatApp' : 'Join ChatApp to start messaging'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
              {error}
            </div>
          )}
          
          {/* Form Inputs (Same for both) */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                placeholder="Username"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                placeholder="Password"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLoginMode ? 'Sign In' : 'Sign Up'}</span>
                {isLoginMode ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </>
            )}
          </button>

          {/* The Toggle Button */}
          <div className="text-center mt-4 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError(''); // Clear errors when switching modes
                }}
                className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
              >
                {isLoginMode ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}

export default LoginPage;