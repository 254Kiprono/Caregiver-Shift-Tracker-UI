
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

const MobileBottomNav: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isMobile) return null;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 sm:hidden shadow-lg">
      <div className="flex justify-around items-center max-w-sm mx-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center py-2 px-6 rounded-lg transition-all duration-200 ${
              location.pathname === path
                ? 'text-careviah-green bg-careviah-green/10 scale-105'
                : 'text-gray-500 hover:text-careviah-green hover:scale-105'
            }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
