import express from 'express'
import next from 'next'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { spawn } from 'node:child_process'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const runningProcesses = new Map()

app.prepare().then(async () => {
  const server = express()
  const httpServer = http.createServer(server)
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
          completedTasks: [],
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

    socket.on('update-code', (classroomId, username, code, completedTasks) => {
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
          io.to(classroomId).emit('student-code-updated', {
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
    })

    socket.on('run-code', async ({ id, code, classroomId, username }) => {
      console.log(
        `Running code for ${username} in classroom ${classroomId}:`,
        code
      )
      executeCode(id, code, classroomId, username, socket, false)
    })

    socket.on(
      'submit-code',
      async ({ id, code, classroomId, username, taskId }) => {
        console.log(
          `Submitting code for ${username} in classroom ${classroomId}:`,
          code
        )
        executeCode(id, code, classroomId, username, socket, true, taskId)
      }
    )

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
// import { spawn } from 'node:child_process'

// const dev = process.env.NODE_ENV !== 'production'
// const app = next({ dev })
// const handle = app.getRequestHandler()
// // Keep track of running processes
// const runningProcesses = new Map()

// app.prepare().then(async () => {
//   const server = express()
//   const httpServer = http.createServer(server)
//   const io = new SocketIOServer(httpServer)

//   // Store classroom data
//   const classrooms = new Map()

//   io.on('connection', (socket) => {
//     console.log('Client connected')

//     socket.on('join-room', (classroomId, username, isTeacher) => {
//       console.log(`User ${username} joining room ${classroomId}`)
//       socket.join(classroomId)

//       if (!classrooms.has(classroomId)) {
//         console.log(`Creating new classroom ${classroomId}`)
//         classrooms.set(classroomId, {
//           students: new Map(),
//           teacher: null,
//           starterCode: '',
//           tasks: [
//             {
//               id: 1,
//               title: 'Draw a Square',
//               description:
//                 "Write a program using loops to draw a 5x5 square using '*' characters.",
//               testCases: [
//                 {
//                   input: '',
//                   expectedOutput: '*****\n*****\n*****\n*****\n*****',
//                 },
//               ],
//             },
//             {
//               id: 2,
//               title: 'Print Number Pyramid',
//               description:
//                 'Write a program that uses nested loops to print a number pyramid. The pyramid should have 5 rows, and each row should contain numbers from 1 up to the row number.',
//               testCases: [
//                 {
//                   input: '',
//                   expectedOutput: '1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5',
//                 },
//               ],
//             },
//             {
//               id: 3,
//               title: 'Fibonacci Sequence',
//               description:
//                 'Write a program that uses a loop to generate the first 10 numbers of the Fibonacci sequence. The sequence starts with 0 and 1, and each subsequent number is the sum of the two preceding ones.',
//               testCases: [
//                 {
//                   input: '',
//                   expectedOutput: '0 1 1 2 3 5 8 13 21 34',
//                 },
//               ],
//             },
//             {
//               id: 4,
//               title: 'Multiplication Table',
//               description:
//                 'Create a program that uses nested loops to print a multiplication table for numbers 1 through 5. Each number should be padded with spaces to ensure alignment.',
//               testCases: [
//                 {
//                   input: '',
//                   expectedOutput:
//                     '  1  2  3  4  5\n  2  4  6  8 10\n  3  6  9 12 15\n  4  8 12 16 20\n  5 10 15 20 25',
//                 },
//               ],
//             },
//           ],
//         })
//       }

//       const classroom = classrooms.get(classroomId)

//       if (isTeacher) {
//         classroom.teacher = username
//         console.log(`Teacher ${username} joined classroom ${classroomId}`)
//         // socket.to(classroomId).emit('teacher-joined', username)
//       } else {
//         classroom.students.set(username, {
//           username: username,
//           code: classroom.starterCode,
//           completedTasks: [],
//         })
//         console.log(`Student ${username} joined classroom ${classroomId}`)
//       }

//       io.to(classroomId).emit('update-participants', {
//         teacher: classroom.teacher,
//         students: Array.from(classroom.students.values()),
//       })

//       const sessionData = {
//         starterCode: classroom.starterCode,
//         students: Array.from(classroom.students.values()),
//         tasks: classroom.tasks,
//       }
//       console.log(
//         `Sending session data for classroom ${classroomId}:`,
//         JSON.stringify(sessionData, null, 2)
//       )

//       socket.emit('session-data', sessionData)
//       console.log(
//         `Session data sent to ${username} in classroom ${classroomId}`
//       )
//     })

//     socket.on('leave-room', (classroomId, username) => {
//       handleLeaveRoom(socket, classroomId, username)
//     })

//     socket.on('execute-code', async ({ id, code, classroomId, username }) => {
//       console.log(
//         `Executing code for ${username} in classroom ${classroomId}:`,
//         code
//       )
//       try {
//         // Kill any existing process for this user
//         if (runningProcesses.has(username)) {
//           runningProcesses.get(username).kill()
//         }

//         const python = spawn('python3', ['-c', code], {
//           timeout: 10000, // 10 second timeout
//           env: {
//             ...process.env,
//             PYTHONPATH: '/usr/local/lib/python3.9/site-packages', // Adjust path as needed
//           },
//         })

//         // Store the process
//         runningProcesses.set(username, python)

//         let output = ''
//         let error = ''

//         python.stdout.on('data', (data) => {
//           output += data.toString()
//           if (output.length > 100000) {
//             // Limit output size
//             python.kill()
//             return
//           }
//           console.log(`Output for ${username}:`, data.toString())
//           io.to(classroomId).emit('execution-output', {
//             id,
//             output: data.toString(),
//           })
//         })

//         python.stderr.on('data', (data) => {
//           error += data.toString()
//           console.error(`Error for ${username}:`, data.toString())
//           io.to(classroomId).emit('execution-error', {
//             id,
//             error: data.toString(),
//           })
//         })

//         python.on('close', (code) => {
//           runningProcesses.delete(username)
//           console.log(`Execution complete for ${username}. Exit code:`, code)
//           console.log(`Final output for ${username}:`, output)
//           io.to(classroomId).emit('execution-complete', {
//             id,
//             exitCode: code,
//             output,
//             error,
//           })
//         })

//         // Handle timeout
//         python.on('error', (error) => {
//           runningProcesses.delete(username)
//           console.error(`Execution error for ${username}:`, error.message)
//           io.to(classroomId).emit('execution-error', {
//             id,
//             error: error.message,
//           })
//         })
//       } catch (error) {
//         runningProcesses.delete(username)
//         console.error(`Catch block error for ${username}:`, error.message)
//         io.to(classroomId).emit('execution-error', {
//           id,
//           error: error.message,
//         })
//       }
//     })
//     socket.on('update-code', (classroomId, username, code, completedTasks) => {
//       console.log(
//         `Updating code for ${username} in classroom ${classroomId}. Completed tasks:`,
//         completedTasks
//       )
//       if (classrooms.has(classroomId)) {
//         const classroom = classrooms.get(classroomId)
//         const student = classroom.students.get(username)
//         if (student) {
//           student.code = code
//           student.completedTasks = completedTasks
//           console.log(`Updated student data for ${username}:`, student)
//           io.to(classroomId).emit('student-code-updated', {
//             username: username,
//             code: code,
//             completedTasks: completedTasks,
//           })
//         } else {
//           console.log(
//             `Student ${username} not found in classroom ${classroomId}`
//           )
//         }
//       } else {
//         console.log(`Classroom ${classroomId} not found`)
//       }
//     })

//     socket.on('run-code', async ({ id, code, classroomId, username }) => {
//       console.log(
//         `Running code for ${username} in classroom ${classroomId}:`,
//         code
//       )
//       executeCode(id, code, classroomId, username, socket, false)
//     })

//     socket.on(
//       'submit-code',
//       async ({ id, code, classroomId, username, taskId }) => {
//         console.log(
//           `Submitting code for ${username} in classroom ${classroomId}:`,
//           code
//         )
//         executeCode(id, code, classroomId, username, socket, true, taskId)
//       }
//     )

//     socket.on('stop-execution', ({ id, classroomId, username }) => {
//       const process = runningProcesses.get(username)
//       if (process) {
//         process.kill()
//         runningProcesses.delete(username)
//         io.to(classroomId).emit('execution-complete', { id })
//       }
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

//     socket.on('disconnect', () => {
//       console.log('Client disconnected')
//       classrooms.forEach((classroom, classroomId) => {
//         handleLeaveRoom(socket, classroomId, socket.username)
//       })
//     })
//   })

//   function handleLeaveRoom(socket, classroomId, username) {
//     socket.leave(classroomId)
//     if (classrooms.has(classroomId)) {
//       const classroom = classrooms.get(classroomId)
//       if (classroom.teacher === username) {
//         classroom.teacher = null
//       } else {
//         classroom.students.delete(username)
//       }
//       if (classroom.students.size === 0 && !classroom.teacher) {
//         classrooms.delete(classroomId)
//       } else {
//         io.to(classroomId).emit('participant-left', username)
//         io.to(classroomId).emit('update-participants', {
//           teacher: classroom.teacher,
//           students: Array.from(classroom.students.values()),
//         })
//       }
//     }
//   }

//   function executeCode(
//     id,
//     code,
//     classroomId,
//     username,
//     socket,
//     isSubmission = false,
//     taskId = null
//   ) {
//     try {
//       // Kill any existing process for this user
//       if (runningProcesses.has(username)) {
//         runningProcesses.get(username).kill()
//       }

//       const python = spawn('python3', ['-c', code], {
//         timeout: 10000, // 10 second timeout
//         env: {
//           ...process.env,
//           PYTHONPATH: '/usr/local/lib/python3.9/site-packages', // Adjust path as needed
//         },
//       })

//       // Store the process
//       runningProcesses.set(username, python)

//       let output = ''
//       let error = ''

//       python.stdout.on('data', (data) => {
//         output += data.toString()
//         if (output.length > 100000) {
//           // Limit output size
//           python.kill()
//           return
//         }
//         console.log(`Output for ${username}:`, data.toString())
//         io.to(classroomId).emit('execution-output', {
//           id,
//           output: data.toString(),
//         })
//       })

//       python.stderr.on('data', (data) => {
//         error += data.toString()
//         console.error(`Error for ${username}:`, data.toString())
//         io.to(classroomId).emit('execution-error', {
//           id,
//           error: data.toString(),
//         })
//       })

//       python.on('close', (exitCode) => {
//         runningProcesses.delete(username)
//         console.log(`Execution complete for ${username}. Exit code:`, exitCode)
//         console.log(`Final output for ${username}:`, output)

//         if (isSubmission) {
//           const classroom = classrooms.get(classroomId)
//           const task = classroom.tasks.find((t) => t.id === taskId)
//           if (task) {
//             const passed = task.testCases.every(
//               (testCase) => output.trim() === testCase.expectedOutput.trim()
//             )

//             io.to(classroomId).emit('submission-result', {
//               id,
//               username,
//               taskId,
//               passed,
//               output,
//               error,
//             })

//             if (passed) {
//               const student = classroom.students.get(username)
//               if (student) {
//                 student.completedTasks = [
//                   ...new Set([...student.completedTasks, taskId]),
//                 ]
//               }
//             }
//           } else {
//             console.error(
//               `Task with id ${taskId} not found for classroom ${classroomId}`
//             )
//             io.to(classroomId).emit('submission-result', {
//               id,
//               username,
//               taskId,
//               passed: false,
//               output,
//               error: 'Task not found',
//             })
//           }
//         } else {
//           io.to(classroomId).emit('execution-complete', {
//             id,
//             exitCode,
//             output,
//             error,
//           })
//         }
//       })

//       // Handle timeout
//       python.on('error', (error) => {
//         runningProcesses.delete(username)
//         console.error(`Execution error for ${username}:`, error.message)
//         io.to(classroomId).emit('execution-error', {
//           id,
//           error: error.message,
//         })
//       })
//     } catch (error) {
//       runningProcesses.delete(username)
//       console.error(`Catch block error for ${username}:`, error.message)
//       io.to(classroomId).emit('execution-error', {
//         id,
//         error: error.message,
//       })
//     }
//   }

//   server.all('*', (req, res) => {
//     return handle(req, res)
//   })

//   const PORT = process.env.PORT || 3000
//   httpServer.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`)
//   })
// })
