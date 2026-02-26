import { signOut } from '@/lib/auth';

// POST /api/auth/logout
// Logs out the current user (works for all roles)
export async function POST(request) {
  try {
    // NextAuth v5 signOut - clears JWT cookie
    await signOut({ redirect: false });
    
    return new Response(
      JSON.stringify({ message: 'Logout successful' }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Logout failed' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
