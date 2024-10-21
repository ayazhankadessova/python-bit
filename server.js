import express from 'express'
import next from 'next'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { spawn } from 'child_process'
import { MongoClient, ObjectId } from 'mongodb'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const runningProcesses = new Map()

const uri = process.env.MONGODB_URI
// const mongoClient = new MongoClient(uri)

app.prepare().then(async () => {
  const server = express()
  const httpServer = createServer(server)
  const io = new SocketIOServer(httpServer)

  const classrooms = new Map()

  io.on('connection', (socket) => {
    console.log('Client connected')

    socket.on('join-room', (classroomId, username, isTeacher) => {
      console.log(`User ${username} joining room ${classroomId}`)
      socket.join(classroomId)

      if (!classrooms.has(classroomId)) {
        console.log(`Creating new classroom ${classroomId}`)
        classrooms.set(classroomId, {
          students: new Map(),
          teacher: null,
        })
      }

      const classroom = classrooms.get(classroomId)

      if (isTeacher) {
        classroom.teacher = username
        console.log(`Teacher ${username} joined classroom ${classroomId}`)
      } else {
        classroom.students.set(username, {
          username: username,
          code: '',
        })
        console.log(`Student ${username} joined classroom ${classroomId}`)
      }

      io.to(classroomId).emit('update-participants', {
        teacher: classroom.teacher,
        students: Array.from(classroom.students.values()),
      })
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
          student.code = code
          console.log(`Updated student data for ${username}:`, student)
          console.log(
            `Emitting student-code-updated event to room ${classroomId}`
          )
          io.to(classroomId).emit('student-code-updated', {
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
            `Emitting student-code-updated event for ${username} to room ${classroomId}`
          )
          io.to(classroomId).emit('student-code-updated', {
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
          console.log(`Sending code for student ${username}:`, student.code)
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
        io.to(classroomId).emit('session-ended')
        io.in(classroomId).disconnectSockets(true)
        classrooms.delete(classroomId)
      }
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
      classrooms.forEach((classroom, classroomId) => {
        handleLeaveRoom(socket, classroomId, socket.username)
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

  function executeCode(
    id,
    code,
    classroomId,
    username,
    socket,
    isSubmission = false,
    taskId = null
  ) {
    try {
      if (runningProcesses.has(username)) {
        runningProcesses.get(username).kill()
      }

      const python = spawn('python3', ['-c', code], {
        timeout: 10000,
        env: {
          ...process.env,
          PYTHONPATH: '/usr/local/lib/python3.9/site-packages',
        },
      })

      runningProcesses.set(username, python)

      let output = ''
      let error = ''

      python.stdout.on('data', (data) => {
        output += data.toString()
        if (output.length > 100000) {
          python.kill()
          return
        }
        console.log(`Output for ${username}:`, data.toString())
        io.to(classroomId).emit('execution-output', {
          id,
          output: data.toString(),
        })
      })

      python.stderr.on('data', (data) => {
        error += data.toString()
        console.error(`Error for ${username}:`, data.toString())
        io.to(classroomId).emit('execution-error', {
          id,
          error: data.toString(),
        })
      })

      python.on('close', (exitCode) => {
        runningProcesses.delete(username)
        console.log(`Execution complete for ${username}. Exit code:`, exitCode)
        console.log(`Final output for ${username}:`, output)

        io.to(classroomId).emit('execution-complete', {
          id,
          exitCode,
          output,
          error,
        })
      })

      python.on('error', (error) => {
        runningProcesses.delete(username)
        console.error(`Execution error for ${username}:`, error.message)
        io.to(classroomId).emit('execution-error', {
          id,
          error: error.message,
        })
      })
    } catch (error) {
      runningProcesses.delete(username)
      console.error(`Catch block error for ${username}:`, error.message)
      io.to(classroomId).emit('execution-error', {
        id,
        error: error.message,
      })
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
