import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { createChatSession } from '../services/geminiService';
import { ChatMessage, MessageAuthor } from '../types';
import Message from './Message';
import { SendIcon } from './IconComponents';
import FaqComponent from './FaqComponent';

const FAQS = [
  "What is SmartSell POS?",
  "How much does it cost?",
  "Where are you located?",
  "Does it work offline?",
  "Can I manage multiple stores?",
  "What hardware is compatible?",
  "Is there a free trial?",
];

const ChatInterface: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFaqs, setShowFaqs] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat(createChatSession());

    const initialMessageContent = "Hello! I am **SmartSell AI**. How can I help you understand our POS solutions for your business today?";
    
    setMessages([{
      id: 'initial-ai-message',
      author: MessageAuthor.AI,
      content: ''
    }]);

    let charIndex = 0;
    const typingSpeed = 40;

    const intervalId = setInterval(() => {
      setMessages(currentMessages => {
        if (currentMessages.length > 1 || currentMessages[0]?.id !== 'initial-ai-message') {
          clearInterval(intervalId);
          return currentMessages;
        }

        const currentContent = currentMessages[0].content;
        if (currentContent.length < initialMessageContent.length) {
            return [{
                ...currentMessages[0],
                content: initialMessageContent.substring(0, charIndex + 1),
            }];
        } else {
            clearInterval(intervalId);
            return currentMessages;
        }
      });
      charIndex++;
    }, typingSpeed);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const submitMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || !chat || isLoading) return;

    if (showFaqs) setShowFaqs(false);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      author: MessageAuthor.USER,
      content: messageContent,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: messageContent });
      
      let aiResponse = '';
      let firstChunk = true;

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        aiResponse += chunkText;
        if (firstChunk) {
            setMessages(prev => [...prev, { id: `ai-${Date.now()}`, author: MessageAuthor.AI, content: aiResponse }]);
            firstChunk = false;
        } else {
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = aiResponse;
                return newMessages;
            });
        }
      }
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        author: MessageAuthor.AI,
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chat, isLoading, showFaqs]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    submitMessage(input);
    setInput('');
  }, [input, isLoading, submitMessage]);

  const handleFaqClick = (question: string) => {
    submitMessage(question);
  };

  return (
    <div className="flex flex-col h-full bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-lg overflow-hidden transition-colors duration-300">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 themed-scrollbar">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start pl-14">
            <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showFaqs && <FaqComponent questions={FAQS} onQuestionClick={handleFaqClick} />}
      
      <div className="p-4 border-t border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-800/50 transition-colors duration-300">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about features, pricing, compatibility..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg text-zinc-800 dark:text-gray-200 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-zinc-500 dark:disabled:bg-zinc-700 disabled:text-gray-100 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Send message"
          >
            <SendIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;