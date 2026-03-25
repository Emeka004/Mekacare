import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Heart, User, LogOut, Home, Calendar, BookOpen, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';

export function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const dashboardPath = user?.userType === 'patient' ? '/patient-dashboard' : '/provider-dashboard';

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate(dashboardPath)}
          >
            <Heart className="h-7 w-7 text-pink-600" />
            <h1 className="text-xl font-bold text-pink-600">MekaCare</h1>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(dashboardPath)}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>

            {user?.userType === 'patient' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/report-risk')}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Report Risk
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/appointments')}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Appointments
            </Button>

            {user?.userType === 'patient' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/education')}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Education
              </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden sm:inline">
            {user?.name}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(dashboardPath)}>
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
