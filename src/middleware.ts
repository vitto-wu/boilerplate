import { auth } from '@/auth'

export default auth((req) => {
	const isLoggedIn = !!req.auth
	const isPublicRoute = req.nextUrl.pathname === '/'

	if (!isLoggedIn && !isPublicRoute) {
		return Response.redirect(new URL('/', req.nextUrl.origin))
	}

	if (isLoggedIn && isPublicRoute) {
		return Response.redirect(new URL('/dashboard', req.nextUrl.origin))
	}
})

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
