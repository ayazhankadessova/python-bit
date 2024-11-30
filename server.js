// server.js
import express from 'express'
import next from 'next'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  const server = express()
  const httpServer = createServer(server)
  const io = new SocketIOServer(httpServer)

  const classrooms = new Map()
  const activeSessions = new Set()

  io.on('connection', (socket) => {
    console.log('[CONNECTION] Client connected with socket ID:', socket.id)

    socket.on('join-room', async (classroomId, username, isTeacher) => {
      console.log(
        `[JOIN] User ${username} (${
          socket.id
        }) joining room ${classroomId} as ${isTeacher ? 'teacher' : 'student'}`
      )

      try {
        // Check and emit session status
        const sessionActive = activeSessions.has(classroomId)
        socket.emit('session-status', {
          active: isTeacher || sessionActive,
          message: sessionActive
            ? 'Session is active'
            : 'No active session found',
        })

        // If student and no active session, return early
        if (!isTeacher && !sessionActive) {
          console.log(
            `[REJECTED] Student ${username} attempted to join inactive session ${classroomId}`
          )
          return
        }

        // Join the main classroom room
        socket.join(classroomId)
        socket.username = username

        // If teacher, also join a teacher-specific room
        if (isTeacher) {
          socket.join(`${classroomId}-teacher`)
        }

        // Initialize classroom if needed
        if (!classrooms.has(classroomId)) {
          console.log(`[NEW CLASSROOM] Creating classroom ${classroomId}`)
          classrooms.set(classroomId, {
            students: new Map(),
            teacher: null,
          })
        }

        const classroom = classrooms.get(classroomId)

        if (isTeacher) {
          console.log(
            `[TEACHER] ${username} registered as teacher for ${classroomId}`
          )
          classroom.teacher = username
          activeSessions.add(classroomId)
        } else {
          console.log(
            `[STUDENT] Adding ${username} to classroom ${classroomId}`
          )
          classroom.students.set(username, {
            username: username,
            code: '',
            socketId: socket.id,
          })
        }

        // Log current classroom state
        console.log(`[CLASSROOM STATE] ${classroomId}:`, {
          teacher: classroom.teacher,
          studentCount: classroom.students.size,
          students: Array.from(classroom.students.keys()),
        })

        // Send update only to teachers using the teacher-specific room
        io.to(`${classroomId}-teacher`).emit('update-participants', {
          teacher: classroom.teacher,
          students: Array.from(classroom.students.keys()),
        })
      } catch (error) {
        console.error('[ERROR] Error in join-room:', error)
        socket.emit('error', 'Failed to join classroom')
      }
    })

    socket.on('leave-room', (classroomId, username) => {
      console.log(`[LEAVE] User ${username} leaving room ${classroomId}`)
      handleLeaveRoom(socket, classroomId, username)
    })

    socket.on('code-update', (data) => {
      const { code, username, classroomId } = data
      console.log(
        `[CODE UPDATE] Student ${username} updating code in ${classroomId} : ${code}`
      )

      if (classrooms.has(classroomId)) {
        const classroom = classrooms.get(classroomId)
        if (classroom.students.has(username)) {
          classroom.students.get(username).code = code
          console.log(`[CODE UPDATE SUCCESS] Code updated for ${username}`)
        } else {
          console.log(`[ERROR] Student ${username} not found in classroom`)
        }
      } else {
        console.log(`[ERROR] Classroom ${classroomId} not found`)
      }
    })

    socket.on('send-code-to-student', (data) => {
      const { classroomId, studentUsername, code } = data
      console.log(
        `[SEND CODE] Request to send code to student ${studentUsername} in ${classroomId}`
      )

      if (!classrooms.has(classroomId)) {
        console.error(`[ERROR] Classroom ${classroomId} not found`)
        return
      }

      const classroom = classrooms.get(classroomId)
      if (classroom.students.has(studentUsername)) {
        classroom.students.get(studentUsername).code = code
        io.to(classroomId).emit('teacher-code', {
          studentUsername,
          code,
        })
        console.log(`[SEND SUCCESS] Code sent to ${studentUsername}`)
      } else {
        console.error(
          `[ERROR] Student ${studentUsername} not found in classroom`
        )
      }
    })

    socket.on('send-code-to-all', (data) => {
      const { classroomId, code } = data
      console.log(
        `[BROADCAST] Broadcasting code to all students in ${classroomId}`
      )

      if (!classrooms.has(classroomId)) {
        console.error(`[ERROR] Classroom ${classroomId} not found`)
        return
      }

      const classroom = classrooms.get(classroomId)
      classroom.students.forEach((student, username) => {
        student.code = code
        console.log(`[BROADCAST] Code set for student ${username}`)
      })

      io.to(classroomId).emit('teacher-code', { code })
      console.log(
        `[BROADCAST SUCCESS] Code sent to all students in ${classroomId}`
      )
    })

    socket.on('get-student-code', (classroomId, username) => {
      console.log(
        `[GET CODE] Retrieving code for student ${username} in ${classroomId}`
      )

      if (classrooms.has(classroomId)) {
        const classroom = classrooms.get(classroomId)
        const student = classroom.students.get(username)
        if (student) {
          socket.emit('student-code', {
            username,
            code: student.code,
          })
          console.log(
            `[GET CODE SUCCESS] Code retrieved for ${username}: ${student.code}`
          )
        } else {
          console.error(`[ERROR] Student ${username} not found`)
        }
      } else {
        console.error(`[ERROR] Classroom ${classroomId} not found`)
      }
    })

    // Also update the 'end-session' handler to be more consistent
    socket.on('end-session', (classroomId) => {
      console.log(`[END SESSION] Ending session for classroom ${classroomId}`)
      if (classrooms.has(classroomId)) {
        // Clear the session
        activeSessions.delete(classroomId)

        // Notify all clients that the session has ended
        io.to(classroomId).emit('session-ended', {
          message: 'Teacher ended the session',
        })

        // Disconnect all sockets in the room
        io.in(classroomId).disconnectSockets(true)

        // Clean up the classroom
        classrooms.delete(classroomId)

        console.log(`[END SESSION SUCCESS] Session ended for ${classroomId}`)
      }
    })

    socket.on('disconnect', () => {
      console.log(
        `[DISCONNECT] Client ${socket.id} (${
          socket.username || 'unknown'
        }) disconnected`
      )
      classrooms.forEach((classroom, classroomId) => {
        handleLeaveRoom(socket, classroomId, socket.username)
      })
    })
  })

  function handleLeaveRoom(socket, classroomId, username) {
    console.log(
      `[LEAVE ROOM] Handling leave room for ${username} in ${classroomId}`
    )
    socket.leave(classroomId)

    if (classrooms.has(classroomId)) {
      const classroom = classrooms.get(classroomId)
      if (classroom.teacher === username) {
        console.log(`[LEAVE ROOM] Teacher ${username} left ${classroomId}`)
        classroom.teacher = null
        // Deactivate session when teacher leaves
        activeSessions.delete(classroomId)

        // Notify all clients in the room that the session is no longer active
        io.to(classroomId).emit('session-ended', {
          message: 'Teacher disconnected, session ended',
        })

        console.log(
          `[SESSION ENDED] Session deactivated for ${classroomId} due to teacher disconnect`
        )
      } else {
        console.log(`[LEAVE ROOM] Student ${username} left ${classroomId}`)
        classroom.students.delete(username)
      }

      if (classroom.students.size === 0 && !classroom.teacher) {
        console.log(`[CLEANUP] Removing empty classroom ${classroomId}`)
        classrooms.delete(classroomId)
      } else {
        io.to(`${classroomId}-teacher`).emit('update-participants', {
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
    console.log(`[SERVER] Running on http://localhost:${PORT}`)
  })
})
