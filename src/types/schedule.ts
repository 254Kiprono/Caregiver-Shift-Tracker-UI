
export interface Schedule {
  id: string;
  user_id: string;
  client_name: string;
  location: string;
  shift_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed';
  start_time?: string;
  end_time?: string;
  start_lat?: number;
  start_lon?: number;
  end_lat?: number;
  end_lon?: number;
  tasks: Task[];
  created_at: string;
  updated_at: string;
  
  // Computed fields for display compatibility
  caregiverName: string;
  caregiverId: string;
  serviceName: string;
  date: string;
  time: string;
  clientContact: {
    email: string;
    phone: string;
  };
  address: string;
  serviceNotes: string;
  clockInTime?: string;
  clockOutTime?: string;
  duration?: string;
}

export interface Task {
  id: string;
  schedule_id: string;
  description: string;
  status: 'completed' | 'not_completed';
  reason?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields for display compatibility
  name: string;
  completed: boolean;
}

export interface DashboardStats {
  missedScheduled: number;
  upcomingToday: number;
  completedToday: number;
}
