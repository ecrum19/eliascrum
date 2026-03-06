export interface BlogPost {
  // Required fields for automated homepage update aggregation.
  id: string;
  title: string;
  dateIso: string; // YYYY-MM-DD
  summary: string;
  url: string;
  linkLabel: string;

  // Optional display metadata.
  category?: string;
}

// Add blog entries here. Keep dateIso in YYYY-MM-DD format.
export const blogPosts: BlogPost[] = [];

export function getBlogPostsSortedNewestFirst(posts: BlogPost[] = blogPosts): BlogPost[] {
  return [...posts].sort((a, b) => b.dateIso.localeCompare(a.dateIso));
}
