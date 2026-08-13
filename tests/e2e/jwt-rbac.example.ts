// Example E2E test - uses global `fetch` (Node 18+) and supports environment variables or CLI args.
// Configure via environment variables, CLI args, or edit the defaults below.

const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, value] = arg.replace(/^--/, '').split('=')
    return [key, value]
  }),
)

const LOGIN_URL = args.loginUrl || process.env.E2E_LOGIN_URL || 'http://localhost:3000/auth/login'
const PROTECTED_URL = args.protectedUrl || process.env.E2E_PROTECTED_URL || 'http://localhost:3000/users'
const EMAIL = args.email || process.env.E2E_EMAIL || 'admin@example.com'
const PASSWORD = args.password || process.env.E2E_PASSWORD || 'password'

async function run() {
  if (typeof fetch !== 'function') {
    console.error('Global fetch is not available in this Node runtime. Use Node 18+ or install node-fetch and adjust the script.')
    process.exit(2)
  }

  console.log('Logging in to', LOGIN_URL)
  const loginResp = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })

  if (!loginResp.ok) {
    const text = await loginResp.text()
    console.error('Login failed', loginResp.status, text)
    process.exit(3)
  }

  const login = await loginResp.json()
  const token = login.access_token || login.token || login.accessToken
  if (!token) {
    console.error('Login response does not contain an access token:', login)
    process.exit(4)
  }
  console.log('Acquired token (length):', token.length)

  console.log('Calling protected endpoint', PROTECTED_URL)
  const protectedResp = await fetch(PROTECTED_URL, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })

  console.log('Protected status:', protectedResp.status)
  const body = await protectedResp.text()
  console.log('Protected body:', body)

  process.exit(protectedResp.ok ? 0 : 5)
}

run().catch(err => {
  console.error('E2E script error:', err)
  process.exit(1)
})
