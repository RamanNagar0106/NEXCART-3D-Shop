import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, bannersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

// GET /products/:productId/reviews
router.get("/products/:productId/reviews", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const reviews = await db.select().from(reviewsTable)
      .where(eq(reviewsTable.productId, productId))
      .orderBy(desc(reviewsTable.helpful));
    return res.json(reviews.map(r => ({
      id: r.id,
      productId: r.productId,
      rating: r.rating,
      title: r.title,
      body: r.body,
      author: r.author,
      verifiedPurchase: r.verifiedPurchase,
      helpful: r.helpful,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "listReviews error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /products/:productId/reviews
router.post("/products/:productId/reviews", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const { rating, title, body, author } = req.body;
    if (!rating || !title || !body || !author) {
      return res.status(400).json({ error: "rating, title, body, author required" });
    }

    const [review] = await db.insert(reviewsTable).values({
      productId,
      rating: parseInt(rating, 10),
      title,
      body,
      author,
      verifiedPurchase: false,
      helpful: 0,
    }).returning();

    return res.status(201).json({
      id: review.id,
      productId: review.productId,
      rating: review.rating,
      title: review.title,
      body: review.body,
      author: review.author,
      verifiedPurchase: review.verifiedPurchase,
      helpful: review.helpful,
      createdAt: review.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "createReview error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /banners
router.get("/banners", async (req, res) => {
  try {
    const banners = await db.select().from(bannersTable)
      .where(eq(bannersTable.isActive, true))
      .orderBy(bannersTable.sortOrder);
    return res.json(banners.map(b => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl,
      bgColor: b.bgColor,
      ctaText: b.ctaText,
    })));
  } catch (err) {
    req.log.error({ err }, "listBanners error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
