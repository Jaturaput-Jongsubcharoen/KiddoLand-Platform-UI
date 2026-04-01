import React, { useEffect, useMemo, useState } from "react";
import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { Clock } from "lucide-react";
import { KiddoButton } from "./KiddoButton";
import { useApp } from "../context/AppContext";
import { refreshSession } from "../utils/authApi";

const WARNING_WINDOW_MS = 2 * 60 * 1000;

const formatCountdown = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const SessionExpiryWarning: React.FC = () => {
  const { appState, updateSession } = useApp();
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!appState.isAuthenticated || !appState.tokenExpiresAt) {
      setIsOpen(false);
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      const msLeft = appState.tokenExpiresAt
        ? appState.tokenExpiresAt - Date.now()
        : 0;
      setRemainingMs(msLeft);
      setIsOpen(msLeft > 0 && msLeft <= WARNING_WINDOW_MS);
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [appState.isAuthenticated, appState.tokenExpiresAt]);

  const progressValue = useMemo(() => {
    if (remainingMs <= 0) return 0;
    return Math.min(100, (remainingMs / WARNING_WINDOW_MS) * 100);
  }, [remainingMs]);

  const handleContinue = async () => {
    if (!appState.accessToken) return;

    setIsRefreshing(true);
    setErrorMessage("");
    try {
      const response = await refreshSession(appState.accessToken);
      const newExpiresAt = Date.now() + response.expires_in * 1000;
      updateSession({
        accessToken: response.access_token,
        tokenExpiresAt: newExpiresAt,
        userRole: response.role,
        userEmail: response.email,
        userName: response.full_name || response.name,
      });
      localStorage.setItem("accessToken", response.access_token);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to extend your session.";
      setErrorMessage(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 16, sm: 24 },
        bottom: { xs: 16, sm: 24 },
        zIndex: 1400,
        width: { xs: "calc(100% - 32px)", sm: 360 },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 2.5,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.2)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Clock size={18} />
            <Typography variant="subtitle1" fontWeight={700}>
              Session expiring soon
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
           Stay logged in to keep working without interruption.
          </Typography>
          <Box>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                height: 6,
                borderRadius: 999,
                backgroundColor: "rgba(148, 163, 184, 0.25)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  background:
                    "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              {formatCountdown(remainingMs)} remaining
            </Typography>
          </Box>
          {errorMessage && (
            <Typography variant="caption" color="error.main">
              {errorMessage}
            </Typography>
          )}
          <KiddoButton
            variant="contained"
            onClick={handleContinue}
            disabled={isRefreshing}
            fullWidth
          >
            {isRefreshing ? "Refreshing..." : "Stay Logged In"}
          </KiddoButton>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SessionExpiryWarning;
