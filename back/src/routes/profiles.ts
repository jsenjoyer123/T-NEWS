import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { Profile, CreateProfileRequest, UpdateProfileRequest, ProfileParams } from '../types'

// Временное хранилище профилей в памяти
let profiles: Profile[] = []
let nextProfileId = 1

// Helper for tests and resetting state
export function _resetProfiles() {
  profiles = []
  nextProfileId = 1
}

export function registerProfileRoutes(server: FastifyInstance) {
  // GET /profiles - получить все профили
  server.get('/profiles', async (_request: FastifyRequest, _reply: FastifyReply) => {
    return { profiles }
  })

  // GET /profiles/:id - получить профиль по ID
  server.get(
    '/profiles/:id',
    async (
      request: FastifyRequest<{ Params: ProfileParams }>,
      reply: FastifyReply
    ) => {
      const id = parseInt(request.params.id)
      const profile = profiles.find(p => p.id === id)

      if (!profile) {
        return reply.status(404).send({ message: 'Профиль не найден' })
      }

      return { profile }
    }
  )

  // POST /profiles - создать новый профиль
  server.post(
    '/profiles',
    async (
      request: FastifyRequest<{ Body: CreateProfileRequest }>,
      reply: FastifyReply
    ) => {
      const { user_id, username, description, photo } = request.body

      if (user_id === undefined || username === undefined) {
        return reply.status(400).send({ message: 'Поля user_id и username обязательны' })
      }

      // Проверяем уникальность username
      if (profiles.some(p => p.username === username)) {
        return reply.status(409).send({ message: 'Имя пользователя уже существует' })
      }

      const now = new Date().toISOString()
      const newProfile: Profile = {
        id: nextProfileId++,
        user_id,
        username,
        description: description ?? null,
        photo: photo ?? null,
        created_at: now,
        updated_at: now
      }

      profiles.push(newProfile)
      return reply.status(201).send({ profile: newProfile })
    }
  )

  // PUT /profiles/:id - обновить профиль
  server.put(
    '/profiles/:id',
    async (
      request: FastifyRequest<{
        Params: ProfileParams
        Body: UpdateProfileRequest
      }>,
      reply: FastifyReply
    ) => {
      const id = parseInt(request.params.id)
      const index = profiles.findIndex(p => p.id === id)

      if (index === -1) {
        return reply.status(404).send({ message: 'Профиль не найден' })
      }

      const existing = profiles[index]
      const { user_id, username, description, photo } = request.body

      if (username) {
        // Проверяем уникальность username только если он изменился
        if (username !== existing.username && profiles.some(p => p.username === username)) {
          return reply.status(409).send({ message: 'Имя пользователя уже существует' })
        }
      }

      // Обновляем только переданные поля
      if (user_id !== undefined) {
        existing.user_id = user_id
      }
      if (username !== undefined) {
        existing.username = username
      }
      if (description !== undefined) {
        existing.description = description
      }
      if (photo !== undefined) {
        existing.photo = photo
      }

      existing.updated_at = new Date().toISOString()
      return { profile: existing }
    }
  )

  // DELETE /profiles/:id - удалить профиль
  server.delete(
    '/profiles/:id',
    async (
      request: FastifyRequest<{ Params: ProfileParams }>,
      reply: FastifyReply
    ) => {
      const id = parseInt(request.params.id)
      const index = profiles.findIndex(p => p.id === id)

      if (index === -1) {
        return reply.status(404).send({ message: 'Профиль не найден' })
      }

      const deleted = profiles.splice(index, 1)[0]
      return { message: 'Профиль удалён', profile: deleted }
    }
  )
}
