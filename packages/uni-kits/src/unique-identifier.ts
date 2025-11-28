export function genUniqueIdentifier(): string {
  let seed = Date.now()

  return 'xxxx-xxxx-6xxx-yxxx-xxxx'.replace(/[xy]/g, (c) => {
    const r = (seed + Math.random() * 16) % 16 | 0
    seed = Math.floor(seed / 16)

    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}
