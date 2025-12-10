import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [Google],
	pages: {
		signIn: '/',
		error: '/'
	},
	/* callbacks: {
		async session({ session, token }) {
			if (session.user && token.sub) {
				session.user.id = token.sub
			}
			return session
		},
		async jwt({ token }) {
			return token
		}
	} */
})
