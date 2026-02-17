import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, Minimize2, Maximize2, Trash2, Heart } from "lucide-react";
import { AppShellLayout, KiddoCard, KiddoButton } from "../components";
import BackButton from "../components/BackButton";
import { useApp } from "../context/AppContext";
import { getStoryHistory, StoryHistoryItem, deleteStory, toggleFavorite } from "../utils/aiApi";

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
  const [itemToDelete, setItemToDelete] = useState<StoryHistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // 🔥 Default = minimized (medium size)
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Pagination state
  const [displayCount, setDisplayCount] = useState(12);
  const ITEMS_PER_PAGE = 12;

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
  
  const displayedItems = sortedItems.slice(0, displayCount);
  const hasMore = displayCount < sortedItems.length;

  const handleCloseDialog = () => {
    setSelectedItem(null);
    // ❌ DO NOT reset isFullScreen
    // It now remembers last size automatically
  };

  const toggleSize = () => {
    setIsFullScreen((prev) => !prev);
  };

  const handleDeleteClick = (e: React.MouseEvent, item: StoryHistoryItem) => {
    e.stopPropagation(); // Prevent card click
    setItemToDelete(item);
    setDeleteError("");
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !appState.accessToken) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteStory(itemToDelete.id, appState.accessToken);
      // Remove from local state
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      setItemToDelete(null);
      // If the deleted item was selected in dialog, close it
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete story.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setItemToDelete(null);
    setDeleteError("");
  };

  const handleFavoriteClick = async (e: React.MouseEvent, item: StoryHistoryItem) => {
    e.stopPropagation(); // Prevent card click

    if (!appState.accessToken) return;

    try {
      const response = await toggleFavorite(item.id, appState.accessToken);
      
      // Update local state
      setItems((prev) =>
        prev.map((storyItem) =>
          storyItem.id === item.id
            ? { ...storyItem, is_favorite: response.is_favorite }
            : storyItem
        )
      );

      // Update selected item if it's the one being toggled
      if (selectedItem?.id === item.id) {
        setSelectedItem({ ...selectedItem, is_favorite: response.is_favorite });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update favorite status.";
      setErrorMessage(message);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
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
          <>
            <Grid container spacing={3}>
              {displayedItems.map((item) => (
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
                      position: "relative",
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Action Buttons - Top Right */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        gap: 0.5,
                      }}
                    >
                      {/* Favorite Heart Button */}
                      <IconButton
                        onClick={(e) => handleFavoriteClick(e, item)}
                        sx={{
                          color: item.is_favorite ? "#E91E63" : "#999",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            color: "#E91E63",
                            transform: "scale(1.15)",
                          },
                        }}
                      >
                        <Heart 
                          size={20} 
                          fill={item.is_favorite ? "#E91E63" : "none"}
                          strokeWidth={2}
                        />
                      </IconButton>

                      {/* Delete Button */}
                      <IconButton
                        onClick={(e) => handleDeleteClick(e, item)}
                        sx={{
                          color: "#999",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            color: "#E91E63",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>

                    <Stack spacing={1}>
                      <Typography variant="h6" sx={{ fontWeight: 700, pr: 8 }}>
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

            {/* Load More Button */}
            {hasMore && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <KiddoButton
                  variant="contained"
                  onClick={handleLoadMore}
                  sx={{
                    background: 'linear-gradient(135deg, #4ECDC4 0%, #45B649 100%)',
                    boxShadow: '0 4px 14px rgba(78, 205, 196, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #45B649 0%, #4ECDC4 100%)',
                      boxShadow: '0 6px 20px rgba(78, 205, 196, 0.6)',
                    },
                  }}
                >
                  Load More Stories
                </KiddoButton>
              </Box>
            )}
          </>
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

      {/* ================= Delete Confirmation Dialog ================= */}
      <Dialog
        open={Boolean(itemToDelete)}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Story?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{itemToDelete?.child_name}'s Story"?
            This action cannot be undone.
          </Typography>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <Trash2 size={16} />}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShellLayout>
  );
};

export default StoryHistoryPage;
