
export enum Sender {
  USER = 'user',
  BOT = 'bot'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface GroundingChunk {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  isEmergency?: boolean;
  imageData?: string; // Base64 encoded image data
  groundingUrls?: GroundingChunk[];
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface Appointment {
  id: string;
  userId: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed';
}
