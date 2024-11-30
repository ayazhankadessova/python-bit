# Authentication Flow Overview

```
AuthContext - handles the actual authentication state and user data
AuthModalContext - handles the UI state for the login/signup modal
```

## 1. Layout Structure (app/layout.tsx)

```tsx
<Providers>
  {' '}
  // Theme provider from shadcn
  <AuthProvider>
    {' '}
    // Handles firebase auth state
    <AuthModalProvider>
      {' '}
      // Handles login/signup modal state
      <SiteHeader />
      {children} // Page content
      <Toaster /> // Notifications
    </AuthModalProvider>
  </AuthProvider>
</Providers>
```

## 2. Context Providers

### AuthProvider (User Authentication)

- Uses Firebase authentication
- Manages user state and data
- Provides:
  - `user`: Current user data from Firestore
  - `loading`: Authentication loading state
  - `signOut`: Sign out function

### AuthModalProvider (Modal UI State)

- Manages authentication modal visibility
- Provides:
  - `isOpen`: Modal visibility state
  - `type`: Current form type ('login', 'register', or 'resetPassword')
  - `onOpen`: Function to open modal
  - `onClose`: Function to close modal

## 3. Components Flow

1. **HomePage**:

   - Displays login/register buttons if no user
   - Shows user stats and dashboard link if logged in
   - Uses `useAuthModal` to trigger the auth modal

2. **AuthModal**:
   - Renders login/register/reset password forms
   - Controlled by AuthModalContext
   - Appears as an overlay when triggered

## 4. Authentication Flows

### Login Flow

1. User clicks "Login"

```typescript
const handleAuth = (type: 'login') => {
  onOpen(type) // Opens modal with login form
}
```

### Register Flow

1. User clicks "Register"

```typescript
const handleAuth = (type: 'register') => {
  onOpen(type) // Opens modal with registration form
}
```

### Password Reset Flow

1. User clicks "Forgot Password?" on login form

```typescript
const handleForgotPassword = () => {
  onOpen('resetPassword') // Opens modal with reset form
}
```

2. Reset password process:

```typescript
const handleReset = async (email: string) => {
  await sendPasswordResetEmail(email)
  // On success: shows confirmation toast and returns to login
  // On error: shows error message
}
```

### Modal Display Logic

```typescript
{
  type === 'login' ?
  : type === 'register' ?
  :
}
```

### Success Flows

1. **Successful Login/Register**:

```typescript
// User data is fetched and stored in AuthContext
// Redirects to dashboard
router.push('/dashboard')
```

2. **Successful Password Reset**:

```typescript
// Email sent confirmation
// Returns to login form
onOpen('login')
```

This structure provides:

- Clear separation of concerns
- Centralized state management
- Consistent auth flow
- Modal UI control
- Comprehensive password recovery
- Seamless form transitions

The system maintains a consistent user experience while handling all authentication scenarios, including password recovery, through a single modal interface controlled by the AuthModalContext.
