# TripSplit Authentication System - Complete Setup Guide

## ✅ Full Dual Authentication Flow Implemented

### 1. **Login Page** (`/login`)
- Email/Password form
- "Continue with Google" button
- Auto-redirects to dashboard on success

### 2. **Register Page** (`/register`)
- Manual signup with email, password
- "Sign up with Google" button for direct signup
- Auto-creates account and redirects to dashboard

### 3. **Google OAuth Flow**
```
User clicks "Continue with Google" or "Sign up with Google"
    ↓
NextAuth Google Provider handling
    ↓
Check if email exists in MongoDB
    ↓
├─ YES: Update profile image (if available) → Sign in
└─ NO: Create new user with Google data → Sign in
    ↓
JWT token created with MongoDB user._id
    ↓
User redirected to /dashboard
```

### 4. **Dashboard** (`/dashboard`)
- Protected route (requires authentication)
- Session contains `user.id` (MongoDB _id)
- Can use `useSession()` to access: `session.user.id`, `session.user.email`, etc.
- Logout via `signOut()` function

## 🔐 Security Features

✅ **Route Protection**: Middleware protects all authenticated routes
✅ **JWT Sessions**: Secure token-based auth with NextAuth
✅ **Password Hashing**: bcrypt for manual passwords
✅ **Secure Cookies**: httpOnly cookies in production
✅ **OAuth Integration**: Google provider with auto user creation

## 📋 Protected Routes

```
/dashboard
/trip/*
/profile
/create-trip
/settings
/notifications
/onboarding
```

Unauthenticated users are auto-redirected to `/login`

## 🛠️ Key Files

| File | Purpose |
|------|---------|
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth config with Credentials & Google providers |
| `src/app/login/page.tsx` | Login with email/password and Google |
| `src/app/register/page.tsx` | Register with email/password and Google |
| `src/app/dashboard/page.tsx` | Protected dashboard with session integration |
| `src/middleware.ts` | Route protection & auth checks |
| `src/components/providers.tsx` | SessionProvider wrapper |
| `src/types/next-auth.d.ts` | TypeScript type extensions |

## 🚀 How to Use Session Data

### Client Component
```tsx
"use client";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session } = useSession();
  
  console.log(session?.user?.id);        // MongoDB _id
  console.log(session?.user?.email);     // User email
  console.log(session?.user?.name);      // User name
  console.log(session?.user?.image);     // Profile image
}
```

### Server Component
```tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ServerComponent() {
  const session = await getServerSession(authOptions);
  
  if (!session) return <div>Not authenticated</div>;
  
  return <div>Welcome, {session.user?.name}</div>;
}
```

### Logout
```tsx
import { signOut } from "next-auth/react";

<button onClick={() => signOut({ callbackUrl: "/login" })}>
  Logout
</button>
```

## 🧪 Testing the Flow

### Manual Signup & Login
1. Go to `/register`
2. Fill name, email, password
3. Click "Create Account"
4. Go to `/login`
5. Enter email & password
6. Auto-redirect to `/dashboard`

### Google OAuth Signup
1. Go to `/register`
2. Click "Sign up with Google"
3. Choose Google account
4. Auto-creates account in MongoDB
5. Auto-redirects to `/dashboard`

### Google OAuth Login
1. Go to `/login`
2. Click "Continue with Google"
3. Choose Google account
4. Auto-redirects to `/dashboard` (links to existing account by email)

## ⚙️ Environment Variables

All variables are set in `.env.local`:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=10c873e3954166b8b8023852a8067e082167a538fd9de3de574e39ddad06ac13
GOOGLE_CLIENT_ID=205706282277-9oekqf5kdh3sqn2q7ca5sgdo7uch31gn.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-OOOD8lxAXV77aH5OQFQ3NKcyJv7
MONGODB_URI=mongodb+srv://...
```

## ✨ Features Included

- ✅ Dual authentication (Manual + Google OAuth)
- ✅ Auto user creation on first Google login
- ✅ Auto linking existing users to Google account
- ✅ Session with MongoDB user ID
- ✅ Protected routes with middleware
- ✅ Automatic redirects
- ✅ Logout functionality
- ✅ Type-safe authentication
- ✅ Error handling & toasts
- ✅ Loading states
