
import React, { useState } from 'react';
import { MOCK_DOCTORS } from '../constants.ts';
import { Calendar, Clock, MapPin, User, CheckCircle2, ChevronLeft, ArrowRight, Star, Award, Shield } from 'lucide-react';

interface AppointmentProps {
  initialSymptoms?: string;
  onBook: (appointment: any) => void;
  existingAppointments: any[];
}

const Appointment: React.FC<AppointmentProps> = ({ initialSymptoms = '', onBook, existingAppointments }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    symptoms: initialSymptoms
  });
  const [success, setSuccess] = useState(false);

  const selectedDoctor = MOCK_DOCTORS.find(d => d.id === selectedDoctorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoctor && formData.date && formData.time) {
      onBook({
        id: Date.now().toString(),
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        date: formData.date,
        time: formData.time,
        status: 'Confirmed'
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedDoctorId(null);
      }, 2500);
      setFormData({ date: '', time: '', symptoms: '' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {!selectedDoctorId ? (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Find a Specialist</h1>
            <p className="text-slate-500 mt-2">Select a qualified healthcare professional to book a detailed consultation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {MOCK_DOCTORS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id)}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 p-6 text-left hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <User size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-1 text-orange-400 mb-1">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{doc.name}</h3>
                  <p className="text-blue-600 text-sm font-semibold mt-1">{doc.specialization}</p>
                  <div className="flex items-center text-slate-400 text-xs mt-3">
                    <MapPin size={12} className="mr-1" />
                    {doc.branch}
                  </div>
                </div>
                <div className="mt-6 flex items-center text-blue-600 font-bold text-sm">
                  Book Now <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Back Button and Info */}
          <div className="lg:col-span-12">
            <button 
              onClick={() => setSelectedDoctorId(null)}
              className="flex items-center text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4"
            >
              <ChevronLeft size={20} className="mr-1" />
              Back to Doctor List
            </button>
          </div>

          {/* Doctor Details Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-blue-600 h-32 relative">
              <div className="absolute -bottom-10 left-8">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <User size={48} />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 pt-14 pb-8">
              <h2 className="text-2xl font-bold text-slate-900">{selectedDoctor?.name}</h2>
              <p className="text-blue-600 font-bold mb-6">{selectedDoctor?.specialization}</p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Location</p>
                    <p className="text-sm text-slate-700 font-medium">{selectedDoctor?.branch}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                    <Award size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Experience</p>
                    <p className="text-sm text-slate-700 font-medium">10+ Years Professional Experience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verified</p>
                    <p className="text-sm text-slate-700 font-medium">Board Certified Specialist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Form */}
          <div className="lg:col-span-8">
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
              {success && (
                <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h3>
                  <p className="text-slate-500 mt-2 max-w-xs">Your appointment with {selectedDoctor?.name} has been successfully scheduled.</p>
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900 mb-8">Schedule Your Consultation</h3>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Consultation Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Preferred Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Reason for Visit / Symptoms</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    placeholder="Briefly describe what you've been experiencing..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 flex items-center justify-center"
                  >
                    Confirm Appointment <ArrowRight size={20} className="ml-2" />
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-4">
                    By confirming, you agree to our terms of clinical consultation and privacy policy.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Existing Appointments Section */}
      <div className="mt-20 border-t border-slate-200 pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Scheduled Visits</h2>
            <p className="text-slate-500 text-sm">Manage your upcoming and past medical appointments.</p>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-full text-slate-600 text-xs font-bold">
            {existingAppointments.length} Active
          </div>
        </div>

        {existingAppointments.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Calendar size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Appointments Yet</h3>
            <p className="text-slate-400 text-sm mt-1">Book a consultation with one of our specialists to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {existingAppointments.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-none">{app.doctorName}</h4>
                      <p className="text-xs text-blue-600 font-medium mt-1">{app.specialization}</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                    {app.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-4">
                  <div className="flex items-center text-slate-600 text-xs">
                    <Calendar size={14} className="mr-2 text-slate-400" />
                    {new Date(app.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-slate-600 text-xs">
                    <Clock size={14} className="mr-2 text-slate-400" />
                    {app.time}
                  </div>
                </div>
                <button className="w-full py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                  Cancel Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;
