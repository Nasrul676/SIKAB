// app/register/page.tsx
"use client";

import React, { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // For linking to login page
import { registerAction, type RegisterFormState } from '@/lib/actions/authActions'; // Adjust path

const initialState: RegisterFormState = {
  success: false,
  message: null,
  errors: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {pending ? 'Registering...' : 'Register'}
    </button>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  // Use useActionState hook for form handling
  const [state, formAction] = useActionState(registerAction, initialState);

  // Effect to handle redirection after successful registration
  useEffect(() => {
    if (state.success) {
      // Redirect to the login page after successful registration
      // Optionally show a success message first
      alert(state.message || "Registration successful! Please log in."); // Replace with toast if preferred
      router.push('/login');
    }
  }, [state.success, router, state.message]);

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="w-full max-w-md p-8 space-y-6  rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Create Account</h1>

        <form action={formAction} className="space-y-4">
          {/* Display general errors */}
          {state.errors?.general && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md" role="alert">
              {state.errors.general}
            </div>
          )}
           {/* Display non-error messages from server */}
           {state.message && !state.success && !state.errors?.general && (
             <div className="p-3 text-sm text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-md" role="alert">
                {state.message}
             </div>
           )}

          {/* Name Input (Optional) */}
          <div>
            
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              name="username" // Name must match FormData key
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Your user name"
              aria-describedby="name-error"
            />
            {state.errors?.username && (
                <p id="name-error" className="mt-1 text-xs text-red-600">
                    {state.errors.username.join(', ')}
                </p>
            )}
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <input
              id="role"
              name="role" // Name must match FormData key
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Your roles"
              aria-describedby="role-error"
            />
            {state.errors?.role && (
                <p id="name-error" className="mt-1 text-xs text-red-600">
                    {state.errors.role.join(', ')}
                </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="you@example.com"
              aria-describedby="email-error"
            />
            {state.errors?.email && (
                <p id="email-error" className="mt-1 text-xs text-red-600">
                    {state.errors.email.join(', ')}
                </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Password (min 8 characters)"
              aria-describedby="password-error"
            />
             {state.errors?.password && (
                <p id="password-error" className="mt-1 text-xs text-red-600">
                    {state.errors.password.join(', ')}
                </p>
            )}
          </div>

          {/* Confirm Password Input */}
           <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Confirm Password"
              aria-describedby="confirmPassword-error"
            />
             {state.errors?.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-xs text-red-600">
                    {state.errors.confirmPassword.join(', ')}
                </p>
            )}
          </div>


          <SubmitButton />
        </form>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
