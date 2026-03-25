import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Heart, Home } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <Heart className="h-20 w-20 text-pink-600 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/')} className="gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
