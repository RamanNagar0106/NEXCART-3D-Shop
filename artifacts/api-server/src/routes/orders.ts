import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

async function buildOrderWithItems(order: typeof ordersTable.$inferSelect) {
  const orderItems = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  const productIds = orderItems.map(i => i.productId);
  const products = productIds.length > 0
    ? await db.select().from(productsTable).where(sql`${productsTable.id} = ANY(${productIds})`)
    : [];
  const categories = await db.select({ id: categoriesTable.id, name: categoriesTable.name }).from(categoriesTable);
  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));

  const items = orderItems.map(item => {
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

  return {
    id: order.id,
    sessionId: order.sessionId,
    status: order.status,
    items,
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    deliveryAddress: order.deliveryAddress,
    paymentMethod: order.paymentMethod,
    estimatedDelivery: order.estimatedDelivery,
    createdAt: order.createdAt.toISOString(),
  };
}

// GET /orders
router.get("/orders", async (req, res) => {
  try {
    const sessionId = (req.query.sessionId as string) || "anonymous";
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.sessionId, sessionId));
    const result = await Promise.all(orders.map(buildOrderWithItems));
    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "listOrders error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /orders
router.post("/orders", async (req, res) => {
  try {
    const { sessionId = "anonymous", deliveryAddress, paymentMethod, items } = req.body;
    if (!deliveryAddress || !paymentMethod || !items?.length) {
      return res.status(400).json({ error: "deliveryAddress, paymentMethod, and items are required" });
    }

    const subtotal = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const total = subtotal + deliveryFee;

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 5);
    const estimatedDelivery = estimatedDate.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });

    const [order] = await db.insert(ordersTable).values({
      sessionId,
      status: "confirmed",
      subtotal: subtotal.toString(),
      discount: "0",
      deliveryFee: deliveryFee.toString(),
      total: total.toString(),
      deliveryAddress,
      paymentMethod,
      estimatedDelivery,
    }).returning();

    await db.insert(orderItemsTable).values(
      items.map((i: { productId: number; quantity: number; price: number }) => ({
        orderId: order.id,
        productId: i.productId,
        quantity: i.quantity,
        price: i.price.toString(),
      }))
    );

    // Clear cart
    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));

    return res.status(201).json(await buildOrderWithItems(order));
  } catch (err) {
    req.log.error({ err }, "createOrder error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /orders/:id
router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const sessionId = (req.query.sessionId as string) ?? "anonymous";
    const order = await db.query.ordersTable.findFirst({ where: eq(ordersTable.id, id) });
    if (!order) return res.status(404).json({ error: "Order not found" });
    // Verify session ownership to prevent IDOR
    if (order.sessionId !== sessionId) return res.status(403).json({ error: "Forbidden" });
    return res.json(await buildOrderWithItems(order));
  } catch (err) {
    req.log.error({ err }, "getOrder error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
