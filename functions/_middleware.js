export async function onRequest(context) {
  const url = new URL(context.request.url);
  const { pathname, search } = url;
  const origin = url.origin;

  // فیدها
  const feedPaths = ['/rss', '/rss/', '/rss.xml', '/atom.xml',
                     '/feed', '/feed/', '/feed.xml', '/blog.xml', '/api/comments'];
  if (feedPaths.includes(pathname)) {
    return Response.redirect(`${origin}/sitemap.xml`, 301);
  }

  // آیکون‌ها
  if (pathname === '/blog/icon.png' || pathname === '/favicon.ico') {
    return Response.redirect(`${origin}/blog.svg`, 301);
  }

  // مسیر عددی ریشه
  const numMatch = pathname.match(/^\/(\d+)\/?$/);
  if (numMatch) {
    return Response.redirect(`${origin}/blog/${numMatch[1]}${search}`, 301);
  }

  // biography → blog
  const bioMatch = pathname.match(/^\/biography\/(.+?)\/?$/);
  if (bioMatch) {
    return Response.redirect(`${origin}/blog/${bioMatch[1]}${search}`, 301);
  }

  // حذف اسلش انتهایی (به‌جز صفحه اصلی)
  if (pathname !== '/' && pathname.endsWith('/')) {
    return Response.redirect(`${origin}${pathname.replace(/\/+$/, '')}${search}`, 301);
  }

  return context.next();
}
