// This should be at `api/posts.ts`
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
  const action = searchParams.get('action');

  try {
    const client = await db.connect();

    switch (req.method) {
      case 'GET': {
        if (id) {
            const { rows } = await client.sql`SELECT id, title, content, "featuredMedia", category, date, views, "linkClicks", socials, created_at as "createdAt" FROM news_articles WHERE id = ${id};`;
            return new Response(JSON.stringify(rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        const { rows } = await client.sql`SELECT id, title, content, "featuredMedia", category, date, views, "linkClicks", socials, created_at as "createdAt" FROM news_articles ORDER BY date DESC;`;
        return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      case 'POST': {
        if (action === 'view') {
          const { id: postId } = await req.json();
          await client.sql`UPDATE news_articles SET views = views + 1 WHERE id = ${postId};`;
          return new Response('View counted', { status: 200 });
        }
        if (action === 'click') {
          const { id: postId, platform } = await req.json();
          if (!['fb', 'insta', 'x'].includes(platform)) return new Response('Invalid platform', { status: 400 });
          
          await client.sql`
            UPDATE news_articles
            SET "linkClicks" = "linkClicks" || jsonb_build_object(${platform}, (("linkClicks"->>${platform})::int + 1))
            WHERE id = ${postId};
          `;
          return new Response('Click counted', { status: 200 });
        }
        
        if (!(await authMiddleware(req))) return new Response('Unauthorized', { status: 401 });

        const { title, content, featuredMedia, category, socials } = await req.json();
        const newId = uuidv4();
        const newDate = new Date().toISOString();
        const initialLinkClicks = { fb: 0, insta: 0, x: 0 };
        
        await client.sql`
          INSERT INTO news_articles (id, title, content, "featuredMedia", category, date, views, "linkClicks", socials)
          VALUES (${newId}, ${title}, ${content}, ${JSON.stringify(featuredMedia)}, ${category}, ${newDate}, 0, ${JSON.stringify(initialLinkClicks)}, ${JSON.stringify(socials)});
        `;
        const { rows } = await client.sql`SELECT * FROM news_articles WHERE id = ${newId};`;
        return new Response(JSON.stringify(rows[0]), { status: 201, headers: { 'Content-Type': 'application/json' } });
      }

      case 'PUT': {
        if (!(await authMiddleware(req))) return new Response('Unauthorized', { status: 401 });
        
        const { id, title, content, featuredMedia, category, socials, date, views, linkClicks } = await req.json();
        
        await client.sql`
          UPDATE news_articles
          SET title = ${title}, content = ${content}, "featuredMedia" = ${JSON.stringify(featuredMedia)}, category = ${category}, socials = ${JSON.stringify(socials)}, date = ${date}, views = ${views}, "linkClicks" = ${JSON.stringify(linkClicks)}
          WHERE id = ${id};
        `;
        const { rows } = await client.sql`SELECT * FROM news_articles WHERE id = ${id};`;
        return new Response(JSON.stringify(rows[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      case 'DELETE': {
        if (!id) return new Response('Bad Request: Missing ID', { status: 400 });
        if (!(await authMiddleware(req))) return new Response('Unauthorized', { status: 401 });
        
        await client.sql`DELETE FROM news_articles WHERE id = ${id};`;
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