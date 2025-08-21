import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { LoginRequest, RegisterRequest } from '../types'

// Временное хранилище пользователей в памяти
let users: { id: number; username: string; password: string; created_at: string }[] = []
let nextUserId = 1

// Helper for tests
export function _resetUsers() {
  users = []
  nextUserId = 1
}

// Инициализация тестового пользователя при старте сервера
// Можно переопределить через переменные окружения SEED_USER и SEED_PASS
const SEED_USER = process.env.SEED_USER || 'test'
const SEED_PASS = process.env.SEED_PASS || 'test'
if (!users.find(u => u.username === SEED_USER)) {
  users.push({
    id: nextUserId++,
    username: SEED_USER,
    password: SEED_PASS,
    created_at: new Date().toISOString()
  })
}

export function registerAuthRoutes(server: FastifyInstance) {
  // routes assume cookie plugin is registered globally

    // POST /register - регистрация нового пользователя
  server.post(
    '/register',
    async (
      request: FastifyRequest<{ Body: RegisterRequest }>,
      reply: FastifyReply
    ) => {
      const { username, password } = request.body

      if (!username || !password) {
        return reply.status(400).send({ message: 'Поля username и password обязательны' })
      }

      // Проверка на уникальность имени пользователя
      const exists = users.find(u => u.username === username)
      if (exists) {
        return reply.status(409).send({ message: 'Пользователь с таким username уже существует' })
      }

      const newUser = {
        id: nextUserId++,
        username,
        password, // В реальном приложении пароли нужно хешировать
        created_at: new Date().toISOString()
      }

      users.push(newUser)
      return reply.status(201).send({ message: 'Регистрация успешна!', user: { id: newUser.id, username: newUser.username } })
    }
  )

  // POST /login - аутентификация пользователя
  server.post(
    '/login',
    async (
      request: FastifyRequest<{ Body: LoginRequest }>,
      reply: FastifyReply
    ) => {
      const { username, password } = request.body

      const user = users.find(u => u.username === username && u.password === password)

      if (user) {
        reply.setCookie('user', username, { signed: true })
        return { message: 'Успешная аутентификация!' }
      } else {
        return reply.status(401).send({ message: 'Неверный логин или пароль' })
      }
    }
  )

  server.get('/hello', async (request: FastifyRequest, reply: FastifyReply) => {
    const userCookie = request.cookies.user
    if (!userCookie) {
      return reply.status(401).send({ message: 'Необходимо аутентифицироваться' })
    }

    const { valid, value } = request.unsignCookie(userCookie)
    if (!valid) {
      return reply.status(401).send({ message: 'Неверная подпись cookie' })
    }

    return { message: `Привет, ${value}!` }
  })
}