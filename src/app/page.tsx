import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function HomePage() {
  // Check if user is authenticated
  const user = await getCurrentUser();
  
  if (!user) {
    // If not authenticated, redirect to login
    redirect('/login');
  }
  
  // If authenticated, redirect to appropriate dashboard based on role
  switch (user.role) {
    case 'superadmin':
      redirect('/superadmin');
    case 'qc':
      redirect('/qc');
    case 'security':
      redirect('/security');
    case 'weighing':
      redirect('/weighing');
    default:
      redirect('/qc'); // Default fallback
  }
}
