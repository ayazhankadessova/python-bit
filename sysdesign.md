// Curriculum content - simpler now
collection: 'curricula' {
  docId: curriculumId {
    title: string,        // "Python for Beginners"
    description: string,
    weeks: [{
      weekNumber: number, // 1
      title: string,      // "Introduction to Python Lists"
      tutorialContent: {
        theory: string,   // Markdown content
        examples: string, // Code examples
        resources: string[]
      },
      assignmentIds: string[]  // References to assignments collection
    }]
  }
}

// Separate assignments collection
collection: 'assignments' {
  docId: assignmentId {
    title: string,        // "Create a List Filter Function"
    problemStatement: string,  // Markdown description
    starterCode: string,      // Initial template
    starterFunctionName: string,  // "filterList"
    examples: [{
      id: string,
      inputText: string,
      outputText: string,
      explanation: string
    }],
  }
}

// Weekly progress stays similar
collection: 'weeklyProgress' {
  docId: `${classroomId}-${weekNumber}` {
    classroomId: string,
    weekNumber: number,
    assignmentCompletions: {
      [assignmentId: string]: {
        completedBy: string[],
        submissions: {
          [username: string]: [{
            code: string,
            submittedAt: timestamp,
            passed: boolean,
            error?: string     // For assert errors
          }]
        }
      }
    },
    lastUpdated: timestamp
  }
}