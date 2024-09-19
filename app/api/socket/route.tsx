import { NextResponse } from 'next/server'

import io from 'socket.io-client'
const socket = io('http://localhost:3000')

export async function POST(req, res) {
  try {
    // do something you need to do in the backend
    // (like database operations, etc.)
    const body = await req.json() // Parse the incoming JSON

    // socket.emit('message1', 'Sync Process Completed')
    socket.emit('message1', body.message || 'Default message')

    return NextResponse.json({ data: 'Success' }, { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error }, { status: 200 })
  }
}
