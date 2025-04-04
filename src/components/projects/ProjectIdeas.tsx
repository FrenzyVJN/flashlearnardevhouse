
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProjectCard from './ProjectCard';

// Mock data for project ideas
const mockProjects = [
  {
    id: 1,
    title: "Rocket Pencil Holder",
    description: "Transform cardboard tubes into an awesome rocket-shaped pencil holder with customizable fins and colors.",
    difficulty: "Easy" as const,
    timeRequired: "1 hour",
    imageUrl: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    rating: 4.7,
    materials: ["Cardboard tube", "Paint", "Scissors", "Glue"]
  },
  {
    id: 2,
    title: "LED Bottle Lamp",
    description: "Create a beautiful ambient lamp from empty plastic bottles with LED string lights inside.",
    difficulty: "Medium" as const,
    timeRequired: "2 hours",
    imageUrl: "https://images.unsplash.com/photo-1564185322734-b75606d3cb7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    rating: 4.9,
    materials: ["Empty plastic bottles", "LED string lights", "Scissors", "Decorative tape"]
  },
  {
    id: 3,
    title: "Magazine Mosaic Wall Art",
    description: "Cut colorful patterns from old magazines to create stunning mosaic wall art for your home.",
    difficulty: "Medium" as const,
    timeRequired: "3 hours",
    imageUrl: "https://images.unsplash.com/photo-1501942250685-1e86701d1eb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    rating: 4.5,
    materials: ["Old magazines", "Canvas", "Glue", "Scissors"]
  },
  {
    id: 4,
    title: "Bottle Cap Necklace",
    description: "Turn colorful bottle caps into unique pendants for a one-of-a-kind necklace.",
    difficulty: "Easy" as const,
    timeRequired: "30 minutes",
    imageUrl: "https://images.unsplash.com/photo-1531995811006-35cb42e1a022?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    rating: 4.3,
    materials: ["Bottle caps", "String/chain", "Drill", "Jump rings"]
  },
  {
    id: 5,
    title: "Mini Greenhouse",
    description: "Build a mini greenhouse from plastic bottles to start your seeds and grow small plants.",
    difficulty: "Medium" as const,
    timeRequired: "2 hours",
    imageUrl: "https://images.unsplash.com/photo-1466692476655-ab0c26c69cbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    rating: 4.8,
    materials: ["Empty plastic bottles", "Soil", "Seeds", "Scissors"]
  },
  {
    id: 6,
    title: "Magazine Paper Beads",
    description: "Roll colorful magazine pages into beautiful beads for jewelry making.",
    difficulty: "Easy" as const,
    timeRequired: "1 hour",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    rating: 4.6,
    materials: ["Old magazines", "Glue", "Toothpicks", "String"]
  }
];

const ProjectIdeas = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Get passed items from the scan page
  const scannedItems = location.state?.items || [];
  
  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);
  
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredProjects(mockProjects);
    } else {
      setFilteredProjects(mockProjects.filter(project => 
        project.difficulty.toLowerCase() === activeFilter
      ));
    }
  }, [activeFilter]);
  
  const difficultyFilters = ['all', 'easy', 'medium', 'hard'];
  
  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gradient mb-4">Project Ideas for You</h2>
        
        {scannedItems.length > 0 && (
          <div className="glass-morphism rounded-lg p-4 mb-6">
            <p className="text-gray-300 mb-2">Based on your items:</p>
            <div className="flex flex-wrap gap-2">
              {scannedItems.map((item: string, index: number) => (
                <span 
                  key={index} 
                  className="bg-midnight-800 text-white px-3 py-1 rounded-full text-sm animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {difficultyFilters.map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  activeFilter === filter 
                    ? 'bg-electric-600 text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div 
              key={item} 
              className="bg-midnight-900/50 rounded-xl h-[320px] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              {...project} 
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectIdeas;
