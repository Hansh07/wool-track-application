import { useState, useRef, useEffect } from 'react';
import { X, Send, Leaf } from 'lucide-react';
import client from '../api/axiosClient';
import logo from '../assets/logo.png';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm the WoolMonitor AI assistant. Ask me anything about wool quality, grading, or the platform.", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        setMessages(prev => [...prev, { text: trimmed, sender: 'user' }]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await client.post('/api/chat', { message: trimmed }, { timeout: 60000 });
            setMessages(prev => [...prev, { text: data.reply || 'No response received.', sender: 'bot' }]);
        } catch (err) {
            const serverMsg = err.response?.data?.error;
            const msg = serverMsg || (err.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : "Sorry, I'm having trouble connecting right now.");
            setMessages(prev => [...prev, { text: msg, sender: 'bot' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 h-[420px] flex flex-col rounded-2xl border border-gray-200 shadow-card-hover overflow-hidden bg-white">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-primary-600 border-b border-primary-700">
                        <img src={logo} alt="Wool Track" className="h-9 w-auto object-contain drop-shadow" />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'bot' && (
                                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                        <Leaf size={12} className="text-primary-600" />
                                    </div>
                                )}
                                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-primary-600 text-white rounded-br-sm'
                                        : 'bg-gray-100 text-gray-700 rounded-bl-sm border border-gray-200'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-1">
                                    <Leaf size={12} className="text-primary-600" />
                                </div>
                                <div className="bg-gray-100 border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                placeholder="Ask about wool quality..."
                                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || loading}
                                className="p-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(p => !p)}
                className="w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 shadow-neon transition-all duration-300 hover:scale-110 flex items-center justify-center overflow-hidden"
            >
                {isOpen
                    ? <X size={22} className="text-white" />
                    : <img src={logo} alt="Chat" className="w-10 h-10 object-contain" />
                }
            </button>
        </div>
    );
};

export default Chatbot;
