import prisma  from "../lib/db.js";

export const addTransaction = async (req, res) => {
    const { amount, type, description, categoryId, date } = req.body;

    try {
        if (!amount || !type || !categoryId) {
            return res.status(400).json({ message: "Amount, type and category are required" });
        }

        if (type !== "income" && type !== "expense") {
            return res.status(400).json({ message: "Type must be income or expense" });
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount,
                type,
                description,
                categoryId,
                date: date ? new Date(date) : new Date(),
                userId: req.user.id
            }
        });

        res.status(201).json(transaction);

    } catch (error) {
        console.error("Add transaction error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const addCategory  = async (req, res) => {
    const { name } = req.body;

    try{
        if(!name){
            return res.status(400).json({ message: "Category name is required"});
        }

        const category = await prisma.category.create({
            data:{
                name,
                userId: req.user.id
            }
        })

        res.status(201).json(category);
    } catch (error) {
        console.erros("Add category error:", error);
        res.status(500).json({ message: "Server error"});
    }

};

export const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { userId: req.user.id }
        });

        res.json(categories);

    } catch (error) {
        console.error("Get categories error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.user.id },
            include: { category: true },
            orderBy: { date: "desc" }
        });

        res.json(transactions);

    } catch (error) {
        console.error("Get transactions error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteTransaction = async (req, res) => {
    const { id } = req.params;

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(id) }
        });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.userId !== req.user.id) {
            return res.status(403).json({ message: "Not allowed" });
        }

        await prisma.transaction.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: "Transaction deleted" });

    } catch (error) {
        console.error("Delete transaction error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const getSummary = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.user.id }
        });

        const totalIncome = transactions
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpense;

        res.json({
            totalIncome,
            totalExpense,
            balance
        });

    } catch (error) {
        console.error("Summary error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};