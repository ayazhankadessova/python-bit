import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const flaskApiUrl =
      process.env.FLASK_API_URL ||
      'https://nextjs-fastapi-starter-three-tau.vercel.app/api/py/execute'

    //   'https://flask-hello-world-hazel-gamma-78.vercel.app/execute'

    // Forward the request to Flask backend
    const flaskResponse = await fetch(flaskApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: await request.text(),
    })

    const data = await flaskResponse.json()

    // Handle rate limit responses
    if (flaskResponse.status === 429 || data.error === 'Rate limit exceeded') {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: data.message || '1 per 1 minute',
        },
      )
    }

    // Return the response from Flask
    return NextResponse.json(data, {
      status: flaskResponse.status,
    })
  } catch (error) {
    console.error('Error executing code:', error)
    return NextResponse.json(
      {
        error: 'Failed to execute code',
        output: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}