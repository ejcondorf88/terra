import { promises as fs } from 'fs'
import { join } from 'path'

export interface StakeRecord {
  stakeId: string
  userId: string
  poolId: string
  amount: number
  status: string
  createdAt: string
}

export class StakeRepository {
  private file: string

  constructor(baseDir?: string) {
    if (baseDir) {
      this.file = join(baseDir, 'stakes.json')
    } else {
      this.file = join(__dirname, 'data', 'stakes.json')
    }
  }

  private async ensureFile() {
    try {
      await fs.mkdir(join(__dirname, 'data'), { recursive: true })
      await fs.access(this.file)
    } catch (e) {
      await fs.writeFile(this.file, '[]', 'utf8')
    }
  }

  private async readAll(): Promise<StakeRecord[]> {
    await this.ensureFile()
    const raw = await fs.readFile(this.file, 'utf8')
    try {
      return JSON.parse(raw) as StakeRecord[]
    } catch (e) {
      return []
    }
  }

  private async writeAll(items: StakeRecord[]) {
    await this.ensureFile()
    await fs.writeFile(this.file, JSON.stringify(items, null, 2), 'utf8')
  }

  async create(record: Omit<StakeRecord, 'stakeId'>): Promise<StakeRecord> {
    const items = await this.readAll()
    const stakeId = `st_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    const rec: StakeRecord = { stakeId, ...record }
    items.push(rec)
    await this.writeAll(items)
    return rec
  }

  async listByUser(userId: string): Promise<StakeRecord[]> {
    const items = await this.readAll()
    return items.filter(i => i.userId === userId)
  }
}
