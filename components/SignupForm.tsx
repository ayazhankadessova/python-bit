// import { useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import * as z from 'zod'
// import { useRouter } from 'next/navigation'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
// import { useToast } from '@/hooks/use-toast'

// // Define the signup schema
// const signupSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   username: z.string().min(2, 'Username must be at least 2 characters'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
//   role: z.enum(['teacher', 'student']),
//   school: z.string().min(1, 'School name is required'),
//   subject: z.string().optional(),
//   grade: z.number().optional(),
// })

// // Infer the type from the schema
// type SignupData = z.infer<typeof signupSchema>

// export default function SignupForm() {
//   const { toast } = useToast()
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(false)

//   const form = useForm<SignupData>({
//     resolver: zodResolver(signupSchema),
//     defaultValues: {
//       uid: newUser.user.uid,
//       email: newUser.user.email,
//       displayName: inputs.displayName,
//       createdAt: Date.now(),
//       updatedAt: Date.now(),
//       likedProblems: [],
//       dislikedProblems: [],
//       solvedProblems: [],
//       starredProblems: [],
//       school: "",
//       role: "student"
//     },
//   })

//   const role = form.watch('role')

//   const onSubmit = async (data: SignupData) => {
//     try {
//       setIsLoading(true)
//       const response = await fetch('/api/auth/signup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || 'Signup failed')
//       }

//       const { user, token } = await response.json()
//       localStorage.setItem('token', token)

//       toast({
//         title: 'Success',
//         description: 'Account created successfully!',
//       })

//       router.push('/dashboard')
//     } catch (error) {
//       console.error('Signup error:', error)
//       toast({
//         title: 'Error',
//         description:
//           error instanceof Error ? error.message : 'Failed to create account',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className='w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg'>
//       <div className='text-center'>
//         <h2 className='text-2xl font-bold'>Create an Account</h2>
//         <p className='text-sm text-gray-600 mt-2'>
//           Join us to start learning or teaching
//         </p>
//       </div>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
//           <FormField
//             control={form.control}
//             name='email'
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Email</FormLabel>
//                 <FormControl>
//                   <Input
//                     type='email'
//                     placeholder='Enter your email'
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name='username'
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Username</FormLabel>
//                 <FormControl>
//                   <Input placeholder='Choose a username' {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name='password'
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Password</FormLabel>
//                 <FormControl>
//                   <Input
//                     type='password'
//                     placeholder='Create a password'
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name='role'
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>I am a</FormLabel>
//                 <Select
//                   onValueChange={field.onChange}
//                   defaultValue={field.value}
//                 >
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder='Select your role' />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     <SelectItem value='teacher'>Teacher</SelectItem>
//                     <SelectItem value='student'>Student</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name='school'
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>School Name</FormLabel>
//                 <FormControl>
//                   <Input placeholder='Enter your school name' {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {role === 'teacher' && (
//             <FormField
//               control={form.control}
//               name='subject'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Subject</FormLabel>
//                   <FormControl>
//                     <Input placeholder='Enter your subject' {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           )}

//           {role === 'student' && (
//             <FormField
//               control={form.control}
//               name='grade'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Grade</FormLabel>
//                   <FormControl>
//                     <Input
//                       type='number'
//                       placeholder='Enter your grade'
//                       {...field}
//                       onChange={(e) =>
//                         field.onChange(
//                           e.target.value ? parseInt(e.target.value) : undefined
//                         )
//                       }
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           )}

//           <Button type='submit' className='w-full' disabled={isLoading}>
//             {isLoading ? 'Creating account...' : 'Create account'}
//           </Button>
//         </form>
//       </Form>
//     </div>
//   )
// }
// components/Signup.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { auth, fireStore } from '@/firebase/firebase'
import { useRouter } from 'next/navigation'
import { doc, setDoc } from 'firebase/firestore'
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth'
import { useAuth } from '@/contexts/AuthContext'

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  displayName: z.string().min(3, 'Display name must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  school: z.string().optional(),
  role: z.enum(['student', 'teacher']),
})

type SignUpValues = z.infer<typeof signUpSchema>

const Signup = () => {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [createUserWithEmailAndPassword, _, loading, error] =
    useCreateUserWithEmailAndPassword(auth)

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      displayName: '',
      password: '',
      school: '',
      role: 'student',
    },
  })

  const onSubmit = async (values: SignUpValues) => {
    try {
      const newUser = await createUserWithEmailAndPassword(
        values.email,
        values.password
      )
      if (!newUser) return

      const userData = {
        uid: newUser.user.uid,
        email: newUser.user.email,
        displayName: values.displayName,
        school: values.school,
        role: values.role,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        likedProblems: [],
        dislikedProblems: [],
        solvedProblems: [],
        starredProblems: [],
      }

      await setDoc(doc(fireStore, 'users', newUser.user.uid), userData)
      toast({
        title: 'Success',
        description: 'Account Created.',
        variant: 'success',
      })
      router.push('/dashboard')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Account not Created.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='w-full max-w-md space-y-8 p-8'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold mb-2'>Register to PythonBit</h2>
        <p className='text-sm text-muted-foreground'>
          Join us to start learning or teaching
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder='name@example.com'
                    {...field}
                    className='border-gray-500'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='displayName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='John Doe'
                    {...field}
                    className='border-gray-500'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='••••••••'
                    {...field}
                    className='border-gray-500'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='role'
            render={({ field }) => (
              <FormItem>
                <FormLabel>I am a</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='border-gray-500'>
                      <SelectValue placeholder='Select your role' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='student'>Student</SelectItem>
                    <SelectItem value='teacher'>Teacher</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='school'
            render={({ field }) => (
              <FormItem>
                <FormLabel>School (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Your school name'
                    {...field}
                    className='border-gray-500'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' disabled={loading} className='w-full'>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>
      </Form>

      {/* <div className='text-center text-sm'>
        <span className='text-muted-foreground'>Already have an account?</span>{' '}
        <Button
        v>  variant='link'
          onClick={handleClick}
          className='p-0 h-auto font-normal'
        >
          Log In
        </Button>
      </div */}
    </div>
  )
}

export default Signup
