// E2E example: login -> protected -> stake
// Supports CLI args or environment variables.

const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, value] = arg.replace(/^--/, '').split('=')
    return [key, value]
  }),
)

const LOGIN_URL = args.loginUrl || process.env.E2E_LOGIN_URL || 'http://localhost:3000/auth/login'
const PROTECTED_URL = args.protectedUrl || process.env.E2E_PROTECTED_URL || 'http://localhost:3000/users'
const STAKE_URL = args.stakeUrl || process.env.E2E_STAKE_URL || 'http://localhost:3000/wallet/finance/stake'
const EMAIL = args.email || process.env.E2E_EMAIL || 'admin@example.com'
const PASSWORD = args.password || process.env.E2E_PASSWORD || 'password'
const POOL_ID = args.poolId || process.env.E2E_POOL_ID || 'pool-1'
const AMOUNT = Number(args.amount || process.env.E2E_AMOUNT || '10')

async function run() {
  if (typeof fetch !== 'function') {
    console.error('Global fetch is not available in this Node runtime. Use Node 18+ or install node-fetch and adjust the script.')
    process.exit(2)
  }

  console.log('Login URL:', LOGIN_URL)
  const loginResp = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })

  if (!loginResp.ok) {
    console.error('Login failed', loginResp.status, await loginResp.text())
    process.exit(3)
  }

  const loginJson = await loginResp.json()
  const token = loginJson.access_token || loginJson.token || loginJson.accessToken
  if (!token) {
    console.error('No token in login response:', loginJson)
    process.exit(4)
  }
  console.log('Acquired token length:', token.length)

  console.log('Checking protected endpoint', PROTECTED_URL)
  const protectedResp = await fetch(PROTECTED_URL, { headers: { Authorization: `Bearer ${token}` } })
  if (!protectedResp.ok) {
    console.error('Protected endpoint failed', protectedResp.status, await protectedResp.text())
    process.exit(5)
  }
  console.log('Protected endpoint OK')

  console.log('Calling stake endpoint', STAKE_URL)
  const stakeResp = await fetch(STAKE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId: EMAIL, poolId: POOL_ID, amount: AMOUNT }),
  })

  if (!stakeResp.ok) {
    console.error('Stake failed', stakeResp.status, await stakeResp.text())
    process.exit(6)
  }

  const stakeJson = await stakeResp.json()
  console.log('Stake response:', stakeJson)
  if (!stakeJson.stakeId) {
    console.error('Stake response missing stakeId')
    process.exit(7)
  }

  console.log('E2E login->stake passed')
  process.exit(0)
}

run().catch(err => {
  console.error('E2E script error:', err)
  process.exit(1)
})
