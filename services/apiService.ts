
import { User, Novel, Episode, Review, Comment, UserRole } from '../types';
import { mockUsers, mockNovels, mockEpisodes, mockReviews, mockComments } from './mockData';

const delay = <T,>(data: T, ms = 500): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), ms));

export const apiService = {
  login: async (email: string, pass: string): Promise<User | null> => {
    console.log(`Attempting login for: ${email}`);
    // In a real app, this would be a POST request with password hashing.
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      return delay(user);
    }
    // Simulate role-based login for easy testing
    if (email === 'reader@test.com') return delay(mockUsers.find(u => u.role === UserRole.READER)!);
    if (email === 'writer@test.com') return delay(mockUsers.find(u => u.role === UserRole.WRITER)!);
    if (email === 'admin@test.com') return delay(mockUsers.find(u => u.role === UserRole.ADMIN)!);
    if (email === 'dev@test.com') return delay(mockUsers.find(u => u.role === UserRole.DEVELOPER)!);

    throw new Error('User not found');
  },
  
  signup: async (username: string, email: string, pass: string): Promise<User | null> => {
    const newUser: User = {
        user_id: Math.max(...mockUsers.map(u => u.user_id)) + 1,
        username,
        email,
        role: UserRole.READER,
        created_at: new Date().toISOString(),
        profile_picture: `https://picsum.photos/seed/user${Math.random()}/100/100`
    };
    mockUsers.push(newUser);
    return delay(newUser);
  },

  getRecommendedNovels: (): Promise<Novel[]> => {
    return delay(mockNovels.slice(0, 6));
  },

  getFantasyNovels: (): Promise<Novel[]> => {
    return delay(mockNovels.slice(6, 12));
  },
  
  getNovelById: (id: number): Promise<Novel | undefined> => {
    return delay(mockNovels.find(n => n.novel_id === id));
  },

  getEpisodesByNovelId: (novelId: number): Promise<Episode[]> => {
    return delay(mockEpisodes.filter(e => e.novel_id === novelId));
  },
  
  getEpisode: (novelId: number, episodeId: number): Promise<Episode | undefined> => {
      return delay(mockEpisodes.find(e => e.novel_id === novelId && e.episode_id === episodeId));
  },
  
  getReviewsByNovelId: (novelId: number): Promise<Review[]> => {
      return delay(mockReviews.filter(r => r.novel_id === novelId));
  },
  
  getCommentsByEpisodeId: (episodeId: number): Promise<Comment[]> => {
      return delay(mockComments.filter(c => c.episode_id === episodeId));
  },

  getWriterNovels: (writerId: number): Promise<Novel[]> => {
    return delay(mockNovels.filter(n => n.author.user_id === writerId));
  }
};
