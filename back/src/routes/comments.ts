import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { Comment, CreateCommentRequest, UpdateCommentRequest, CommentParams } from '../types'

// Временное хранилище комментариев в памяти
let comments: Comment[] = []
let nextCommentId = 1

/**
 * Удаляет все комментарии, относящиеся к указанному postId (используется для каскадного удаления)
 */
export function deleteCommentsByPost(postId: number) {
  comments = comments.filter(c => c.post_id !== postId)
}

// Helper для тестов
export function _resetComments() {
  comments = []
  nextCommentId = 1
}

export function registerCommentRoutes(server: FastifyInstance) {
  // GET /comments - получить все комментарии
  server.get('/comments', async (_request: FastifyRequest, _reply: FastifyReply) => {
    return { comments }
  })

  // GET /comments/:id - получить комментарий по ID
  server.get(
    '/comments/:id',
    async (
      request: FastifyRequest<{ Params: CommentParams }>,
      reply: FastifyReply
    ) => {
      const id = parseInt(request.params.id)
      const comment = comments.find(c => c.id === id)
      if (!comment) {
        return reply.status(404).send({ message: 'Комментарий не найден' })
      }
      return { comment }
    }
  )

  // POST /comments - создать новый комментарий
  server.post(
    '/comments',
    async (
      request: FastifyRequest<{ Body: CreateCommentRequest }>,
      reply: FastifyReply
    ) => {
      const { post_id, author_name, author_avatar, text } = request.body

      if (!author_name || !text || post_id === undefined) {
        return reply.status(400).send({
          message: 'Поля post_id, author_name и text обязательны'
        })
      }

      const now = new Date().toISOString()
      const newComment: Comment = {
        id: nextCommentId++,
        post_id,
        author_name,
        author_avatar: author_avatar ?? null,
        text,
        likes: 0,
        created_at: now,
        updated_at: now
      }

      comments.push(newComment)
      return reply.status(201).send({ comment: newComment })
    }
  )

  // PUT /comments/:id - обновить комментарий
  server.put(
    '/comments/:id',
    async (
      request: FastifyRequest<{
        Params: CommentParams
        Body: UpdateCommentRequest
      }>,
      reply: FastifyReply
    ) => {
      const id = parseInt(request.params.id)
      const commentIndex = comments.findIndex(c => c.id === id)
      if (commentIndex === -1) {
        return reply.status(404).send({ message: 'Комментарий не найден' })
      }

      const { author_name, author_avatar, text, likes } = request.body
      const comment = comments[commentIndex]

      if (author_name !== undefined) comment.author_name = author_name
      if (author_avatar !== undefined) comment.author_avatar = author_avatar
      if (text !== undefined) comment.text = text
      if (likes !== undefined) comment.likes = likes

      comment.updated_at = new Date().toISOString()

      return { comment }
    }
  )

  // DELETE /comments/:id - удалить комментарий
  server.delete(
    '/comments/:id',
    async (
      request: FastifyRequest<{ Params: CommentParams }>,
      reply: FastifyReply
    ) => {
      const id = parseInt(request.params.id)
      const index = comments.findIndex(c => c.id === id)
      if (index === -1) {
        return reply.status(404).send({ message: 'Комментарий не найден' })
      }
      const deleted = comments.splice(index, 1)[0]
      return { message: 'Комментарий удалён', comment: deleted }
    }
  )
}
