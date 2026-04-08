import express from "express";
import { addTransaction, addCategory, getCategories, getTransactions, deleteTransaction, getSummary } from "../controllers/transaction.controller.js";
import  {authMiddleware} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, addTransaction);
router.post("/categories", authMiddleware, addCategory);
router.get("/categories", authMiddleware, getCategories);
router.get("/", authMiddleware, getTransactions);
router.delete("/:id", authMiddleware, deleteTransaction);
router.get("/summary", authMiddleware, getSummary);

export default router;

