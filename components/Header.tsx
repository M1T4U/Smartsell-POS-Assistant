import React from 'react';
import { PosTerminalIcon, RestartIcon, SunIcon, MoonIcon } from './IconComponents';

interface HeaderProps {
  onClearChat: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClearChat, theme, toggleTheme }) => {
  return (
    <header className="flex-shrink-0 border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-800/50 backdrop-blur-lg transition-colors duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
              <PosTerminalIcon className="h-8 w-8 text-green-500" />
              <h1 className="text-xl font-bold tracking-wider text-zinc-800 dark:text-gray-100">
                  SmartSell<span className="font-light text-blue-500 dark:text-blue-400">AI</span>
              </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearChat}
              aria-label="Restart chat"
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <RestartIcon className="h-6 w-6" />
            </button>
            <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            >
                {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;