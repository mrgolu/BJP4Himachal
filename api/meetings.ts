// This should be at `api/meetings.ts`
import { db, sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

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
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    const client = await db.connect();

    switch (req.method) {
      case 'GET': {
        const { rows } = await client.sql`SELECT id, title, type, date, location, description, link, invited, created_at as "createdAt" FROM meetings ORDER BY date DESC;`;
        return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      case 'POST': {
        if (!(await authMiddleware(req))) {
          return new Response('Unauthorized', { status: 401 });
        }
        const { title, type, date, location, description, link, invited } = await req.json();
        const newId = uuidv4();
        
        await client.sql`
          INSERT INTO meetings (id, title, type, date, location, description, link, invited)
          VALUES (${newId}, ${title}, ${type}, ${date}, ${location}, ${description}, ${link}, ${invited});
        `;
        const { rows } = await client.sql`SELECT id, title, type, date, location, description, link, invited, created_at as "createdAt" FROM meetings WHERE id = ${newId};`;
        return new Response(JSON.stringify(rows[0]), { status: 201, headers: { 'Content-Type': 'application/json' } });
      }

      case 'PUT': {
        if (!(await authMiddleware(req))) {
          return new Response('Unauthorized', { status: 401 });
        }
        const { id, title, type, date, location, description, link, invited } = await req.json();
        
        await client.sql`
          UPDATE meetings
          SET title = ${title}, type = ${type}, date = ${date}, location = ${location}, description = ${description}, link = ${link}, invited = ${invited}
          WHERE id = ${id};
        `;
        const { rows } = await client.sql`SELECT id, title, type, date, location, description, link, invited, created_at as "createdAt" FROM meetings WHERE id = ${id};`;
        return new Response(JSON.stringify(rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      case 'DELETE': {
        if (!id) return new Response('Bad Request: Missing ID', { status: 400 });
        if (!(await authMiddleware(req))) {
          return new Response('Unauthorized', { status: 401 });
        }
        await client.sql`DELETE FROM meetings WHERE id = ${id};`;
        return new Response(null, { status: 204 });
      }

      default:
        return new Response('Method Not Allowed', { status: 405 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}