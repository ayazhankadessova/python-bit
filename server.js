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

  // Store classroom data with more details
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
        console.log('teacher joined room ', classroomId)
      } else {
        classroom.students.set(userId, {
          id: userId,
          code: classroom.starterCode,
        })
        socket.to(classroomId).emit('student-joined', userId)
        console.log('student joined room ', classroomId)
      }

      // Send updated participant list to all clients in the room
      io.to(classroomId).emit('update-participants', {
        teacher: classroom.teacher,
        students: Array.from(classroom.students.values()),
      })

      // Send initial data to the newly joined user
      socket.emit('session-data', {
        starterCode: classroom.starterCode,
        students: Array.from(classroom.students.values()),
      })
    })

    socket.on('leave-room', (classroomId, userId) => {
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
    })

    // New event for ending the session
    socket.on('end-session', (classroomId) => {
      if (classrooms.has(classroomId)) {
        // Remove all information for the session
        classrooms.delete(classroomId)

        // Notify all clients in the room that the session has ended
        io.to(classroomId).emit('session-ended')

        // Disconnect all clients from the room
        const sockets = io.sockets.adapter.rooms.get(classroomId)
        if (sockets) {
          for (const socketId of sockets) {
            io.sockets.sockets.get(socketId).leave(classroomId)
          }
        }

        console.log(`Session ended for classroom ${classroomId}`)
      }
    })

    // New event listener for get-session-data
    // Updated get-session-data event listener
    socket.on('get-session-data', (classroomId) => {
      if (classrooms.has(classroomId)) {
        const classroom = classrooms.get(classroomId)
        socket.emit('session-data', {
          starterCode: classroom.starterCode,
          students: Array.from(classroom.students.values()),
        })
      } else {
        socket.emit('session-data', {
          starterCode: '',
          students: [],
        })
      }
    })

    socket.on('update-starter-code', (classroomId, code) => {
      if (classrooms.has(classroomId)) {
        console.log('Starter code updated')
        const classroom = classrooms.get(classroomId)
        classroom.starterCode = code

        // Update starter code for all students
        classroom.students.forEach((student) => {
          student.code = code
        })

        // Broadcast the updated starter code to all clients in the room
        io.to(classroomId).emit('starter-code-updated', {
          starterCode: code,
          students: Array.from(classroom.students.values()),
        })
      }
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
      // Handle disconnection and remove user from all classrooms they were in
      classrooms.forEach((classroom, classroomId) => {
        if (classroom.teacher === socket.id) {
          classroom.teacher = null
          io.to(classroomId).emit('teacher-left')
        } else if (classroom.students.has(socket.id)) {
          classroom.students.delete(socket.id)
          io.to(classroomId).emit('participant-left', socket.id)
        }

        if (classroom.students.size === 0 && !classroom.teacher) {
          classrooms.delete(classroomId)
        } else {
          io.to(classroomId).emit('update-participants', {
            teacher: classroom.teacher,
            students: Array.from(classroom.students.values()),
          })
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
