
import React from 'react';
import { User, RiskLevel } from '../types';
import { Shield, MessageSquare, Calendar, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

interface DashboardProps {
  user: User;
  stats: {
    totalChats: number;
    appointments: number;
    lastRisk?: RiskLevel;
  };
  onAction: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, stats, onAction }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hello, {user.fullName}!</h1>
        <p className="text-slate-600">Monitor your health metrics and get instant guidance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <MessageSquare size={24} />
            </div>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Total Consultations</h3>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalChats}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <Calendar size={24} />
            </div>
            <Clock size={20} className="text-slate-400" />
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Pending Appointments</h3>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.appointments}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <Shield size={24} />
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              stats.lastRisk === RiskLevel.HIGH ? 'bg-red-100 text-red-600' : 
              stats.lastRisk === RiskLevel.MEDIUM ? 'bg-orange-100 text-orange-600' : 
              'bg-green-100 text-green-600'
            }`}>
              {stats.lastRisk || 'Safe'}
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Last Risk Assessment</h3>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.lastRisk || 'None'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Start New Health Consultation</h2>
            <p className="text-blue-100 mb-6 max-w-md">Our AI-powered assistant is ready to help you analyze symptoms and provide instant guidance.</p>
            <button 
              onClick={() => onAction('chatbot')}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-md"
            >
              Talk to HealthBot
            </button>
          </div>
          <div className="absolute top-0 right-0 -mr-12 -mt-12 opacity-10">
            <ActivityIcon size={240} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-red-600 mb-4 font-bold">
              <AlertTriangle size={20} />
              <span>Emergency Disclaimer</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              HealthAI is an informational assistant designed for educational guidance. It is NOT a substitute for professional medical advice, diagnosis, or treatment. 
              <strong> If you are experiencing a medical emergency, call your local emergency services immediately.</strong>
            </p>
          </div>
          <button 
             onClick={() => onAction('appointments')}
             className="border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            Find a Professional
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default Dashboard;
