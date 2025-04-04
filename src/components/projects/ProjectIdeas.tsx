import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [projects, setProjects] = useState([]);
  const [generationDone, setGenerationDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const apiCallMade = useRef(false);
  
  const scannedItems = location.state?.items || [];
  
  useEffect(() => {
    // Only run this effect if we have scanned items and haven't made the API call yet
    if (scannedItems.length > 0 && !apiCallMade.current) {
      const generateProjects = async () => {
        // Set loading state
        setIsLoading(true);
        apiCallMade.current = true;
        
        try {
          const itemsString = scannedItems.join(', ');
          
          const GEMINI_API_KEY = "AIzaSyD-UHTng5Gh82qHDTuoxxZiM_nSNbDXqr8";
          const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
          
          const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Generate creative DIY project or recipes or whatever is relevant in that particular domain ideas using these materials: ${itemsString}. 
                  Format the response as a JSON array of objects with these properties: 
                  id (number), 
                  title (string), 
                  description (string), 
                  steps (List of JSON Objects as such {
                    title (string)
                    description (string)
                  }),
                  difficulty ("Easy", "Medium", or "Hard"), 
                  timeRequired (string like "1 hour"), 
                  imageUrl (use https://http.cat/images/418.jpg as a placeholder), 
                  rating (number between 4.0 and 5.0), 
                  materials (array of strings).
                  Only include projects that use at least one of the scanned items. Generate 5-8 projects.`
                }]
              }]
            })
          });
  
          if (!response.ok) throw new Error("Failed to generate projects");
  
          const data = await response.json();
          const projectsText = data.candidates[0].content.parts[0].text;          
          const jsonMatch = projectsText.match(/\[[\s\S]*\]/);
          const projectsJson = jsonMatch ? jsonMatch[0] : projectsText;
          const generatedProjects = JSON.parse(projectsJson);

          setProjects(generatedProjects);
          setAllProjects(generatedProjects);
          setFilteredProjects(generatedProjects);
        } catch (error) {
          console.error("Error generating projects:", error);
          setProjects(mockProjects);
          setFilteredProjects(mockProjects);
          alert("Error generating projects");
        } finally {
          setIsLoading(false);
        }
      };
  
      generateProjects();
    }
  }, [scannedItems]);
  
  useEffect(() => {
    if (activeFilter != 'all') {
      setFilteredProjects(allProjects.filter(project => 
        project.difficulty.toLowerCase() === activeFilter
      ));
    }
  }, [activeFilter, projects]);
  
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
                disabled={isLoading}
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
            <ProjectCardSkeleton key={item} />
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

// Skeleton loader component using shadcn UI
const ProjectCardSkeleton = () => {
  return (
    <div className="glass-morphism rounded-xl overflow-hidden flex flex-col h-full animate-pulse">
      <Skeleton className="w-full h-48 bg-midnight-800/50" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4 bg-midnight-800/50" />
        <Skeleton className="h-4 w-full bg-midnight-800/30" />
        <Skeleton className="h-4 w-5/6 bg-midnight-800/30" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-6 w-16 rounded-full bg-midnight-800/50" />
          <Skeleton className="h-6 w-20 rounded-full bg-midnight-800/50" />
        </div>
      </div>
    </div>
  );
};

export default ProjectIdeas;