
import React from 'react';
import { Sender, Message } from '../../types';
import { AlertCircle, User as UserIcon, Bot, Eye } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
          isUser ? 'ml-2 bg-blue-600 text-white' : 'mr-2 bg-slate-200 text-slate-600'
        }`}>
          {isUser ? <UserIcon size={16} /> : <Bot size={16} />}
        </div>
        
        <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-blue-600 text-white rounded-tr-none' 
            : message.isEmergency 
              ? 'bg-red-50 border border-red-200 text-slate-900 rounded-tl-none'
              : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
        }`}>
          {message.isEmergency && (
            <div className="flex items-center text-red-600 font-bold mb-2 text-sm uppercase tracking-wider">
              <AlertCircle size={16} className="mr-2" />
              Urgent Medical Alert
            </div>
          )}

          {message.imageData && (
            <div className="mb-3 rounded-xl overflow-hidden border border-slate-200/50 shadow-sm bg-black/5">
              <img 
                src={message.imageData} 
                alt="Symptom photo" 
                className="max-w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(message.imageData, '_blank')}
              />
              <div className="p-2 flex items-center space-x-2 text-[10px] text-slate-500 font-medium">
                <Eye size={12} />
                <span>Uploaded Symptom Analysis</span>
              </div>
            </div>
          )}
          
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.text}
          </div>
          
          <div className={`text-[10px] mt-2 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
