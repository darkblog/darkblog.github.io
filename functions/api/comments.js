function generateCommentId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

async function getComments(env, pageId) {
  const commentsListKey = `comments:${pageId}`;
  const commentIdsJson = await env.COMMENTS_KV.get(commentsListKey);
  const commentIds = commentIdsJson ? JSON.parse(commentIdsJson) : [];

  const comments = await Promise.all(
    commentIds.map(async (id) => {
      const commentData = await env.COMMENTS_KV.get(`comment:${id}`);
      return commentData ? JSON.parse(commentData) : null;
    })
  );
  return comments.filter(c => c !== null);
}

async function addComment(env, pageId, name, content, email) {
  const id = generateCommentId();
  const now = new Date().toISOString();
  const comment = {
    id,
    pageId,
    name: name.trim(),
    content: content.trim(),
    email: email ? email.trim() : null,
    createdAt: now,
    approved: true,
  };

  await env.COMMENTS_KV.put(`comment:${id}`, JSON.stringify(comment));

  const commentsListKey = `comments:${pageId}`;
  const existingIdsJson = await env.COMMENTS_KV.get(commentsListKey);
  const existingIds = existingIdsJson ? JSON.parse(existingIdsJson) : [];
  existingIds.push(id);
  await env.COMMENTS_KV.put(commentsListKey, JSON.stringify(existingIds));

  return comment;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://www.pasgah.org',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (method === 'GET') {
    const pageId = url.searchParams.get('page');
    if (!pageId) {
      return new Response(JSON.stringify({ error: 'Missing page parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const comments = await getComments(env, pageId);
    return new Response(JSON.stringify(comments), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  if (method === 'POST') {
    try {
      const body = await request.json();
      const { pageId, name, content, email } = body;

      if (!pageId || !name || !content) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      if (name.length > 50 || content.length > 1000) {
        return new Response(JSON.stringify({ error: 'Name or content too long' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const newComment = await addComment(env, pageId, name, content, email);
      return new Response(JSON.stringify(newComment), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
}
