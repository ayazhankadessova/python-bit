// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="https://nextjs.org/icons/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
//               app/page.tsx
//             </code>
//             .
//           </li>
//           <li>Save and see your changes instantly.</li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="https://nextjs.org/icons/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }

// 'use client'

// import { useEffect, useState } from 'react'
// import { socket } from '../socket'

// export default function Home() {
//   const [isConnected, setIsConnected] = useState(false)
//   const [transport, setTransport] = useState('N/A')
//   const [text, setText] = useState('hi')

//   useEffect(() => {
//     if (socket.connected) {
//       onConnect()
//     }

//     function onConnect() {
//       setIsConnected(true)
//       setTransport(socket.io.engine.transport.name)

//       socket.io.engine.on('upgrade', (transport) => {
//         setTransport(transport.name)
//       })
//     }

//     function onDisconnect() {
//       setIsConnected(false)
//       setTransport('N/A')
//     }

//     socket.on('connect', onConnect)
//     socket.on('disconnect', onDisconnect)
//     socket.on('hey', (value) => {
//       setText(value) // Update the text state with the message from the server
//     })

//     return () => {
//       socket.off('connect', onConnect)
//       socket.off('disconnect', onDisconnect)
//     }
//   }, [])

//   const handleButtonClick = () => {
//     if (socket.connected) {
//       console.log('Emitting hello event...')
//       socket.emit('hello', 'Hello from the client!')
//     } else {
//       console.error('Socket is not connected')
//     }
//   }

//   return (
//     <div>
//       <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
//       <p>Transport: {transport}</p>
//       <p>Text: {text}</p>
//       <button onClick={handleButtonClick}>Send Hello</button>
//     </div>
//   )
// }
// ExampleComponent.jsx

// page.tsx
'use client'
import React, { useEffect } from 'react'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000') // Adjust the URL if needed

const ExampleComponent = () => {
  useEffect(() => {
    socket.on('message2', (data) => {
      console.log('Received from SERVER ::', data)
    })

    return () => {
      socket.off('message2')
    }
  }, [])

  const sendMessage = async () => {
    try {
      const response = await fetch('/api/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Message from frontend!' }), // Optional payload
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const result = await response.json()
      console.log('Response from API:', result)
    } catch (error) {
      console.error('Error sending POST request:', error)
    }
  }

  return (
    <div>
      <h1>Hello World!</h1>
      <button onClick={sendMessage}>Send Message</button>
    </div>
  )
}

export default ExampleComponent
