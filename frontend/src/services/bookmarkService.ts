// Frontend service for managing bookmarks via API

const API_BASE = "http://localhost:5000/api";

export interface BookmarkResponse {
  bookmarkedCourses: string[];
}

export interface MessageResponse {
  message: string;
}

export const bookmarkService = {
  // Get user's bookmarks
  async getBookmarks(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE}/bookmarks`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookmarks");
      }

      const data: BookmarkResponse = await response.json();
      return data.bookmarkedCourses;
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      throw error;
    }
  },

  // Add a bookmark
  async addBookmark(courseId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add bookmark");
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
      throw error;
    }
  },

  // Remove a bookmark
  async removeBookmark(courseId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/bookmarks`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove bookmark");
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
      throw error;
    }
  },

  // Toggle bookmark (add if not bookmarked, remove if bookmarked)
  async toggleBookmark(courseId: string, isCurrentlyBookmarked: boolean): Promise<void> {
    if (isCurrentlyBookmarked) {
      await this.removeBookmark(courseId);
    } else {
      await this.addBookmark(courseId);
    }
  },
}; 