export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/comments') {
    return new Response(null, { status: 410 });
  }

  if (path === '/blog.xml') {
    return Response.redirect('https://www.pasgah.org/sitemap.xml', 301);
  }

  if (path.includes('feed') || path.includes('rss') || path.includes('atom')) {
    return Response.redirect('https://www.pasgah.org/sitemap.xml', 301);
  }

  if (path === '/favicon.ico') {
    return Response.redirect('https://www.pasgah.org/blog.svg', 301);
  }

  if (path.startsWith('/biography/')) {
    const slug = path.replace('/biography/', '').replace(/\/$/, '');
    if (slug) {
      return Response.redirect(`https://www.pasgah.org/blog/${slug}`, 301);
    }
  }

  const numericPostPattern = /^\/(\d+)\/?$/;
  const numericMatch = path.match(numericPostPattern);
  if (numericMatch) {
    const postId = numericMatch[1];
    return Response.redirect(`https://www.pasgah.org/blog/${postId}`, 301);
  }

  if (path !== '/' && path.endsWith('/')) {
    const newPath = path.slice(0, -1);
    return Response.redirect(`https://www.pasgah.org${newPath}`, 301);
  }

  return next();
}
