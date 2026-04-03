require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const timerRoutes = require("./routes/timerRoutes");
const { verifyShopifyRequest } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(morgan("dev"));
app.use(cors({ origin: process.env.HOST || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/timers/active", async (req, res) => {
    const { shop } = req.query;
    if (!shop) return res.status(400).json({ error: "shop param required" });
    try {
        const Timer = require("./models/Timer");
        const now = new Date();
        const activeTimer = await Timer.findOne({
            shop,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
        }).sort({ createdAt: -1 });

        res.json({ timer: activeTimer || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use("/api/timers", verifyShopifyRequest, timerRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;