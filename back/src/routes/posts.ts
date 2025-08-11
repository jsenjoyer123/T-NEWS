import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { Post, CreatePostRequest, UpdatePostRequest, PostParams } from '../types'
import { deleteCommentsByPost } from './comments'

// Временное хранилище постов в памяти
let posts: Post[] = []
let nextId = 1

// Helper for tests
export function _resetPosts() {
  posts = []
  nextId = 1
}

export function registerPostRoutes(server: FastifyInstance) {
  // GET /posts - получить все посты
  server.get('/posts', async (request: FastifyRequest, reply: FastifyReply) => {
    return { posts }
  })

  // GET /posts/:id - получить пост по ID
  server.get(
    '/posts/:id',
    async (
      request: FastifyRequest<{ Params: PostParams }>,
      reply: FastifyReply
    ) => {
      const id = parseInt(request.params.id)
      const post = posts.find(p => p.id === id)
      
      if (!post) {
        return reply.status(404).send({ message: 'Пост не найден' })
      }
      
      return { post }
    }
  )

  // POST /posts - создать новый пост
  server.post(
    '/posts',
    async (
      request: FastifyRequest<{ Body: CreatePostRequest }>,
      reply: FastifyReply
    ) => {
      const { author_name, text } = request.body

      if (!author_name || !text) {
        return reply.status(400).send({ 
          message: 'Поля author_name и text обязательны' 
        })
      }

      const now = new Date().toISOString()
      const newPost: Post = {
        id: nextId++,
        author_name,
        text,
        created_at: now,
        updated_at: now
      }

      posts.push(newPost)
      return reply.status(201).send({ post: newPost })
    }
  )

  // PUT /posts/:id - обновить пост
  server.put(
    '/posts/:id',
    async (
      request: FastifyRequest<{ 
        Params: PostParams
        Body: UpdatePostRequest 
      }>,
      reply: FastifyReply
    ) => {
      const id = parseInt(request.params.id)
      const postIndex = posts.findIndex(p => p.id === id)
      
      if (postIndex === -1) {
        return reply.status(404).send({ message: 'Пост не найден' })
      }

      const { author_name, text } = request.body
      const post = posts[postIndex]

      // Обновляем только переданные поля
      if (author_name !== undefined) {
        post.author_name = author_name
      }
      if (text !== undefined) {
        post.text = text
      }
      
      post.updated_at = new Date().toISOString()
      
      return { post }
    }
  )

  // DELETE /posts/:id - удалить пост
  server.delete(
    '/posts/:id',
    async (
      request: FastifyRequest<{ Params: PostParams }>,
      reply: FastifyReply
    ) => {
      const id = parseInt(request.params.id)
      const postIndex = posts.findIndex(p => p.id === id)
      
      if (postIndex === -1) {
        return reply.status(404).send({ message: 'Пост не найден' })
      }

      const deletedPost = posts.splice(postIndex, 1)[0]
      // Каскадное удаление комментариев
      deleteCommentsByPost(deletedPost.id)
      return { message: 'Пост удален', post: deletedPost }
    }
  )
}