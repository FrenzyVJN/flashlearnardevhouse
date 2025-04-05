import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MessageCircle, Share2, ChevronRight } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import ProjectAIChat from './ProjectAIChat';

const comments = [
  {
    user: "MakerMike",
    comment: "Made this with my kids and they loved it! We used glow-in-the-dark paint for an extra cool effect.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    user: "CreativeCathy",
    comment: "Great project! I modified it to make a rocket-shaped piggy bank by cutting a slot in the side.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    user: "DIYDavid",
    comment: "Simple but effective. Took me about 45 minutes from start to finish.",
    rating: 4,
    avatar: "https://i.pravatar.cc/150?img=8"
  }
]

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

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [projectData, setProjectData] = useState<ProjectCardProps>();

  
  
  useEffect(() => {
    const cachedProjects = JSON.parse(localStorage.getItem("cachedProjects"));
    const curr = parseInt(id);
    if (curr == undefined) {
      alert("Invalid ID!!");
      return;
    }
    if (cachedProjects && Array.isArray(cachedProjects) && cachedProjects.length > curr) {
      setProjectData(cachedProjects[curr-1])
      console.log("Using cached projects");
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);
  
  const handleNextStep = () => {
    console.log(activeStep, projectData.steps.length);
    if (activeStep < projectData.steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      alert("congrats!!");
    }
  };
  
  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else {
      alert("nooo!!");
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto w-full p-6 flex justify-center items-center min-h-[50vh]">
        <div className="w-16 h-16 rounded-full border-4 border-electric-500 border-t-transparent animate-spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto w-full p-6">
      <div className="mb-8">
        <Link to="/projects" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Link>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold text-gradient mb-2">{projectData.title}</h1>
            <p className="text-gray-400 mb-6">{projectData.description}</p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center glass-morphism px-3 py-2 rounded-lg">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  projectData.difficulty === "Easy" ? "bg-green-500" :
                  projectData.difficulty === "Medium" ? "bg-yellow-500" : "bg-red-500"
                }`}></div>
                <span className="text-sm">{projectData.difficulty} Difficulty</span>
              </div>
              
              <div className="flex items-center glass-morphism px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 mr-2 text-electric-400" />
                <span className="text-sm">{projectData.timeRequired}</span>
              </div>
              
              <div className="flex items-center glass-morphism px-3 py-2 rounded-lg">
                <Star className="w-4 h-4 mr-2 text-yellow-400 fill-yellow-400" />
                <span className="text-sm">{projectData.rating} Rating</span>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/3 flex justify-end">
            <AnimatedButton 
              variant="electric" 
              className="w-full md:w-auto"
              withGlow
            >
              <Link to={`/ar/${id}`} className="flex items-center justify-center">
                Start AR Instructions
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </AnimatedButton>
          </div>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Materials You'll Need</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {projectData.materials.map((material, index) => (
            <div 
              key={index} 
              className="glass-morphism p-4 rounded-lg flex items-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-2 h-2 bg-electric-500 rounded-full mr-3"></div>
              <span>{material}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Step by step instructions */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6">Step-by-Step Instructions</h2>
        
        {/* Step progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Step {activeStep + 1} of {projectData.steps.length}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(((activeStep + 1) / projectData.steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-electric-600 to-electric-400 rounded-full transition-all duration-300"
              style={{ width: `${((activeStep + 1) / projectData.steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Current step */}
        <AnimatedCard className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <div className="rounded-lg overflow-hidden mb-4">
                <img 
                  src={projectData.imageUrl}
                  alt={`Step ${activeStep + 1}`}
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            <div className="md:w-1/2">
              <h3 className="text-xl font-bold mb-4">
                {activeStep + 1}. {projectData.steps[activeStep].title}
              </h3>
              <p className="text-gray-400 mb-6">{projectData.steps[activeStep].description}</p>
              
              <div className="flex space-x-4">
                <button 
                  className="px-4 py-2 border border-white/10 rounded-lg text-gray-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={handlePrevStep}
                >
                  Previous Step
                </button>
                
                <button 
                  className={`px-4 py-2 rounded-lg ${
                    activeStep === projectData.steps.length - 1
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-electric-600 hover:bg-electric-700 text-white"
                  } transition-colors`}
                  onClick={handleNextStep}
                >
                  {activeStep === projectData.steps.length - 1 ? "Complete Project" : "Next Step"}
                </button>
              </div>
            </div>
          </div>
        </AnimatedCard>
        
        {/* Step list */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {projectData.steps.map((step, index) => (
            <button
              key={index}
              className={`p-4 rounded-lg text-left transition-all duration-300 ${
                index === activeStep 
                ? "glass-morphism border-2 border-electric-500 shadow-glow" 
                : index < activeStep 
                  ? "glass-morphism opacity-70" 
                  : "glass-morphism opacity-50"
              }`}
              onClick={() => setActiveStep(index)}
            >
              <div className="flex items-center mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                  index <= activeStep ? "bg-electric-500 text-black" : "bg-gray-700 text-gray-400"
                }`}>
                  {index + 1}
                </div>
                <span className={index <= activeStep ? "text-white" : "text-gray-400"}>
                  {step.title.length > 15 ? step.title.substring(0, 15) + "..." : step.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Community feedback section */}
      <div className="mb-12 grid md:grid-cols-2 gap-8">
      <ProjectAIChat projectTitle={projectData.title} />
      
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Community Feedback</h2>
            <div className="flex items-center space-x-4">
              <button className="flex items-center text-gray-400 hover:text-white transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="flex items-center text-gray-400 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4 mr-2" />
                Comment
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {comments.map((comment, index) => (
              <AnimatedCard 
                key={index} 
                withBorder 
                className="animate-fade-in" 
                delay={index * 200}
              >
                <div className="flex items-start space-x-4">
                  <img 
                    src={comment.avatar} 
                    alt={comment.user} 
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-semibold">{comment.user}</h4>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < comment.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-400">{comment.comment}</p>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;