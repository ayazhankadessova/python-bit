// components/auth/Login.tsx
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { auth } from '@/firebase/firebase'
import { useRouter } from 'next/navigation'
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth'
import { useAuth } from '@/contexts/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginInputs = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [signInWithEmailAndPassword, _, loading, error] =
    useSignInWithEmailAndPassword(auth)

  const form = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginInputs) => {
    try {
      const result = await signInWithEmailAndPassword(data.email, data.password)
      if (!result) throw new Error('Failed to sign in')

      toast({
        title: 'Success',
        description: 'Successfully signed in!',
        variant: 'success',
      })

      router.push('/dashboard')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold'>Welcome back</h2>
        <p className='text-sm text-gray-600 mt-2'>Please sign in to continue</p>
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
                    type='email'
                    placeholder='Enter your email'
                    className='bg-gray-50 border-gray-300'
                    {...field}
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
                    placeholder='Enter your password'
                    className='bg-gray-50 border-gray-300'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <div className='flex items-center justify-end'>
            <button
              type='button'
              className='text-sm text-blue-600 hover:underline'
              onClick={handleModalChange}
            >
              Forgot password?
            </button>
          </div> */}

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
