// lib/generateClassCode.ts
import { customAlphabet } from 'nanoid'

const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const generateShortCode = customAlphabet(alphabet, 6)

export async function generateUniqueClassCode(db: any): Promise<string> {
  let classCode: string = ''
  let isUnique = false

  while (!isUnique) {
    classCode = generateShortCode()
    const existing = await db.collection('classrooms').findOne({ classCode })
    if (!existing) {
      isUnique = true
    }
  }

  return classCode
}
