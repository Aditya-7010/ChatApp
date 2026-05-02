import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, LogIn, Send, LogOut, User, MessageSquare } from 'lucide-react';
import LoginPage from './components/LoginPage';
import ChatPage from './components/ChatPage'; 
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
      return <ChatPage user={user} onLogout={handleLogout} />;
    default:
      return <LoginPage onLogin={handleLogin} />;
  }
}

// --- LOGIN PAGE COMPONENT ---

// --- CHAT PAGE COMPONENT ---
