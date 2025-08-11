import fastify from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import fastifyCookie from '@fastify/cookie'
import fastifyStatic from '@fastify/static'          // NEW
import cors from '@fastify/cors'                     // NEW
import path from 'node:path'                         // NEW
import { FastifyInstance } from 'fastify'

import { registerAuthRoutes } from './routes/auth'
import { registerPostRoutes } from './routes/posts'
import { registerCommentRoutes } from './routes/comments'
import { registerProfileRoutes } from './routes/profiles'

const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000
const FRONT_ROOT = path.join(__dirname, '../tinc_final_front')     // NEW

export function buildServer(): FastifyInstance {
  const server = fastify().withTypeProvider<TypeBoxTypeProvider>()

  // cookies
  server.register(fastifyCookie, { secret: process.env.COOKIE_SECRET || 'your-secret-key' })

  // CORS — включайте только если фронтенд не на том же origin
server.register(cors, {
  origin: ['http://127.0.0.1:33143', 'http://localhost:8080'], // или true для всех
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
});

  // раздаём статические файлы (HTML/CSS/JS/шрифты …)
  server.register(fastifyStatic, {
    root: FRONT_ROOT,
    prefix: '/',        // URL /signin.html, /scripts/auth.js, /style/…
    index: ['signin.html']
  })

  // маршруты API
  registerAuthRoutes(server)
  registerPostRoutes(server)
  registerCommentRoutes(server)
  registerProfileRoutes(server)

  return server
}

if (require.main === module) {
  const server = buildServer()
  server.listen({ port }, (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Сервер запущен на http://localhost:${port}`)
  })
}

export default buildServer