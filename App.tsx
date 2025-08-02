import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import Background from './components/Background';

// Export the Theme type so other components can use it
export type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [resetCounter, setResetCounter] = useState(0);
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Set initial theme based on storage, or system preference, or default to dark
    const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleClearChat = () => {
    setResetCounter(prev => prev + 1);
  };

  return (
    <div className="relative min-h-screen w-full font-sans text-zinc-900 dark:text-white transition-colors duration-300 overflow-hidden">
      {/* Background component - should appear behind everything */}
      <Background theme={theme} />
      
      {/* Main content with transparent background */}
      <div className="relative z-10 flex flex-col h-screen bg-transparent">
        <Header onClearChat={handleClearChat} theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 flex p-4 overflow-hidden">
          <div className="w-full max-w-4xl mx-auto h-full">
            <ChatInterface key={resetCounter} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;