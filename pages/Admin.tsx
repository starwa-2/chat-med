
import React, { useState } from 'react';
import { Users, MessageSquare, ShieldAlert, BarChart3, Search, Eye } from 'lucide-react';
import { User, ChatSession, Message } from '../types';
import MessageBubble from '../components/Chat/MessageBubble';

interface AdminProps {
  users: User[];
  sessions: ChatSession[];
}

const Admin: React.FC<AdminProps> = ({ users, sessions }) => {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emergencyCount = sessions.reduce((acc, s) => 
    acc + s.messages.filter(m => m.isEmergency).length, 0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Control Center</h1>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none focus:ring-0 text-sm bg-transparent w-48 lg:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users className="text-blue-600" />} label="Total Users" value={users.length} />
        <StatCard icon={<MessageSquare className="text-purple-600" />} label="Total Chats" value={sessions.length} />
        <StatCard icon={<ShieldAlert className="text-red-600" />} label="Emergency Alerts" value={emergencyCount} />
        <StatCard icon={<BarChart3 className="text-green-600" />} label="Avg Messages" value={sessions.length ? (sessions.reduce((a, s) => a + s.messages.length, 0) / sessions.length).toFixed(1) : 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Registered Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {u.fullName.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {sessions.filter(s => s.userId === u.id).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Recent Logs</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
            {sessions.map(session => (
              <div key={session.id} className="p-4 hover:bg-slate-50 transition-colors group">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate w-40">{session.title}</h4>
                  <button 
                    onClick={() => setSelectedSession(session)}
                    className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>{session.userName}</span>
                  <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
                {session.messages.some(m => m.isEmergency) && (
                  <div className="mt-2 flex items-center text-[10px] text-red-600 font-bold uppercase">
                    <ShieldAlert size={10} className="mr-1" />
                    Emergency Triggered
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedSession.title}</h3>
                <p className="text-sm text-slate-500">History for {selectedSession.userName}</p>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {selectedSession.messages.map(m => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-slate-50">
      {icon}
    </div>
    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

export default Admin;
