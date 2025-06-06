import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { UserBookmark } from "../entities/UserBookmark";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// GET /api/bookmarks - Get user's bookmarks
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    if (!userId) {
      res.status(401).json({ error: "User ID required" });
      return;
    }

    const bookmarkRepository = AppDataSource.getRepository(UserBookmark);
    
    const bookmarks = await bookmarkRepository
      .createQueryBuilder("bookmark")
      .leftJoinAndSelect("bookmark.course", "course")
      .where("bookmark.userID = :userId", { userId })
      .getMany();

    const courseIds = bookmarks.map(bookmark => bookmark.courseID);
    
    res.json({ bookmarkedCourses: courseIds });
    return;
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
    return;
  }
});

// POST /api/bookmarks - Add a bookmark
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { courseId } = req.body;
    
    if (!userId || !courseId) {
      res.status(400).json({ error: "User ID and Course ID required" });
      return;
    }

    const bookmarkRepository = AppDataSource.getRepository(UserBookmark);
    
    // Check if bookmark already exists
    const existingBookmark = await bookmarkRepository.findOne({
      where: { userID: userId, courseID: courseId }
    });
    
    if (existingBookmark) {
      res.status(400).json({ error: "Course already bookmarked" });
      return;
    }

    // Create new bookmark
    const bookmark = new UserBookmark();
    bookmark.userID = userId;
    bookmark.courseID = courseId;
    
    await bookmarkRepository.save(bookmark);
    
    res.json({ message: "Bookmark added successfully" });
    return;
  } catch (error) {
    console.error("Error adding bookmark:", error);
    res.status(500).json({ error: "Failed to add bookmark" });
    return;
  }
});

// DELETE /api/bookmarks - Remove a bookmark
router.delete("/", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { courseId } = req.body;
    
    if (!userId || !courseId) {
      res.status(400).json({ error: "User ID and Course ID required" });
      return;
    }

    const bookmarkRepository = AppDataSource.getRepository(UserBookmark);
    
    const result = await bookmarkRepository.delete({
      userID: userId,
      courseID: courseId
    });
    
    if (result.affected === 0) {
      res.status(404).json({ error: "Bookmark not found" });
      return;
    }
    
    res.json({ message: "Bookmark removed successfully" });
    return;
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({ error: "Failed to remove bookmark" });
    return;
  }
});

export default router; 