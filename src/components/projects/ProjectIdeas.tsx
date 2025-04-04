import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProjectCard from './ProjectCard';

const ProjectIdeas = () => {
  const location = useLocation();
  const [generationDone, setGenerationDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const scannedItems = location.state?.items || [];
  
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  
    if (!generationDone && scannedItems.length > 0) {
      const generateProjects = async () => {
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
                  text: `Generate creative DIY project ideas using these materials: ${itemsString}. 
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
          setFilteredProjects(generatedProjects);
          setAllProjects(generatedProjects);
          setGenerationDone(true);
        } catch (error) {
          console.error("Error generating projects:", error);
          setGenerationDone(true);
        }
      };
  
      generateProjects();
    }
  }, [generationDone, scannedItems]);
  
  useEffect(() => {
    if (activeFilter != 'all') {
      setFilteredProjects(allProjects.filter(project => 
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
