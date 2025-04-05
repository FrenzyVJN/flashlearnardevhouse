import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const ARView = () => {
  const { id } = useParams<{ id: string }>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const context = JSON.parse(localStorage.getItem('cachedProjects') || '[]')[parseInt(id) - 1];

  useEffect(() => {
    // Create event listener for the IFRAME_READY message
    const handleMessage = (event: MessageEvent) => {
      // Optional: Validate origin for security
      // if (event.origin !== 'https://flashlearnarbackend.vercel.app') return;
      
      if (event.data?.type === 'IFRAME_READY' && iframeRef.current?.contentWindow) {
        // Send context to iframe
        iframeRef.current.contentWindow.postMessage(
          { type: 'PROJECT_CONTEXT', context },
          'https://flashlearnarbackend.vercel.app'
        );
      }
    };
    
    // Add event listener for message from iframe
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [context]);

  // Optional: Also pass context via URL parameter
  const encodedContext = encodeURIComponent(JSON.stringify(context));
  const iframeSrc = `https://flashlearnarbackend.vercel.app?context=${encodedContext}`;

  return (
    <div className="relative h-screen w-full">
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        className="w-full h-full border-0"
        title="AR Experience"
        allow="camera; microphone"
      />
    </div>
  );
};

export default ARView;