import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { Episode } from '../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Episode[] | { error: string }>
) {
  const { novelId } = req.query;
  const id = parseInt(novelId as string);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const episodes = await prisma.episode.findMany({
      where: { novel_id: id },
      orderBy: {
        release_date: 'asc',
      },
    });
    
    res.status(200).json(episodes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
}
