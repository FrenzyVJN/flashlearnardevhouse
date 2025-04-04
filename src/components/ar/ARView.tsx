import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Smartphone, ChevronLeft, ChevronRight, Play, Pause, RefreshCw, Camera, Check, Mic, MicOff } from 'lucide-react';
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
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [lastFrameUrl, setLastFrameUrl] = useState<string | null>(null);
  const [micon, setMicOn] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Handle initial loading of AR resources
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasPermission) {
        setIsLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [hasPermission]);
  
  // Clean up camera resources when component unmounts
  useEffect(() => {
    return () => {
      stopCameraStream();
      // Clean up any captured frame
      if (lastFrameUrl) {
        URL.revokeObjectURL(lastFrameUrl);
      }
    };
  }, [lastFrameUrl]);
  
  // Handle camera activation when AR becomes active
  useEffect(() => {
    if (isARActive && !hasPermission) {
      startCamera();
    } else if (!isARActive) {
      stopCameraStream();
    }
  }, [isARActive, hasPermission]);
  
  const stopCameraStream = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  
  const captureVideoFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame onto the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob and create URL
        canvas.toBlob((blob) => {
          if (blob) {
            // Clean up previous blob URL if exists
            if (lastFrameUrl) {
              URL.revokeObjectURL(lastFrameUrl);
            }
            
            // Create new blob URL
            const newFrameUrl = URL.createObjectURL(blob);
            setLastFrameUrl(newFrameUrl);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };
  
  const startCamera = async () => {
    setIsLoading(true);
    setCameraError(null);
    
    try {
      // Stop any existing stream first
      stopCameraStream();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      // Store the stream in ref for later cleanup
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Play the video once metadata is loaded
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setHasPermission(true);
                setIsLoading(false);
                // Reset any previously captured frame
                if (lastFrameUrl) {
                  URL.revokeObjectURL(lastFrameUrl);
                  setLastFrameUrl(null);
                }
                setIsPaused(false);
              })
              .catch(err => {
                console.error("Error playing video:", err);
                setCameraError("Could not start video playback. Please try again.");
                setIsLoading(false);
              });
          }
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or not available. Please check your permissions.");
      setIsLoading(false);
    }
  };
  
  const handleNextStep = () => {
    if (currentStep < mockSteps.length - 1) {
      setIsLoading(true);
      setCurrentStep(prevStep => prevStep + 1);
      setTimeout(() => setIsLoading(false), 1000);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setIsLoading(true);
      setCurrentStep(prevStep => prevStep - 1);
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handleMicToggle = () => {
    setMicOn(prev => !prev);
    // Handle microphone access here if needed
  };
  
  const toggleAR = () => {
    if (!isARActive) {
      setIsARActive(true);
    } else {
      stopCameraStream();
      setIsARActive(false);
      setHasPermission(false);
    }
  };
  
  const togglePause = () => {
    if (!isPaused) {
      // If unpaused, capture the current frame and pause
      captureVideoFrame();
    }
    
    setIsPaused(prevPaused => !prevPaused);
  };
  
  const switchCamera = () => {
    // Toggle between front and back camera
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
    
    // Restart camera with new facing mode
    setIsLoading(true);
    setIsPaused(false);
    
    // Delete any previous frame capture
    if (lastFrameUrl) {
      URL.revokeObjectURL(lastFrameUrl);
      setLastFrameUrl(null);
    }
    
    // Small delay before restarting
    setTimeout(() => {
      startCamera();
    }, 300);
  };
  
  return (
    <div className="relative h-screen bg-black">
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden"></canvas>
      
      {/* AR view area */}
      <div className="relative w-full h-full">
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
            {/* Camera view */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent z-10"></div>
              
              {/* Live camera feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${(!hasPermission || cameraError || isPaused) ? 'hidden' : 'block'}`}
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
              
              {/* Captured frame display when paused */}
              {isPaused && lastFrameUrl && (
                <div className="absolute inset-0">
                  <img 
                    src={lastFrameUrl}
                    alt="Paused Frame" 
                    className="w-full h-full object-cover"
                    style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                  />
                </div>
              )}
              
              {/* Fallback if camera access fails */}
              {(cameraError || (!hasPermission && !isLoading && !isPaused)) && (
                <div className="absolute inset-0 bg-midnight-950 flex items-center justify-center flex-col p-6">
                  <img 
                    src="https://images.unsplash.com/photo-1576502200916-3808e07386a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
                    alt="AR Camera View Fallback" 
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                    <div className="text-center p-6 max-w-md">
                      <Camera className="w-12 h-12 text-red-400 mx-auto mb-4" />
                      <p className="text-white font-bold mb-2">Camera Access Required</p>
                      <p className="text-gray-300 mb-4">
                        {cameraError || "We need camera access to provide the AR experience. Please grant permission when prompted."}
                      </p>
                      <AnimatedButton
                        variant="electric"
                        withGlow
                        onClick={startCamera}
                      >
                        Try Again
                      </AnimatedButton>
                    </div>
                  </div>
                </div>
              )}
              
              {/* AR Content Overlay */}
              {(!isLoading && hasPermission) && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="relative w-64 h-64">
                    {/* AR 3D object placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full rounded-full border-2 border-dashed border-electric-500 animate-pulse opacity-60"></div>
                      <div className="absolute w-3/4 h-3/4 bg-electric-500/10 rounded-full animate-pulse"></div>
                      <div className="absolute">
                        {/* <img 
                          src={`https://source.unsplash.com/random/600x600?diy,craft,${mockSteps[currentStep].title}`} 
                          alt="AR Object" 
                          className="w-48 h-48 object-contain"
                        /> */}
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
                    <p className="text-electric-400">{hasPermission ? 'Loading AR content...' : 'Accessing camera...'}</p>
                  </div>
                </div>
              )}
              
              {/* Scan prompt if paused - removed since we want to display the last frame instead */}
            </div>
            
            {/* AR interface controls */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-30">
              <Link to={`/project/${id}`} className="bg-black/60 backdrop-blur-sm p-2 rounded-full">
                <ArrowLeft className="w-6 h-6 text-white" />
              </Link>
              
              <div className="flex space-x-2">
                <button 
                  className="bg-black/60 backdrop-blur-sm p-2 rounded-full"
                  onClick={handleMicToggle}
                  disabled={isLoading}
                >
                  {micon ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
                  </button>
                <button 
                  className="bg-black/60 backdrop-blur-sm p-2 rounded-full"
                  onClick={togglePause}
                  disabled={isLoading || !hasPermission}
                >
                  {isPaused ? <Play className="w-6 h-6 text-white" /> : <Pause className="w-6 h-6 text-white" />}
                </button>
                <button 
                  className="bg-black/60 backdrop-blur-sm p-2 rounded-full"
                  onClick={switchCamera}
                  disabled={isLoading}
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
                  disabled={currentStep === 0 || isLoading}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </button>
                
                <button 
                  className="flex items-center px-4 py-2 rounded-lg bg-electric-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNextStep}
                  disabled={currentStep === mockSteps.length - 1 || isLoading}
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