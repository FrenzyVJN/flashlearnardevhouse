import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Smartphone, ChevronLeft, ChevronRight, Play, Pause, RefreshCw, Camera, Check, Mic, MicOff, Wifi, WifiOff } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

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
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [pcmData, setPcmData] = useState<number[]>([]);
  const [currentFrameB64, setCurrentFrameB64] = useState<string | null>(null);
  const [audioWorkletNode, setAudioWorkletNode] = useState<AudioWorkletNode | null>(null);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const pcmDataRef = useRef<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttemptsRef = useRef(0);
  
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
    if (isVoiceChatActive) {
      stopVoiceChat();
    } else {
      startVoiceChat();
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
  
  // Initialize WebSocket connection with reconnection logic
  useEffect(() => {
    const connectWebSocket = () => {
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        setWsStatus('error');
        return;
      }

      setWsStatus('connecting');
      const ws = new WebSocket("ws://localhost:9080");
      
      ws.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttemptsRef.current = 0;
        setWsStatus('connected');
        // Send initial setup message with correct configuration
        const setupMessage = {
          setup: {
            generation_config: {
              temperature: 0.9,
              top_p: 1,
              top_k: 32,
              max_output_tokens: 2048
            }
          }
        };
        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        if (messageData.text) {
          setChatMessages(prev => [...prev, `GEMINI: ${messageData.text}`]);
        }
        if (messageData.audio) {
          handleAudioResponse(messageData.audio);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsStatus('error');
        ws.close();
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        setWsStatus('disconnected');
        
        // Attempt to reconnect after a delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectWebSocket();
        }, 3000); // Wait 3 seconds before reconnecting
      };

      wsRef.current = ws;
      setWebSocket(ws);
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Initialize audio context and worklet
  const initializeAudioContext = async () => {
    if (audioContextRef.current) return;

    const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    await context.audioWorklet.addModule("/pcm-processor.js");
    const workletNode = new AudioWorkletNode(context, "pcm-processor");
    workletNode.connect(context.destination);

    audioContextRef.current = context;
    setAudioContext(context);
    setAudioWorkletNode(workletNode);
  };

  // Handle audio response from Gemini
  const handleAudioResponse = async (base64Audio: string) => {
    try {
      if (!audioContextRef.current || !audioWorkletNode) {
        await initializeAudioContext();
      }

      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }

      const arrayBuffer = base64ToArrayBuffer(base64Audio);
      const float32Data = convertPCM16LEToFloat32(arrayBuffer);
      audioWorkletNode?.port.postMessage(float32Data);
    } catch (error) {
      console.error("Error processing audio chunk:", error);
    }
  };

  // Utility functions for audio processing
  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const convertPCM16LEToFloat32 = (pcmData: ArrayBuffer) => {
    const inputArray = new Int16Array(pcmData);
    const float32Array = new Float32Array(inputArray.length);
    for (let i = 0; i < inputArray.length; i++) {
      float32Array[i] = inputArray[i] / 32768;
    }
    return float32Array;
  };

  // Start voice chat
  const startVoiceChat = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      const context = new AudioContext({
        sampleRate: 16000,
      });

      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = inputData[i] * 0x7fff;
        }
        pcmDataRef.current.push(...pcm16);
      };

      source.connect(processor);
      processor.connect(context.destination);

      // Start sending audio chunks
      intervalRef.current = setInterval(sendAudioChunk, 3000);
      setIsVoiceChatActive(true);
      setMicOn(true);
    } catch (error) {
      console.error("Error starting voice chat:", error);
    }
  };

  // Stop voice chat
  const stopVoiceChat = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsVoiceChatActive(false);
    setMicOn(false);
  };

  // Send audio chunk to Gemini
  const sendAudioChunk = () => {
    if (!wsRef.current || !currentFrameB64) return;

    const buffer = new ArrayBuffer(pcmDataRef.current.length * 2);
    const view = new DataView(buffer);
    pcmDataRef.current.forEach((value, index) => {
      view.setInt16(index * 2, value, true);
    });

    const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));

    const payload = {
      realtime_input: {
        media_chunks: [
          {
            mime_type: "audio/pcm",
            data: base64,
          },
          {
            mime_type: "image/jpeg",
            data: currentFrameB64,
          },
        ],
      },
    };

    wsRef.current.send(JSON.stringify(payload));
    pcmDataRef.current = [];
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
                          src={`https://source.unsplash.com/random/600x600?diy,craft,${currentSteps[currentStep].title}`} 
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
      
      {/* Add chat messages display */}
      <div className="absolute bottom-32 left-4 right-4 max-h-32 overflow-y-auto bg-black/60 backdrop-blur-sm rounded-lg p-4 z-40">
        {chatMessages.map((message, index) => (
          <p key={index} className="text-white text-sm mb-2">{message}</p>
        ))}
      </div>

      {/* Add WebSocket status indicator */}
      <div className="absolute top-6 right-6 flex items-center space-x-2 z-50">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
          wsStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
          wsStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
          wsStatus === 'error' ? 'bg-red-500/20 text-red-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {wsStatus === 'connected' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {wsStatus === 'connected' ? 'Connected' :
             wsStatus === 'connecting' ? 'Connecting...' :
             wsStatus === 'error' ? 'Connection Error' :
             'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ARView;