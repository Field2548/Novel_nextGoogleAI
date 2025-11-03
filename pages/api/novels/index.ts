import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { Novel } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Novel[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // This can be expanded with query params for filtering, pagination, etc.
  // e.g., /api/novels?tag=Fantasy&sortBy=views
  const { category } = req.query;

  try {
    const novels = await prisma.novel.findMany({
      // Example of simple filtering
      where: category ? {
        tags: {
          has: category as string,
        },
      } : {},
      include: {
        authors: {
          select: {
            user: {
              select: {
                user_id: true,
                username: true,
              }
            }
          }
        }
      },
      orderBy: {
        views: 'desc',
      },
      take: 12, // Arbitrary limit for now
    });

    // Map Prisma result to frontend type
    const formattedNovels = novels.map(n => ({
      ...n,
      // The first author is the primary one for now.
      // A more complex app would handle multiple authors gracefully.
      author: n.authors[0]?.user ?? { user_id: 0, username: 'Unknown' },
    }));

    res.status(200).json(formattedNovels as any);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch novels' });
  }
}
