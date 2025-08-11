export interface Post {
  id: number
  author_name: string
  text: string
  created_at: string
  updated_at: string
}

export interface CreatePostRequest {
  author_name: string
  text: string
}

export interface UpdatePostRequest {
  author_name?: string
  text?: string
}

export interface PostParams {
  id: string
}
