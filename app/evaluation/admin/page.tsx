// app/evaluation/admin/page.tsx
"use client";

import React from "react";
import { Box } from "@mui/material";
import AdminMainPage from "./components/AdminMainPage";

export default function AdminPage() {
  return (
    <Box sx={{ height: "100vh", overflow: "auto" }}>
      <AdminMainPage />
    </Box>
  );
}
