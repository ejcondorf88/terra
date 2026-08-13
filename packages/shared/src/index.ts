export type SharedExample = {
  id: string
  name: string
}

export function createSharedExample(id: string, name: string): SharedExample {
  return { id, name }
}

export * from './auth.types'
export * from './metrics'
