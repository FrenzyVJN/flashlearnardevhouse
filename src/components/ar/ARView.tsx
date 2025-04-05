import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Smartphone, ChevronLeft, ChevronRight, Play, Pause, RefreshCw, Camera, Check, Mic, MicOff } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { GeminiLiveWebsocketTransport } from '@pipecat-ai/gemini-live-websocket-transport';

// Audio Recorder class definition
class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataCallbacks: ((data: string) => void)[] = [];
  private volumeCallbacks: ((volume: number) => void)[] = [];

  constructor() {
    this.audioContext = new AudioContext();
  }

  on(event: 'data' | 'volume', callback: (data: any) => void) {
    if (event === 'data') {
      this.dataCallbacks.push(callback);
    } else if (event === 'volume') {
      this.volumeCallbacks.push(callback);
    }
    return this;
  }

  off(event: 'data' | 'volume', callback: (data: any) => void) {
    if (event === 'data') {
      this.dataCallbacks = this.dataCallbacks.filter(cb => cb !== callback);
    } else if (event === 'volume') {
      this.volumeCallbacks = this.volumeCallbacks.filter(cb => cb !== callback);
    }
    return this;
  }

  async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      const source = this.audioContext!.createMediaStreamSource(stream);
      this.analyser = this.audioContext!.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        this.volumeCallbacks.forEach(callback => callback(average / 128));
        requestAnimationFrame(checkVolume);
      };
      checkVolume();

      this.mediaRecorder.ondataavailable = (e) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          this.dataCallbacks.forEach(callback => callback(base64.split(',')[1]));
        };
        reader.readAsDataURL(e.data);
      };

      this.mediaRecorder.start(100);
    } catch (error) {
      console.error('Error starting audio recorder:', error);
    }
  }

  stop() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.mediaRecorder = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
  }
}

// Mock step data for AR instructions
const mockSteps = [
  { 
    title: "Position the cardboard tube", 
    discription: "Place the cardboard tube upright on a flat surface.",
  },
  { 
    title: "Cut the cone shape", 
    discription: "Use scissors to cut out the cone shape for the rocket nose.",
  },
  { 
    title: "Attach the cone", 
    discription: "Apply glue to the top of the tube and attach the cone.",
  },
  { 
    title: "Add the fins", 
    discription: "Glue the fins evenly spaced around the bottom of the tube.",
  },
  { 
    title: "Paint the rocket", 
    discription: "Paint your rocket in your chosen colors.",
  }
];

const ARView = () => {
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isARActive, setIsARActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSteps, setCurrentSteps] = useState<any[]>(mockSteps)
  const [isPaused, setIsPaused] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [lastFrameUrl, setLastFrameUrl] = useState<string | null>(null);
  const [micon, setMicOn] = useState(false);
  
  // Gemini-related state
  const [geminiSession, setGeminiSession] = useState<any>(null);
  const [geminiResponse, setGeminiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Audio processing refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Handle initial loading of AR resources
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasPermission) {
        setIsLoading(false);
      }
    }, 2000);

    const cachedProjects = JSON.parse(localStorage.getItem("cachedProjects"));
    const curr = parseInt(id);
    if (curr == undefined) {
      alert("Invalid ID!!");
      return;
    }
    if (cachedProjects && Array.isArray(cachedProjects) && cachedProjects.length > curr) {
      setCurrentSteps(cachedProjects[curr-1].steps)
      console.log("Using cached projects");
    }
    
    return () => clearTimeout(timer);
  }, [hasPermission]);
  
  // Clean up camera resources when component unmounts
  useEffect(() => {
    return () => {
      stopCameraStream();
      stopListening();
      // Clean up any captured frame
      if (lastFrameUrl) {
        URL.revokeObjectURL(lastFrameUrl);
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
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
  
  // Initialize Gemini WebSocket
  useEffect(() => {
    const initGeminiSession = async () => {
      try {
        const apiKey = "AIzaSyD-UHTng5Gh82qHDTuoxxZiM_nSNbDXqr8"; // Replace with your actual API key
        
        // Create WebSocket connection with proper URL format
        const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
        console.log("Connecting to Gemini WebSocket:", wsUrl);
        
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log("Gemini WebSocket connection established!");
          
          // Send initial configuration message
          const setupMessage = {
            setup: {
              model: "models/gemini-2.0-flash-exp"
            }
          };
          
          ws.send(JSON.stringify(setupMessage));
          setGeminiSession(ws);
        };
        
        ws.onmessage = (event) => {
          try {
            console.log("Received message from Gemini:", event.data);
            
            // Handle binary data
            if (event.data instanceof Blob) {
              // Process binary data (audio, etc.)
              event.data.arrayBuffer().then(buffer => {
                // Handle audio data
                if (audioContextRef.current && audioProcessorRef.current) {
                  const audioData = new Uint8Array(buffer);
                  // Process audio data
                  console.log("Received audio data of length:", audioData.length);
                }
              });
            } else {
              // Handle JSON data
              const response = JSON.parse(event.data);
              
              if (response.candidates && response.candidates[0].content) {
                const text = response.candidates[0].content.parts[0].text;
                console.log("Gemini response text:", text);
                setGeminiResponse(prev => prev + text);
              }
            }
          } catch (error) {
            console.error("Error parsing Gemini response:", error);
          }
        };
        
        ws.onerror = (error) => {
          console.error("Gemini WebSocket error:", error);
        };
        
        ws.onclose = (event) => {
          console.log("Gemini WebSocket connection closed", event.code, event.reason);
          setGeminiSession(null);
          
          // Attempt to reconnect after a delay if not intentionally closed
          if (event.code !== 1000) {
            console.log("Attempting to reconnect in 5 seconds...");
            setTimeout(() => {
              if (!geminiSession) {
                initGeminiSession();
              }
            }, 5000);
          }
        };
        
      } catch (error) {
        console.error("Failed to initialize Gemini session:", error);
      }
    };

    // Only attempt to initialize if we don't already have a session
    if (!geminiSession) {
      initGeminiSession();
    }

    return () => {
      if (geminiSession) {
        try {
          // Close with code 1000 to indicate normal closure
          geminiSession.close(1000, "Component unmounting");
        } catch (error) {
          console.error("Error closing Gemini session:", error);
        }
      }
    };
  }, [geminiSession]); // Add geminiSession as a dependency to prevent re-initialization
  
  // Handle audio recording and volume
  useEffect(() => {
    const onData = (base64: string) => {
      if (geminiSession && !muted) {
        // Send audio data to Gemini
        const realtimeInputMessage = {
          realtimeInput: {
            mediaChunks: [
              {
                mimeType: "audio/pcm;rate=16000",
                data: base64
              }
            ]
          }
        };
        geminiSession.send(JSON.stringify(realtimeInputMessage));
      }
    };

    if (geminiSession && !muted && audioRecorder) {
      audioRecorder.on("data", onData).on("volume", setInVolume).start();
    } else {
      audioRecorder.stop();
    }

    return () => {
      audioRecorder.off("data", onData).off("volume", setInVolume);
    };
  }, [geminiSession, muted, audioRecorder]);
  
  // Handle video frame capture and sending
  useEffect(() => {
    if (videoRef.current && renderCanvasRef.current) {
      let frameId: number | null = null;

      function sendVideoFrame() {
        const video = videoRef.current;
        const canvas = renderCanvasRef.current;

        if (!video || !canvas || !geminiSession) {
          return;
        }

        const ctx = canvas.getContext("2d")!;
        canvas.width = video.videoWidth * 0.25;
        canvas.height = video.videoHeight * 0.25;
        
        if (canvas.width + canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL("image/jpeg", 0.8);
          const data = base64.slice(base64.indexOf(",") + 1, Infinity);
          
          // Send video frame to Gemini
          const realtimeInputMessage = {
            realtimeInput: {
              mediaChunks: [
                {
                  mimeType: "image/jpeg",
                  data: data
                }
              ]
            }
          };
          geminiSession.send(JSON.stringify(realtimeInputMessage));
        }
        
        if (geminiSession) {
          frameId = requestAnimationFrame(sendVideoFrame);
        }
      }

      if (geminiSession) {
        frameId = requestAnimationFrame(sendVideoFrame);
      }

      return () => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }
      };
    }
  }, [geminiSession]);
  
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
            
            // Send the frame to Gemini if we're actively listening
            if (geminiSession && micon) {
              const reader = new FileReader();
              reader.onloadend = () => {
                // Get the base64 encoded image
                const base64data = reader.result;
                // Send the image to Gemini
                geminiSession.send({
                  image: base64data
                });
              };
              reader.readAsDataURL(blob);
            }
          }
        }, 'image/jpeg', 0.8); // Reduced quality for faster transmission
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
    if (currentStep < currentSteps.length - 1) {
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
    if (!micon) {
      startListening();
    } else {
      stopListening();
    }
  };
  
  const startListening = async () => {
    if (geminiSession) {
      setIsProcessing(true);
      setGeminiResponse(""); // Clear previous responses
      
      try {
        // Get audio stream from microphone
        audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create audio context and processor
        audioContextRef.current = new AudioContext();
        audioSourceRef.current = audioContextRef.current.createMediaStreamSource(audioStreamRef.current);
        audioProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        
        // Connect the audio nodes
        audioSourceRef.current.connect(audioProcessorRef.current);
        audioProcessorRef.current.connect(audioContextRef.current.destination);
        
        // Process audio data
        audioProcessorRef.current.onaudioprocess = (e) => {
          if (geminiSession) {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert Float32Array to Array and send to Gemini
            geminiSession.send({
              audio: Array.from(inputData)
            });
          }
        };
        
        // Capture video frame for visual context
        captureVideoFrame();
        
        // Set up interval to send periodic frames for visual context
        frameIntervalRef.current = setInterval(() => {
          if (micon && !isPaused) {
            captureVideoFrame();
          }
        }, 3000); // Send a frame every 3 seconds
        
      } catch (error) {
        console.error("Error accessing microphone:", error);
        setMicOn(false);
        setIsProcessing(false);
      }
    }
  };
  
  const stopListening = () => {
    setIsProcessing(false);
    
    // Clear frame interval
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    
    // Stop audio processing
    if (audioSourceRef.current && audioProcessorRef.current) {
      audioSourceRef.current.disconnect();
      audioProcessorRef.current.disconnect();
    }
    
    // Stop audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
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
<<<<<<< Updated upstream
                        {/* <img 
                          src={`https://source.unsplash.com/random/600x600?diy,craft,${currentSteps[currentStep].title}`} 
                          alt="AR Object" 
                          className="w-48 h-48 object-contain"
                        /> */}
=======
                        {/* 3D model would be rendered here */}
>>>>>>> Stashed changes
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
              
              {/* Gemini response display */}
              {micon && geminiResponse && (
                <div className="absolute bottom-32 left-6 right-6 bg-black/70 backdrop-blur-sm p-4 rounded-lg z-40">
                  <p className="text-white">{geminiResponse}</p>
                </div>
              )}
              
              {/* Gemini processing indicator */}
              {micon && isProcessing && !geminiResponse && (
                <div className="absolute bottom-32 left-6 right-6 bg-black/70 backdrop-blur-sm p-4 rounded-lg z-40 flex items-center">
                  <div className="w-4 h-4 rounded-full bg-electric-500 animate-pulse mr-2"></div>
                  <p className="text-white">Gemini is listening...</p>
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
                  className={`bg-black/60 backdrop-blur-sm p-2 rounded-full ${micon ? 'ring-2 ring-electric-500' : ''}`}
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
                <button 
                  className="bg-black/60 backdrop-blur-sm p-2 rounded-full"
                  onClick={captureVideoFrame}
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            
            {/* Instruction panel */}
            <div className="absolute bottom-0 left-0 right-0 glass-morphism p-6 z-30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">Step {currentStep + 1} of {currentSteps.length}</span>
                <div className="flex space-x-1">
                  {currentSteps.map((_, index) => (
                    <div 
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-electric-500' : 'bg-gray-600'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{currentSteps[currentStep].title}</h3>
              <p className="text-gray-300 mb-4">{currentSteps[currentStep].description}</p>
              
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
                  disabled={currentStep === currentSteps.length - 1 || isLoading}
                >
                  {currentStep === currentSteps.length - 1 ? (
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
      
      <canvas 
        style={{ display: "none" }} 
        ref={renderCanvasRef} 
      />
      
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          className={`p-2 rounded-full ${
            !muted ? 'bg-blue-500' : 'bg-gray-500'
          } text-white`}
          onClick={() => setMuted(!muted)}
        >
          {!muted ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
        
        {inVolume > 0 && (
          <div 
            className="w-2 bg-blue-500 rounded-full transition-all"
            style={{ height: `${Math.max(5, Math.min(inVolume * 200, 8))}px` }}
          />
        )}
      </div>
    </div>
  );
};

export default ARView;
