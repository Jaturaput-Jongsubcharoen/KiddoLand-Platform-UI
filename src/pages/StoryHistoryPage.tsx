import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { AppShellLayout, KiddoCard } from "../components";
import BackButton from "../components/BackButton";
import { useApp } from "../context/AppContext";
import { getStoryHistory, StoryHistoryItem } from "../utils/aiApi";

const formatDate = (value: string | null): string => {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

const toTimestamp = (value: string | null): number => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const StoryHistoryPage: React.FC = () => {
  const { appState } = useApp();

  const [items, setItems] = useState<StoryHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<StoryHistoryItem | null>(
    null,
  );

  // 🔥 Default = minimized (medium size)
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      if (!appState.accessToken) {
        setErrorMessage("You are not authenticated.");
        setIsLoading(false);
        return;
      }

      try {
        const historyItems = await getStoryHistory(appState.accessToken);
        setItems(historyItems);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load history.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [appState.accessToken]);

  const sortedItems = [...items].sort(
    (a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at),
  );

  const handleCloseDialog = () => {
    setSelectedItem(null);
    // ❌ DO NOT reset isFullScreen
    // It now remembers last size automatically
  };

  const toggleSize = () => {
    setIsFullScreen((prev) => !prev);
  };

  return (
    <AppShellLayout>
      <Stack spacing={3}>
        <Box>
          <BackButton />
        </Box>
        <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
          <Typography variant="h4">Story History</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Newest stories appear first.
          </Typography>
        </KiddoCard>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {isLoading ? (
          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={20} />
              <Typography>Loading history...</Typography>
            </Stack>
          </KiddoCard>
        ) : sortedItems.length === 0 ? (
          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Typography>No story history yet.</Typography>
          </KiddoCard>
        ) : (
          <Grid container spacing={3}>
            {sortedItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <KiddoCard
                  hoverEffect
                  sx={{
                    p: 3,
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onClick={() => setSelectedItem(item)} // 🔥 No forced fullscreen
                >
                  <Stack spacing={1}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {item.child_name}'s Story
                    </Typography>

                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Age {item.age ?? "N/A"}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.85rem",
                        color: "text.secondary",
                        textTransform: "capitalize",
                      }}
                    >
                      {item.type}
                    </Typography>
                  </Stack>

                  <Typography
                    sx={{
                      mt: 3,
                      fontSize: "0.75rem",
                      color: "text.disabled",
                      fontStyle: "italic",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {formatDate(item.created_at)}
                  </Typography>
                </KiddoCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      {/* ================= Dialog ================= */}
      <Dialog
        open={Boolean(selectedItem)}
        onClose={handleCloseDialog}
        fullScreen={isFullScreen}
        maxWidth="md"
        fullWidth
        BackdropProps={{
          sx: {
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(15,23,42,0.55)",
          },
        }}
        PaperProps={{
          sx: {
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
            borderRadius: isFullScreen ? 0 : 1,
            height: isFullScreen ? "100%" : "80vh",
            width: isFullScreen ? "100%" : "90%",
            maxWidth: isFullScreen ? "100%" : 900,
            margin: isFullScreen ? 0 : "auto",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        {selectedItem && (
          <>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 3,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                backgroundColor: "rgba(248,250,252,0.8)",
                backdropFilter: "blur(6px)",
              }}
            >
              {/* LEFT: Close */}
              <IconButton onClick={handleCloseDialog}>
                <X size={18} />
              </IconButton>

              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Typography fontWeight={600}>Story Details</Typography>
              </Box>

              {/* RIGHT: Minimize / Maximize */}
              <IconButton onClick={toggleSize}>
                {isFullScreen ? (
                  <Minimize2 size={18} />
                ) : (
                  <Maximize2 size={18} />
                )}
              </IconButton>
            </Box>

            {/* Metadata */}
            <Box sx={{ px: 4, py: 3 }}>
              <Typography color="text.secondary">
                {formatDate(selectedItem.created_at)} | {selectedItem.type} |
                Age {selectedItem.age ?? "N/A"} | Child{" "}
                {selectedItem.child_name}
              </Typography>
            </Box>

            {/* Story Content */}
            <Box
              sx={{
                flex: 1,
                px: 4,
                pb: 4,
                overflowY: "auto",
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedItem.story}
              </ReactMarkdown>
            </Box>
          </>
        )}
      </Dialog>
    </AppShellLayout>
  );
};

export default StoryHistoryPage;
