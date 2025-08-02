import React from 'react';

interface FaqComponentProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

const FaqComponent: React.FC<FaqComponentProps> = ({ questions, onQuestionClick }) => {
  return (
    <div className="px-4 pt-2 pb-4 border-t border-zinc-200 dark:border-white/10 transition-colors duration-300">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3 transition-colors duration-300">
        Frequently Asked Questions
      </h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onQuestionClick(q)}
            className="px-3 py-1.5 bg-gray-200 dark:bg-zinc-700/80 text-sm text-zinc-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors duration-200"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FaqComponent;