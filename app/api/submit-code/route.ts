import { NextResponse } from 'next/server'
import { executeAndTestCode, updateStudentProgress } from '@/lib/codeExecution'

export async function POST(request: Request) {
  const { classroomId, weekNumber, taskId, username, code } =
    await request.json()

  try {
    const { passed, output, expectedOutput } = await executeAndTestCode(
      code,
      taskId
    )
    await updateStudentProgress(
      classroomId,
      username,
      weekNumber,
      parseInt(taskId),
      passed,
      code
    )

    return NextResponse.json({
      passed,
      output,
      expectedOutput,
    })
  } catch (error) {
    console.error('Error executing and testing code:', error)
    return NextResponse.json(
      {
        error: 'An error occurred while executing and testing the code',
      },
      { status: 500 }
    )
  }
}
