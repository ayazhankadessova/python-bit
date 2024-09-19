const express = require('express')
const next = require('next')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const http = require('http')
const socketIO = require('socket.io')

app.prepare().then(async () => {
  const server = express()
  const httpServer = http.createServer(server)
  const io = socketIO(httpServer)

  const classrooms = new Map()

  io.on('connection', (socket) => {
    console.log('Client connected')

    socket.on('join-room', (classroomId, userId, isTeacher) => {
      socket.join(classroomId)
      if (!classrooms.has(classroomId)) {
        classrooms.set(classroomId, new Set())
      }
      classrooms.get(classroomId).add(userId)

      if (isTeacher) {
        socket.to(classroomId).emit('teacher-joined', userId)
      } else {
        socket.to(classroomId).emit('student-joined', userId)
      }

      io.to(classroomId).emit(
        'update-participants',
        Array.from(classrooms.get(classroomId))
      )
    })

    socket.on('leave-room', (classroomId, userId) => {
      socket.leave(classroomId)
      if (classrooms.has(classroomId)) {
        classrooms.get(classroomId).delete(userId)
        if (classrooms.get(classroomId).size === 0) {
          classrooms.delete(classroomId)
        }
      }
      io.to(classroomId).emit('participant-left', userId)
      io.to(classroomId).emit(
        'update-participants',
        Array.from(classrooms.get(classroomId) || [])
      )
    })

    socket.on('send-message', (classroomId, message) => {
      io.to(classroomId).emit('new-message', message)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
      // Handle disconnection and remove user from all classrooms they were in
      classrooms.forEach((participants, classroomId) => {
        participants.forEach((userId) => {
          if (socket.id === userId) {
            participants.delete(userId)
            io.to(classroomId).emit('participant-left', userId)
            io.to(classroomId).emit(
              'update-participants',
              Array.from(participants)
            )
          }
        })
        if (participants.size === 0) {
          classrooms.delete(classroomId)
        }
      })
    })
  })

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  const PORT = process.env.PORT || 3000
  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
})
