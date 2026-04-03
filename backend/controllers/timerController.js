const Timer = require("../models/timerModel");

// GET - Fetch Timers
const getTimers = async (req, res) => {
  try {
    const shop = req.shop;
    const { search, sort = "createdAt_desc", page = 1, limit = 20 } = req.query;

    const query = { shop };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { promotionDescription: { $regex: search, $options: "i" } },
      ];
    }

    const [sortField, sortDir] = sort.split("_");
    const sortObj = { [sortField]: sortDir === "desc" ? -1 : 1 };

    const timers = await Timer.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Timer.countDocuments(query);

    res.json({
      timers,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET -Fetch Timer details By Id
const getTimer = async (req, res) => {
  try {
    const timer = await Timer.findOne({ _id: req.params.id, shop: req.shop });
    if (!timer) return res.status(404).json({ error: "Timer not found" });
    res.json({ timer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST - Add Timer
const createTimer = async (req, res) => {
  try {
    const { name, promotionDescription, startDate, endDate, color, size, position, urgencyNotification, urgencyThresholdMinutes } = req.body;

    const timer = await Timer.create({
      shop: req.shop,
      name, promotionDescription,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      color, size, position,
      urgencyNotification,
      urgencyThresholdMinutes,
      isActive: true,
    });

    res.status(201).json({ timer, message: "Timer created successfully" });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: errors.join(", ") });
    }
    res.status(500).json({ error: err.message });
  }
};

// PUT - Update Timer By Id
const updateTimer = async (req, res) => {
  try {
    const allowedFields = [
      "name", "promotionDescription", "startDate", "endDate",
      "color", "size", "position", "urgencyNotification",
      "urgencyThresholdMinutes", "isActive"
    ];

    const updates = {};

    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const existingTimer = await Timer.findOne({
      _id: req.params.id,
      shop: req.shop,
    });

    if (!existingTimer) {
      return res.status(404).json({ error: "Timer not found" });
    }

    const finalStartDate = updates.startDate ? new Date(updates.startDate) : existingTimer.startDate;
    const finalEndDate = updates.endDate ? new Date(updates.endDate) : existingTimer.endDate;

    if (finalEndDate <= finalStartDate) {
      return res.status(400).json({
        error: "End date must be after start date",
      });
    }

    if (updates.startDate) {
      updates.startDate = new Date(updates.startDate);
    }

    if (updates.endDate) {
      updates.endDate = new Date(updates.endDate);
    }

    const timer = await Timer.findOneAndUpdate(
      { _id: req.params.id, shop: req.shop },
      updates,
      { new: true }
    );

    res.json({
      timer,
      message: "Timer updated successfully",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// DELETE - Delete Timer
const deleteTimer = async (req, res) => {
  try {
    const timer = await Timer.findOneAndDelete({ _id: req.params.id, shop: req.shop });
    if (!timer) return res.status(404).json({ error: "Timer not found" });
    res.json({ message: "Timer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH - Activate/Inactivate Timer
const toggleTimer = async (req, res) => {
  try {
    const timer = await Timer.findOne({ _id: req.params.id, shop: req.shop });
    if (!timer) return res.status(404).json({ error: "Timer not found" });
    timer.isActive = !timer.isActive;
    await timer.save();
    res.json({ timer, message: `Timer ${timer.isActive ? "activated" : "deactivated"}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getTimers, getTimer, createTimer, updateTimer, deleteTimer, toggleTimer };