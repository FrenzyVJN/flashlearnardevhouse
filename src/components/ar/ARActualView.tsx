import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import styles from './ARActualView.module.css';

interface Project {
  id: number;
  title: string;
  instructions: string;
  steps: Array<{
    description: string;
    completed: boolean;
  }>;
  difficulty: string;
}

interface AnalysisResult {
  success: boolean;
  analysis: {
    completed: boolean;
    feedback: string;
    confidence: number;
    nextStepRecommendation: string;
  };
}

const ARActualView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Configure your FastAPI server URL
  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    const savedProject = localStorage.getItem('currentProject');
    if (savedProject) {
      try {
        setProject(JSON.parse(savedProject));
      } catch (e) {
        console.error("Error parsing saved project:", e);
      }
    }
    
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'environment'
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    initializeCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }
      setIsPaused(true);
    }
  };

  const goToNextStep = () => {
    if (project && currentStepIndex < project.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setAnalysisResult(null); // Clear previous results when changing steps
      setApiError(null);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setAnalysisResult(null); // Clear previous results when changing steps
      setApiError(null);
    }
  };

  const analyzeCurrentStep = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
  
    // Match canvas to video frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    // Freeze the frame by copying from video
    setIsPaused(true);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // Capture image data
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
  
    try {
      const response = await fetch(`http://localhost:8000/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_data: imageData }),
      });
  
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
  
      const result = await response.json();
  
      if (result.success && Array.isArray(result.analysis.feedback?.points)) {
        const points = result.analysis.feedback.points;
  
        points.forEach((point: { x: number; y: number }) => {
          const x = (point.x) * canvas.width;
          const y = (point.y) * canvas.height;
  
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'blue';
          ctx.stroke();
        });
      }
    } catch (error) {
      console.error('Error analyzing step:', error);
    }
  };
  
  
  
  const currentStep = project?.steps[currentStepIndex];

  if (isLoading) {
    return <div className={styles.loadingIndicator}>Loading...</div>;
  }

  if (!project) {
    return <div className={styles.errorMessage}>No project data available</div>;
  }

  return (
    <div className={styles.arActualView}>
      <div className={styles.cameraContainer}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`${styles.cameraFeed} ${isPaused ? styles.hidden : ''}`}
        />
        <canvas
          ref={canvasRef}
          className={`${styles.cameraFeed} ${!isPaused ? styles.hidden : ''}`}
        />
        <div className={styles.statusIndicator}>
          <div className={`${styles.statusDot} ${isPaused ? styles.paused : ''}`} />
          <span>{isPaused ? 'Frozen' : 'Live'}</span>
        </div>
        <div className={styles.controls}>
          <button 
            className={styles.controlButton}
            onClick={togglePause}
            disabled={isAnalyzing}
          >
            {isPaused ? 'Resume' : 'Freeze'}
          </button>
          <button 
            className={styles.controlButton}
            onClick={analyzeCurrentStep}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Current Step'}
          </button>
        </div>
        
        {/* API Error Message */}
        {apiError && (
          <div className={styles.errorMessage}>
            <h4>API Error</h4>
            <p>{apiError}</p>
          </div>
        )}
        
        {/* Analysis Results Display */}
        {analysisResult && (
          <div className={`${styles.analysisResults} ${analysisResult.success ? (analysisResult.analysis.completed ? styles.success : styles.incomplete) : styles.error}`}>
            <h4>Analysis Results</h4>
            <p><strong>Status:</strong> {analysisResult.analysis.completed ? 'Completed' : 'Not Completed'}</p>
            <p><strong>Feedback:</strong> {analysisResult.analysis.feedback}</p>
            {analysisResult.analysis.confidence > 0 && (
              <p><strong>Confidence:</strong> {Math.round(analysisResult.analysis.confidence * 100)}%</p>
            )}
            <p><strong>Recommendation:</strong> {analysisResult.analysis.nextStepRecommendation}</p>
          </div>
        )}
      </div>
      
      <div className={styles.projectInfo}>
        <h3>{project.title}</h3>
        <p className={styles.difficulty}>Difficulty: {project.difficulty}</p>
        <p className={styles.instructions}>{project.instructions}</p>
        
        <div className={styles.stepNavigation}>
          <button 
            className={styles.navButton}
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
          >
            Previous Step
          </button>
          <span className={styles.stepCounter}>
            Step {currentStepIndex + 1} of {project.steps.length}
          </span>
          <button 
            className={styles.navButton}
            onClick={goToNextStep}
            disabled={currentStepIndex === project.steps.length - 1}
          >
            Next Step
          </button>
        </div>

        <div className={styles.currentStep}>
          <h4>Current Step:</h4>
          <p>{currentStep?.description}</p>
        </div>

        <div className={styles.steps}>
          {project.steps.map((step, index) => (
            <div 
              key={index} 
              className={`${styles.step} ${step.completed ? styles.completed : ''} ${index === currentStepIndex ? styles.active : ''}`}
            >
              {step.description}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ARActualView;