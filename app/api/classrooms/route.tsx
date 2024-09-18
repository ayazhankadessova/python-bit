import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')

    const classrooms = await db.collection('classrooms').find({}).toArray()

    res.json(classrooms)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Unable to fetch classrooms' })
  }
}
