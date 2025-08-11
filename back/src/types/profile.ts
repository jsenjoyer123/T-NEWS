export interface Profile {
  id: number
  user_id: number
  username: string
  description?: string | null
  photo?: string | null
  created_at: string
  updated_at: string
}

export interface CreateProfileRequest {
  user_id: number
  username: string
  description?: string | null
  photo?: string | null
}

export interface UpdateProfileRequest {
  user_id?: number
  username?: string
  description?: string | null
  photo?: string | null
}

export interface ProfileParams {
  id: string
}
