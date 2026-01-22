
import React from 'react';
import { Activity, MessageSquare, History, Calendar, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, activeTab, onTabChange, onLogout }) => {
  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'chatbot', label: 'HealthBot', icon: <MessageSquare size={18} /> },
    { id: 'history', label: 'History', icon: <History size={18} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
  ];

  if (user.role === UserRole.ADMIN) {
    navItems.push({ id: 'admin', label: 'Admin', icon: <ShieldCheck size={18} /> });
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => onTabChange('dashboard')}
              className="flex-shrink-0 flex items-center space-x-2 group"
            >
              <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
                <Activity size={24} />
              </div>
              <span className="text-xl font-bold text-slate-900 hidden sm:block">HealthAI</span>
            </button>
            <div className="hidden lg:ml-8 lg:flex lg:space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-semibold transition-all ${
                    activeTab === item.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center text-sm text-slate-700 space-x-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {user.fullName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-bold leading-none">{user.fullName}</span>
                <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="lg:hidden border-t border-slate-200 bg-white">
        <div className="flex justify-around py-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors flex-shrink-0 ${
                activeTab === item.id ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
