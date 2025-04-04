# PythonBit: Interactive Python Learning Platform with micro:bit

A real-time interactive coding platform that bridges block-based programming to text with Python and micro:bit, designed for students in grades 5-7.

## 🌟 Features

- **Real-time Collaboration**

  - Live code sharing between teachers and students
  - Real-time code execution and feedback
  - Virtual classroom environment

- **Curriculum Management**

  - Structured weekly learning modules
  - Progressive difficulty levels
  - Integrated micro:bit activities

- **Interactive Learning**

  - Code editor with syntax highlighting
  - Real-time test case validation
  - AI-assisted learning support

- **Progress Tracking**
  - Student progress monitoring
  - Task completion tracking
  - Weekly performance analytics

## Credits 

- Python Tutorial Modified from: 
  * https://www.learnpython.org/en/Welcome 
  * https://www.geeksforgeeks.org/python-for-kids/#control

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React
- **UI Components**: shadcn/ui
- **State Management**: Context API
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Real-time updates
- **Real-time Communication**: Socket.IO
- **Code Editor**: CodeMirror
- **Styling**: TailwindCSS

## 🏗 Architecture

### Database Structure (Firestore)

```
├── users/
│   └── userId/
│       ├── displayName
│       ├── email
│       ├── role
│       └── solvedProblems[]
│
├── classrooms/
│   └── classroomId/
│       ├── teacherId
│       ├── name
│       ├── curriculumId
│       ├── activeSession
│       └── lastTaughtWeek
│
├── curricula/
│   └── curriculumId/
│       └── weeks[]/
│           ├── weekNumber
│           └── assignmentIds[]
│
└── weeklyProgress/
    └── ${classroomId}-${weekNumber}/
        ├── activeSession
        ├── lastUpdated
        └── taskCompletions/
            └── taskId/
                └── completedBy[]
```

### Real-time Features

- Socket.IO events handling:
  - Join/leave classroom sessions
  - Code sharing and updates
  - Task completion notifications
  - Student progress updates

## 🚀 Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/python-bit.git
cd python-bit
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_BASE_URL=
```

4. Run the development server:

```bash
npm run dev
```

## 📱 Components

### Core Components

- `TeacherSessionView`: Manages the teacher's view of the virtual classroom
- `StudentSessionView`: Handles the student's learning interface
- `WeekSelector`: Controls curriculum week navigation
- `FileProcessorTest`: Manages code execution and testing

### Authentication

- Context-based authentication system
- Role-based access control
- Protected routes and sessions

## 🔄 Current Development Status

### Completed Features

- [x] User authentication system
- [x] Real-time code sharing
- [x] Basic curriculum structure
- [x] Task completion tracking
- [x] Live session management

### In Progress

- [ ] AI assistance integration
- [ ] Enhanced test case management
- [ ] micro:bit hardware integration
- [ ] Extended curriculum content

## 🌐 Future Enhancements

1. **Performance Optimization**

   - Implement caching mechanisms
   - Optimize database queries
   - Reduce unnecessary API calls

2. **Feature Additions**

   - Advanced AI code assistance
   - Extended micro:bit integration
   - Enhanced progress visualization
   - Comprehensive test suite

3. **UI/UX Improvements**
   - Responsive design enhancements
   - Accessibility improvements
   - Dark/light theme toggle

## 🤝 Contributing

Contributions are welcome! Submit a pull request.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Development Log

## Project Timeline

### Phase 1: Initial Setup & Core Features (Sep 18-23)

- ✅ Implemented shadcn/ui components
- ✅ Created basic teacher/student pages
- ✅ Set up MongoDB database structure
- ✅ Implemented classroom session functionality
- ✅ Added real-time code sharing features
- ✅ Developed user management system

### Phase 2: Socket Integration & Real-time Features (Oct 18-21)

- ✅ Implemented code execution functionality
- ✅ Added progress tracking
- ✅ Enhanced session management
- ✅ Developed weekly task system
- ✅ Implemented student progress monitoring

### Phase 3: Firebase Migration & Enhancement (Nov 22-30)

- ✅ Migrated to Firebase
- ✅ Implemented AuthContext
- ✅ Created curriculum structure
- ✅ Enhanced classroom management
- ✅ Improved student dashboard
- ✅ Implemented real-time updates

## Technical Implementation Details

### Socket.IO Event Structure

```javascript
// Core Events
1. join-room
2. leave-room
3. code-update
4. send-code-to-student
5. send-code-to-all
6. get-student-code
```

## Ongoing Development

### High Priority

- [ ] API Route Consolidation
- [ ] Caching Implementation
- [ ] Test Case Management
- [ ] Progress Tracking Enhancement

### Medium Priority

- [ ] AI Integration
- [ ] micro:bit Connection
- [ ] UI/UX Improvements
- [ ] Extended Curriculum Development

### Performance Optimizations

- Implement caching for classroom/curriculum data in individual classrooms
- Consolidate API calls
- Add error boundaries
- Revamp everything to SWR/SWR Mutation implementation

## Learning Curriculum Structure

### Week 3-4

- Lists and Loops
- Basic Data Processing
- Dictionaries
- File Handling

### Week 5-6

- Advanced Functions
- Error Handling
- Simple Classes
- Final Project

## Future Enhancements

### Technical Improvements

- Queuing system for code execution
- File persistence system
- Library optimization
- Enhanced test case system

### Infrastructure

- API route consolidation
- Caching implementation
- Error handling improvement
- Performance optimization

### Educational Features

- Interactive problem sets
- Custom test case creation
- Progress visualization
- Peer review system

## Nov 30

### Easy

- [ ] ALL firebase operations under `/api`
- [x] Dashboard cache
- [x] Classrooms page cache
- [ ] Add caching for the individual classroom pages
- [ ] Explore page is just list of all problems
- [ ] lesson progress card -> firestore
- [ ] Add favicon for my app
- [x] no need to store both username and code of students , just store the usernames
- [x] Teacher dashboard & student dashboard -> many overlap
- [x] Student classrooms & teacher classrooms -> many overlap

### Medium

- [ ] Work on Week 5
- [ ] dont refresh code card after the test casses are passed
- [ ] Show which test cases are we running -> students can choose which test cases they want to run
- [ ] Make progress bar better
- [ ] fix topics
- [ ] UseAuth must be used within AuthProvider after login

## 25 dec

- [x] MDX w/ velite
- [x] Add full python course mdx
- [x] l1
- [x] l2
- [x] l3
- [x] back button
- [x] Share button

## Dec 26 

- [x] Header fix 
- [x] Footer fix
- [x] Added tags to python101 lessons

## Dec 27

- [x] Search btn 
- [x] Active tab 
- [x] Logo diff 
- [x] Exercise 1 in projects

## Dec 28
- [x] exercise type to types file
- [x] project images added
- [x] fix "Go to Theme ad card" end
- [x] themes moved to config
- [x] Run / Submit Btns 

## Dec 29: 

- Work on `Tutorials` page till 4pm 
- [ ] Students need to run ever cell to complete exercise, so think of a logic

## Backend
- [x] rate Limiter 
- [ ] add caching to all routes
- [ ] add error handling to all routes
- [ ] add validation to all routes

## Front 
- [ ] Students need to run ever cell to complete exercise, so think of a logic
- [x] handle Exercises completion check
- [x] add footer icons
- [x] siteConfig fix!
- [x] bg gradient
- [x] resize python code editor
- [x] add home page
- [x] remove underline in tailwind md
- [x] accent to curr tab if togglable , accent to pages when I am in sub pages


## Jan 1

- [ ] padding to project page 
- [x] add at least 4 projects
- [ ] if solved project, add to firestore
- [ ] store code  ?? 
- [ ] add share if completed project
- [ ] add caching to progress checkers
- [ ] next tutorial Button
- [ ] Add 5 projects w/ tags
- [x] Add better imgs
- [ ] Meme creation tools

# Jan 2

- [ ] show if error when running
- [x] should backend return {err & output} or {err, success, output}
- [x] tut 4 and rest
- [ ] projects to config
- [ ] store expected output in config file, not in .md.
- [ ] added aura points , can see in frontend. add testCode to backend
- [x] handleProjectCompletion
- [x] show that project is completed
- [ ] do we even need config for the exercises? technically, if i dont want to pass starter code, but then i have to have it in json?

## jan 4
- [x] add back btn to theme
- [x] Project status 
- [x] project status to theme
- [ ] last attemp to date -> format date is util
- [x] move utils/projects to lib

## Jan 5

- [x] add Reset code button to codeExecutor
- [x] handleExercise run
- [x] lastUpdated not shown if no progress at all
- [x] add overall Progress thing to tutorial
- [x] add last Activity
- [ ] keep all interfaces in 1 place
- [ ] add attempts. show attempts

## Jan 6
- [ ] show attempts for project
- [ ] add one more project
- [ ] `api/tutorial/[tid]` -> get info on tutorial progress. cache it and only refresh if hanld exercise completing
- [ ] const { progress, invalidateCache } = useProjectProgress(projectId, user)
- [ ] add latest attempt to project

// When submitting code:
await submitCode(...)
invalidateCache() // This will drop the cache and trigger a refetch

## Jan 9 

- [x] run code and show output 
- [x] no test code but rather expected output !!
- [x] make reusable component for code editor in live session

## Jan 10
- [x] add three themes to live session code editor
- [x] update code
- [x] reset code
- [ ] fix when disabled
- [x] add reset code to live session code editor
- [x] Fix the assignent in firebase
- [x] fix its json
- [x] join leave session

## Jan 12

- [x] ui for management of classrooms
- [x] backticks ui
- [x] depreciate test code for assignments
- [ ] security for firestore stuff
- [x] join session then u should pre select week task
- [x] del active session from classroom interface


## Jan 13

- [x] del session
- [ ]  add more weeks
- [ ]  think of sys des for handle complete assignment
- [ ] show solution to teachers
- [ ] add students when they connect 
- [x] deploy to vercel
- [x] remove selectedStudent
- [ ] have to upd the code before sending?
- [ ] 
- [ ] get project progress information
- [ ] add like uncomment this code 


- add caching to all firestore opers

- Avatar circles (students) https://magicui.design/docs/components/avatar-circles
- confetti https://magicui.design/docs/components/confetti
- particles
- cool mode for btns https://magicui.design/docs/components/cool-mode
## jan 11 

- [ ] implement magic js somehwee

## Feb 12

- Global search: tutorials, pages, 
- [x] Search projecs

## Feb 13
- [x] Make Run Code and Submit Btns different
- [x] light+Dark mode header btns remove bg
- [x] hydration issues solved
- [x] create week 2 assignments 
- [x] create week 3 assignments
- [ ] Check project types: eg there is one from velite and one that i created
- [x] beautiful 404
- [ ] what stuff should be in velite projects?
- [x] create week 3 assignments
  
## Feb 14

- [x] create week 4 assignments
- [x] When creating curricula, make sure assignment is added
- [x] Fix week selector!, make sure assignments properly shown
- [x] remove useless stuff from currcilim. which fields u dont need?
- [x] Add 5 weeks to curricula


## Feb 15 

- [x] how does lastTaught week get updated?
- [ ] lessonprogresscard
- [ ] why students: 0 ?
- [ ] add solved Assignments
- [ ] Remove headers from assignments
- [ ] list of schools in HK
- [ ] lesson progress -> just show if student has this assignment as completed assignment 
- [x] fetch classrooms doesnt get updated


## Feb 17

- [ ] fetchClassroomAndCurriculum twice -> hooks

## Later

- [ ] get assignment expectedOutput from firestore [fastapi]
- [ ] Should I show progress for assignment ?

## Feb 16 

- [ ] create new pics for tutorials
- [ ] what do i need when i create a classroom ?
- [ ] Should i add dashboard page?

## Feb 18

- [x] school list Show
- https://en.wikipedia.org/wiki/List_of_secondary_schools_in_Hong_Kong
- [x] login error show. 
- [x] why do we need id in useClassrooms
- [x] API Error: Dynamic server usage: Route /api/classrooms couldn't be rendered statically because it used `request.url`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
- [ ] classrooms not updated!  
- [x] tutorials: show where to press on tutorial (underline). 
- [x] exercises not found. dark theme remove. back not working. 
- [ ] not started should not be there if there is last Attempt. 
- [x] add images to projects. 
- [x] indexof TypeError: undefined is not an object (evaluating 'n.indexOf') assignmentProgress

## Feb 20

- [ ] how to see focused or not 
- [x] delete old problems
- [ ] make limits to writes
- [ ] next tutorial button.
- [ ] add tooltip to theme btns

## Feb 24

- [ ] lesson 7

## Feb 25
- [ ] allow users to change settings


## Project Test cases

- [ ] Add test cases to 2-3 projects
Modern Features to Include:
Achievements/badges system
Social sharing options
Project showcases
Peer reviews
AI-powered hints
Real-time collaboration
Customizable themes/avatars

for every classroom, teachers will want to see progress
we will leyt them choose classroom and show

lesson 

list of students and their progress
for every student -> go to their "tutorials progress" -> set of completed exercises
we will see the total progress by 
tutrials data or every tutorials
- is logged in ? exerices number, tutorial_id 
- execute code , is_exercise if yes then upd in firestore
- show is completed for ever lesson
- progress for every lesson
- what to store on firestore (lesson id , total exercises count)
- for user, create progress_tut collection and store their tut progress
- [ ] How can i track completion? For every classroom, show list of lessons and how many completed. Completed = Did exercise
- [ ] Classes
- [ ] For teacher, add panel to monitor each classroom

## BackLog
- [x] GitHub, Logo icons
- [ ] In Live Session, Markdown rendered renders backticks and ``` in a weird way. Figure out how rehype pretty code is messing is in conflict
- [ ] Dont send expectedOutput and testCases, they should be in Backend
- [ ] Search Button Functionality
- [ ] logo
- [ ] Add quiz custom elements
- [ ] fix page paddings & nav font bigger
- [ ] Pagination in Tutorials page should be more sophisticated (per page), show page numbers
- [ ] Background -> picture not just white/dark.
- [ ] Fix session view ui, make it more engaging for kids (Raise hand needed?)
- [ ] Add PythonCodeEditor integration to Lessons4-...
- [ ] why is my ```code theme not githubdark
- [ ] Clean up types

## What I have
- go thru every week and check what works and what not 
- Student create their own accounts -> no need

## What I need 
- markdown based sessions for every week.
- make them and just add them to firebase
- students can either see them or what their teacher chose
- Create a template where teachers can create their own courses 
- Self paced learning -> add problems there 
- Teachers create students' accounts
- Every student has managed_by field 
- Easier 
- Detect if students are active
import { useAuth } from '@/contexts/AuthContext'

  const { user, loading, signOut } = useAuth()



## Pages 

1. `container mx-auto px-8 py-8`
2. add toc to tutorials
Output does not match expected result


## projects 

```
users/
  {uid}/
    projects/
      {project_id}/
        completed: boolean
        lastAttempt: number
        totalAttempts: number
        successfulAttempts: number
        attempts/
          {auto-id}/  // Automatically generated ID
            code: string
            timestamp: number
            success: boolean
```


## Color Palette
1. #D7F4EE
2.  #E0D7F4
2. #F4D7DD
3. #EBF4D7


images, change questions.


- Bugs:
quiz 5, q6: options should be code blocks

- add more quizzes
- interactivity

## layout fixes


<!-- -     <div className='container max-w-6xl mx-auto px-8 md:px-14 py-16'> -->

So, i want my pages to take up whole width , unless i specify smth diff,
now need to think on padding
