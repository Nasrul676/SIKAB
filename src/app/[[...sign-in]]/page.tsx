// app/login/page.tsx
"use client";

import React, { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation'; // Use next/navigation
import { loginAction, type LoginFormState } from '@/lib/actions/authActions'; // Adjust path

const initialState: LoginFormState = {
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
      className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {pending ? 'Logging In...' : 'Login'}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'; // Default redirect

  // Use useActionState hook for form handling
  const [state, formAction] = useActionState(loginAction, initialState);

  // Effect to handle redirection after successful login
  useEffect(() => {
    if (state.success) {
        
      // Redirect to the dashboard or the callbackUrl after successful login
      console.log(`Login successful, redirecting to: ${callbackUrl}`);
      router.push(state.message || callbackUrl);
      // Optionally show a success toast message before redirecting
      // toast.success(state.message || "Login successful!");
    }
  }, [state.success, router, callbackUrl]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-900 rounded-lg shadow-md shadow-gray-800">
       <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold  mb-2">SIKAB</h2>
          <p className=" text-lg">Sistem Informasi Kedatangan Bahan Baku</p>
        </div>

        <form action={formAction} className="space-y-6">
          {/* Display general errors */}
          {state.errors?.general && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md" role="alert">
              {state.errors.general}
            </div>
          )}
           {/* Display non-error messages from server (e.g., if needed) */}
           {state.message && !state.success && !state.errors?.general && (
             <div className="p-3 text-sm text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-md" role="alert">
                {state.message}
             </div>
           )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium"
            >
              Email address
            </label>
            <input
              id="email"
              name="email" // Name must match FormData key
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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              name="password" // Name must match FormData key
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Password"
              aria-describedby="password-error"
            />
             {state.errors?.password && (
                <p id="password-error" className="mt-1 text-xs text-red-600">
                    {state.errors.password.join(', ')}
                </p>
            )}
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
