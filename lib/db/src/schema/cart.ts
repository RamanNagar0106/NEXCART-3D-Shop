import { pgTable, serial, text, numeric, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("cart_session_idx").on(t.sessionId),
]);

export const wishlistItemsTable = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("wishlist_session_idx").on(t.sessionId),
]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  status: text("status").notNull().default("pending"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  estimatedDelivery: text("estimated_delivery"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("orders_session_idx").on(t.sessionId),
]);

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });

export type CartItem = typeof cartItemsTable.$inferSelect;
export type WishlistItem = typeof wishlistItemsTable.$inferSelect;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
