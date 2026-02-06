import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('token')
  const isAuthed = !!tokenCookie?.value
  const pathname = request.nextUrl.pathname

  // Proteger les routes /app/*
  if (pathname.startsWith('/app') && !isAuthed) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Rediriger les utilisateurs connectes loin des pages auth
  if ((pathname === '/auth/login' || pathname === '/auth/signup') && isAuthed) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/auth/login', '/auth/signup'],
}
