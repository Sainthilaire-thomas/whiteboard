// 📁 app/evaluation/components/UnifiedHeader/shared/DomainSelector.tsx
"use client";

import React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Domain as DomainIcon } from "@mui/icons-material";

interface DomainSelectorProps {
  domains: Array<{ iddomaine: number; nomdomaine: string }>;
  selectedDomain: string;
  onChange: (event: any) => void;
}

export default function DomainSelector({
  domains,
  selectedDomain,
  onChange,
}: DomainSelectorProps) {
  const domainExists =
    selectedDomain &&
    domains.some(
      (domain) => String(domain.iddomaine) === String(selectedDomain)
    );

  const effectiveSelectedDomain = domainExists
    ? selectedDomain
    : domains.length > 0
    ? String(domains[0].iddomaine)
    : "";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <DomainIcon sx={{ color: "secondary.main", fontSize: 20 }} />
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel sx={{ fontSize: "0.875rem" }}>Domaine</InputLabel>
        <Select
          value={effectiveSelectedDomain}
          onChange={onChange}
          label="Domaine"
          sx={{ fontSize: "0.875rem" }}
        >
          {domains.map((domain) => (
            <MenuItem key={domain.iddomaine} value={String(domain.iddomaine)}>
              {domain.nomdomaine}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
