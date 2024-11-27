This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Sep 18

- add shadcn/ui
- Create teacher page and connect to mongodb

- i will create classrom (2) and user collection (5)
- i will create page.tsx

## Sep 19

1. [x] check what is in form
2. [x] select from various programmes
3. [x]Start Lesson
4. how to select Programmes?
5. How to store Weekly courses? -> mdx ?
6. mobile nav
7. [x]how to connect to socket?
8. [] how to connect teachers and students to web socket?

create dummy frontend for virtual classroom 4. select 1 programme for 1 classroom and start a virtual classroom

## Sep 21

- [x]both team teacher joined room?
- [x]check how roles are alloc so that links work correct
- [x] Send code to students
- [ ] remove repetitions
- [x] Fix Generate invite link to be popover
- [x] Why when student joins they cannot see the starter code ?

## Sep 22

Common:

- [x] add interfaces
- [x] what to do with student interface ?

Backend:

- [x] Create new teacher
- [x] create new student
- [x] make users collection and add 2 teachers and 2 students there

## Sep 23

- [x] add leave room functionality
- [x] make it possible for teacher to see every students code via card
- [x] send code to specific student
- [ ] add submit code button
- [ ] show toast when end session , why toasts not working ?
- [ ] how to show teaching content?

- work on showing full programmes

- fix :
- dont add someone whos is not id db

## Scalability questions

- when will i add students to a classroom? (beginning when creating or with put)
- page for every classroom w basic info
- dont hardcode studentID
- pass the whole student body

### 18 October:

1. syntax checking
2. [x] Run python code
3. [x] Progress to new tasks
4. [ ] Add not found page
5. [x] Remove duplicate session data checking

6. be able to connect to MicroBit

## 19 October

6. [ ] no point of run code ?

1. [ ] how many runs needed?
1. [ ] Check for many classrooms
1. [ ] Integrate AI to give them feedback on their code
1. [ ] Go back in their code
1. [ ] understand how tasts are completed

- [x] Failed to start the week. Please try again.
- [x] Ok, I can shoose week, see the tasks, but students who join the classroom cannot see the tasks.

[x] assignment ids 67139a85da456cc1e6881a18 67139ba3da456cc1e6881a19
[x] created curricula

- [x] stuck at load sesion data

## Oct 20

- [x] Change the background of the toast
- [x] How can teacher see the progress -> api send smth to session-view and session view emits smth to socket
- [ ] Created weekly progress table

## Oct 21

- [x] Remove "Run Code"
- [x] Add refresh button and use weekly updates ! what can i use it for?
- [x] Current Progress Report should be based on selectedWeek, not based on last Taught week
- [x] Why ayazhankadessova has completed?
- [ ] User API to reun code
- [x] 2/0 completed ?
- [x] Send code to all students
- [ ] When i press on selected student again, remove selected student (back to normal)
- [ ] Run code via api, not socket connection
- [ ] be able to check every students' current code
- [ ] be able to send code to specific student
- [x] How many tasks did student complete for this week?
- [x] Remove completed tasks from server.js
- [x] In weekly progress, we just need to know who completed. (alr completed, no need to add them again!)
- [ ] In curricula, we will save actual submission -> submissions table.
- [ ] Integrate AI

## Nov 22

- [x] let teacher login and they can see all classes that she has.
- [x] cant find GET /classroom/6740320f2cf18e4ef71cdbcc/session 404 in 678ms
- [x] send code to all students in the classroom

## Nov 23

- [x] change student's views
- [x] how students join classroom, change that, maybe we show active classroom?

#### Student Dashboard:

- [x] Show name of every classroom ur enrolled
- [x] Join classroom -> if not yet made by teacher, then show that there is no active session
- [x] clean up classrooms (remove old ones)
- [x] Remove Class code from my classrooms list
- [x] Show Student name no their grade when u create classroom

## Nov 24

- [ ] Ask AI HELP {chat gpt token?}
- [x] Full Programmes -> get reference from Microsoft -> https://makecode.microbit.org/courses/csintro-educator
- [x] change task id to int32

## Nov 26 : Revamp everything to Firebase :))) hahahah

- [x] User created with AuthContext
- [x] Create curricula with 2 weeks
- [x] create teacher
- [x] weeklyprogress => "classroomid-week" => {task1: [array of users who completed - no duplicates]}

## Nov 27

- [ ] I need to work on CodeExecutor. Really try to do 2 simple functions! and test.
- [ ] Run code doesn't work bc function
- [ ] Create task Ids (the functions will stay locally)
- [ ] fix students dashboard -> it doesnt retrieve enrolled classrooms effectively
- [ ] choose week
- [ ] how to save progress
- [ ] no document to update
- [ ] is it actually checking ?
- [ ] make meaningful ids for classroom?
- [ ] all interfaces in one place
- [ ] remove atom stuff
- [ ] Create classroom tasks -> taskId
- [ ] think of how to create a classroom
- [ ] test case for week 1 ok
- [ ] add test cases section
- [ ] test cases for all weeks. Test case boxes like in leetcode
- [ ] check progress
- [ ] show last topic for every classroom.
- [ ] Finally do smth w microbit AHHAHAH
- [ ] add student progress for every student!
- [ ] Sessiom view -> every task will go to another link -> new view

## Nov 28

- [ ] Teacher dashboard & student dashboard -> many overlap
- [ ] Student classrooms & teacher classrooms -> many overlap
      \

##background-position

- [ ] UseAuth must be used within AuthProvider after login

## Nov 26 addtnl

- [ ] remove so many router pusher like why so many ahahha
      What to ask?

- [ ] Do i need to save submissions?
- [ ] Do we need starter code?

Consider implementing a caching mechanism for the classroom and curriculum data to reduce unnecessary API calls.
If possible, combine the classroom and curriculum data into a single API call to reduce the number of requests.
Implement error boundaries to handle errors more gracefully at a higher level in your component tree.
Use a library like React Query or SWR for better management of asynchronous state and caching.

refresh shows progress

[x] checkout all the types
[ ] check out weekly progress
[ ] assoc week with weekly report

- [ ] queuing system to execute code
- [ ] save as files
- [ ] how many libraries are there needed ?

```
db.classrooms.createIndex({ teacherId: 1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

- Recoil auth model
- split js
- uiw/codemirror

```
npm install @uiw/react-codemirror @codemirror/lang-python @uiw/codemirror-theme-vscode

```

"Recoil auth state" refers to the practice of storing user authentication information (like login status, user details) within the state management system "Recoil" in a React application, allowing easy access to this data across different components in your app without needing to pass it down manually through props; essentially, it's a way to centrally manage your application's authentication state using Recoil's "atom" mechanism

```

- Workspace: Playground(EditorFooter.tsx, Playground.tsx), ProblemDescription (ProblemDescription.tsx)
```

## DB:

1. Week 1 can have many 3 problems
2. Problem : id, title, category, difficulty, likes, dislikes, videoId
3. Users: id, displayName, email, likedProblems, dislikedProblems, starredProblems, solvedProblems, createdAt, updatedAt

## Local:

1. Problems: id, title, problemStatement, examples(also test cases), constraints, order (no need), startedCode, handlerFunction (test code), startedFunctionName

## Nov 25

1. `npm i assert` -> check if function gives us correct code
2. send callback function
3. create new problems

## firestore

1. build -> db
2. Start in test mode
