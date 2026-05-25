import { Room } from "./types"

interface Store {
  get(id: string): Promise<Room | undefined>
  set(id: string, room: Room): Promise<void>
  delete(id: string): Promise<void>
  getAll(): Promise<Room[]>
}

const GLOBAL_KEY = "__blackjack_store__"

function getGlobalStore(): Map<string, Room> {
  if (typeof globalThis !== "undefined") {
    if (!(globalThis as any)[GLOBAL_KEY]) {
      ;(globalThis as any)[GLOBAL_KEY] = new Map<string, Room>()
    }
    return (globalThis as any)[GLOBAL_KEY]
  }
  return new Map<string, Room>()
}

class InMemoryStore implements Store {
  private rooms = getGlobalStore()

  async get(id: string): Promise<Room | undefined> {
    return this.rooms.get(id)
  }

  async set(id: string, room: Room): Promise<void> {
    this.rooms.set(id, room)
  }

  async delete(id: string): Promise<void> {
    this.rooms.delete(id)
  }

  async getAll(): Promise<Room[]> {
    return Array.from(this.rooms.values())
  }
}

async function createRedisStore(): Promise<Store | null> {
  try {
    const hasKV = !!(process.env.KV_URL || process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL)
    const hasToken = !!(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)
    if (!hasKV) {
      console.log("[kv] No KV_URL env var — falling back to in-memory")
      return null
    }

    const { Redis } = await import("@upstash/redis")
    const url = (process.env.KV_URL || process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL)!
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ""

    console.log("[kv] Connecting to Redis:", url.slice(0, 20) + "...", "token set:", !!token)

    const redis = new Redis({ url, token })

    // Test the connection
    await redis.get("__health__")

    console.log("[kv] Redis connected successfully")

    return {
      async get(id: string) {
        const data = await redis.get(`room:${id}`)
        return data ? (data as unknown as Room) : undefined
      },
      async set(id: string, room: Room) {
        await redis.set(`room:${id}`, JSON.parse(JSON.stringify(room)))
      },
      async delete(id: string) {
        await redis.del(`room:${id}`)
      },
      async getAll() {
        const keys = await redis.keys("room:*")
        if (keys.length === 0) return []
        const data = await redis.mget<unknown[]>(...keys)
        return data.filter(Boolean) as Room[]
      },
    }
  } catch (err) {
    console.error("[kv] Redis store error:", err)
    return null
  }
}

let storePromise: Promise<Store> | null = null

async function getStore(): Promise<Store> {
  if (storePromise) return storePromise

  storePromise = (async () => {
    const redis = await createRedisStore()
    if (redis) return redis
    console.log("No Redis available, using in-memory store")
    return new InMemoryStore()
  })()

  return storePromise
}

export const kv: Store = {
  get: (id) => getStore().then((s) => s.get(id)),
  set: (id, room) => getStore().then((s) => s.set(id, room)),
  delete: (id) => getStore().then((s) => s.delete(id)),
  getAll: () => getStore().then((s) => s.getAll()),
}
