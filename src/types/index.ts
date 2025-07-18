export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'mentor' | 'learner';
  avatar_url?: string;
  university?: string;
  country?: string;
  subject?: string;
  bio?: string;
  languages: string[];
  experience?: string;
  created_at: string;
  updated_at: string;
}

export interface MentorAvailability {
  id: string;
  mentor_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  is_booked: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  learner_id: string;
  mentor_id: string;
  availability_slot_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  video_call_link?: string;
  topic?: string;
  message?: string;
  created_at: string;
  updated_at: string;
  learner?: Profile;
  mentor?: Profile;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photo: string;
  role: 'student' | 'mentor';
}

export interface BookingRequest {
  mentorId: string;
  studentName: string;
  studentEmail: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  topic: string;
}

// Legacy types for backward compatibility
export interface Mentor {
  id: string;
  name: string;
  photo: string;
  university: string;
  country: string;
  location: string;
  subject: string;
  bio: string;
  experience: string;
  rating: number;
  totalSessions: number;
  languages: string[];
  availability: 'Available' | 'Busy' | 'Offline';
}