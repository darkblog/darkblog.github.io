export async function onRequest(context) {
  const url = new URL(context.request.url);
  const { pathname, search } = url;
  const origin = url.origin;

  // ==========================================
  // 📌 ریدایرکت‌های ۳۰۱ تکی
  // قالب: '/مسیر-قدیمی': '/مسیر-جدید',
  // ==========================================
  const singleRedirects = {
    '/blog/2026-5-10-126':          '/blog/126',
    '/api/comments':        '/sitemap.xml',
  };

  if (singleRedirects[pathname]) {
    const target = new URL(singleRedirects[pathname], origin);
    target.search = search;
    return Response.redirect(target.toString(), 301);
  }

  // ==========================================
  // فیدها → sitemap.xml
  // ==========================================
  const feedPaths = ['/rss', '/rss/', '/rss.xml', '/atom.xml',
                     '/feed', '/feed/', '/feed.xml', '/blog.xml'];
  if (feedPaths.includes(pathname)) {
    return Response.redirect(new URL('/sitemap.xml', origin).toString(), 301);
  }

  // ==========================================
  // آیکون‌ها → blog.svg
  // ==========================================
  if (pathname === '/blog/icon.png' || pathname === '/favicon.ico') {
    return Response.redirect(new URL('/blog.svg', origin).toString(), 301);
  }

  // ==========================================
  // مسیر عددی ریشه (مثل /81 یا /81/) → /blog/81
  // ==========================================
  const numMatch = pathname.match(/^\/(\d+)\/?$/);
  if (numMatch) {
    const target = new URL(`/blog/${numMatch[1]}`, origin);
    target.search = search;
    return Response.redirect(target.toString(), 301);
  }

  // ==========================================
  // biography → blog (مثل /biography/x → /blog/x)
  // ==========================================
  const bioMatch = pathname.match(/^\/biography\/(.+?)\/?$/);
  if (bioMatch) {
    const target = new URL(`/blog/${bioMatch[1]}`, origin);
    target.search = search;
    return Response.redirect(target.toString(), 301);
  }

  // ==========================================
  // حذف اسلش انتهایی (به‌جز صفحه اصلی "/")
  // ==========================================
  if (pathname !== '/' && pathname.endsWith('/')) {
    const cleanPath = pathname.replace(/\/+$/, '');
    const target = new URL(cleanPath, origin);
    target.search = search;
    return Response.redirect(target.toString(), 301);
  }

  return context.next();
}
