
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Smartphone, ChevronLeft, ChevronRight, Play, Pause, RefreshCw, Camera, Check } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

// Mock step data for AR instructions
const mockSteps = [
  { 
    title: "Position the cardboard tube", 
    instruction: "Place the cardboard tube upright on a flat surface.",
    arModel: "tube_placement.glb"
  },
  { 
    title: "Cut the cone shape", 
    instruction: "Use scissors to cut out the cone shape for the rocket nose.",
    arModel: "cutting_cone.glb"
  },
  { 
    title: "Attach the cone", 
    instruction: "Apply glue to the top of the tube and attach the cone.",
    arModel: "attaching_cone.glb"
  },
  { 
    title: "Add the fins", 
    instruction: "Glue the fins evenly spaced around the bottom of the tube.",
    arModel: "adding_fins.glb"
  },
  { 
    title: "Paint the rocket", 
    instruction: "Paint your rocket in your chosen colors.",
    arModel: "painting_rocket.glb"
  }
];

const ARView = () => {
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isARActive, setIsARActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    // Simulate loading AR resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleNextStep = () => {
    if (currentStep < mockSteps.length - 1) {
      setIsLoading(true);
      setCurrentStep(currentStep + 1);
      setTimeout(() => setIsLoading(false), 1500);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setIsLoading(true);
      setCurrentStep(currentStep - 1);
      setTimeout(() => setIsLoading(false), 1500);
    }
  };
  
  const toggleAR = () => {
    setIsARActive(!isARActive);
    if (!isARActive) {
      // Simulate requesting camera permissions
      setTimeout(() => {
        setIsARActive(true);
      }, 1000);
    }
  };
  
  const togglePause = () => {
    setIsPaused(!isPaused);
  };
  
  return (
    <div className="relative min-h-screen bg-black">
      {/* AR view area */}
      <div className="relative w-full h-[calc(100vh-180px)]">
        {!isARActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-midnight-950 text-center p-6">
            <Smartphone className="w-16 h-16 text-electric-400 mb-6" />
            <h2 className="text-2xl font-bold text-gradient mb-4">AR Instructions</h2>
            <p className="text-gray-400 mb-8 max-w-md">
              Experience step-by-step augmented reality guidance for building your Rocket Pencil Holder.
            </p>
            <AnimatedButton 
              variant="electric" 
              withGlow
              onClick={toggleAR}
            >
              Start AR Experience
            </AnimatedButton>
          </div>
        ) : (
          <div className="relative w-full h-full overflow-hidden bg-midnight-950">
            {/* AR camera view (simulated) */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1576502200916-3808e07386a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
                alt="AR Camera View" 
                className="w-full h-full object-cover opacity-70"
              />
              
              {/* AR Content Overlay */}
              {!isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="relative w-64 h-64">
                    {/* AR 3D object placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full rounded-full border-2 border-dashed border-electric-500 animate-pulse opacity-60"></div>
                      <div className="absolute w-3/4 h-3/4 bg-electric-500/10 rounded-full animate-pulse"></div>
                      <div className="absolute">
                        <img 
                          src={`https://source.unsplash.com/random/600x600?diy,craft,${mockSteps[currentStep].title}`} 
                          alt="AR Object" 
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                    </div>
                    
                    {/* Animated guides */}
                    <div className="absolute top-1/2 left-0 w-14 h-0.5 bg-electric-500 animate-pulse"></div>
                    <div className="absolute top-1/2 right-0 w-14 h-0.5 bg-electric-500 animate-pulse"></div>
                    <div className="absolute top-0 left-1/2 h-14 w-0.5 bg-electric-500 animate-pulse"></div>
                    <div className="absolute bottom-0 left-1/2 h-14 w-0.5 bg-electric-500 animate-pulse"></div>
                  </div>
                </div>
              )}
              
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-4 border-electric-500 border-t-transparent animate-spinner mb-4"></div>
                    <p className="text-electric-400">Loading AR content...</p>
                  </div>
                </div>
              )}
              
              {/* Scan prompt if paused */}
              {isPaused && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-25">
                  <div className="flex flex-col items-center">
                    <div className="w-48 h-48 border-2 border-dashed border-electric-500 rounded-lg flex items-center justify-center mb-4">
                      <Smartphone className="w-12 h-12 text-electric-400" />
                    </div>
                    <p className="text-white font-medium mb-2">Move your phone to scan the area</p>
                    <p className="text-gray-400 text-sm">Find a flat surface to place your project</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* AR interface controls */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-30">
              <Link to={`/project/${id}`} className="bg-black/60 backdrop-blur-sm p-2 rounded-full">
                <ArrowLeft className="w-6 h-6 text-white" />
              </Link>
              
              <div className="flex space-x-2">
                <button 
                  className="bg-black/60 backdrop-blur-sm p-2 rounded-full"
                  onClick={togglePause}
                >
                  {isPaused ? <Play className="w-6 h-6 text-white" /> : <Pause className="w-6 h-6 text-white" />}
                </button>
                <button 
                  className="bg-black/60 backdrop-blur-sm p-2 rounded-full"
                  onClick={() => setIsARActive(false)}
                >
                  <RefreshCw className="w-6 h-6 text-white" />
                </button>
                <button className="bg-black/60 backdrop-blur-sm p-2 rounded-full">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            
            {/* Instruction panel */}
            <div className="absolute bottom-0 left-0 right-0 glass-morphism p-6 z-30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">Step {currentStep + 1} of {mockSteps.length}</span>
                <div className="flex space-x-1">
                  {mockSteps.map((_, index) => (
                    <div 
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-electric-500' : 'bg-gray-600'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{mockSteps[currentStep].title}</h3>
              <p className="text-gray-300 mb-4">{mockSteps[currentStep].instruction}</p>
              
              <div className="flex justify-between">
                <button 
                  className="flex items-center px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </button>
                
                <button 
                  className="flex items-center px-4 py-2 rounded-lg bg-electric-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNextStep}
                  disabled={currentStep === mockSteps.length - 1}
                >
                  {currentStep === mockSteps.length - 1 ? (
                    <>
                      <Check className="w-5 h-5 mr-1" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARView;
