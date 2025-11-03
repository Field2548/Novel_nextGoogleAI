import { User, Novel, Episode, Review, Comment } from '../types';

// Helper for making API requests
async function fetchAPI<T>(url: string, options: RequestInit = {}): Promise<T> {
    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API call failed with status ${response.status}`);
    }
    return response.json();
}


export const apiService = {
  // Auth is handled by NextAuth, but we need a signup function
  signup: async (username: string, email: string, pass: string): Promise<User | null> => {
    return fetchAPI('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, password: pass }),
    });
  },

  // Reader APIs
  getRecommendedNovels: (): Promise<Novel[]> => {
    return fetchAPI('/api/novels?category=Recommended'); // Example category
  },

  getFantasyNovels: (): Promise<Novel[]> => {
    return fetchAPI('/api/novels?category=Fantasy'); // Example category
  },
  
  getNovelById: (id: number): Promise<Novel | undefined> => {
    return fetchAPI(`/api/novels/${id}`);
  },

  getEpisodesByNovelId: (novelId: number): Promise<Episode[]> => {
    return fetchAPI(`/api/novels/${novelId}/episodes`);
  },
  
  getEpisode: (novelId: number, episodeId: number): Promise<Episode | undefined> => {
    // Assuming an endpoint structure like this might be needed.
    // Let's reuse the general episodes fetch for now.
    // In a real app, you might have /api/episodes/[episodeId]
    return apiService.getEpisodesByNovelId(novelId).then(eps => eps.find(e => e.episode_id === episodeId));
  },
  
  getReviewsByNovelId: (novelId: number): Promise<Review[]> => {
      return fetchAPI(`/api/novels/${novelId}/reviews`);
  },
  
  getCommentsByEpisodeId: (episodeId: number): Promise<Comment[]> => {
      // Placeholder for comments API
      return Promise.resolve([]);
      // return fetchAPI(`/api/episodes/${episodeId}/comments`);
  },

  // Writer APIs
  getWriterNovels: (writerId: number): Promise<Novel[]> => {
    // This would need a dedicated endpoint, e.g., /api/writer/novels
    // For now, let's filter on the client, assuming we have all novels. This is not efficient.
    console.warn("apiService.getWriterNovels is not efficiently implemented yet.");
    return fetchAPI<Novel[]>('/api/novels').then(novels => 
        novels.filter(n => n.author.user_id === writerId)
    );
  }
};
