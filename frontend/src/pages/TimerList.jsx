import React, { useState, useCallback } from "react";
import { Page, Layout, Card, ResourceList, ResourceItem, Text, Button, TextField, Select, Badge, Banner, Spinner, EmptyState, ActionList, Popover, Modal, Toast, Frame, InlineStack, BlockStack, Box, Divider, } from "@shopify/polaris";
import useTimers from "../hooks/useTimers";
import TimerModal from "../components/TimerModal";

const TimerList = ({ shop }) => {
  const { timers, loading, error, fetchTimers, createTimer, updateTimer, deleteTimer, toggleTimer } =
    useTimers(shop || "dev-store.myshopify.com");

  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState("createdAt_desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState(null);
  const [activePopover, setActivePopover] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (msg, isError = false) => setToast({ content: msg, error: isError });

  const handleSearch = useCallback((val) => {
    setSearchValue(val);
    fetchTimers({ search: val, sort: sortValue });
  }, [sortValue, fetchTimers]);

  const handleSort = useCallback((val) => {
    setSortValue(val);
    fetchTimers({ search: searchValue, sort: val });
  }, [searchValue, fetchTimers]);

  const openCreate = () => { setEditingTimer(null); setModalOpen(true); };
  const openEdit = (t) => { setEditingTimer(t); setModalOpen(true); setActivePopover(null); };

  const handleSave = async (formData) => {
    try {
      if (editingTimer) { await updateTimer(editingTimer._id, formData); showToast("Timer updated"); }
      else { await createTimer(formData); showToast("Timer created"); }
      setModalOpen(false);
    } catch (err) { showToast(err.message, true); }
  };

  const handleDelete = async (id) => {
    try { await deleteTimer(id); setDeleteConfirm(null); showToast("Timer deleted"); }
    catch (err) { showToast(err.message, true); }
  };

  const handleToggle = async (id) => {
    try { const t = await toggleTimer(id); setActivePopover(null); showToast(`Timer ${t.isActive ? "activated" : "deactivated"}`); }
    catch (err) { showToast(err.message, true); }
  };

  const getStatusBadge = (timer) => {
    const now = new Date();
    if (!timer.isActive) return <Badge tone="info">Inactive</Badge>;
    if (new Date(timer.startDate) > now) return <Badge tone="attention">Scheduled</Badge>;
    if (new Date(timer.endDate) < now) return <Badge tone="critical">Expired</Badge>;
    return <Badge tone="success">Active</Badge>;
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <Frame>
      <Page title="Countdown Timer Manager" subtitle="Create and manage countdown timers for your promotions" primaryAction={{ content: "+ Create timer", onAction: openCreate }}>
        <Layout>
          {error && <Layout.Section><Banner tone="critical">{error}</Banner></Layout.Section>}

          <Layout.Section>
            <Card>
              <Box padding="400">
                <InlineStack gap="300" align="space-between" blockAlign="center">
                  <Box minWidth="280px">
                    <TextField placeholder="Search timers" value={searchValue} onChange={handleSearch} clearButton onClearButtonClick={() => handleSearch("")} autoComplete="off" />
                  </Box>
                  <Select label="" value={sortValue} onChange={handleSort}
                    options={[{ label: "Create date (newest first)", value: "createdAt_desc" }, { label: "Create date (oldest first)", value: "createdAt_asc" }, { label: "Name (A–Z)", value: "name_asc" }, { label: "Name (Z–A)", value: "name_desc" }, { label: "End date (soonest)", value: "endDate_asc" },]} />
                </InlineStack>
              </Box>
              <Divider />

              {loading ? (
                <Box padding="800" as="div" style={{ textAlign: "center" }}><Spinner /></Box>
              ) : timers.length === 0 ? (
                <EmptyState heading="No timers yet" action={{ content: "Create timer", onAction: openCreate }} image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg">
                  <p>Create your first countdown timer to drive urgency on product pages.</p>
                </EmptyState>
              ) : (
                <ResourceList resourceName={{ singular: "timer", plural: "timers" }} items={timers}
                  renderItem={(timer) => {
                    const isOpen = activePopover === timer._id;
                    return (
                      <ResourceItem id={timer._id} onClick={() => openEdit(timer)}>
                        <InlineStack align="space-between" blockAlign="center">
                          <BlockStack gap="100">
                            <InlineStack gap="200" blockAlign="center">
                              <Text variant="bodyMd" fontWeight="semibold">{timer.name}</Text>
                              {getStatusBadge(timer)}
                            </InlineStack>
                            <Text variant="bodySm" tone="subdued">{timer.promotionDescription || "No description"}</Text>
                            <Text variant="bodySm" tone="subdued">Start: {formatDate(timer.startDate)}</Text>
                          </BlockStack>

                          <div onClick={(e) => e.stopPropagation()}>
                            <Popover active={isOpen} onClose={() => setActivePopover(null)}
                              activator={
                                <Button variant="plain" onClick={() => setActivePopover(isOpen ? null : timer._id)}>•••</Button>
                              }>
                              <ActionList items={[
                                { content: "Edit", onAction: () => openEdit(timer) },
                                { content: timer.isActive ? "Deactivate" : "Activate", onAction: () => handleToggle(timer._id) },
                                { content: "Delete", destructive: true, onAction: () => { setDeleteConfirm(timer); setActivePopover(null); } },
                              ]} />
                            </Popover>
                          </div>
                        </InlineStack>
                      </ResourceItem>
                    );
                  }}
                />
              )}
            </Card>
          </Layout.Section>
        </Layout>

        <TimerModal open={modalOpen} timer={editingTimer} onClose={() => setModalOpen(false)} onSave={handleSave} />

        <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete timer?" primaryAction={{ content: "Delete", destructive: true, onAction: () => handleDelete(deleteConfirm._id) }} secondaryActions={[{ content: "Cancel", onAction: () => setDeleteConfirm(null) }]}>
          <Modal.Section>
            <Text>Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?</Text>
          </Modal.Section>
        </Modal>

        {toast && <Toast content={toast.content} error={toast.error} onDismiss={() => setToast(null)} duration={3000} />}
      </Page>
    </Frame>
  );
}

export default TimerList;