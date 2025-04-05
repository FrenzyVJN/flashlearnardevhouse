import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './ARActualView.module.css';

interface ProjectDetails {
  instructions: string;
  steps: Array<{
    description: string;
    completed: boolean;
  }>;
}

const ARActualView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const location = useLocation();
  const projectDetails = location.state as ProjectDetails;

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
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
      // Capture current frame before pausing
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

  const analyzeCurrentStep = async () => {
    console.log("Analyzing current step", projectDetails);
    if (!projectDetails || isAnalyzing) return;

    const currentStep = projectDetails.steps.find(step => !step.completed);
    if (!currentStep) return;

    setIsAnalyzing(true);
    try {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      if (!video) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');

      const response = await fetch('https://api.moondream.com/v1/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_MOONDREAM_API_KEY}`
        },
        body: JSON.stringify({
          image: imageData,
          instructions: currentStep.description,
          projectContext: projectDetails.instructions
        })
      });

      const result = await response.json();
      console.log('Analysis result:', result);
      // Handle the analysis result as needed
    } catch (error) {
      console.error('Error analyzing step:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      </div>
      {projectDetails && (
        <div className={styles.projectInfo}>
          <h3>Current Instructions</h3>
          <p className={styles.instructions}>{projectDetails.instructions}</p>
          <div className={styles.steps}>
            {projectDetails.steps.map((step, index) => (
              <div 
                key={index} 
                className={`${styles.step} ${step.completed ? styles.completed : ''}`}
              >
                {step.description}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ARActualView;
