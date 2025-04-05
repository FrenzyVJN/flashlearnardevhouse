import { useParams } from 'react-router-dom';

const ARView = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="relative h-screen w-full">
      <iframe
        src="https://flashlearnarbackend.vercel.app/"
        className="w-full h-full border-0"
        title="AR Experience"
        allow="camera; microphone"
      />
    </div>
  );
};

export default ARView;