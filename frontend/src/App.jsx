import React, { useState } from 'react';
import { Mail, Lock, LogIn, Send, LogOut, User, MessageSquare } from 'lucide-react';
import LoginPage from './components/LoginPage';
import ChatPage from './components/ChatPage'; 
import AccountPage from './components/AccountPage'; // 🔴 ADDED: Import the account page component
import './index.css'; 

// --- MAIN APP (ROUTER EQUIVALENT) ---
export default function App() {
  // This state acts as our "Router". It prevents page refreshes!
  const [currentRoute, setCurrentRoute] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentRoute('chat');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRoute('login');
  };

  // Switch/Case navigation guarantees a seamless, no-refresh experience
  switch (currentRoute) {
    case 'login':
      return <LoginPage onLogin={handleLogin} />;
      
    case 'chat':
      return (
        <ChatPage 
          user={user} 
          onLogout={handleLogout} 
          onNavigateToAccount={() => setCurrentRoute('account')} // 🔴 FIXED: Wires up the profile button click
        />
      );
      
    case 'account':
      return (
        <AccountPage 
          user={user} 
          onBackToChat={() => setCurrentRoute('chat')} // 🔴 ADDED: Wires up the back button to get to chats
          onUpdateUser={(updatedUserData) => setUser(updatedUserData)} // 🔴 ADDED: Updates the user data instantly across your app
        />
      );
      
    default:
      return <LoginPage onLogin={handleLogin} />;
  }
}