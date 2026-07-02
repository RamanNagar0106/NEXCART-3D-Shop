import { Router } from "express";
import { db } from "@workspace/db";
import { wishlistItemsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

// GET /wishlist
router.get("/wishlist", async (req, res) => {
  try {
    const sessionId = (req.query.sessionId as string) || "anonymous";
    const items = await db.select().from(wishlistItemsTable).where(eq(wishlistItemsTable.sessionId, sessionId));
    if (items.length === 0) return res.json([]);

    const productIds = items.map(i => i.productId);
    const products = await db.select().from(productsTable).where(
      sql`${productsTable.id} = ANY(${productIds})`
    );
    const categories = await db.select({ id: categoriesTable.id, name: categoriesTable.name }).from(categoriesTable);
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    return res.json(products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      discountPercent: p.discountPercent,
      imageUrl: p.imageUrl,
      images: (p.images as string[]) ?? [],
      brand: p.brand,
      categoryId: p.categoryId,
      categoryName: categoryMap[p.categoryId] ?? "General",
      rating: Number(p.rating),
      reviewCount: p.reviewCount,
      inStock: p.inStock,
      stockCount: p.stockCount,
      tags: (p.tags as string[]) ?? [],
      isFeatured: p.isFeatured,
      isDeal: p.isDeal,
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "getWishlist error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /wishlist/:productId
router.post("/wishlist/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const sessionId = req.body?.sessionId || "anonymous";

    const existing = await db.query.wishlistItemsTable.findFirst({
      where: and(eq(wishlistItemsTable.sessionId, sessionId), eq(wishlistItemsTable.productId, productId)),
    });

    if (!existing) {
      await db.insert(wishlistItemsTable).values({ sessionId, productId });
    }

    return res.json({ success: true, message: "Added to wishlist" });
  } catch (err) {
    req.log.error({ err }, "addToWishlist error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /wishlist/:productId
router.delete("/wishlist/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const sessionId = req.body?.sessionId || "anonymous";

    await db.delete(wishlistItemsTable).where(
      and(eq(wishlistItemsTable.sessionId, sessionId), eq(wishlistItemsTable.productId, productId))
    );

    return res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    req.log.error({ err }, "removeFromWishlist error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
