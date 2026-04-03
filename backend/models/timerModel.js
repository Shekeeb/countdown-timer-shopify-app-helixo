const mongoose = require("mongoose");

const timerSchema = new mongoose.Schema(
    {
        shop: {
            type: String,
            required: [true, "shop is required"],
            trim: true,
            lowercase: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, "Timer name is required"],
            trim: true,
            maxlength: [120, "Name cannot exceed 120 characters"],
        },
        promotionDescription: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
            default: "",
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"],
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"],
            validate: {
                validator: function (val) {
                    return val > this.startDate;
                },
                message: "End date must be after start date",
            },
        },
        color: {
            type: String,
            default: "#22c55e",
            match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"],
        },
        size: {
            type: String,
            enum: ["small", "medium", "large"],
            default: "medium",
        },
        position: {
            type: String,
            enum: ["top", "bottom", "inline"],
            default: "top",
        },
        urgencyNotification: {
            type: String,
            enum: ["none", "color_pulse", "notification_banner"],
            default: "color_pulse",
        },
        urgencyThresholdMinutes: {
            type: Number,
            default: 5,
            min: 1,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

timerSchema.index({ shop: 1, isActive: 1, startDate: 1, endDate: 1 });

timerSchema.virtual("isRunning").get(function () {
    const now = new Date();
    return this.isActive && this.startDate <= now && this.endDate >= now;
});

timerSchema.virtual("status").get(function () {
    const now = new Date();
    if (!this.isActive) return "inactive";
    if (now < this.startDate) return "scheduled";
    if (now > this.endDate) return "expired";
    return "active";
});

const Timer = mongoose.model("Timer", timerSchema);

module.exports = Timer;