import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, LogIn, Send, LogOut, User, MessageSquare } from 'lucide-react';  

function ChatPage({ user, onLogout }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! Welcome to the chat.", sender: 'system', time: '10:00 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsgObj = {
      id: Date.now(),
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsgObj]);
    setNewMessage('');

    // Simulate a reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev, 
        { id: Date.now(), text: "I received your message!", sender: 'other', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 1000);
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar - Hidden on small screens for simplicity, visible on md */}
      <div className="hidden md:flex w-80 bg-white border-r border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-indigo-200 border-green-400">Online</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Chats</div>
          {/* Mock Contact */}
          <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl cursor-pointer">
            <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center">
              <User className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">General Room</h4>
              <p className="text-sm text-gray-500 truncate">I received your message!</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors w-full p-2 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50">
        
        {/* Mobile Header (Shows when Sidebar is hidden) */}
        <div className="md:hidden p-4 bg-indigo-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            <span className="font-bold">ChatApp</span>
          </div>
          <button onClick={onLogout} className="text-indigo-100 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Header */}
        <div className="hidden md:flex p-6 bg-white border-b border-gray-200 items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">General Room</h2>
            <p className="text-sm text-gray-500">3 members online</p>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[75%] md:max-w-[60%] p-4 rounded-2xl shadow-sm ${
                  msg.sender === 'me' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                }`}
              >
                <p className="text-sm md:text-base">{msg.text}</p>
              </div>
              <span className="text-xs text-gray-400 mt-1 mx-1">{msg.time}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 rounded-full py-3 px-5 transition-all outline-none"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default ChatPage;