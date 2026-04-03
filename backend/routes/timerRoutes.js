const express = require("express");
const router = express.Router();
const { getTimers, getTimer, createTimer, updateTimer, deleteTimer, toggleTimer, } = require("../controllers/timerController");

router.get("/", getTimers);
router.post("/", createTimer);
router.get("/:id", getTimer);
router.put("/:id", updateTimer);
router.delete("/:id", deleteTimer);
router.patch("/:id/toggle", toggleTimer);

module.exports = router;