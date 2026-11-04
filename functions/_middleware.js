export async function onRequest(context) {
  const url = new URL(context.request.url);
  const { pathname, search } = url;
  const origin = url.origin;

  // ==========================================
  // 📌 ریدایرکت‌های ۳۰۱ تکی
  // قالب: '/مسیر-قدیمی': '/مسیر-جدید',
  // ==========================================
  const singleRedirects = {
    '/blog/2026-5-19-190':          '/blog/190',
    '/api/comments':        '/sitemap.xml',
    '/gftrdft':             'https://telegra.ph/%D8%AA%D8%A7%DA%A9%D8%B1-%DA%A9%D8%A7%D8%B1%D9%84%D8%B3%D9%88%D9%86-%D8%AD%D9%85%D9%84%D9%87-%D8%A7%D8%AA%D9%85%DB%8C-%D8%A2%D9%85%D8%B1%DB%8C%DA%A9%D8%A7-%D8%B9%D9%84%DB%8C%D9%87-%D8%A7%DB%8C%D8%B1%D8%A7%D9%86-11-03',
    '/45ftgy':              'https://tangled.org/ehsanchehri.tngl.sh',
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
