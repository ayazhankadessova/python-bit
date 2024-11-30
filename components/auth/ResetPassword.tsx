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
import { useAuthModal } from '@/contexts/AuthModalContext'
import { useSendPasswordResetEmail } from 'react-firebase-hooks/auth'

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ResetInputs = z.infer<typeof resetSchema>

export default function ResetPassword() {
  const { toast } = useToast()
  const { onClose, onOpen } = useAuthModal()
  const [sendPasswordResetEmail, loading, error] =
    useSendPasswordResetEmail(auth)

  const form = useForm<ResetInputs>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ResetInputs) => {
    try {
      const success = await sendPasswordResetEmail(data.email)

      if (!success) throw new Error('Failed to send reset email')

      toast({
        title: 'Success',
        description: 'Password reset email sent! Check your inbox.',
        variant: 'success',
      })
      onClose()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email',
        variant: 'destructive',
      })
    }
  }

  // Handle Firebase error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }, [error, toast])

  return (
    <div className='w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold'>Reset Password</h2>
        <p className='text-sm text-gray-600 mt-2'>
          Enter your email to receive a reset link
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

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Button
            type='button'
            variant='ghost'
            className='w-full'
            onClick={() => onOpen('login')}
          >
            Back to Login
          </Button>
        </form>
      </Form>
    </div>
  )
}
