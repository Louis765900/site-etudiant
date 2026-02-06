// Types for the database
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          birth_date: string | null
          filiere: string | null
          parent_email: string | null
          parental_consent_validated: boolean
          learning_style: string | null
          preferences: {
            completed_test?: boolean
            test_date?: string
          } | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          deadline: string
          priority: 'low' | 'medium' | 'high'
          completed: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          message: string
          response: string
          model_used: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      stage_activities: {
        Row: {
          id: string
          user_id: string
          hours_worked: number
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['stage_activities']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['stage_activities']['Insert']>
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type StageActivity = Database['public']['Tables']['stage_activities']['Row']
