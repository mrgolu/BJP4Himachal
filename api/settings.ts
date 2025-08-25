// This should be at `api/settings.ts`
import { db, sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

// Middleware for admin authentication
async function authMiddleware(req: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  // Fail safely if the admin password isn't set on the server.
  if (!adminPassword) {
    console.error('CRITICAL: ADMIN_PASSWORD environment variable not set on API endpoint.');
    return false;
  }
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  return token === adminPassword;
}

export default async function handler(req: Request) {
  try {
    const client = await db.connect();
    
    switch (req.method) {
      case 'GET': {
        const { rows } = await client.sql`SELECT links FROM settings WHERE key = 'socialLinks' LIMIT 1;`;
        const socialLinks = rows[0]?.links || { fb: '', insta: '', x: '' };
        return new Response(JSON.stringify(socialLinks), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      case 'POST': {
        if (!(await authMiddleware(req))) {
          return new Response('Unauthorized', { status: 401 });
        }
        const newLinks = await req.json();
        
        await client.sql`
          INSERT INTO settings (key, links)
          VALUES ('socialLinks', ${JSON.stringify(newLinks)})
          ON CONFLICT (key)
          DO UPDATE SET links = EXCLUDED.links;
        `;
        return new Response(JSON.stringify(newLinks), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      default:
        return new Response('Method Not Allowed', { status: 405 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}