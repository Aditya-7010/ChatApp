import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, LogIn, Send, LogOut, User, MessageSquare } from 'lucide-react';  

function ChatPage({ user, onLogout }) {
  // We start with an empty array now, no fake system message needed
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const messagesEndRef = useRef(null);
  
  // 🔴 WEBSOCKET: Create a reference to hold our live pipe
  const ws = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔴 NEW: Fetch chat history when the page loads
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/accounts/messages/');
        if (response.ok) {
          const data = await response.json();
          
          // Format the database messages to match our React layout
          const formattedMessages = data.map(msg => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender === user?.name ? 'me' : msg.sender,
            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };

    fetchHistory();
  }, [user]); // Re-run if the user changes

  // 🔴 WEBSOCKET: Open the pipe as soon as the ChatPage loads!
  useEffect(() => {
    // Connect to Django's WebSocket URL (assuming a room named 'general')
    const wsUrl = `ws://127.0.0.1:8000/ws/chat/general/`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("🟢 Connected to Django WebSockets!");
    };

    // When a message comes flying out of the pipe from Django
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      const newMsgObj = {
        id: Date.now(),
        text: data.message,
        // If the sender matches my username, mark it as 'me', otherwise 'other'
        sender: data.sender === user?.name ? 'me' : data.sender,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Add the new message to our list so React draws it
      setMessages((prev) => [...prev, newMsgObj]);
    };

    ws.current.onclose = () => {
      console.log("🔴 Disconnected from Django WebSockets.");
    };

    // Close the pipe when we leave the chat page
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // 🔴 WEBSOCKET: Instead of updating the screen immediately and faking a reply, 
    // we just shove the text down the pipe. The onmessage function above will catch 
    // it when it bounces back from Django and draw it on the screen!
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        message: newMessage,
        sender: user?.name || 'Anonymous' // Send our username so others know who typed it
      }));
      setNewMessage(''); // Clear the input box
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar - Hidden on small screens for simplicity, visible on md */}
      <div className="hidden md:flex w-80 bg-white border-r border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold">{user?.name || 'Guest'}</p>
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
              <p className="text-sm text-gray-500 truncate">Connected to live chat</p>
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
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Connection
            </p>
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
                {/* Show the sender's name if it's someone else! */}
                {msg.sender !== 'me' && (
                  <p className="text-xs font-bold text-indigo-600 mb-1">{msg.sender}</p>
                )}
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