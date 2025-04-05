
import { useState } from 'react';
import { Camera, Upload, RefreshCw, ArrowRight } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { useNavigate } from 'react-router-dom';

const ScanItem = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [identifiedItems, setIdentifiedItems] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!uploadedImage) return;
  
    setIsScanning(true);
  
    try {
      const base64Image = uploadedImage.split(',')[1];
      
      const GEMINI_API_KEY = "AIzaSyD-UHTng5Gh82qHDTuoxxZiM_nSNbDXqr8";
      const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Identify all objects visible in this image and return them as a comma-separated list of simple terms. ONLY RETURN THE LIST DO NOT SEND ANYTHING ELSE."
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Image
                  }
                }
              ]
            }
          ]
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${JSON.stringify(errorData)}`);
      }
  
      const data = await response.json();
      
      const itemsText = data.candidates[0].content.parts[0].text;
      const itemsList = itemsText.split(',').map(item => item.trim());
      
      setIdentifiedItems(itemsList);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setIdentifiedItems(["Error identifying items"]);
    } finally {
      setIsScanning(false);
      setScanComplete(true);
    }
  };

  const handleContinue = () => {
    localStorage.setItem("scannedItems", JSON.stringify(identifiedItems));
    navigate('/projects', { state: { items: identifiedItems } });
  };

  const handleReset = () => {
    setUploadedImage(null);
    setScanComplete(false);
    setIdentifiedItems([]);
  };

  return (
    <div className="max-w-4xl mx-auto w-full bg-midnight-900/50 rounded-xl overflow-hidden glass-morphism">
      <div className="relative p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gradient mb-6">Scan Your Items</h2>
        <p className="text-gray-400 mb-8">
          Take or upload a photo of the items you want to use for your DIY project.
          Our AI will identify them and suggest creative projects.
        </p>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 relative border border-white/10 rounded-xl overflow-hidden animate-fade-in">
            {uploadedImage ? (
              <div className="relative aspect-square">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded items" 
                  className="w-full h-full object-cover"
                />
                {isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    <div className="w-16 h-16 rounded-full border-2 border-electric-500 border-t-transparent animate-spinner mb-4"></div>
                    <p className="text-electric-400">Scanning items...</p>
                  </div>
                )}
                {scanComplete && (
                  <div className="absolute inset-0 flex items-center justify-center" onClick={handleReset}>
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                    <div className="relative px-4 py-3 rounded-lg bg-electric-500/20 border border-electric-500/40 backdrop-blur-md">
                      {identifiedItems.map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center mb-2 animate-fade-in" 
                          style={{ animationDelay: `${index * 150}ms` }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full bg-electric-500 mr-2"></span>
                          <span className="text-white">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square flex flex-col items-center justify-center bg-midnight-950/50 text-gray-500">
                <Camera className="w-16 h-16 mb-4 text-gray-600" />
                <p>No image uploaded</p>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-white font-medium mb-2">Upload Photo</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-electric-500/50 transition-colors duration-300">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400">Drag and drop or click to upload</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={isScanning}
                  />
                </label>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Or Take a Photo</label>
                <button 
                  className="w-full py-3 px-4 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  disabled={isScanning}
                >
                  <Camera className="w-5 h-5 mr-2 text-electric-400" />
                  <span>Open Camera</span>
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {uploadedImage && !scanComplete && (
                <AnimatedButton
                  variant="electric"
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spinner" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      Scan Items
                    </>
                  )}
                </AnimatedButton>
              )}
              
              {scanComplete && (
                <AnimatedButton
                  variant="electric"
                  onClick={handleContinue}
                  className="w-full"
                >
                  <span>Continue to Project Ideas</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </AnimatedButton>
              )}
              
              {uploadedImage && (
                <button 
                  className="w-full py-2 text-gray-400 hover:text-white transition-colors"
                  onClick={handleReset}
                  disabled={isScanning}
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanItem;
