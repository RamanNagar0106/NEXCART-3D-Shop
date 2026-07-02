import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

async function buildCartResponse(sessionId: string) {
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));
  if (items.length === 0) {
    return { items: [], subtotal: 0, discount: 0, deliveryFee: 0, total: 0, itemCount: 0 };
  }

  const productIds = items.map(i => i.productId);
  const products = await db.select().from(productsTable).where(
    sql`${productsTable.id} = ANY(${productIds})`
  );
  const categories = await db.select({ id: categoriesTable.id, name: categoriesTable.name }).from(categoriesTable);
  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));

  const cartItems = items.map(item => {
    const product = productMap[item.productId];
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.price),
      product: product ? {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        discountPercent: product.discountPercent,
        imageUrl: product.imageUrl,
        images: (product.images as string[]) ?? [],
        brand: product.brand,
        categoryId: product.categoryId,
        categoryName: categoryMap[product.categoryId] ?? "General",
        rating: Number(product.rating),
        reviewCount: product.reviewCount,
        inStock: product.inStock,
        stockCount: product.stockCount,
        tags: (product.tags as string[]) ?? [],
        isFeatured: product.isFeatured,
        isDeal: product.isDeal,
        createdAt: product.createdAt.toISOString(),
      } : null,
    };
  }).filter(i => i.product !== null);

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const originalSubtotal = cartItems.reduce((sum, i) => {
    const prod = productMap[i.productId];
    const orig = prod?.originalPrice ? Number(prod.originalPrice) : i.price;
    return sum + orig * i.quantity;
  }, 0);
  const discount = Math.max(0, originalSubtotal - subtotal);
  const deliveryFee = subtotal >= 499 ? 0 : 49;
  const total = subtotal + deliveryFee;
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return { items: cartItems, subtotal, discount, deliveryFee, total, itemCount };
}

// GET /cart
router.get("/cart", async (req, res) => {
  try {
    const sessionId = (req.query.sessionId as string) || "anonymous";
    return res.json(await buildCartResponse(sessionId));
  } catch (err) {
    req.log.error({ err }, "getCart error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /cart/items
router.post("/cart/items", async (req, res) => {
  try {
    const { productId, quantity, sessionId = "anonymous" } = req.body;
    if (!productId || !quantity) return res.status(400).json({ error: "productId and quantity required" });

    const product = await db.query.productsTable.findFirst({ where: eq(productsTable.id, productId) });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const existing = await db.query.cartItemsTable.findFirst({
      where: and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)),
    });

    if (existing) {
      await db.update(cartItemsTable)
        .set({ quantity: existing.quantity + quantity, updatedAt: new Date() })
        .where(eq(cartItemsTable.id, existing.id));
    } else {
      await db.insert(cartItemsTable).values({
        sessionId,
        productId,
        quantity,
        price: product.price,
        updatedAt: new Date(),
      });
    }

    return res.json(await buildCartResponse(sessionId));
  } catch (err) {
    req.log.error({ err }, "addToCart error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /cart/items/:productId
router.patch("/cart/items/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const { quantity, sessionId = "anonymous" } = req.body;

    if (quantity <= 0) {
      await db.delete(cartItemsTable).where(
        and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId))
      );
    } else {
      await db.update(cartItemsTable)
        .set({ quantity, updatedAt: new Date() })
        .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)));
    }

    return res.json(await buildCartResponse(sessionId));
  } catch (err) {
    req.log.error({ err }, "updateCartItem error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /cart/items/:productId
router.delete("/cart/items/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const sessionId = req.body?.sessionId ?? (req.query.sessionId as string) ?? "anonymous";

    await db.delete(cartItemsTable).where(
      and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId))
    );

    return res.json(await buildCartResponse(sessionId));
  } catch (err) {
    req.log.error({ err }, "removeFromCart error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /cart/clear
router.delete("/cart/clear", async (req, res) => {
  try {
    const sessionId = (req.query.sessionId as string) ?? req.body?.sessionId ?? "anonymous";
    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));
    return res.json({ items: [], subtotal: 0, discount: 0, deliveryFee: 0, total: 0, itemCount: 0 });
  } catch (err) {
    req.log.error({ err }, "clearCart error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
