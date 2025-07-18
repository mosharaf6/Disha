export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'mentor' | 'learner';
          avatar_url: string | null;
          university: string | null;
          country: string | null;
          subject: string | null;
          bio: string | null;
          languages: string[];
          experience: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: 'mentor' | 'learner';
          avatar_url?: string | null;
          university?: string | null;
          country?: string | null;
          subject?: string | null;
          bio?: string | null;
          languages?: string[];
          experience?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'mentor' | 'learner';
          avatar_url?: string | null;
          university?: string | null;
          country?: string | null;
          subject?: string | null;
          bio?: string | null;
          languages?: string[];
          experience?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mentor_availability: {
        Row: {
          id: string;
          mentor_id: string;
          start_time: string;
          end_time: string;
          duration: number;
          is_booked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          start_time: string;
          end_time: string;
          duration?: number;
          is_booked?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          mentor_id?: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          is_booked?: boolean;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          learner_id: string;
          mentor_id: string;
          availability_slot_id: string;
          start_time: string;
          end_time: string;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          video_call_link: string | null;
          topic: string | null;
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          learner_id: string;
          mentor_id: string;
          availability_slot_id: string;
          start_time: string;
          end_time: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          video_call_link?: string | null;
          topic?: string | null;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          learner_id?: string;
          mentor_id?: string;
          availability_slot_id?: string;
          start_time?: string;
          end_time?: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          video_call_link?: string | null;
          topic?: string | null;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}