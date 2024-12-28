// components/Signup.tsx
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
  // const { user } = useAuth()
  const [createUserWithEmailAndPassword, _, loading] =
    useCreateUserWithEmailAndPassword(auth)
  console.log(_)

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
    } catch (error) {
      toast({
        title: 'Error' + error,
        description: 'Account not Created.',
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
