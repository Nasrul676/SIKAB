// lib/session.ts
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { cookies } from 'next/headers';
export interface SessionUser {
    id: string;
    email: string;
    username: string;
    role: string;
    // Add other relevant fields like role if needed
}

// Define the shape of your session data
// Add any properties you want to store about the logged-in user
declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionUser; // Store user info in the session
  }
}

// Configuration options for iron-session
export const sessionOptions = {
  // VERY IMPORTANT: Set a strong password, ideally from environment variables
  // Use a tool like https://1password.com/password-generator/ to generate a 32+ character password
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'sikab-session-cookie', // Choose a unique name
  cookieOptions: {
    // secure: true should be used in production (HTTPS)
    // Setting it to false for development (HTTP) environments.
    // Check NODE_ENV before setting this dynamically.
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Prevent client-side JS access
    sameSite: 'lax', // Recommended for most cases
  },
};

// Helper function to get the current session
// Can be called from Server Components, Server Actions, Route Handlers
export async function getSession(): Promise<IronSession<IronSessionData>> {
  const session = await getIronSession<IronSessionData>(await cookies(), sessionOptions);
  return session;
}

// Define the user data you want to store in the session (exclude password!)


// Check if the password environment variable is set
if (!process.env.SECRET_COOKIE_PASSWORD || process.env.SECRET_COOKIE_PASSWORD.length < 32) {
    console.warn(
        'WARNING: SECRET_COOKIE_PASSWORD environment variable is not set or is too short (recommend 32+ characters).',
        'Using a default value for development, but this is INSECURE for production.',
        'Generate a strong password and set it in your .env.local file.'
    );
    // Provide a default ONLY for development to avoid immediate crashes, but emphasize insecurity
    if (process.env.NODE_ENV !== 'production') {
        sessionOptions.password = 'complex_password_at_least_32_characters_long_dev_only';
    } else {
        throw new Error('SECRET_COOKIE_PASSWORD environment variable is required for production.');
    }
}
