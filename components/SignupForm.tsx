import { useState, useEffect } from 'react'
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
import Link from 'next/link'
import { useAuthModal } from '@/contexts/AuthModalContext'

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
  const { onClose } = useAuthModal()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [firebaseError, setFirebaseError] = useState<string | null>(null)
  const [createUserWithEmailAndPassword, userCred] =
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

  // Close form if we already have user credentials
  useEffect(() => {
    if (userCred) {
      router.push('/dashboard')
    }
  }, [userCred, router])

  const onSubmit = async (values: SignUpValues) => {
    setFirebaseError(null)
    setIsSubmitting(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(
        values.email,
        values.password
      )

      if (!userCredential?.user) {
        throw new Error('Failed to create user')
      }

      const newUser = userCredential.user

      const userData = {
        uid: newUser.uid,
        email: newUser.email,
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

      await setDoc(doc(fireStore, 'users', newUser.uid), userData)

      onClose()

      toast({
        title: 'Success',
        description: 'Account Created.',
        variant: 'success',
      })
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during signup' + err
      setFirebaseError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='w-full max-w-md space-y-8 px-8 py-4'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold mb-2'>Register to PythonBit</h2>
        <p className='text-sm text-muted-foreground'>
          Join us to start learning or teaching
        </p>
      </div>

      {firebaseError && (
        <div className='text-primary/70 text-sm text-center mb-4 p-2 bg-red-400/20 rounded'>
          {firebaseError}
        </div>
      )}

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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' disabled={isSubmitting} className='w-full'>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </Button>
        </form>
      </Form>

      <div className='text-center text-sm mt-4'>
        <span className='text-muted-foreground'>Already have an account?</span>{' '}
        <Button variant='link' asChild className='p-0 h-auto font-normal'>
          <Link href='/login'>Log In</Link>
        </Button>
      </div>
    </div>
  )
}

export default Signup
