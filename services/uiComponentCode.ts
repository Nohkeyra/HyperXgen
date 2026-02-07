
export const componentCode = `
import React, { useState } from 'react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent new line
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200 sticky bottom-0 z-10 flex flex-col md:flex-row items-center gap-2">
      <textarea
        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base transition duration-150 ease-in-out h-12 overflow-hidden md:h-auto md:max-h-24"
        placeholder="Type your message here..."
        value={input}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        disabled={isLoading}
        rows={1}
        style={{ minHeight: '3rem' }}
      />
      <button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        className={\`px-6 py-2 rounded-lg text-white font-semibold transition duration-150 ease-in-out w-full md:w-auto
          \${isLoading || !input.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'}\`}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          'Send'
        )}
      </button>
    </div>
  );
};

export default InputArea;
`;