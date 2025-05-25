// 📜 app/evaluation/admin/page.tsx
"use client";

import React from "react";
import { Box } from "@mui/material";
import AdminPonderationPage from "./AdminPonderationPage";

export default function AdminPage() {
  return (
    <Box sx={{ height: "100vh", overflow: "auto" }}>
      <AdminPonderationPage />
    </Box>
  );
}
