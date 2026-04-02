import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  Grid,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, Minimize2, Maximize2, Heart } from "lucide-react";
import { AppShellLayout, KiddoCard, KiddoButton } from "../components";
import { useApp } from "../context/AppContext";
import {
  StoryHistoryItem,
  getFavoriteStories,
  toggleFavorite,
} from "../utils/aiApi";
import {
  getHistoryCardTitle,
  getContentKind,
  getHistoryAudioSrc,
  matchesHistoryFilter,
  type HistoryContentKindFilter,
} from "../utils/historyDisplay";

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

export const StoryFavoritesPage: React.FC = () => {
  const { appState } = useApp();
  const [items, setItems] = useState<StoryHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<StoryHistoryItem | null>(
    null,
  );
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [kindFilter, setKindFilter] = useState<HistoryContentKindFilter>("all");

  // Pagination state
  const [displayCount, setDisplayCount] = useState(12);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [kindFilter]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!appState.accessToken) {
        setErrorMessage("You are not authenticated.");
        setIsLoading(false);
        return;
      }

      try {
        const favoriteItems = await getFavoriteStories(appState.accessToken);
        setItems(favoriteItems);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load favorites.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [appState.accessToken]);

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at),
      ),
    [items],
  );

  const filteredItems = useMemo(
    () => sortedItems.filter((it) => matchesHistoryFilter(it, kindFilter)),
    [sortedItems, kindFilter],
  );

  const displayedItems = filteredItems.slice(0, displayCount);
  const hasMore = displayCount < filteredItems.length;

  const handleCloseDialog = () => {
    setSelectedItem(null);
  };

  const toggleSize = () => {
    setIsFullScreen((prev) => !prev);
  };

  const handleFavoriteClick = async (
    e: React.MouseEvent,
    item: StoryHistoryItem,
  ) => {
    e.stopPropagation(); // Prevent card click

    if (!appState.accessToken) return;

    try {
      const response = await toggleFavorite(item.id, appState.accessToken);

      // If unfavorited, remove from the list
      if (!response.is_favorite) {
        setItems((prev) =>
          prev.filter((storyItem) => storyItem.id !== item.id),
        );

        // If viewing the unfavorited story in dialog, close it
        if (selectedItem?.id === item.id) {
          setSelectedItem(null);
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update favorite status.";
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
          <Typography variant="h4">Favourites</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Saved stories and rhymes. Click the heart to remove from favorites.
          </Typography>
        </Box>

        {!isLoading && sortedItems.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              width: "100%",
            }}
          >
            <ToggleButtonGroup
              exclusive
              size="small"
              value={kindFilter}
              onChange={(_, v: HistoryContentKindFilter | null) => v && setKindFilter(v)}
              aria-label="Filter favorites by content type"
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="story">Stories</ToggleButton>
              <ToggleButton value="rhyme">Rhymes</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {isLoading ? (
          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={20} />
              <Typography>Loading favorites...</Typography>
            </Stack>
          </KiddoCard>
        ) : sortedItems.length === 0 ? (
          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Typography>
              No favorites yet. Save from story or rhyme creation, or from history.
            </Typography>
          </KiddoCard>
        ) : filteredItems.length === 0 ? (
          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Typography>No favorites match this filter.</Typography>
          </KiddoCard>
        ) : (
          <>
            <Grid container spacing={3} sx={{ width: "100%" }}>
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
                    {/* Remove from Favorites Heart - Top Right */}
                    <IconButton
                      onClick={(e) => handleFavoriteClick(e, item)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "#E91E63",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          color: "#999",
                          transform: "scale(1.15)",
                        },
                      }}
                    >
                      <Heart size={20} fill="#E91E63" strokeWidth={2} />
                    </IconButton>

                    <Stack spacing={1}>
                      <Typography variant="h6" sx={{ fontWeight: 700, pr: 5 }}>
                        {getHistoryCardTitle(item)}
                      </Typography>

                      {item.type === "rewrite" && (
                        <Chip size="small" label="Rewritten" variant="outlined" />
                      )}

                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Age {item.age ?? "N/A"}
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
                    background:
                      "linear-gradient(135deg, #4ECDC4 0%, #45B649 100%)",
                    boxShadow: "0 4px 14px rgba(78, 205, 196, 0.4)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #45B649 0%, #4ECDC4 100%)",
                      boxShadow: "0 6px 20px rgba(78, 205, 196, 0.6)",
                    },
                  }}
                >
                  Load More Favorites
                </KiddoButton>
              </Box>
            )}
          </>
        )}
      </Stack>

      {/* ================= Story Details Dialog ================= */}
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
                <Typography fontWeight={600}>
                  {selectedItem && getContentKind(selectedItem) === "rhyme"
                    ? "Favorite rhyme"
                    : "Favorite story"}
                </Typography>
              </Box>

              {/* RIGHT: Remove from Favorites + Minimize/Maximize */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  onClick={(e) => handleFavoriteClick(e, selectedItem)}
                  sx={{
                    color: "#E91E63",
                    "&:hover": {
                      color: "#999",
                    },
                  }}
                >
                  <Heart size={20} fill="#E91E63" strokeWidth={2} />
                </IconButton>
                <IconButton onClick={toggleSize}>
                  {isFullScreen ? (
                    <Minimize2 size={18} />
                  ) : (
                    <Maximize2 size={18} />
                  )}
                </IconButton>
              </Box>
            </Box>

            {/* Metadata */}
            <Box sx={{ px: 4, py: 3 }}>
              {selectedItem.type === "rewrite" && (
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip size="small" label="Rewritten" variant="outlined" />
                </Stack>
              )}
              <Typography color="text.secondary">
                {formatDate(selectedItem.created_at)} | Age {selectedItem.age ?? "N/A"} |{" "}
                {selectedItem.child_name}
              </Typography>
              {getHistoryAudioSrc(selectedItem) && (
                <Box sx={{ mt: 2 }}>
                  <audio
                    controls
                    src={getHistoryAudioSrc(selectedItem) ?? undefined}
                    style={{ width: "100%", maxWidth: 480 }}
                  />
                </Box>
              )}
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

export default StoryFavoritesPage;
