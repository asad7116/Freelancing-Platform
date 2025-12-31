import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2, Trash2, Bot } from 'lucide-react';
import '../styles/ChatbotWidget.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus();
        }
    }, [isOpen, isMinimized]);

    // Load session from localStorage
    useEffect(() => {
        const savedSession = localStorage.getItem('chatbot_session');
        const savedMessages = localStorage.getItem('chatbot_messages');

        if (savedSession) {
            setSessionId(savedSession);
        }
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error('Failed to parse saved messages');
            }
        }
    }, []);

    // Save messages to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chatbot_messages', JSON.stringify(messages.slice(-50)));
        }
        if (sessionId) {
            localStorage.setItem('chatbot_session', sessionId);
        }
    }, [messages, sessionId]);

    const toggleChat = () => {
        if (isOpen) {
            setIsOpen(false);
            setIsMinimized(false);
        } else {
            setIsOpen(true);
            setIsMinimized(false);

            // Add welcome message if no messages
            if (messages.length === 0) {
                setMessages([{
                    role: 'assistant',
                    content: "Hi! 👋 I'm your assistant. How can I help you today? Feel free to ask me anything about our freelancing platform!",
                    timestamp: new Date().toISOString()
                }]);
            }
        }
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: "Chat cleared! How can I help you today?",
            timestamp: new Date().toISOString()
        }]);
        setSessionId(null);
        localStorage.removeItem('chatbot_session');
        localStorage.removeItem('chatbot_messages');
    };

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/chatbot/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    sessionId
                })
            });

            const data = await response.json();

            if (data.success) {
                setSessionId(data.sessionId);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString()
                }]);
            } else {
                throw new Error(data.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date().toISOString(),
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chatbot-container">
            {/* Chat Window */}
            {isOpen && (
                <div className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}>
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <Bot size={20} />
                            </div>
                            <div className="chatbot-title">
                                <h4>Platform Assistant</h4>
                                <span className="chatbot-status">
                                    <span className="status-dot"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                        <div className="chatbot-header-actions">
                            <button
                                onClick={clearChat}
                                className="chatbot-header-btn"
                                title="Clear chat"
                            >
                                <Trash2 size={16} />
                            </button>
                            <button
                                onClick={toggleMinimize}
                                className="chatbot-header-btn"
                                title={isMinimized ? 'Maximize' : 'Minimize'}
                            >
                                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                            </button>
                            <button
                                onClick={toggleChat}
                                className="chatbot-header-btn close-btn"
                                title="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    {!isMinimized && (
                        <>
                            <div className="chatbot-messages">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`chatbot-message ${msg.role} ${msg.isError ? 'error' : ''}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="message-avatar">
                                                <Bot size={16} />
                                            </div>
                                        )}
                                        <div className="message-content">
                                            <div className="message-text">{msg.content}</div>
                                            <div className="message-time">{formatTime(msg.timestamp)}</div>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="chatbot-message assistant">
                                        <div className="message-avatar">
                                            <Bot size={16} />
                                        </div>
                                        <div className="message-content">
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="chatbot-input-area">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    disabled={isLoading}
                                    className="chatbot-input"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="chatbot-send-btn"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Floating Button */}
            <button
                className={`chatbot-trigger ${isOpen ? 'open' : ''}`}
                onClick={toggleChat}
                aria-label="Toggle chat"
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <>
                        <MessageSquare size={24} />
                        <span className="chatbot-trigger-pulse"></span>
                    </>
                )}
            </button>
        </div>
    );
};

export default ChatbotWidget;
