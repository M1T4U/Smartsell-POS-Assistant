import React from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import { PosTerminalIcon } from './IconComponents';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.author === MessageAuthor.USER;

  const renderAiMessage = (content: string) => {
    return content.split('\n').map((line, index) => {
      let processedLine = line;

      // Check for unordered or ordered lists and replace with the emoji
      const listMatch = line.match(/^(\s*[-*]|\s*\d+\.)\s(.*)/);
      if (listMatch) {
        processedLine = `🔹 ${listMatch[2]}`;
      }

      // Split the line by bold markdown to handle styling
      const parts = processedLine.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*)/g).filter(Boolean);

      return (
        <p key={index} className="min-h-[1.5rem]">
          {parts.map((part, partIndex) => {
            if ((part.startsWith('***') && part.endsWith('***')) || (part.startsWith('**') && part.endsWith('**'))) {
              const text = part.startsWith('***') ? part.slice(3, -3) : part.slice(2, -2);
              return (
                <strong
                  key={partIndex}
                  className="font-bold bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-400 dark:to-green-500 bg-clip-text text-transparent"
                >
                  {text}
                </strong>
              );
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center border border-gray-300 dark:border-zinc-700 transition-colors duration-300">
          <PosTerminalIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        </div>
      )}
      <div
        className={`max-w-xl rounded-lg px-4 py-3 text-sm sm:text-base transition-colors duration-300 ${
          isUser
            ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white'
            : 'bg-gray-100 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/60'
        }`}
      >
        {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
            <div className="text-zinc-800 dark:text-gray-200 transition-colors duration-300">{renderAiMessage(message.content)}</div>
        )}
      </div>
    </div>
  );
};

export default Message;