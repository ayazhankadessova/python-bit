import { useEffect, useRef, useState } from 'react'

// Base interfaces for different message data types
export interface ParticipantsData {
  teacher: string | null
  students: string[]
}

export interface StudentCodeData {
  username: string
  code: string
}

export interface TeacherCodeData {
  code: string
}

export interface CodeUpdateData {
  code: string
  username?: string
}

export interface SendCodeToStudentData {
  studentUsername: string
  code: string
}

export interface GetStudentCodeData {
  username: string
}

// Map of all possible message types to their corresponding data types
export type WebSocketMessageData = {
  'update-participants': ParticipantsData
  'student-code': StudentCodeData
  'teacher-code': TeacherCodeData
  'code-update': CodeUpdateData
  'student-code-updated': StudentCodeData
  'send-code-to-student': SendCodeToStudentData
  'send-code-to-all': TeacherCodeData
  'get-student-code': GetStudentCodeData
  'request-code': undefined
}

export type WebSocketMessageType = keyof WebSocketMessageData

// Message handler type that infers the correct data type based on the message type
export type MessageHandler<T extends WebSocketMessageType> = (
  data: WebSocketMessageData[T]
) => void

// Type for the actual WebSocket message
export type WebSocketMessage<
  T extends WebSocketMessageType = WebSocketMessageType
> = {
  type: T
  data: WebSocketMessageData[T]
}

export interface UseWebSocketReturn {
  isConnected: boolean
  sendMessage: <T extends WebSocketMessageType>(
    type: T,
    data: WebSocketMessageData[T]
  ) => void
  on: <T extends WebSocketMessageType>(
    type: T,
    handler: MessageHandler<T>
  ) => () => void
}

export function useWebSocket(
  classroomId: string,
  username: string | undefined,
  isTeacher: boolean
): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const messageHandlers = useRef<
    Map<WebSocketMessageType, MessageHandler<WebSocketMessageType>[]>
  >(new Map())

  const connect = () => {
    if (!username) return

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/${classroomId}/${username}/${isTeacher}`
    console.log('Connecting to WebSocket:', wsUrl)
    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage
        console.log('Received WebSocket message:', message)

        const handlers = messageHandlers.current.get(message.type)
        if (handlers) {
          console.log(
            `Found ${handlers.length} handlers for message type:`,
            message.type
          )
          handlers.forEach((handler) => {
            try {
              // Type assertion here is safe because of our WebSocketMessage type
              handler(message.data as never)
            } catch (error) {
              if (error instanceof Error) {
                console.error('Error in message handler:', error.message)
              }
            }
          })
        } else {
          console.log('No handlers found for message type:', message.type)
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error processing WebSocket message:', error.message)
        }
      }
    }

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
      if (event.code === 4000) {
        alert(event.reason || 'Cannot join - no teacher present')
      }
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }

  useEffect(() => {
    const cleanup = connect()
    return () => {
      if (cleanup) cleanup()
    }
  }, [classroomId, username, isTeacher])

  const sendMessage = <T extends WebSocketMessageType>(
    type: T,
    data: WebSocketMessageData[T]
  ) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage<T> = { type, data }
      console.log('Sending WebSocket message:', message)
      ws.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  const on = <T extends WebSocketMessageType>(
    type: T,
    handler: MessageHandler<T>
  ) => {
    const handlers = messageHandlers.current.get(type) || []
    handlers.push(handler as MessageHandler<WebSocketMessageType>)
    messageHandlers.current.set(type, handlers)

    return () => {
      const handlers = messageHandlers.current.get(type) || []
      messageHandlers.current.set(
        type,
        handlers.filter((h) => h !== handler)
      )
    }
  }

  return {
    isConnected,
    sendMessage,
    on,
  }
}
