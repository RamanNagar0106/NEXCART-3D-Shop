import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

// GET /categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
    const counts = await db.select({
      categoryId: productsTable.categoryId,
      count: sql<number>`count(*)`,
    }).from(productsTable).groupBy(productsTable.categoryId);
    const countMap = Object.fromEntries(counts.map(c => [c.categoryId, Number(c.count)]));

    return res.json(categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      icon: c.icon,
      parentId: c.parentId,
      productCount: countMap[c.id] ?? 0,
    })));
  } catch (err) {
    req.log.error({ err }, "listCategories error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /categories/:slug/products
router.get("/categories/:slug/products", async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await db.query.categoriesTable.findFirst({ where: eq(categoriesTable.slug, slug) });
    if (!category) return res.status(404).json({ error: "Category not found" });

    const products = await db.select().from(productsTable)
      .where(eq(productsTable.categoryId, category.id))
      .limit(20);

    return res.json({
      products: products.map(p => ({
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
        categoryName: category.name,
        rating: Number(p.rating),
        reviewCount: p.reviewCount,
        inStock: p.inStock,
        stockCount: p.stockCount,
        tags: (p.tags as string[]) ?? [],
        isFeatured: p.isFeatured,
        isDeal: p.isDeal,
        createdAt: p.createdAt.toISOString(),
      })),
      total: products.length,
      page: 1,
      totalPages: 1,
    });
  } catch (err) {
    req.log.error({ err }, "getCategoryProducts error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
