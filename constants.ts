
export const SYSTEM_PROMPT = `
You are an Intelligent Healthcare Chatbot designed for a college project.
Your job is to provide instant medical guidance based on user symptoms using AI and NLP.

Rules:
1) You are NOT a doctor and you must always include a disclaimer.
2) Do NOT provide final diagnosis.
3) Provide safe and practical suggestions only.
4) If symptoms indicate emergency (chest pain, breathing difficulty, severe bleeding, fainting, stroke signs), 
   immediately advise emergency medical help and show an urgent warning.
5) Ask 2-4 follow-up questions if required (age, duration, severity, existing conditions).
6) Give response in simple English.
7) Provide output in structured format:

Format:
- Possible causes (2-4 bullet points)
- Immediate precautions / home care (3-6 bullet points)
- When to consult a doctor (clear conditions)
- Emergency warning (only if needed)
- Disclaimer
`;

export const EMERGENCY_KEYWORDS = [
  'chest pain', 'breathing difficulty', 'difficulty breathing', 'severe bleeding', 
  'fainting', 'stroke', 'heart attack', 'poisoning', 'suicide', 'unconscious', 
  'seizure', 'heavy bleeding', 'broken bone', 'paralysis'
];

export const MOCK_DOCTORS = [
  { id: '1', name: 'Dr. Sarah Johnson', specialization: 'General Physician', branch: 'Main Clinic' },
  { id: '2', name: 'Dr. Michael Chen', specialization: 'Cardiologist', branch: 'Heart Center' },
  { id: '3', name: 'Dr. Emily Brown', specialization: 'Pediatrician', branch: 'Children\'s Wing' },
  { id: '4', name: 'Dr. Robert Wilson', specialization: 'Dermatologist', branch: 'Skin Care Unit' }
];
