
// This should be at `api/auth.ts`

// In a real app, you'd use a more robust auth system (e.g., JWT, OAuth).
// For this internal tool, we check a secret password from environment variables.

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set.');
      return new Response(JSON.stringify({ message: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (password === adminPassword) {
      return new Response(JSON.stringify({ message: 'Authentication successful' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ message: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Bad Request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
