import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import cartRouter from "./cart";
import wishlistRouter from "./wishlist";
import ordersRouter from "./orders";
import reviewsRouter from "./reviews";
import chatbotRouter from "./chatbot";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(cartRouter);
router.use(wishlistRouter);
router.use(ordersRouter);
router.use(reviewsRouter);
router.use(chatbotRouter);

export default router;
