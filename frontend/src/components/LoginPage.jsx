import React, { useState } from 'react';
// FIX 1: Cleaned up duplicate 'Lock' import here
import { LogIn, UserPlus, User, MessageSquare, AtSign, Mail, Users, Calendar, Lock, Eye, EyeOff } from 'lucide-react';

function LoginPage({ onLogin }) {
  // Toggle between Login and Register
  const [isLoginMode, setIsLoginMode] = useState(true); 
  
  // Form State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 1. DYNAMIC URL
    const endpoint = isLoginMode 
      ? 'http://127.0.0.1:8000/api/accounts/login/' 
      : 'http://127.0.0.1:8000/api/accounts/register/';

    // 2. DYNAMIC PAYLOAD (Only send what is needed)
    const payload = isLoginMode
      ? { username: username, password: password }
      : { 
          username: username, 
          password: password, 
          display_name: displayName, 
          email: email, 
          gender: gender, 
          age: age 
        };

    try {
      // 3. THE FETCH CALL
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Log the user in
        onLogin({ name: username, ...data });
      } else {
        // Error handling
        if (data.username) {
          setError(`Username error: ${data.username[0]}`);
        } else if (data.email) {
          setError(`Email error: ${data.email[0]}`);
        } else {
          setError(data.error || data.detail || 'Something went wrong. Please try again.');
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
          
          <div className="space-y-4">
            
            {/* 1. Unique Handle (ALWAYS VISIBLE) */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                placeholder="Unique Handle (e.g., @adarsh_99)"
                required
              />
            </div>

            {/* 👇 THESE FIELDS ONLY SHOW DURING SIGN UP 👇 */}
            {!isLoginMode && (
              <>
                {/* 2. Display Name */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    placeholder="Display Name"
                    required={!isLoginMode}
                  />
                </div>

                {/* 3. Email */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    placeholder="Email Address"
                    required={!isLoginMode}
                  />
                </div>

                {/* 4. Gender (Dropdown) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none bg-white text-gray-500 appearance-none"
                    required={!isLoginMode}
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                    <option value="P">Prefer not to say</option>
                  </select>
                </div>

                {/* 5. Age */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    placeholder="Age"
                    min="13"
                    max="120"
                    required={!isLoginMode}
                  />
                </div>
              </>
            )}
            {/* 👆 END OF SIGN UP ONLY FIELDS 👆 */}

            {/* 6. Password with Toggle */}
            <div className="relative">
              {/* Left Lock Icon */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                placeholder="Password"
                required
              />

              {/* Right Show/Hide Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

          </div> {/* FIX 2: This closed tag balances the fields layout div cleanly */}

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
                  setError('');
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