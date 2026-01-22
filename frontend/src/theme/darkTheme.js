import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7c4dff", // electric violet
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#00e5ff", // cyan accent
      contrastText: "#000000",
    },
    background: {
      default: "#0b1020", // deep navy
      paper: "#0f1724", // slightly lighter surface
    },
    surface: {
      main: "#0f1724",
    },
    text: {
      primary: "#e6eef8",
      secondary: "#a8b3c7",
    },
    success: {
      main: "#4caf50",
      contrastText: "#0b1020",
    },
    error: {
      main: "#ff5252",
    },
    info: {
      main: "#26c6da",
    },
    warning: {
      main: "#ffb86b",
    },
    divider: "rgba(255,255,255,0.06)",
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
  },
});

export default darkTheme;