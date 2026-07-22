import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_PROJECT_URL || process.env.SUPABASE_URL || process.env.PROJECT_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_PROJECT_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.PROJECT_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Optional: Fetch user role to ensure they are an admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userRole || userRole.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect seller dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userRole || userRole.role !== 'seller') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/signup'],
}
