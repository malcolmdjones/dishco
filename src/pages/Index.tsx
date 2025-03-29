
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to HomePage
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dishco-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Dishco</h1>
        <p className="text-xl text-gray-600">Loading your meal planning experience...</p>
      </div>
    </div>
  );
};

export default Index;
