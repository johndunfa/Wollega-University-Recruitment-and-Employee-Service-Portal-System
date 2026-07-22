// pages/api/jobs/search.ts (or .js)
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required and must be a string.' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('mint_db');

    // Search job titles case-insensitive, partial match
    const jobs = await db.collection('Job')
      .find({ title: { $regex: q, $options: 'i' } })
      .limit(20) // limit results for performance
      .toArray();

    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}
