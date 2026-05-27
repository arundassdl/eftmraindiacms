"use client";

import React from "react";
import { DefaultListView } from "@payloadcms/ui";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import type { ListViewClientProps } from "payload";

const eftmraListTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#004383",
    },
    background: {
      default: "#f5f6fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#292640",
      secondary: "#77758a",
    },
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "#e3e5eb",
        },
      },
    },
  },
});

export function EftmraListView(props: ListViewClientProps) {
  return (
    <ThemeProvider theme={eftmraListTheme}>
      <div className="eftmra-mui-list-view">
        <DefaultListView {...props} />
      </div>
    </ThemeProvider>
  );
}

export default EftmraListView;
