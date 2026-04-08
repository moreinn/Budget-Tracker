import { useEffect, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const Dashboard = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState("");
    const [form, setForm] = useState({
        amount: "",
        type: "expense",
        description: "",
        categoryId: ""
    });

    const fetchData = async () => {
        try {
            const [summaryRes, transactionsRes, categoriesRes] = await Promise.all([
                api.get("/transactions/summary"),
                api.get("/transactions"),
                api.get("/transactions/categories")
            ]);
            setSummary(summaryRes.data);
            setTransactions(transactionsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            await api.post("/transactions/categories", { name: newCategory });
            setNewCategory("");
            fetchData();
        } catch (error) {
            console.error("Failed to add category:", error);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            await api.post("/transactions", {
                amount: parseFloat(form.amount),
                type: form.type,
                description: form.description,
                categoryId: parseInt(form.categoryId)
            });
            setForm({ amount: "", type: "expense", description: "", categoryId: "" });
            fetchData();
        } catch (error) {
            console.error("Failed to add transaction:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/transactions/${id}`);
            fetchData();
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    const chartData = [
        { name: "Income", amount: summary?.totalIncome || 0 },
        { name: "Expense", amount: summary?.totalExpense || 0 }
    ];

    return (
        <div className="dashboard">

            {/* header */}
            <div className="dashboard-header">
                <h1>Budget Tracker</h1>
                <div className="header-right">
                    <span>Hi, {user?.name}</span>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </div>

            {/* summary cards */}
            <div className="summary-cards">
                <div className="card income">
                    <h3>Total Income</h3>
                    <p>₹{summary?.totalIncome}</p>
                </div>
                <div className="card expense">
                    <h3>Total Expense</h3>
                    <p>₹{summary?.totalExpense}</p>
                </div>
                <div className="card balance">
                    <h3>Balance</h3>
                    <p>₹{summary?.balance}</p>
                </div>
            </div>

            {/* chart */}
            <div className="chart-container">
                <h2>Income vs Expense</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${value}`} />
                        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                            <Cell fill="#27ae60" />
                            <Cell fill="#e74c3c" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* add category */}
            <div className="add-category">
                <h2>Add Category</h2>
                <form onSubmit={handleAddCategory} className="category-form">
                    <input
                        type="text"
                        placeholder="e.g. Food, Salary, Rent, Transport"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button type="submit">+ Add Category</button>
                </form>
                {categories.length > 0 && (
                    <div className="category-tags">
                        {categories.map(c => (
                            <span key={c.id} className="category-tag">{c.name}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* add transaction */}
            <div className="add-transaction">
                <h2>Add Transaction</h2>
                <form onSubmit={handleAddTransaction} className="transaction-form">
                    <input
                        type="number"
                        placeholder="Amount"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        required
                    />
                    <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                    <select
                        value={form.categoryId}
                        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                        required
                    >
                        <option value="">Select category</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    <button type="submit" className="btn-add">Add Transaction</button>
                </form>
            </div>

            {/* transactions list */}
            <div className="transactions-list">
                <h2>Recent Transactions</h2>
                {transactions.length === 0 ? (
                    <p className="empty">No transactions yet</p>
                ) : (
                    transactions.map(t => (
                        <div key={t.id} className={`transaction-item ${t.type}`}>
                            <div className="transaction-info">
                                <p className="transaction-desc">{t.description || "No description"}</p>
                                <p className="transaction-category">{t.category.name}</p>
                            </div>
                            <div className="transaction-right">
                                <p className="transaction-amount">
                                    {t.type === "income" ? "+" : "-"}₹{t.amount}
                                </p>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(t.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default Dashboard;