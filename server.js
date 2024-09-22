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
// import express from 'express'
// import next from 'next'
// import http from 'http'
// import { Server as SocketIOServer } from 'socket.io'
// import mongoose from 'mongoose'
// import session from 'express-session'
// import MongoStore from 'connect-mongo'

// const dev = process.env.NODE_ENV !== 'production'
// const app = next({ dev })
// const handle = app.getRequestHandler()

// // MongoDB connection
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })

// // User model
// const UserSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   password: String,
//   role: String,
//   createdAt: Date,
//   updatedAt: Date,
//   code: String,
// })

// const User = mongoose.model('User', UserSchema)

// app.prepare().then(async () => {
//   const server = express()
//   const httpServer = http.createServer(server)
//   const io = new SocketIOServer(httpServer)

//   // Session middleware
//   const sessionMiddleware = session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
//   })

//   server.use(sessionMiddleware)

//   // Store classroom data
//   const classrooms = new Map()

//   io.use((socket, next) => {
//     sessionMiddleware(socket.request, {}, next)
//   })

//   io.on('connection', (socket) => {
//     console.log('Client connected')

//     socket.on('join-room', async (classroomId, userId, isTeacher) => {
//       socket.join(classroomId)

//       if (!classrooms.has(classroomId)) {
//         classrooms.set(classroomId, {
//           students: new Map(),
//           teacher: null,
//           starterCode: '',
//         })
//       }

//       const classroom = classrooms.get(classroomId)

//       const user = await User.findById(userId)
//       if (!user) {
//         socket.emit('error', 'User not found')
//         return
//       }

//       if (isTeacher) {
//         classroom.teacher = user
//         socket.to(classroomId).emit('teacher-joined', user.username)
//       } else {
//         classroom.students.set(userId, {
//           id: userId,
//           username: user.username,
//           code: classroom.starterCode,
//         })
//       }

//       io.to(classroomId).emit('update-participants', {
//         teacher: classroom.teacher ? classroom.teacher.username : null,
//         students: Array.from(classroom.students.values()),
//       })

//       socket.emit('session-data', {
//         starterCode: classroom.starterCode,
//         students: Array.from(classroom.students.values()),
//       })
//     })

//     socket.on('leave-room', (classroomId, userId) => {
//       handleLeaveRoom(socket, classroomId, userId)
//     })

//     socket.on('end-session', (classroomId) => {
//       if (classrooms.has(classroomId)) {
//         const classroom = classrooms.get(classroomId)
//         io.to(classroomId).emit('session-ended')

//         // Disconnect all clients from the room
//         io.in(classroomId).disconnectSockets(true)

//         // Remove the classroom data
//         classrooms.delete(classroomId)
//       }
//     })

//     socket.on('update-starter-code', (classroomId, code) => {
//       if (classrooms.has(classroomId)) {
//         const classroom = classrooms.get(classroomId)
//         classroom.starterCode = code
//         classroom.students.forEach((student) => {
//           student.code = code
//         })

//         io.to(classroomId).emit('starter-code-updated', {
//           starterCode: code,
//           students: Array.from(classroom.students.values()),
//         })
//       }
//     })

//     socket.on('submit-code', (classroomId, userId, code) => {
//       if (classrooms.has(classroomId)) {
//         const classroom = classrooms.get(classroomId)
//         const student = classroom.students.get(userId)
//         if (student) {
//           student.code = code
//           io.to(classroomId).emit('student-code-updated', {
//             studentId: userId,
//             code: code,
//           })
//         }
//       }
//     })

//     socket.on('disconnect', () => {
//       console.log('Client disconnected')
//       classrooms.forEach((classroom, classroomId) => {
//         handleLeaveRoom(socket, classroomId, socket.request.session.userId)
//       })
//     })
//   })

//   function handleLeaveRoom(socket, classroomId, userId) {
//     socket.leave(classroomId)
//     if (classrooms.has(classroomId)) {
//       const classroom = classrooms.get(classroomId)
//       if (classroom.teacher && classroom.teacher.id === userId) {
//         classroom.teacher = null
//       } else {
//         classroom.students.delete(userId)
//       }

//       if (classroom.students.size === 0 && !classroom.teacher) {
//         classrooms.delete(classroomId)
//       } else {
//         io.to(classroomId).emit('participant-left', userId)
//         io.to(classroomId).emit('update-participants', {
//           teacher: classroom.teacher ? classroom.teacher.username : null,
//           students: Array.from(classroom.students.values()),
//         })
//       }
//     }
//   }

//   // API routes
//   server.post('/api/auth/login', async (req, res) => {
//     const { username, password } = req.body
//     const user = await User.findOne({ username, password })
//     if (user) {
//       req.session.userId = user._id
//       res.json({
//         success: true,
//         user: { id: user._id, username: user.username, role: user.role },
//       })
//     } else {
//       res.status(401).json({ success: false, message: 'Invalid credentials' })
//     }
//   })

//   server.post('/api/auth/logout', (req, res) => {
//     req.session.destroy((err) => {
//       if (err) {
//         res.status(500).json({ success: false, message: 'Failed to logout' })
//       } else {
//         res.json({ success: true })
//       }
//     })
//   })

//   server.put('/api/classroom/:id/invite', async (req, res) => {
//     const { id } = req.params
//     const { userId } = req.body

//     try {
//       const user = await User.findById(userId)
//       if (!user) {
//         return res
//           .status(404)
//           .json({ success: false, message: 'User not found' })
//       }

//       // Here you would typically check if the user is allowed to join the classroom
//       // For simplicity, we're just returning success
//       res.json({ success: true, message: 'Joined classroom successfully' })
//     } catch (error) {
//       res
//         .status(500)
//         .json({ success: false, message: 'Failed to join classroom' })
//     }
//   })

//   server.all('*', (req, res) => {
//     return handle(req, res)
//   })

//   const PORT = process.env.PORT || 3000
//   httpServer.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`)
//   })
// })
