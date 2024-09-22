import express from 'express'
import next from 'next'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  const server = express()
  const httpServer = http.createServer(server)
  const io = new SocketIOServer(httpServer)

  // Store classroom data
  const classrooms = new Map()

  io.on('connection', (socket) => {
    console.log('Client connected')

    socket.on('join-room', (classroomId, userId, isTeacher) => {
      socket.join(classroomId)

      if (!classrooms.has(classroomId)) {
        classrooms.set(classroomId, {
          students: new Map(),
          teacher: null,
          starterCode: '',
        })
      }

      const classroom = classrooms.get(classroomId)

      if (isTeacher) {
        classroom.teacher = userId
        socket.to(classroomId).emit('teacher-joined', userId)
      } else {
        classroom.students.set(userId, {
          id: userId,
          code: classroom.starterCode,
        })
      }

      io.to(classroomId).emit('update-participants', {
        teacher: classroom.teacher,
        students: Array.from(classroom.students.values()),
      })

      socket.emit('session-data', {
        starterCode: classroom.starterCode,
        students: Array.from(classroom.students.values()),
      })
    })

    socket.on('leave-room', (classroomId, userId) => {
      handleLeaveRoom(socket, classroomId, userId)
    })

    socket.on('end-session', (classroomId) => {
      if (classrooms.has(classroomId)) {
        const classroom = classrooms.get(classroomId)
        io.to(classroomId).emit('session-ended')

        // Disconnect all clients from the room
        io.in(classroomId).disconnectSockets(true)

        // Remove the classroom data
        classrooms.delete(classroomId)
      }
    })

    socket.on('update-starter-code', (classroomId, code) => {
      if (classrooms.has(classroomId)) {
        const classroom = classrooms.get(classroomId)
        classroom.starterCode = code
        classroom.students.forEach((student) => {
          student.code = code
        })

        io.to(classroomId).emit('starter-code-updated', {
          starterCode: code,
          students: Array.from(classroom.students.values()),
        })
      }
    })

    socket.on('submit-code', (classroomId, userId, code) => {
      if (classrooms.has(classroomId)) {
        const classroom = classrooms.get(classroomId)
        const student = classroom.students.get(userId)
        if (student) {
          student.code = code
          io.to(classroomId).emit('student-code-updated', {
            studentId: userId,
            code: code,
          })
        }
      }
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
      classrooms.forEach((classroom, classroomId) => {
        handleLeaveRoom(socket, classroomId, socket.id)
      })
    })
  })

  function handleLeaveRoom(socket, classroomId, userId) {
    socket.leave(classroomId)
    if (classrooms.has(classroomId)) {
      const classroom = classrooms.get(classroomId)
      if (classroom.teacher === userId) {
        classroom.teacher = null
      } else {
        classroom.students.delete(userId)
      }

      if (classroom.students.size === 0 && !classroom.teacher) {
        classrooms.delete(classroomId)
      } else {
        io.to(classroomId).emit('participant-left', userId)
        io.to(classroomId).emit('update-participants', {
          teacher: classroom.teacher,
          students: Array.from(classroom.students.values()),
        })
      }
    }
  }

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  const PORT = process.env.PORT || 3000
  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
})
