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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";
import { User, Home, School, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { SharedNavBar } from "./SharedNavBar";
import { updateUserPlan } from "../utils/authApi";
import { PlanUpgradeDialog } from "./PlanUpgradeDialog";
import AnonymousDemoModal from "./AnonymousDemoModal";

interface AppShellLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export const AppShellLayout: React.FC<AppShellLayoutProps> = ({
  children,
  showNav = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appState, logout, setUserPlan } = useApp();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showLogoutPrompt, setShowLogoutPrompt] = React.useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = React.useState(false);
  const [isUpgrading, setIsUpgrading] = React.useState(false);
  const [upgradeError, setUpgradeError] = React.useState("");

  const isHomeMode = appState.selectedMode === "home";
  const isInstitutionMode = appState.selectedMode === "institution";
  const isGuestMode = appState.userRole === "Guest";
  const institutionDashboardPath = "/institution";
  const institutionCreateStoryPath = "/institution/create-story";
  const homePath = isInstitutionMode ? institutionDashboardPath : "/home";
  const isAuthRoute = location.pathname.startsWith("/auth/");
  const showMainNavControls = appState.isAuthenticated && !isAuthRoute;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setShowLogoutPrompt(false);
    logout();
    handleClose();
    navigate("/");
  };

  const handleChangePlan = async (plan: "free" | "paid") => {
    if (!appState.accessToken) return;
    try {
      setIsUpgrading(true);
      setUpgradeError("");
      const response = await updateUserPlan(appState.accessToken, plan);
      setUserPlan(response.plan);
      setShowUpgradePrompt(false);
      handleClose();
    } catch (error) {
      setUpgradeError(error instanceof Error ? error.message : "Unable to update plan right now.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const getModeLabel = () => {
    if (isGuestMode) return "Anonymous Demo";
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
              onClick={() => navigate(homePath)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(homePath);
                }
              }}
              aria-label="Go to home page"
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                borderRadius: 3,
                px: 0.75,
                py: 0.25,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                },
                "&:focus-visible": {
                  outline: "2px solid rgba(255,255,255,0.7)",
                  outlineOffset: 2,
                },
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
                  transform: "scale(1.1)",
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
              {showMainNavControls && (
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
                      backgroundColor: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.35)",
                      backdropFilter: "blur(8px)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.18)",
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
                          borderRadius: 2,
                          minWidth: 220,
                          mt: 1,
                          px: 1,
                          py: 0.5,
                          background:
                            "linear-gradient(165deg, rgba(255,255,255,0.52) 0%, rgba(243,248,255,0.3) 100%)",
                          border: "1px solid rgba(255,255,255,0.6)",
                          backdropFilter: "blur(20px) saturate(155%)",
                          boxShadow: "0 18px 44px rgba(15,23,42,0.2)",
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

                    <MenuItem disabled>
                      Plan: {isGuestMode ? "Anonymous Demo" : appState.userPlan === "paid" ? "Paid" : "Free"}
                    </MenuItem>
                    {!isGuestMode && (
                      <MenuItem
                        onClick={() => {
                          setUpgradeError("");
                          setShowUpgradePrompt(true);
                          handleClose();
                        }}
                      >
                        Change Plan
                      </MenuItem>
                    )}
                    <Divider sx={{ my: 1 }} />

                    {/* MOBILE NAV ITEMS */}
                    <Box sx={{ display: { xs: "block", md: "none" } }}>
                      {isInstitutionMode ? (
                        <>
                          <MenuItem
                            onClick={() => navigate(institutionDashboardPath)}
                          >
                            Dashboard
                          </MenuItem>
                          <MenuItem
                            onClick={() => navigate(institutionCreateStoryPath)}
                          >
                            Create story
                          </MenuItem>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                      <Divider sx={{ my: 1 }} />
                    </Box>

                    {/* LOGOUT */}
                    <MenuItem onClick={() => setShowLogoutPrompt(true)}>
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
        <Container
          maxWidth="xl"
          sx={{
            py: 4,
            position: "relative",
          }}
        >
          {children}
        </Container>
      </Box>
      <PlanUpgradeDialog
        open={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onConfirmPlan={handleChangePlan}
        currentPlan={appState.userPlan}
        allowFreeSelection
        isSubmitting={isUpgrading}
        errorMessage={upgradeError}
      />
      <Dialog open={showLogoutPrompt} onClose={() => setShowLogoutPrompt(false)}>
        <DialogTitle>Before you log out</DialogTitle>
        <DialogContent>
          <Typography>
            {isGuestMode
              ? 'You are currently using Anonymous Demo Mode. Your guest history stays in this browser until you clear it or switch devices.'
              : `You are currently on the ${appState.userPlan} plan. Upgrade to paid to unlock unlimited audio and PDF downloads.`}
          </Typography>
          {upgradeError && (
            <Typography color="error" sx={{ mt: 1.5 }}>
              {upgradeError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {!isGuestMode && appState.userPlan === "free" && (
            <Button
              onClick={() => {
                setUpgradeError("");
                setShowUpgradePrompt(true);
              }}
              disabled={isUpgrading}
            >
              Upgrade Plan
            </Button>
          )}
          <Button onClick={handleLogout} color="error">
            Logout
          </Button>
          <Button onClick={() => setShowLogoutPrompt(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <AnonymousDemoModal />
    </Box>
  );
};

export default AppShellLayout;
