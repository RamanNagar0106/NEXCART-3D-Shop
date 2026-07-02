import { pgTable, serial, text, numeric, integer, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  icon: text("icon"),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  discountPercent: integer("discount_percent"),
  imageUrl: text("image_url").notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  brand: text("brand").notNull(),
  categoryId: integer("category_id").notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("4.0"),
  reviewCount: integer("review_count").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  stockCount: integer("stock_count").notNull().default(100),
  tags: jsonb("tags").$type<string[]>().default([]),
  isFeatured: boolean("is_featured").notNull().default(false),
  isDeal: boolean("is_deal").notNull().default(false),
  specifications: jsonb("specifications").$type<Record<string, string>>().default({}),
  highlights: jsonb("highlights").$type<string[]>().default([]),
  warranty: text("warranty"),
  seller: text("seller").default("NEXCART Seller"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("products_category_idx").on(t.categoryId),
  index("products_brand_idx").on(t.brand),
]);

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });

export type Category = typeof categoriesTable.$inferSelect;
export type Product = typeof productsTable.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
