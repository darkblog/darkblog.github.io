export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  
  // فقط مسیرهای عددی مثل /1 یا /256
  const numericPostPattern = /^\/(\d+)\/?$/;
  const match = path.match(numericPostPattern);
  
  if (match) {
    const postId = match[1];
    return Response.redirect(
      `https://www.pasgah.org/blog/${postId}`,
      301
    );
  }
  
  // اگه عددی نبود، ادامه بده
  return next();
}
