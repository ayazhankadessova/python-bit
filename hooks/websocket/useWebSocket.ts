import { useEffect, useRef, useState } from 'react'

interface WebSocketMessage {
  type: string
  data: any
}

export function useWebSocket(
  classroomId: string,
  username: string | undefined,
  isTeacher: boolean
) {
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const messageHandlers = useRef<Map<string, ((data: any) => void)[]>>(
    new Map()
  )

  const connect = () => {
    if (!username) return
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/${classroomId}/${username}/${isTeacher}`

    console.log('Connecting to WebSocket:', wsUrl) // Debug log

    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }

     ws.current.onmessage = (event) => {
       try {
         const message: WebSocketMessage = JSON.parse(event.data)
         console.log('Received WebSocket message:', message)

         const handlers = messageHandlers.current.get(message.type)
         if (handlers) {
           console.log(
             `Found ${handlers.length} handlers for message type:`,
             message.type
           )
           handlers.forEach((handler) => {
             try {
               handler(message.data)
             } catch (error) {
               console.error('Error in message handler:', error)
             }
           })
         } else {
           console.log('No handlers found for message type:', message.type)
         }
       } catch (error) {
         console.error('Error processing WebSocket message:', error)
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

  const sendMessage = (type: string, data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message = { type, data }
      console.log('Sending WebSocket message:', message) // Debug log
      ws.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  const on = (type: string, handler: (data: any) => void) => {
    const handlers = messageHandlers.current.get(type) || []
    handlers.push(handler)
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
