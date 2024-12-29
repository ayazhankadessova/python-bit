import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const flaskApiUrl =
      process.env.FLASK_API_URL ||
      'https://flask-hello-world-hazel-gamma-78.vercel.app/api/execute'

    // Forward the request to Flask backend
    const flaskResponse = await fetch(flaskApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: await request.text(),
    })

    const data = await flaskResponse.json()

    // Return the response from Flask
    return NextResponse.json(data, {
      status: flaskResponse.status,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to execute code',
        output: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
