import { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2 } from 'lucide-react';

interface LiveCameraProps {
  onCapture: (base64Image: string) => void;
}

export function LiveCamera({ onCapture }: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setHasStarted(true);
      setPhoto(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Camera access denied or unavailable. Please enable camera access.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(imgData);
        stopCamera();
        onCapture(imgData);
      }
    }
  };

  const retake = () => {
    setPhoto(null);
    startCamera();
  };

  return (
    <div className="w-full flex justify-center flex-col items-center border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
      {!hasStarted && !photo ? (
        <button
          type="button"
          onClick={startCamera}
          className="flex flex-col items-center text-gray-500 hover:text-primary transition p-8"
        >
          <Camera size={48} className="mb-2" />
          <span>Tap to capture mandatory live photo</span>
        </button>
      ) : photo ? (
        <div className="relative w-full max-w-sm rounded-lg overflow-hidden shadow-md">
          <img src={photo} alt="Food capture" className="w-full h-auto" />
          <div className="absolute top-2 right-2 bg-white rounded-full text-green-500 shadow-md">
            <CheckCircle2 size={32} />
          </div>
          <button 
            type="button"
            onClick={retake} 
            className="w-full bg-gray-800 text-white flex items-center justify-center py-3 hover:bg-gray-700"
          >
            <RefreshCw size={18} className="mr-2" /> Retake Photo
          </button>
        </div>
      ) : (
        <div className="relative w-full max-w-sm bg-black rounded-lg overflow-hidden shadow-md">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-auto min-h-[300px]"
          />
          <button
            type="button"
            onClick={capturePhoto}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg active:scale-95 transition"
          />
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// Resubmission commit update
