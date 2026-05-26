import React, { useState } from 'react';
import { User, Mail, Users, Calendar, AtSign, Lock, ShieldCheck, X, Eye, EyeOff, ArrowLeft } from 'lucide-react';

function AccountPage({ user, onBackToChat, onUpdateUser }) {
  // 1. Form States (Mapping Django backend data style from user context)
  const [displayName, setDisplayName] = useState(user?.display_name || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gender, setGender] = useState(user?.gender || 'P');
  const [age, setAge] = useState(user?.age || '');
  
  // 2. UI States
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 3. Password Modal States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [modalError, setModalError] = useState('');

  React.useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || user.name || '');
      setEmail(user.email || '');
      setGender(user.gender || 'P');
      setAge(user.age || '');
    }
  }, [user]);

  // Handle Main Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/profile/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        username: user?.name,
          display_name: displayName,
          email: email,
          gender: gender,
          age: age
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Sync modified data back to application root state
        onUpdateUser({ ...user, ...data, name: user.name }); 
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to update profile.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Pop-up Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setModalError('');

    if (newPassword !== confirmPassword) {
      setModalError("New passwords don't match.");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/password/change/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: user?.name,
          current_password: currentPassword,
          new_password: newPassword
        }),
      });

      if (response.ok) {
        setIsPasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMessage({ type: 'success', text: 'Password updated successfully!' });
      } else {
        const data = await response.json();
        setModalError(data.detail || data.error || 'Failed to update password.');
      }
    } catch (err) {
      setModalError('Network error. Could not update password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        
        {/* Navigation Bar Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <button 
            onClick={onBackToChat}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> 
            Back to Chat
          </button>
          <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Core Settings
          </span>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Account Profile</h2>
            <p className="text-sm text-gray-500">Modify your application identifiers and demographic profile</p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm text-center font-medium border ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Unique Username Handle (Read Only) */}
            <div className="relative opacity-60 cursor-not-allowed">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                disabled
                value={user?.name || 'username'}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none"
              />
              <span className="absolute right-3 top-3 text-xs text-gray-400 font-medium">Immutable</span>
            </div>

            {/* Display Name Input */}
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
                required
              />
            </div>

            {/* Email Input */}
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
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender Dropdown */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none bg-white text-gray-700"
                  required
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                  <option value="P">Prefer not to say</option>
                </select>
              </div>

              {/* Age Input */}
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
                  required
                />
              </div>
            </div>

            {/* Form Button Triggers */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-indigo-600" /> Change Password
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-70"
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= PASSWORD CHANGE MODAL POP-UP ================= */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 transform transition-all duration-150">
            
            {/* Pop-up Title Layout */}
            <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-800">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg">Change Security Password</h3>
              </div>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Interactive Fields */}
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs text-center font-medium border border-red-100">
                  {modalError}
                </div>
              )}

              {/* Input: Current Password */}
              <div className="relative">
                <input
                  type={showPass.current ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  required
                  className="block w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass({...showPass, current: !showPass.current})}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Input: New Password */}
              <div className="relative">
                <input
                  type={showPass.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  className="block w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass({...showPass, new: !showPass.new})}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Input: Confirm New Password */}
              <div className="relative">
                <input
                  type={showPass.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  required
                  className="block w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Footer Layout Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                >
                  Confirm Change
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

export default AccountPage;