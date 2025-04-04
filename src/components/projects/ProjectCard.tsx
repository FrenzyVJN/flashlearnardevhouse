
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, ArrowRight } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';

interface ProjectCardProps {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeRequired: string;
  imageUrl: string;
  rating: number;
  materials: string[];
  steps: any[],
  index?: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  id, 
  title, 
  description, 
  difficulty, 
  timeRequired, 
  imageUrl, 
  rating,
  materials,
  steps,
  index = 0
}) => {
  const navigate = useNavigate();
  const difficultyColor = {
    Easy: 'bg-green-500',
    Medium: 'bg-yellow-500',
    Hard: 'bg-red-500'
  };
  
  const handleContinue = () => {
    navigate(`/project/${id}`, { 
      state: { 
        project: JSON.stringify({
          id, 
          title, 
          description, 
          difficulty, 
          timeRequired, 
          imageUrl, 
          rating,
          materials,
          steps,
          index
        }) 
      } 
    });
  }

  return (
    <AnimatedCard
      withGlow
      withHover
      withBorder
      delay={index * 150}
      className="overflow-hidden group flex flex-col"
    >
      <div className="relative h-48 overflow-hidden rounded-lg mb-4">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-3 left-3 flex space-x-2">
          <span className={`${difficultyColor[difficulty]} text-xs px-2 py-1 rounded-full text-white`}>
            {difficulty}
          </span>
          <span className="bg-black/60 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-white flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {timeRequired}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center bg-black/60 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-yellow-400">
          <Star className="w-3 h-3 mr-1 fill-yellow-400" />
          {rating.toFixed(1)}
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{title}</h3>
      <p className="text-gray-400 text-sm mb-4 flex-grow line-clamp-2">{description}</p>
      
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Materials Needed:</div>
        <div className="flex flex-wrap gap-1">
          {materials.slice(0, 3).map((material, idx) => (
            <span key={idx} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
              {material}
            </span>
          ))}
          {materials.length > 3 && (
            <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
              +{materials.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      <button
        onClick={handleContinue}
        className="flex items-center text-electric-400 hover:text-electric-300 text-sm group mt-auto"
      >
        View Project
        <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
      </button>
    </AnimatedCard>
  );
};

export default ProjectCard;
