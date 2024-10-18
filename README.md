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

### DO:

1. be able to connect to MicroBit
2. syntax checking
3. Run python code
4. [ ] Add not found page
5. [ ] Integrate AI to give them feedback on their code
