
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Info, RefreshCw, Image as ImageIcon, X, Camera } from 'lucide-react';
import { Sender, Message, ChatSession, RiskLevel } from '../types';
import { medicalService } from '../services/geminiService';
import MessageBubble from '../components/Chat/MessageBubble';

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
    // Reset input value so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedImage) || loading) return;

    const userText = input || (selectedImage ? "Please analyze this image for potential symptoms." : "");
    const imageToUpload = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    
    // 1. Add User Message
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
      // 2. Risk Detection (Local Logic)
      const risk = medicalService.analyzeRisk(userText);
      
      // 3. Get AI Response
      const historyForAI = updatedMessages.map(m => {
        const parts: any[] = [{ text: m.text }];
        if (m.imageData) {
          parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: m.imageData.split('base64,')[1]
            }
          });
        }
        return {
          role: m.sender === Sender.USER ? 'user' : 'model',
          parts: parts
        };
      });

      const aiResponseText = await medicalService.generateMedicalGuidance(userText, historyForAI, imageToUpload || undefined);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText || "I'm sorry, I couldn't process that. Please try rephrasing your symptoms.",
        sender: Sender.BOT,
        timestamp: Date.now(),
        isEmergency: risk.level === RiskLevel.HIGH
      };

      onUpdateSession({ ...session, messages: [...updatedMessages, botMessage] });
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "System Error: Unable to connect to the medical knowledge base. Please check your internet connection.",
        sender: Sender.BOT,
        timestamp: Date.now()
      };
      onUpdateSession({ ...session, messages: [...updatedMessages, errorMessage] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mt-4">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">HealthBot Assistant</h3>
            <div className="flex items-center text-[10px] text-green-500 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              Ready to Help
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

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
        {session.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <ImageIcon size={32} className="text-blue-500" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Symptom Analysis</h4>
            <p className="text-slate-500 max-w-sm">
              Describe your symptoms or <b>upload a clear photo</b> of a visible condition (like a rash or swelling) for an AI-powered analysis.
              <br/><br/>
              <span className="italic text-xs font-medium">Example: "I have this red rash on my arm, what could it be?"</span>
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
              <span className="text-sm text-slate-500 italic">Bot is analyzing symptoms...</span>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Area */}
      {selectedImage && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center space-x-4 animate-in slide-in-from-bottom-2">
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
            <p className="text-xs font-bold text-slate-700">Image selected</p>
            <p className="text-[10px] text-slate-500">Add context in the message below</p>
          </div>
        </div>
      )}

      {/* Input */}
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
            title="Upload symptom photo"
          >
            <Camera size={20} />
          </button>
          
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedImage ? "Describe this symptom..." : "Type your symptoms here..."}
              className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || loading}
              className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center"><Info size={10} className="mr-1"/> Multimodal Analysis Enabled</span>
          <button 
            onClick={() => onBookAppointment(input || "Consultation with symptom photo")} 
            className="text-blue-500 hover:underline font-medium"
          >
            Need a doctor? Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
