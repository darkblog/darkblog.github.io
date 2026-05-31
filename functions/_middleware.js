export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  
  const numericPostPattern = /^\/(\d+)\/?$/;
  const match = path.match(numericPostPattern);
  
  if (match) {
    const postId = match[1];
    return Response.redirect(
      `https://www.pasgah.org/blog/${postId}`,
      301
    );
  }
  
  if (path !== "/" && path.endsWith("/")) {
    const newPath = path.slice(0, -1);
    return Response.redirect(
      `https://www.pasgah.org${newPath}`,
      301
    );
  }
  
  return next();
}
