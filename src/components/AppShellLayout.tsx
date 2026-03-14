import React, { ReactNode } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { User, Home, School, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { SharedNavBar } from "./SharedNavBar";

interface AppShellLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export const AppShellLayout: React.FC<AppShellLayoutProps> = ({
  children,
  showNav = true,
}) => {
  const navigate = useNavigate();
  const { appState, logout } = useApp();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const isHomeMode = appState.selectedMode === "home";
  const isInstitutionMode = appState.selectedMode === "institution";

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/");
  };

  const getModeLabel = () => {
    if (isHomeMode) return "Home Mode";
    if (isInstitutionMode) return "Institution Mode";
    return "";
  };

  const getModeIcon = () => {
    if (isHomeMode) return <Home size={18} />;
    if (isInstitutionMode) return <School size={18} />;
    return null;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {showNav && (
        <AppBar position="sticky" elevation={0}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            {/* ================= LEFT: LOGO ================= */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <Box
                component="img"
                src="/KiddoLand_Logo.png"
                alt="KiddoLand Logo"
                sx={{
                  height: { xs: 60, md: 80 },
                  width: "auto",
                  objectFit: "contain",
                  transform: "scale(1.1)", // makes it appear bigger
                  transition: "transform 0.2s ease",
                }}
              />
            </Box>

            {/* ================= RIGHT SECTION ================= */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {appState.isAuthenticated && (
                <>
                  {/* NAV BUTTONS (Desktop Only) */}
                  <Box
                    sx={{
                      display: { xs: "none", md: "flex" },
                      alignItems: "center",
                    }}
                  >
                    <SharedNavBar />
                  </Box>

                  {/* USER ICON */}
                  <IconButton
                    size="large"
                    onClick={handleMenu}
                    sx={{
                      color: "#FFFFFF",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <User size={24} />
                  </IconButton>

                  {/* DROPDOWN MENU */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    slotProps={{
                      paper: {
                        sx: {
                          borderRadius: 1,
                          minWidth: 220,
                          mt: 1,
                          px: 1,
                          py: 0.5,
                        },
                      },
                    }}
                  >
                    {/* USER NAME */}
                    <MenuItem
                      disabled
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        opacity: 1,
                      }}
                    >
                      {appState.userName || appState.userEmail || "Signed in"}
                    </MenuItem>

                    {/* MODE INFO */}
                    {appState.selectedMode && (
                      <MenuItem
                        disabled
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          opacity: 1,
                          fontSize: "0.85rem",
                          color: "text.secondary",
                        }}
                      >
                        {getModeIcon()}
                        {getModeLabel()}
                      </MenuItem>
                    )}

                    <Divider sx={{ my: 1 }} />

                    {/* MOBILE NAV ITEMS */}
                    <Box sx={{ display: { xs: "block", md: "none" } }}>
                      <MenuItem onClick={() => navigate("/home")}>
                        Home
                      </MenuItem>
                      <MenuItem onClick={() => navigate("/story-history")}>
                        History
                      </MenuItem>
                      <MenuItem
                        onClick={() => navigate("/story-favorites")}
                      >
                        Favourite
                      </MenuItem>
                      <Divider sx={{ my: 1 }} />
                    </Box>

                    {/* LOGOUT */}
                    <MenuItem onClick={handleLogout}>
                      <LogOut size={18} style={{ marginRight: 8 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: showNav ? "calc(100vh - 72px)" : "100vh",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default AppShellLayout;
