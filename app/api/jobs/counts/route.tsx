// pages/api/jobs/counts.ts (or .js)

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await connectToDatabase();
    const db = client.db('mint_db');

    // Aggregate counts for each filter

    // Job Type counts
    const jobTypeCounts = await db.collection('jobs').aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]).toArray();

    // Job Functions counts (assuming stored in 'category' field)
    const jobFunctionCounts = await db.collection('jobs').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();

    // Experience Level counts (assuming stored in 'experienceLevel' field)
    const experienceLevelCounts = await db.collection('jobs').aggregate([
      { $group: { _id: '$experienceLevel', count: { $sum: 1 } } }
    ]).toArray();

    res.status(200).json({
      jobTypeCounts,
      jobFunctionCounts,
      experienceLevelCounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch counts' });
  }
}
