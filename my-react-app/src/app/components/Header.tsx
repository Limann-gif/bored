import { Link, useNavigate } from 'react-router';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Calendar, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/activities" className="flex items-center gap-2">
          <Sparkles className="size-8 text-purple-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Bored!
          </span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link to="/activities">
            <Button variant="ghost">Activities</Button>
          </Link>
          <Link to="/my-groups">
            <Button variant="ghost">
              <Calendar className="size-4 mr-2" />
              My Groups
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User className="size-4" />
                {user.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="text-sm">{user.email}</span>
                  <span className="text-xs text-gray-500">
                    {user.subscriptionStatus === 'active' ? 'Active Subscriber' : 'Free Tier'}
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="size-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
