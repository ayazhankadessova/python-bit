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

- [ ] Add full python course mdx
- [ ] integrate codemirror to mdx courses
- [ ] How can i track completion? For every classroom, show list of lessons and how many completed. Completed = Did exercise
- [ ] Header 
- [ ] Footer 

- [ ] Classes
- [ ] Add projectss
- [ ] Custom Pagination
-  For teacher, add panel to monitor each classroom
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