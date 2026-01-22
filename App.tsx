
import React, { useState, useEffect, useCallback } from 'react';
// Fix missing icon imports for History, MessageSquare, and Activity
import { History, MessageSquare, Activity } from 'lucide-react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Appointment from './pages/Appointment';
import Admin from './pages/Admin';
import { User, ChatSession, Message, RiskLevel, UserRole } from './types';

const STORAGE_KEY_USER = 'healthai_user';
const STORAGE_KEY_SESSIONS = 'healthai_sessions';
const STORAGE_KEY_APPOINTMENTS = 'healthai_appointments';
const STORAGE_KEY_ALL_USERS = 'healthai_all_users';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [prefilledSymptoms, setPrefilledSymptoms] = useState('');

  // Initial Data Load
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
    const savedAppointments = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    const savedAllUsers = localStorage.getItem(STORAGE_KEY_ALL_USERS);

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
    
    if (savedAllUsers) {
      setAllUsers(JSON.parse(savedAllUsers));
    } else {
      // Mock some users if none exist for the admin panel
      const initialUsers = [
        { id: 'admin-1', fullName: 'System Admin', email: 'admin@healthai.com', phone: '000-0000', role: UserRole.ADMIN },
        { id: 'u-1', fullName: 'Sarah Parker', email: 'sarah@example.com', phone: '555-1234', role: UserRole.USER }
      ];
      setAllUsers(initialUsers);
      localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(initialUsers));
    }
  }, []);

  // Persistence
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY_USER);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  const handleLogin = (email: string, fullName: string) => {
    // Check if user exists in our mock database
    const existing = allUsers.find(u => u.email === email);
    if (existing) {
      setUser(existing);
    } else {
      const newUser: User = { 
        id: Date.now().toString(), 
        fullName, 
        email, 
        phone: '555-0100', 
        role: email.includes('admin') ? UserRole.ADMIN : UserRole.USER 
      };
      setAllUsers(prev => [...prev, newUser]);
      setUser(newUser);
    }
    setActiveTab('dashboard');
  };

  const handleRegister = (data: { email: string; fullName: string; phone: string }) => {
    const newUser: User = {
      id: Date.now().toString(),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.email.includes('admin') ? UserRole.ADMIN : UserRole.USER
    };
    setAllUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setIsRegistering(false);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentSessionId(null);
    setActiveTab('dashboard');
  };

  const startNewSession = useCallback(() => {
    if (!user) return;
    const newSession: ChatSession = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.fullName,
      title: `Consultation ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setActiveTab('chatbot');
  }, [user]);

  const updateSession = (updatedSession: ChatSession) => {
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const bookAppointment = (appointment: any) => {
    if (!user) return;
    setAppointments(prev => [{ ...appointment, userId: user.id }, ...prev]);
  };

  const handleBookFromChat = (symptoms: string) => {
    setPrefilledSymptoms(symptoms);
    setActiveTab('appointments');
  };

  if (!user) {
    return isRegistering 
      ? <Register onRegister={handleRegister} onNavigateToLogin={() => setIsRegistering(false)} />
      : <Login onLogin={handleLogin} onNavigateToRegister={() => setIsRegistering(true)} />;
  }

  // Filter sessions and appointments for the current user
  const userSessions = sessions.filter(s => s.userId === user.id);
  const userAppointments = appointments.filter(a => a.userId === user.id);

  const currentSession = sessions.find(s => s.id === currentSessionId) || {
    id: 'temp',
    userId: user.id,
    userName: user.fullName,
    title: 'New Chat',
    messages: [],
    createdAt: Date.now()
  };

  const lastRisk = userSessions.flatMap(s => s.messages)
    .filter(m => m.isEmergency)
    .length > 0 ? RiskLevel.HIGH : RiskLevel.LOW;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'chatbot' && !currentSessionId) startNewSession();
        }} 
        onLogout={handleLogout} 
      />

      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard 
            user={user} 
            stats={{
              totalChats: userSessions.length,
              appointments: userAppointments.length,
              lastRisk
            }} 
            onAction={(tab) => {
              setActiveTab(tab);
              if (tab === 'chatbot' && !currentSessionId) startNewSession();
            }}
          />
        )}

        {activeTab === 'chatbot' && (
          <div className="px-4 pb-8">
            <Chatbot 
              session={currentSession} 
              onUpdateSession={updateSession}
              onNewSession={startNewSession}
              onBookAppointment={handleBookFromChat}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Consultation History</h2>
              <button 
                onClick={startNewSession}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                Start New Consultation
              </button>
            </div>
            <div className="grid gap-4">
              {userSessions.length === 0 ? (
                <div className="bg-white p-16 rounded-2xl text-center border border-slate-200 shadow-sm">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    {/* Shadowed global History interface with imported Lucide icon component */}
                    <History size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No History Yet</h3>
                  <p className="text-slate-500 mt-2 max-w-xs mx-auto">Your medical consultations will appear here once you start a conversation with HealthBot.</p>
                </div>
              ) : (
                userSessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentSessionId(s.id);
                      setActiveTab('chatbot');
                    }}
                    className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                        {/* Use imported MessageSquare icon component */}
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{s.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(s.createdAt).toLocaleDateString()} at {new Date(s.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {s.messages.some(m => m.isEmergency) && (
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight">
                          Alert
                        </span>
                      )}
                      <div className="text-slate-400 font-semibold text-xs border border-slate-100 px-3 py-1 rounded-lg">
                        {s.messages.length} msgs
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <Appointment 
            initialSymptoms={prefilledSymptoms} 
            onBook={bookAppointment}
            existingAppointments={userAppointments}
          />
        )}

        {activeTab === 'admin' && user.role === UserRole.ADMIN && (
          <Admin users={allUsers} sessions={sessions} />
        )}
      </main>

      <footer className="py-8 bg-slate-100/50 border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-slate-500">
              {/* Use imported Activity icon component */}
              <Activity size={18} className="text-blue-600" />
              <span className="text-sm font-bold text-slate-900">HealthAI</span>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] uppercase tracking-widest font-medium">Medical Assistance Platform</span>
            </div>
            <p className="text-slate-400 text-[10px] text-center md:text-right max-w-md">
              Disclaimer: This AI chatbot provides educational medical guidance only. It is not a clinical diagnostic tool. 
              Developed as a college project simulation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
