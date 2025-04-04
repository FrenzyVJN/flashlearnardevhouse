import React, { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';

interface ProjectAIChatProps {
  projectTitle: string;
}

const ProjectAIChat: React.FC<ProjectAIChatProps> = ({ projectTitle }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ text: string; isUser: boolean }[]>([]);

  const handleSendMessage = () => {
    if (message.trim() === '') return;

    // Add user message
    setChatMessages(prev => [...prev, { text: message, isUser: true }]);

    // Static AI response (for now)
    const aiResponse = `Hey there! I noticed you're working on the ${projectTitle} project. 
    Here's a pro tip: Make sure to take your time with each step and don't be afraid to get creative with your materials. 
    Would you like some additional guidance or have any specific questions about this project?`;

    // Add AI response after a short delay to simulate thinking
    setTimeout(() => {
      setChatMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
    }, 500);

    // Clear input
    setMessage('');
  };

  return (
    <AnimatedCard withBorder className="p-4">
      <div className="flex items-center mb-4">
        <Bot className="w-6 h-6 text-electric-400 mr-2" />
        <h3 className="text-lg font-bold">AI Project Assistant</h3>
      </div>
      
      <div className="h-64 overflow-y-auto mb-4 space-y-3 scrollbar-none">
        {chatMessages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.isUser 
                  ? 'bg-electric-600 text-white' 
                  : 'bg-white/10 text-gray-300'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex">
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask the AI about your project..."
          className="flex-grow bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-electric-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button 
          onClick={handleSendMessage}
          className="bg-electric-600 text-white px-4 py-2 rounded-r-lg hover:bg-electric-700 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </AnimatedCard>
  );
};

export default ProjectAIChat;
