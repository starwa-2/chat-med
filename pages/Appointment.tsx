
import React, { useState } from 'react';
import { MOCK_DOCTORS } from '../constants';
import { Calendar, Clock, MapPin, User, CheckCircle2 } from 'lucide-react';

interface AppointmentProps {
  initialSymptoms?: string;
  onBook: (appointment: any) => void;
  existingAppointments: any[];
}

const Appointment: React.FC<AppointmentProps> = ({ initialSymptoms = '', onBook, existingAppointments }) => {
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    symptoms: initialSymptoms
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.doctorId && formData.date && formData.time) {
      const doctor = MOCK_DOCTORS.find(d => d.id === formData.doctorId);
      onBook({
        id: Date.now().toString(),
        doctorName: doctor?.name,
        specialization: doctor?.specialization,
        date: formData.date,
        time: formData.time,
        status: 'Confirmed'
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({ doctorId: '', date: '', time: '', symptoms: '' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Calendar className="mr-2 text-blue-600" size={24} />
              Book New Appointment
            </h2>

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center">
                <CheckCircle2 size={20} className="mr-3" />
                Appointment booked successfully! We've sent details to your phone.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Specialist</label>
                  <select
                    required
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">Choose a doctor</option>
                    {MOCK_DOCTORS.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Symptoms Overview</label>
                <textarea
                  required
                  rows={4}
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="Tell the doctor briefly what you are feeling..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>

        {/* My Appointments */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <Clock className="mr-2 text-slate-400" size={20} />
              My Appointments
            </h2>

            <div className="space-y-4">
              {existingAppointments.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No upcoming appointments.</p>
                </div>
              ) : (
                existingAppointments.map(app => (
                  <div key={app.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-100 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 text-sm">{app.doctorName}</h4>
                      <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{app.specialization}</p>
                    <div className="flex items-center text-[10px] text-slate-400 space-x-3">
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {app.date}
                      </div>
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {app.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
