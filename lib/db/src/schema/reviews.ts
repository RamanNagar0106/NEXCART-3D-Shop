import { pgTable, serial, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  bgColor: text("bg_color").notNull().default("#1a237e"),
  ctaText: text("cta_text").notNull().default("Shop Now"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  author: text("author").notNull(),
  verifiedPurchase: boolean("verified_purchase").notNull().default(false),
  helpful: integer("helpful").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("reviews_product_idx").on(t.productId),
]);

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export const insertBannerSchema = createInsertSchema(bannersTable).omit({ id: true });

export type Review = typeof reviewsTable.$inferSelect;
export type Banner = typeof bannersTable.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
