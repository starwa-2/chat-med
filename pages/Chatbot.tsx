
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Info, RefreshCw, Image as ImageIcon, X, Camera, AlertCircle } from 'lucide-react';
import { Sender, Message, ChatSession, RiskLevel } from '../types.ts';
import { medicalService } from '../services/geminiService.ts';
import MessageBubble from '../components/Chat/MessageBubble.tsx';

interface ChatbotProps {
  session: ChatSession;
  onUpdateSession: (session: ChatSession) => void;
  onNewSession: () => void;
  onBookAppointment: (symptoms: string) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ session, onUpdateSession, onNewSession, onBookAppointment }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedImage) || loading) return;

    const userText = input || (selectedImage ? "Please analyze this image for potential symptoms." : "");
    const imageToUpload = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: Sender.USER,
      timestamp: Date.now(),
      imageData: imageToUpload || undefined
    };
    
    const updatedMessages = [...session.messages, userMessage];
    onUpdateSession({ ...session, messages: updatedMessages });

    setLoading(true);

    try {
      const risk = medicalService.analyzeRisk(userText);
      
      const historyForAI = updatedMessages.map(m => {
        const parts: any[] = [{ text: m.text }];
        if (m.imageData) {
          const base64Data = m.imageData.includes('base64,') 
            ? m.imageData.split('base64,')[1] 
            : m.imageData;
          parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          });
        }
        return {
          role: m.sender === Sender.USER ? 'user' : 'model',
          parts: parts
        };
      });

      const aiResponseText = await medicalService.generateMedicalGuidance(historyForAI);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: Sender.BOT,
        timestamp: Date.now(),
        isEmergency: risk.level === RiskLevel.HIGH
      };

      onUpdateSession({ ...session, messages: [...updatedMessages, botMessage] });
    } catch (error: any) {
      const botErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error.message || "Failed to connect to HealthAI. Please check your configuration."}`,
        sender: Sender.BOT,
        timestamp: Date.now(),
        isEmergency: true
      };
      onUpdateSession({ ...session, messages: [...updatedMessages, botErrorMessage] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mt-4">
      <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">HealthBot Assistant</h3>
            <div className="flex items-center text-[10px] text-green-500 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              Live Connection
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onNewSession}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50"
          >
            New Session
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
        {session.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <ActivityIcon size={32} className="text-blue-500" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">How are you feeling today?</h4>
            <p className="text-slate-500 max-w-sm">
              Describe your symptoms or upload a photo of a visible condition for immediate AI-powered guidance.
            </p>
          </div>
        ) : (
          session.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm flex items-center space-x-2">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span className="text-sm text-slate-500 italic">Consulting medical database...</span>
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-500 shadow-sm">
            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-700">Image attached</p>
            <p className="text-[10px] text-slate-500">The AI will analyze this photo for visible symptoms.</p>
          </div>
        </div>
      )}

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all ${selectedImage ? 'text-blue-600 bg-blue-50 border-blue-200' : ''}`}
          >
            <Camera size={20} />
          </button>
          
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms..."
              className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || loading}
              className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center"><Info size={10} className="mr-1"/> AI analysis in progress</span>
          <button 
            onClick={() => onBookAppointment(input || "Consultation request")} 
            className="text-blue-500 hover:underline font-medium"
          >
            Find a doctor
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default Chatbot;
