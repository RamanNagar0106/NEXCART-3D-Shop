import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, sql, desc, asc, inArray } from "drizzle-orm";

const router = Router();

// GET /products
router.get("/products", async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      brand,
      rating,
      sort,
      page = "1",
      limit = "20",
      inStock,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: ReturnType<typeof eq>[] = [];

    if (category) {
      const cat = await db.query.categoriesTable.findFirst({ where: eq(categoriesTable.slug, category) });
      if (cat) conditions.push(eq(productsTable.categoryId, cat.id));
    }
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
    if (minPrice) conditions.push(gte(productsTable.price, minPrice));
    if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));
    if (brand) conditions.push(ilike(productsTable.brand, `%${brand}%`));
    if (inStock === "true") conditions.push(eq(productsTable.inStock, true));

    let orderBy;
    switch (sort) {
      case "price_asc": orderBy = asc(productsTable.price); break;
      case "price_desc": orderBy = desc(productsTable.price); break;
      case "rating": orderBy = desc(productsTable.rating); break;
      case "newest": orderBy = desc(productsTable.createdAt); break;
      default: orderBy = desc(productsTable.isFeatured);
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [products, countResult] = await Promise.all([
      db.select().from(productsTable)
        .where(where)
        .orderBy(orderBy)
        .limit(limitNum)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
    ]);

    const categories = await db.select({ id: categoriesTable.id, name: categoriesTable.name }).from(categoriesTable);
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    const total = Number(countResult[0]?.count ?? 0);

    return res.json({
      products: products.map(p => formatProduct(p, categoryMap)),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "listProducts error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /products/featured
router.get("/products/featured", async (req, res) => {
  try {
    const products = await db.select().from(productsTable)
      .where(eq(productsTable.isFeatured, true))
      .orderBy(desc(productsTable.rating))
      .limit(12);
    const categories = await db.select({ id: categoriesTable.id, name: categoriesTable.name }).from(categoriesTable);
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
    return res.json(products.map(p => formatProduct(p, categoryMap)));
  } catch (err) {
    req.log.error({ err }, "getFeaturedProducts error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /products/deals
router.get("/products/deals", async (req, res) => {
  try {
    const products = await db.select().from(productsTable)
      .where(eq(productsTable.isDeal, true))
      .orderBy(desc(productsTable.discountPercent))
      .limit(10);
    const categories = await db.select({ id: categoriesTable.id, name: categoriesTable.name }).from(categoriesTable);
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
    return res.json(products.map(p => formatProduct(p, categoryMap)));
  } catch (err) {
    req.log.error({ err }, "getDealsOfDay error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /products/:id
router.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await db.query.productsTable.findFirst({ where: eq(productsTable.id, id) });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const category = await db.query.categoriesTable.findFirst({ where: eq(categoriesTable.id, product.categoryId) });
    return res.json(formatProductDetail(product, category?.name ?? "General"));
  } catch (err) {
    req.log.error({ err }, "getProduct error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /products/:id/related
router.get("/products/:id/related", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await db.query.productsTable.findFirst({ where: eq(productsTable.id, id) });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const related = await db.select().from(productsTable)
      .where(and(eq(productsTable.categoryId, product.categoryId), sql`${productsTable.id} != ${id}`))
      .orderBy(desc(productsTable.rating))
      .limit(6);
    const categories = await db.select({ id: categoriesTable.id, name: categoriesTable.name }).from(categoriesTable);
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
    return res.json(related.map(p => formatProduct(p, categoryMap)));
  } catch (err) {
    req.log.error({ err }, "getRelatedProducts error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /stats/summary
router.get("/stats/summary", async (req, res) => {
  try {
    const [productCount, categoryCount, dealCount, brandsResult, avgRatingResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(productsTable),
      db.select({ count: sql<number>`count(*)` }).from(categoriesTable),
      db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.isDeal, true)),
      db.selectDistinct({ brand: productsTable.brand }).from(productsTable).limit(8),
      db.select({ avg: sql<number>`avg(${productsTable.rating})` }).from(productsTable),
    ]);
    return res.json({
      totalProducts: Number(productCount[0]?.count ?? 0),
      totalCategories: Number(categoryCount[0]?.count ?? 0),
      totalDeals: Number(dealCount[0]?.count ?? 0),
      topBrands: brandsResult.map(b => b.brand),
      avgRating: Math.round(Number(avgRatingResult[0]?.avg ?? 4.2) * 10) / 10,
    });
  } catch (err) {
    req.log.error({ err }, "getStoreSummary error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /search/suggestions
router.get("/search/suggestions", async (req, res) => {
  try {
    const q = (req.query.q as string) ?? "";
    if (!q || q.length < 2) return res.json([]);
    const products = await db.select({ name: productsTable.name, brand: productsTable.brand })
      .from(productsTable)
      .where(ilike(productsTable.name, `%${q}%`))
      .limit(8);
    const suggestions = [...new Set(products.map(p => p.name).concat(products.map(p => p.brand)))].slice(0, 8);
    return res.json(suggestions);
  } catch (err) {
    req.log.error({ err }, "getSearchSuggestions error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

function formatProduct(p: typeof productsTable.$inferSelect, categoryMap: Record<number, string>) {
  return {
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
  };
}

function formatProductDetail(p: typeof productsTable.$inferSelect, categoryName: string) {
  return {
    ...formatProduct(p, { [p.categoryId]: categoryName }),
    specifications: (p.specifications as Record<string, string>) ?? {},
    highlights: (p.highlights as string[]) ?? [],
    warranty: p.warranty,
    seller: p.seller,
  };
}

export default router;
