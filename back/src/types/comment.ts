export interface Comment {
  id: number
  post_id: number
  author_name: string
  author_avatar?: string | null
  text: string
  likes: number
  created_at: string
  updated_at: string
}

export interface CreateCommentRequest {
  post_id: number
  author_name: string
  author_avatar?: string | null
  text: string
}

export interface UpdateCommentRequest {
  author_name?: string
  author_avatar?: string | null
  text?: string
  likes?: number
}

export interface CommentParams {
  id: string
}
