import React, { useState, useEffect } from "react";
import { Modal, FormLayout, TextField, Select, Text, InlineStack, Box, BlockStack, Banner, } from "@shopify/polaris";

const EMPTY_FORM = {
  name: "", startDate: "", startTime: "", endDate: "", endTime: "",
  promotionDescription: "", color: "#22c55e",
  size: "medium", position: "top", urgencyNotification: "color_pulse",
};

const TimerModal = ({ open, timer, onClose, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (timer) {
      const toDate = (d) => d ? new Date(d).toISOString().split("T")[0] : "";
      const toTime = (d) => {
        if (!d) return "";
        const dt = new Date(d);
        return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
      };
      setForm({
        name: timer.name || "",
        startDate: toDate(timer.startDate),
        startTime: toTime(timer.startDate),
        endDate: toDate(timer.endDate),
        endTime: toTime(timer.endDate),
        promotionDescription: timer.promotionDescription || "",
        color: timer.color || "#22c55e",
        size: timer.size || "medium",
        position: timer.position || "top",
        urgencyNotification: timer.urgencyNotification || "color_pulse",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({}); setApiError("");
  }, [timer, open]);

  const set = (field) => (val) => setForm((f) => ({ ...f, [field]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Timer name is required";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.startTime) e.startTime = "Start time is required";
    if (!form.endDate) e.endDate = "End date is required";
    if (!form.endTime) e.endTime = "End time is required";
    if (form.startDate && form.endDate) {
      const start = new Date(`${form.startDate}T${form.startTime || "00:00"}`);
      const end = new Date(`${form.endDate}T${form.endTime || "00:00"}`);
      if (end <= start) e.endDate = "End must be after start";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true); setApiError("");
    try {
      await onSave({
        name: form.name.trim(),
        promotionDescription: form.promotionDescription.trim(),
        startDate: new Date(`${form.startDate}T${form.startTime}:00`).toISOString(),
        endDate: new Date(`${form.endDate}T${form.endTime}:00`).toISOString(),
        color: form.color,
        size: form.size,
        position: form.position,
        urgencyNotification: form.urgencyNotification,
      });
    } catch (err) { setApiError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} large title={timer ? "Edit Timer" : "Create New Timer"} primaryAction={{ content: timer ? "Save changes" : "Create timer", onAction: handleSave, loading: saving }} secondaryActions={[{ content: "Cancel", onAction: onClose }]}>
      <Modal.Section>
        {apiError && <Box paddingBlockEnd="400"><Banner tone="critical">{apiError}</Banner></Box>}

        <FormLayout>
          <TextField label="Timer name *" placeholder="Enter timer name" value={form.name} onChange={set("name")} error={errors.name} autoComplete="off" />

          <FormLayout.Group>
            <TextField label="Start date" type="date" value={form.startDate}
              onChange={set("startDate")} error={errors.startDate} autoComplete="off" />
            <TextField label="Start time" type="time" value={form.startTime}
              onChange={set("startTime")} error={errors.startTime} autoComplete="off" />
          </FormLayout.Group>

          <FormLayout.Group>
            <TextField label="End date" type="date" value={form.endDate}
              onChange={set("endDate")} error={errors.endDate} autoComplete="off" />
            <TextField label="End time" type="time" value={form.endTime}
              onChange={set("endTime")} error={errors.endTime} autoComplete="off" />
          </FormLayout.Group>

          <TextField label="Promotion description" placeholder="Enter promotion details" value={form.promotionDescription} onChange={set("promotionDescription")} multiline={4} autoComplete="off" />

          <BlockStack gap="200">
            <Text variant="bodyMd" as="label">Timer color</Text>
            <InlineStack gap="300" blockAlign="center">
              <input type="color" value={form.color} onChange={(e) => set("color")(e.target.value)} style={{ width: "48px", height: "48px", border: "1px solid #e1e3e5", borderRadius: "8px", cursor: "pointer", padding: "2px" }} />
              <TextField value={form.color} onChange={set("color")} placeholder="#22c55e" autoComplete="off" label="" />
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: form.color, border: "1px solid #e1e3e5" }} />
            </InlineStack>
          </BlockStack>

          <FormLayout.Group>
            <Select label="Timer size" value={form.size} onChange={set("size")} options={[{ label: "Small", value: "small" }, { label: "Medium", value: "medium" }, { label: "Large", value: "large" },]} />
            <Select label="Timer position" value={form.position} onChange={set("position")} options={[{ label: "Top", value: "top" }, { label: "Bottom", value: "bottom" }, { label: "Inline", value: "inline" },]} />
          </FormLayout.Group>

          <Select label="Urgency notification" value={form.urgencyNotification} onChange={set("urgencyNotification")} helpText="Visual cue shown when timer has less than 5 minutes remaining" options={[{ label: "None", value: "none" }, { label: "Color pulse", value: "color_pulse" }, { label: "Notification banner", value: "notification_banner" },]} />
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}

export default TimerModal;