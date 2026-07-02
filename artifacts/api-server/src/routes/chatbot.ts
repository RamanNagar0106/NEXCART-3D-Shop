import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { ilike, sql } from "drizzle-orm";

const router = Router();

const GREETINGS = ["hello", "hi", "hey", "namaste", "hola"];
const CART_KEYWORDS = ["cart", "bag", "basket", "add"];
const ORDER_KEYWORDS = ["order", "delivery", "track", "shipped", "status"];
const RETURN_KEYWORDS = ["return", "refund", "cancel", "exchange"];
const HELP_KEYWORDS = ["help", "support", "issue", "problem", "contact"];

// POST /chatbot/message
router.post("/chatbot/message", async (req, res) => {
  try {
    const { message = "" } = req.body;
    const lower = message.toLowerCase();

    let reply = "";
    let suggestions: string[] = [];
    let productIds: number[] = [];

    if (GREETINGS.some(g => lower.includes(g))) {
      reply = "Hello! Welcome to NEXCART. I am your shopping assistant. I can help you find products, track orders, or answer any questions. What are you looking for today?";
      suggestions = ["Show me today's deals", "Help me find electronics", "Track my order", "What's trending?"];
    } else if (ORDER_KEYWORDS.some(k => lower.includes(k))) {
      reply = "You can track your orders by visiting the 'My Orders' section. Go to the Orders page from the navigation menu and you will see real-time status updates for all your orders including estimated delivery dates.";
      suggestions = ["View my orders", "Cancel an order", "Return policy", "Contact support"];
    } else if (RETURN_KEYWORDS.some(k => lower.includes(k))) {
      reply = "NEXCART offers a 10-day easy return policy on most products. Simply go to My Orders, select the item, and click 'Return/Exchange'. Our team will arrange a pickup within 2-3 business days.";
      suggestions = ["Start a return", "Refund timeline", "Exchange policy", "Contact support"];
    } else if (CART_KEYWORDS.some(k => lower.includes(k))) {
      reply = "You can add products to your cart directly from the product page or listing. Your cart is saved automatically. To checkout, visit your cart and follow the steps to place your order.";
      suggestions = ["View my cart", "Apply coupon", "Check delivery", "Payment options"];
    } else if (HELP_KEYWORDS.some(k => lower.includes(k))) {
      reply = "I am here to help! You can reach NEXCART customer support at support@nexcart.in or call 1800-XXX-XXXX (9 AM to 9 PM, Monday to Saturday). Average response time is under 2 hours.";
      suggestions = ["Track my order", "Return a product", "Payment issue", "Report a problem"];
    } else {
      // Search for products matching the message
      const searchTerms = message.split(" ").filter((w: string) => w.length > 2).slice(0, 3);
      const searchQuery = searchTerms.join(" ");

      const matchedProducts = searchQuery.length > 0
        ? await db.select({ id: productsTable.id, name: productsTable.name })
            .from(productsTable)
            .where(ilike(productsTable.name, `%${searchQuery}%`))
            .limit(4)
        : [];

      if (matchedProducts.length > 0) {
        productIds = matchedProducts.map(p => p.id);
        reply = `I found ${matchedProducts.length} product(s) matching "${searchQuery}"! Here are some recommendations for you. Tap on any product to view details and add to cart.`;
        suggestions = ["Add to cart", "View more options", "Filter by price", "Compare products"];
      } else {
        reply = `I couldn't find exact results for "${message}", but I can help you browse our categories. We have electronics, fashion, home appliances, sports gear, books, and much more!`;
        suggestions = ["Browse Electronics", "Browse Fashion", "Show deals", "Help me choose"];
      }
    }

    return res.json({ reply, suggestions, productIds });
  } catch (err) {
    req.log.error({ err }, "chatbot error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
