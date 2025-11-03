
import { User, Novel, Episode, Review, Comment, UserRole } from '../types';

export const mockUsers: User[] = [
  { user_id: 1, username: 'ReaderJoe', email: 'reader@test.com', role: UserRole.READER, created_at: '2023-01-15T09:30:00Z', profile_picture: 'https://picsum.photos/seed/user1/100/100' },
  { user_id: 2, username: 'WriterJane', email: 'writer@test.com', role: UserRole.WRITER, created_at: '2023-02-20T14:00:00Z', profile_picture: 'https://picsum.photos/seed/user2/100/100', bio: 'Avid writer of fantasy.' },
  { user_id: 3, username: 'AdminAlex', email: 'admin@test.com', role: UserRole.ADMIN, created_at: '2023-01-10T08:00:00Z', profile_picture: 'https://picsum.photos/seed/user3/100/100' },
  { user_id: 4, username: 'DevSam', email: 'dev@test.com', role: UserRole.DEVELOPER, created_at: '2023-03-05T18:45:00Z', profile_picture: 'https://picsum.photos/seed/user4/100/100' },
];

export const mockNovels: Novel[] = Array.from({ length: 12 }, (_, i) => ({
  novel_id: 101 + i,
  title: `The Crimson Cipher ${i + 1}`,
  description: 'A thrilling adventure in a world of ancient magic and futuristic technology. A young hero must decode the secrets of a powerful artifact before it falls into the wrong hands.',
  cover_image: `https://picsum.photos/seed/novel${i}/400/600`,
  tags: ['Fantasy', 'Adventure', 'Sci-Fi'],
  status: i % 3 === 0 ? 'Completed' : 'Ongoing',
  last_update: new Date(Date.now() - i * 1000 * 3600 * 24).toISOString(),
  views: 16458 + i * 123,
  likes: 2010 + i * 45,
  rating: parseFloat((4.5 - i * 0.1).toFixed(2)),
  author: { user_id: 2, username: 'WriterJane' },
}));

export const mockEpisodes: Episode[] = mockNovels.flatMap(novel => 
  Array.from({ length: 5 }, (_, i) => ({
    episode_id: novel.novel_id * 100 + i + 1,
    novel_id: novel.novel_id,
    title: `Chapter ${i + 1}: The Discovery`,
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque a libero sit amet tortor sagittis maximus nec eu felis. In hac habitasse platea dictumst. Sed vitae feugiat quam, id rhoncus ante. Vivamus rhoncus, justo eget ullamcorper feugiat, enim orci blandit ex, et malesuada enim nulla et ex. ${'Lorem ipsum '.repeat(200)}`,
    is_locked: i > 2,
    price: 10,
    release_date: new Date(Date.now() - (5-i) * 1000 * 3600 * 24 * 7).toISOString(),
  }))
);

export const mockReviews: Review[] = [
  { review_id: 1, novel_id: 101, user: mockUsers[0], rating: 5, comment: 'Absolutely amazing! I couldn\'t put it down.', created_at: '2023-10-01T12:34:56Z' },
  { review_id: 2, novel_id: 101, user: { user_id: 5, username: 'CriticCarl', profile_picture: 'https://picsum.photos/seed/user5/100/100' }, rating: 4, comment: 'A solid read with great world-building.', created_at: '2023-10-02T15:20:11Z' },
];

export const mockComments: Comment[] = [
    { comment_id: 1, episode_id: 10101, user: mockUsers[0], content: "What a cliffhanger!", created_at: new Date(Date.now() - 1000 * 3600 * 24 * 2).toISOString(), replies: [
        { comment_id: 3, episode_id: 10101, user: mockUsers[1], parent_comment_id: 1, content: "Glad you enjoyed it!", created_at: new Date(Date.now() - 1000 * 3600 * 24 * 1).toISOString() }
    ]},
    { comment_id: 2, episode_id: 10101, user: {user_id: 6, username: 'FanGirl', profile_picture: 'https://picsum.photos/seed/user6/100/100' }, content: "I can't wait for the next chapter!", created_at: new Date(Date.now() - 1000 * 3600 * 24 * 3).toISOString() }
];
