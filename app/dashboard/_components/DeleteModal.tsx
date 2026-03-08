"use client";

import { motion, AnimatePresence } from "framer-motion";

type DeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string; // e.g. "Wireless Earbuds"
};

export default function DeleteModal({
  open,
  onClose,
  onConfirm,
  itemName = "this item",
}: DeleteModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {/* Background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
          zIndex: 999,
        }}
      ></motion.div>

      {/* Modal container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "420px",
          background: "#fff",
          borderRadius: "10px",
          padding: "25px",
          zIndex: 1000,
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}>
          Delete Product
        </h2>

        <p style={{ fontSize: "14px", color: "#555", marginBottom: "25px" }}>
          Are you sure you want to permanently delete{" "}
          <strong>{itemName}</strong>?  
          <br />
          This action <strong>cannot be undone</strong>.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 14px",
              fontSize: "14px",
              background: "#f3f4f6",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            style={{
              padding: "8px 14px",
              fontSize: "14px",
              color: "#fff",
              background: "#dc2626",
              borderRadius: "6px",
              border: "1px solid #b91c1c",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Yes, Delete
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
