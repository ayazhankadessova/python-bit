import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { spawn } from 'child_process'

let io: SocketIOServer | null = null
export const classrooms = new Map()
export const runningProcesses = new Map()

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  if (!io) {
    io = new SocketIOServer(httpServer)
  }
  return io
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error(
      'Socket.io has not been initialized. Please call initializeSocket first.'
    )
  }
  return io
}

export function handleSocketEvents(socket: Socket): void {
  console.log('Client connected')

  socket.on(
    'join-room',
    (classroomId: string, username: string, isTeacher: boolean) => {
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
          completedTasks: [],
        })
        console.log(`Student ${username} joined classroom ${classroomId}`)
      }

      getIO()
        .to(classroomId)
        .emit('update-participants', {
          teacher: classroom.teacher,
          students: Array.from(classroom.students.values()),
        })
    }
  )

  socket.on('leave-room', (classroomId: string, username: string) => {
    handleLeaveRoom(socket, classroomId, username)
  })

  socket.on('execute-code', async ({ id, code, classroomId, username }) => {
    console.log(
      `Executing code for ${username} in classroom ${classroomId}:`,
      code
    )
    executeCode(id, code, classroomId, username, false)
  })

  socket.on(
    'update-code',
    (
      classroomId: string,
      username: string,
      code: string,
      completedTasks: number[]
    ) => {
      console.log(
        `Updating code for ${username} in classroom ${classroomId}. Completed tasks:`,
        completedTasks
      )
      if (classrooms.has(classroomId)) {
        const classroom = classrooms.get(classroomId)
        const student = classroom.students.get(username)
        if (student) {
          student.code = code
          student.completedTasks = completedTasks
          console.log(`Updated student data for ${username}:`, student)
          getIO().to(classroomId).emit('student-code-updated', {
            username: username,
            code: code,
            completedTasks: completedTasks,
          })
        } else {
          console.log(
            `Student ${username} not found in classroom ${classroomId}`
          )
        }
      } else {
        console.log(`Classroom ${classroomId} not found`)
      }
    }
  )

  socket.on('run-code', async ({ id, code, classroomId, username }) => {
    console.log(
      `Running code for ${username} in classroom ${classroomId}:`,
      code
    )
    executeCode(id, code, classroomId, username, false)
  })

  socket.on(
    'submit-code',
    async ({ id, code, classroomId, username, taskId }) => {
      console.log(
        `Submitting code for ${username} in classroom ${classroomId}:`,
        code
      )
      executeCode(id, code, classroomId, username, true, taskId)
    }
  )

  socket.on('stop-execution', ({ id, classroomId, username }) => {
    const process = runningProcesses.get(username)
    if (process) {
      process.kill()
      runningProcesses.delete(username)
      getIO().to(classroomId).emit('execution-complete', { id })
    }
  })

  socket.on('end-session', (classroomId: string) => {
    if (classrooms.has(classroomId)) {
      getIO().to(classroomId).emit('session-ended')
      getIO().in(classroomId).disconnectSockets(true)
      classrooms.delete(classroomId)
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected')
    classrooms.forEach((classroom, classroomId) => {
      handleLeaveRoom(socket, classroomId, socket.data.username)
    })
  })
}

function handleLeaveRoom(
  socket: Socket,
  classroomId: string,
  username: string
): void {
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
      getIO().to(classroomId).emit('participant-left', username)
      getIO()
        .to(classroomId)
        .emit('update-participants', {
          teacher: classroom.teacher,
          students: Array.from(classroom.students.values()),
        })
    }
  }
}

function executeCode(
  id: string,
  code: string,
  classroomId: string,
  username: string,
  isSubmission: boolean = false,
  taskId: string | null = null
): void {
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
      getIO().to(classroomId).emit('execution-output', {
        id,
        output: data.toString(),
      })
    })

    python.stderr.on('data', (data) => {
      error += data.toString()
      console.error(`Error for ${username}:`, data.toString())
      getIO().to(classroomId).emit('execution-error', {
        id,
        error: data.toString(),
      })
    })

    python.on('close', (exitCode) => {
      runningProcesses.delete(username)
      console.log(`Execution complete for ${username}. Exit code:`, exitCode)
      console.log(`Final output for ${username}:`, output)

      getIO().to(classroomId).emit('execution-complete', {
        id,
        exitCode,
        output,
        error,
      })
    })

    python.on('error', (error) => {
      runningProcesses.delete(username)
      console.error(`Execution error for ${username}:`, error.message)
      getIO().to(classroomId).emit('execution-error', {
        id,
        error: error.message,
      })
    })
  } catch (error) {
    runningProcesses.delete(username)
    console.error(`Catch block error for ${username}:`, error.message)
    getIO().to(classroomId).emit('execution-error', {
      id,
      error: error.message,
    })
  }
}

// export { initializeSocket, handleSocketEvents }
