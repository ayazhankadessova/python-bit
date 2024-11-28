// server.js

import express from 'express'
import next from 'next'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const runningProcesses = new Map()

app.prepare().then(async () => {
  const server = express()
  const httpServer = createServer(server)
  const io = new SocketIOServer(httpServer)

  const classrooms = new Map()
  const activeSessions = new Set()

  io.on('connection', (socket) => {
    console.log('Client connected')

    // server.js - modify the join-room handler
    socket.on('join-room', async (classroomId, username, isTeacher) => {
      console.log(`User ${username} attempting to join room ${classroomId}`)

      try {
        // Immediately check and emit session status
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
            `Student ${username} attempted to join inactive session ${classroomId}`
          )
          return
        }

        // Continue with room joining logic
        socket.join(classroomId)

        if (!classrooms.has(classroomId)) {
          classrooms.set(classroomId, {
            students: new Map(),
            teacher: null,
          })
        }

        const classroom = classrooms.get(classroomId)

        if (isTeacher) {
          classroom.teacher = username
          activeSessions.add(classroomId)
          console.log(
            `Teacher ${username} created/joined session for ${classroomId}`
          )
        } else {
          classroom.students.set(username, {
            username: username,
            code: '',
          })
          console.log(
            `Student ${username} joined active session ${classroomId}`
          )
        }

        // Emit updated participants
        io.to(classroomId).emit('update-participants', {
          teacher: classroom.teacher,
          students: Array.from(classroom.students.values()),
        })
      } catch (error) {
        console.error('Error in join-room:', error)
        socket.emit('error', 'Failed to join classroom')
      }
    })

    socket.on('leave-room', (classroomId, username) => {
      handleLeaveRoom(socket, classroomId, username)
    })

    socket.on('execute-code', async ({ id, code, classroomId, username }) => {
      console.log(
        `Executing code for ${username} in classroom ${classroomId}:`,
        code
      )
      executeCode(id, code, classroomId, username, socket, false)
    })

    socket.on('update-code', (classroomId, username, code) => {
      console.log(`Updating code for ${username} in classroom ${classroomId}`)
      if (classrooms.has(classroomId)) {
        const classroom = classrooms.get(classroomId)
        const student = classroom.students.get(username)
        if (student) {
          // Update the stored code
          student.code = code

          // Log the update for debugging
          console.log(`Updated student data for ${username}:`, student)
          console.log(`Current code for ${username}:`, student.code)

          io.to(classroomId).emit('student-code', {
            username: username,
            code: code,
          })
        } else {
          console.log(
            `Student ${username} not found in classroom ${classroomId}`
          )
        }
      } else {
        console.log(`Classroom ${classroomId} not found`)
      }
    })

    // New event for sending code to all students
    socket.on('send-code-to-all', (classroomId, code) => {
      console.log(`Sending code to all students in classroom ${classroomId}`)
      if (classrooms.has(classroomId)) {
        const classroom = classrooms.get(classroomId)
        classroom.students.forEach((student, username) => {
          student.code = code
          console.log(
            `Emitting student-code event for ${username} to room ${classroomId}`
          )
          io.to(classroomId).emit('student-code', {
            username: username,
            code: code,
          })
        })
        console.log(`Code sent to all students in classroom ${classroomId}`)
      } else {
        console.log(`Classroom ${classroomId} not found`)
      }
    })

    // New event for getting a specific student's code
    socket.on('get-student-code', (classroomId, username) => {
      console.log(
        `Getting code for student ${username} in classroom ${classroomId}`
      )
      if (classrooms.has(classroomId)) {
        const classroom = classrooms.get(classroomId)
        const student = classroom.students.get(username)
        if (student) {
          // Log the current state for debugging
          console.log(
            `Current stored code for student ${username}:`,
            student.code
          )

          // Emit the current code back to the requester
          socket.emit('student-code', {
            username: username,
            code: student.code,
          })
        } else {
          console.log(
            `Student ${username} not found in classroom ${classroomId}`
          )
        }
      } else {
        console.log(`Classroom ${classroomId} not found`)
      }
    })

    socket.on('stop-execution', ({ id, classroomId, username }) => {
      const process = runningProcesses.get(username)
      if (process) {
        process.kill()
        runningProcesses.delete(username)
        io.to(classroomId).emit('execution-complete', { id })
      }
    })

    socket.on('end-session', (classroomId) => {
      if (classrooms.has(classroomId)) {
        console.log(`Ending session for classroom ${classroomId}`)

        // Remove from active sessions
        activeSessions.delete(classroomId)

        // Notify all clients
        io.to(classroomId).emit('session-ended')

        // Disconnect all sockets in the room
        io.in(classroomId).disconnectSockets(true)

        // Clean up classroom data
        classrooms.delete(classroomId)
      }
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
      // Clear any stored state for this socket
      socket.rooms.forEach((room) => {
        handleLeaveRoom(socket, room, socket.username)
      })
    })
  })

  function handleLeaveRoom(socket, classroomId, username) {
    socket.leave(classroomId)
    if (classrooms.has(classroomId)) {
      const classroom = classrooms.get(classroomId)
      if (classroom.teacher === username) {
        classroom.teacher = null
      } else {
        classroom.students.delete(username)
      }
      if (classroom.students.size === 0 && !classroom.teacher) {
        classrooms.delete(classroomId)
      } else {
        io.to(classroomId).emit('participant-left', username)
        io.to(classroomId).emit('update-participants', {
          teacher: classroom.teacher,
          students: Array.from(classroom.students.values()),
        })
      }
    }
  }

  global.updateStudentProgress = (classroomId, username, taskId) => {
    io.to(classroomId).emit('student-progress-updated', { username, taskId })
  }

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  const PORT = process.env.PORT || 3000
  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
})
