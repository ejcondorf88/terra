// Performance E2E example - measures login and protected endpoint latency.
// Supports CLI args or environment variables.

const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, value] = arg.replace(/^--/, '').split('=')
    return [key, value]
  }),
)

const LOGIN_URL = args.loginUrl || process.env.PERF_LOGIN_URL || 'http://localhost:3000/auth/login'
const PROTECTED_URL = args.protectedUrl || process.env.PERF_PROTECTED_URL || 'http://localhost:3000/users'
const EMAIL = args.email || process.env.PERF_EMAIL || 'admin@example.com'
const PASSWORD = args.password || process.env.PERF_PASSWORD || 'password'
const LOGIN_THRESHOLD_MS = Number(args.loginThreshold || process.env.PERF_LOGIN_THRESHOLD_MS || '500')
const PROTECTED_THRESHOLD_MS = Number(args.protectedThreshold || process.env.PERF_PROTECTED_THRESHOLD_MS || '250')
const TOTAL_THRESHOLD_MS = Number(args.totalThreshold || process.env.PERF_TOTAL_THRESHOLD_MS || '800')

const now = () => Number(process.hrtime.bigint() / BigInt(1_000_000))

async function run() {
  if (typeof fetch !== 'function') {
    console.error('Global fetch is not available in this Node runtime. Use Node 18+ or install node-fetch and adjust the script.')
    process.exit(2)
  }

  console.log('Performance test start')
  console.log(`Login URL: ${LOGIN_URL}`)
  console.log(`Protected URL: ${PROTECTED_URL}`)
  console.log(`Thresholds: login=${LOGIN_THRESHOLD_MS}ms protected=${PROTECTED_THRESHOLD_MS}ms total=${TOTAL_THRESHOLD_MS}ms`)

  const startTotal = now()

  const loginStart = now()
  const loginResp = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const loginEnd = now()
  const loginDuration = loginEnd - loginStart
  console.log(`Login status: ${loginResp.status}, duration=${loginDuration}ms`)

  if (!loginResp.ok) {
    const text = await loginResp.text()
    console.error('Login failed:', loginResp.status, text)
    process.exit(3)
  }

  const loginJson = await loginResp.json()
  const token = loginJson.access_token || loginJson.token || loginJson.accessToken
  if (!token) {
    console.error('Login response does not contain an access token:', loginJson)
    process.exit(4)
  }

  const protectedStart = now()
  const protectedResp = await fetch(PROTECTED_URL, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
  const protectedEnd = now()
  const protectedDuration = protectedEnd - protectedStart
  console.log(`Protected endpoint status: ${protectedResp.status}, duration=${protectedDuration}ms`)

  if (!protectedResp.ok) {
    const text = await protectedResp.text()
    console.error('Protected endpoint failed:', protectedResp.status, text)
    process.exit(5)
  }

  const body = await protectedResp.text()
  const totalDuration = now() - startTotal

  console.log('Response body length:', body.length)
  console.log('Performance summary:')
  console.log(`  login: ${loginDuration}ms`)
  console.log(`  protected: ${protectedDuration}ms`)
  console.log(`  total: ${totalDuration}ms`)

  let exitCode = 0
  if (loginDuration > LOGIN_THRESHOLD_MS) {
    console.warn(`Login latency above threshold: ${loginDuration}ms > ${LOGIN_THRESHOLD_MS}ms`)
    exitCode = 6
  }
  if (protectedDuration > PROTECTED_THRESHOLD_MS) {
    console.warn(`Protected endpoint latency above threshold: ${protectedDuration}ms > ${PROTECTED_THRESHOLD_MS}ms`)
    exitCode = Math.max(exitCode, 7)
  }
  if (totalDuration > TOTAL_THRESHOLD_MS) {
    console.warn(`Total flow latency above threshold: ${totalDuration}ms > ${TOTAL_THRESHOLD_MS}ms`)
    exitCode = Math.max(exitCode, 8)
  }

  if (exitCode === 0) {
    console.log('Performance test passed within thresholds.')
  } else {
    console.warn('Performance test failed threshold checks.')
  }

  process.exit(exitCode)
}

run().catch(err => {
  console.error('Performance test error:', err)
  process.exit(1)
})
