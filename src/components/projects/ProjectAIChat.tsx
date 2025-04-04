import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Bot } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';

interface ProjectStep {
  title: string;
  description: string;
}

interface ProjectCardProps {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeRequired: string;
  imageUrl: string;
  rating: number;
  materials: string[];
  steps: ProjectStep[];
  index?: number;
}

interface ProjectAIChatProps {
  projectTitle: string;
}

const projectDataMock: ProjectCardProps = {
  id: 1,
  title: "Rocket Pencil Holder",
  description: "Transform cardboard tubes into an awesome rocket-shaped pencil holder with customizable fins and colors. This project is perfect for kids and adults alike, and makes for a great desk accessory or gift.",
  difficulty: "Easy",
  timeRequired: "1 hour",
  imageUrl: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=60",
  rating: 4.7,
  materials: ["Cardboard tube", "Colored paper", "Scissors", "Glue", "Paint", "Brushes", "Ruler"],
  steps: [
    {
      title: "Gather Materials",
      description: "Collect all the materials you'll need for this project. Make sure your cardboard tube is clean and dry."
    },
    {
      title: "Cut the Rocket Shape",
      description: "Cut a cone shape from colored paper for the rocket's nose. Cut triangles for the fins from cardboard or thick paper."
    },
    {
      title: "Paint the Tube",
      description: "Paint the cardboard tube in your chosen colors. Let it dry completely before moving to the next step."
    },
    {
      title: "Assemble the Rocket",
      description: "Glue the cone to the top of the tube. Attach the fins around the bottom of the tube, spacing them evenly."
    },
    {
      title: "Add Details",
      description: "Add decorative details like windows, a door, or patterns using markers or more colored paper."
    }
  ]
};

const ProjectAIChat: React.FC<ProjectAIChatProps> = ({ projectTitle }) => {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationHistoryRef = useRef<Array<{role: string, parts: Array<{text: string}>}>>([]);
  const projectDataRef = useRef<ProjectCardProps | null>(null);
  const GEMINI_API_KEY = "AIzaSyD-UHTng5Gh82qHDTuoxxZiM_nSNbDXqr8";
  
  useEffect(() => {
    try {
      const projectData = typeof location.state?.project === 'string' 
        ? JSON.parse(location.state?.project) 
        : location.state?.project || projectDataMock;
      
      projectDataRef.current = projectData;
      
      initializeConversation(projectData);
    } catch (error) {
      console.error("Error parsing project data:", error);
      projectDataRef.current = projectDataMock;
      initializeConversation(projectDataMock);
    }
  }, [location.state?.project]);
  
  const initializeConversation = async (projectData: ProjectCardProps) => {
    const systemMessage = {
      role: "model",
      parts: [{
        text: `I'm an AI assistant helping with DIY projects. I'll be answering questions about the following project:    
Project: ${projectData.title}
Description: ${projectData.description}
Difficulty: ${projectData.difficulty}
Time Required: ${projectData.timeRequired}
Materials: ${projectData.materials.join(', ')}
Steps: 
${projectData.steps.map((step, i) => `${i+1}. ${step.title}: ${step.description}`).join('\n')}

I'll help with instructions, alternatives, adaptations, or any other questions about this project. My responses will be helpful, specific to this project, and beginner-friendly.`
      }]
    };
    
    const welcomeMessage = {
      role: "model", 
      parts: [{
        text: `Hi there! I'm your AI project assistant for the ${projectData.title}. How can I help you create this ${projectData.difficulty.toLowerCase()} project today? Feel free to ask about materials, steps, or any specific part you're curious about!`
      }]
    };
    
    conversationHistoryRef.current = [systemMessage, welcomeMessage];
    
    setChatMessages([{ 
      text: welcomeMessage.parts[0].text, 
      isUser: false 
    }]);
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    setChatMessages(prev => [...prev, { text: message, isUser: true }]);
    
    conversationHistoryRef.current.push({
      role: "user",
      parts: [{ text: message }]
    });
    
    setIsLoading(true);
    setMessage('');

    try {
      const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: conversationHistoryRef.current,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponseText = data.candidates[0].content.parts[0].text;
      
      // Add AI response to UI
      setChatMessages(prev => [...prev, { text: aiResponseText, isUser: false }]);
      
      // Add AI response to conversation history
      conversationHistoryRef.current.push({
        role: "model",
        parts: [{ text: aiResponseText }]
      });
      
    } catch (error) {
      console.error("Error generating response:", error);
      setChatMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedCard withBorder className="p-4">
      <div className="flex items-center mb-4">
        <Bot className="w-6 h-6 text-electric-400 mr-2" />
        <h3 className="text-lg font-bold">AI Project Assistant</h3>
      </div>
      
      <div className="h-full overflow-y-auto mb-4 space-y-3 scrollbar-none">
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
              {msg.text.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < msg.text.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-gray-300 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-electric-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-electric-400 animate-bounce" style={{animationDelay: "0.2s"}}></div>
                <div className="w-2 h-2 rounded-full bg-electric-400 animate-bounce" style={{animationDelay: "0.4s"}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex">
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask the AI about your project..."
          className="flex-grow bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-electric-500"
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          className="bg-electric-600 text-white px-4 py-2 rounded-r-lg hover:bg-electric-700 transition-colors disabled:opacity-50"
          disabled={isLoading || message.trim() === ''}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </AnimatedCard>
  );
};

export default ProjectAIChat;