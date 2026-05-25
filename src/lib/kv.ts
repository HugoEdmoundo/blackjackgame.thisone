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

function resolveRedisUrl(): { url: string; token: string } {
  // Prefer KV_REST_API_URL if set (https:// format)
  if (process.env.KV_REST_API_URL) {
    return {
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN || "",
    }
  }

  const rawUrl = process.env.KV_URL || process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ""

  if (!rawUrl) {
    throw new Error("No KV/REDIS URL environment variable set")
  }

  // KV_URL from Vercel is in rediss://default:pass@host:port format.
  // @upstash/redis requires https://host:port.
  if (rawUrl.startsWith("rediss://") || rawUrl.startsWith("redis://")) {
    const parsed = new URL(rawUrl)
    const host = parsed.hostname || parsed.host
    const port = parsed.port || "443"
    return { url: `https://${host}:${port}`, token }
  }

  return { url: rawUrl, token }
}

async function createRedisStore(): Promise<Store> {
  const { Redis } = await import("@upstash/redis")
  const { url, token } = resolveRedisUrl()

  const redis = new Redis({ url, token })

  // Test the connection
  await redis.get("__health__")

  console.log("[kv] Redis connected")

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
}

let storePromise: Promise<Store> | null = null

async function getStore(): Promise<Store> {
  if (storePromise) return storePromise

  const isDev = process.env.NODE_ENV !== "production"

  storePromise = (async () => {
    try {
      return await createRedisStore()
    } catch (err) {
      if (isDev) {
        console.log("[kv] Redis unavailable, using in-memory store:", err)
        return new InMemoryStore()
      }
      // In production: throw hard so we see the error
      throw err
    }
  })()

  return storePromise
}

export const kv: Store = {
  get: (id) => getStore().then((s) => s.get(id)),
  set: (id, room) => getStore().then((s) => s.set(id, room)),
  delete: (id) => getStore().then((s) => s.delete(id)),
  getAll: () => getStore().then((s) => s.getAll()),
}