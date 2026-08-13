import { mkdtempSync, rmSync } from 'fs'
import { join } from 'path'
import os from 'os'
import { StakeRepository } from '../../TERRA X CHANGE/wallet/finance/stake.repository'

describe('StakeRepository', () => {
  const tmpBase = mkdtempSync(join(os.tmpdir(), 'terra-test-'))
  const baseDir = join(tmpBase, 'stakes')

  afterAll(() => {
    try {
      rmSync(tmpBase, { recursive: true, force: true })
    } catch (e) {}
  })

  test('creates and lists stakes by user', async () => {
    const repo = new StakeRepository(baseDir)
    const rec1 = await repo.create({ userId: 'u1', poolId: 'pool-1', amount: 100, status: 'active', createdAt: new Date().toISOString() })
    const rec2 = await repo.create({ userId: 'u2', poolId: 'pool-1', amount: 50, status: 'active', createdAt: new Date().toISOString() })

    expect(rec1.stakeId).toBeDefined()
    const listU1 = await repo.listByUser('u1')
    expect(listU1.length).toBe(1)
    expect(listU1[0].userId).toBe('u1')
  })
})
