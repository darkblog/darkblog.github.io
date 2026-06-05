export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  
  const bioPattern = /^\/biography\/(\d+)\/?$/;
  const bioMatch = path.match(bioPattern);
  
  if (bioMatch) {
    const postId = bioMatch[1];
    return Response.redirect(
      `https://www.pasgah.org/blog/${postId}`,
      301
    );
  }
  
  const numericPostPattern = /^\/(\d+)\/?$/;
  const numericMatch = path.match(numericPostPattern);
  
  if (numericMatch) {
    const postId = numericMatch[1];
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
  
  const response = await next();
  
  if (response.status === 404) {
    return Response.redirect('https://www.pasgah.org/blog/1', 301);
  }
  
  return response;
}
