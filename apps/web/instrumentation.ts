export async function register() {
  // Runs once when the Next.js server starts.
  // Add any server-side initialization here (e.g. oRPC server-side client).
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Reserved for future server-side client setup if the API is ever
    // co-located in this Next.js app (see oRPC "Optimize SSR" docs).
  }
}
