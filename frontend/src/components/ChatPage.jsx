import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Plus, X, Users } from 'lucide-react';

function ChatPage({ user, onLogout, onNavigateToAccount }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState('general');
  const [friends, setFriends] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFriendHandle, setNewFriendHandle] = useState('');

  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Calculate the current room
  const currentRoomName = activeChat === 'general' 
    ? 'general' 
    : [user.name, activeChat].sort().join('_');

  // We need a ref for the current room so the WebSocket always knows where we are looking
  const currentRoomNameRef = useRef(currentRoomName);
  useEffect(() => {
    currentRoomNameRef.current = currentRoomName;
  }, [currentRoomName]);

  // ==========================================
  // 1. THE GLOBAL WEBSOCKET CONNECTION
  // ==========================================
  useEffect(() => {
    // We only connect ONCE using our own username
    const wsUrl = `ws://127.0.0.1:8000/ws/chat/${user.name}/`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { message, sender, room_name } = data;

      // WhatsApp Magic: If someone new messages us, auto-add them to the sidebar!
      if (room_name !== 'general') {
        const users = room_name.split('_');
        const otherUser = users.find(u => u !== user.name);
        
        if (otherUser) {
          setFriends(prev => {
            if (!prev.includes(otherUser)) return [...prev, otherUser];
            return prev;
          });
        }
      }

      // Only show the message on screen if we are looking at that specific room
      if (room_name === currentRoomNameRef.current) {
        setMessages((prev) => [...prev, data]);
      } else {
        console.log(`New message from ${sender} in background room: ${room_name}`);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user.name]); 

  // ==========================================
  // 2. AUTOMATIC CHAT HISTORY LOADER (Step 3)
  // ==========================================
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/accounts/messages/${currentRoomName}/`);
        if (response.ok) {
          const historyData = await response.json();
          setMessages(historyData); // Populate the screen with database history!
        }
      } catch (err) {
        console.error("Failed to load historical messages:", err);
      }
    };

    fetchChatHistory();
  }, [currentRoomName]); // Runs every single time you switch chat selections!


  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && ws.current) {
      ws.current.send(JSON.stringify({
        message: newMessage,
        sender: user.name,
        room_name: currentRoomName // Tell Django exactly where to route this!
      }));
      setNewMessage('');
    }
  };

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (newFriendHandle.trim() && !friends.includes(newFriendHandle)) {
      setFriends([...friends, newFriendHandle.trim()]);
      setActiveChat(newFriendHandle.trim()); 
      setIsModalOpen(false);
      setNewFriendHandle('');
      setMessages([]); 
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* ========================================== */}
      {/* SIDEBAR */}
      {/* ========================================== */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        
        {/* User Profile Header */}
        {/* User Profile Header */}
<div className="p-4 border-b border-gray-200 bg-indigo-600 text-white flex justify-between items-center">
  
  {/* MODIFIED: Wrapped user identifiers in a clickable account portal trigger */}
  <button 
    type="button"
    onClick={onNavigateToAccount}
    className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
  >
    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold group-hover:bg-white/30 group-hover:scale-105 transition-all">
      {user.name.charAt(0).toUpperCase()}
    </div>
    <div>
      <h3 className="font-bold group-hover:underline decoration-indigo-200 underline-offset-2">{user.name}</h3>
      <p className="text-xs text-indigo-200">Online • View Profile</p>
    </div>
  </button>
  
  <button onClick={onLogout} className="text-xs hover:underline text-indigo-200 z-10">Logout</button>
</div>

        {/* General Room Button */}
        <div className="p-4">
          <button 
            onClick={() => { setActiveChat('general'); setMessages([]); }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeChat === 'general' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
          >
            <Users className={`w-5 h-5 ${activeChat === 'general' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className="font-medium">General Room</span>
          </button>
        </div>

        {/* Direct Messages Section */}
        <div className="px-4 pb-2 flex justify-between items-center">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Direct Messages</h4>
          <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-indigo-600 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {friends.map((friend) => (
            <button 
              key={friend}
              onClick={() => { setActiveChat(friend); setMessages([]); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeChat === friend ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {friend.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{friend}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* MAIN CHAT AREA */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col bg-slate-50">
        
        {/* Chat Header */}
        <div className="h-20 border-b border-gray-200 bg-white flex items-center px-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {activeChat === 'general' ? 'General Room' : `Chat with ${activeChat}`}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Live Connection: {currentRoomName}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>No messages here yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.sender === user.name;
              return (
                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>
                    {!isMe && <p className="text-xs font-bold text-indigo-600 mb-1">{msg.sender}</p>}
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${activeChat === 'general' ? 'the room' : activeChat}...`}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </div>

      {/* ========================================== */}
      {/* "ADD FRIEND" MODAL */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2">Add a Friend</h3>
            <p className="text-sm text-gray-500 mb-4">Enter your friend's unique handle to start a private chat.</p>
            <form onSubmit={handleAddFriend}>
              <input
                type="text"
                value={newFriendHandle}
                onChange={(e) => setNewFriendHandle(e.target.value)}
                placeholder="e.g., testuser2"
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700">
                Start Chatting
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;