import { Room } from "./types"

const rooms = new Map<string, Room>()

export function getRoom(id: string): Room | undefined {
  return rooms.get(id)
}

export function setRoom(id: string, room: Room): void {
  rooms.set(id, room)
}

export function deleteRoom(id: string): void {
  rooms.delete(id)
}

export function getAllRooms(): Room[] {
  return Array.from(rooms.values())
}
