import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { KiddoCard } from '../KiddoCard';
import { InfoTooltip } from '../InfoTooltip';
import { fetchBookRecommendations, type BookRecommendation } from '../../utils/recommendationsApi';
import {
  loadRecommendationActivity,
  RECS_UPDATED_EVENT,
  saveRecommendationActivity,
} from '../../utils/recommendationActivity';
import { getCachedRecommendations, setCachedRecommendations } from '../../utils/recommendationCache';

/** Same outer box for real covers and placeholders — avoids one card looking smaller */
const COVER_BOX = 70;
const COVER_RADIUS = '14px';

/** Match Quick Actions grid: full width on xs, three columns from md up */
const gridItemProps = { xs: 12 as const, md: 4 as const };

const BOOKS_PAGE_SIZE = 3;

const BookCoverBadge: React.FC<{ cover: string | null }> = ({ cover }) => {
  const [failed, setFailed] = useState(false);
  const shellSx = {
    width: COVER_BOX,
    height: COVER_BOX,
    borderRadius: COVER_RADIUS,
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const;

  if (cover && !failed) {
    return (
      <Box sx={{ ...shellSx, bgcolor: 'action.hover' }}>
        <Box
          component="img"
          alt=""
          src={cover}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setFailed(true)}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ...shellSx,
        bgcolor: 'rgba(29, 78, 216, 0.1)',
        color: 'primary.main',
      }}
    >
      <BookOpen size={Math.round(COVER_BOX * 0.42)} strokeWidth={1.75} aria-hidden />
    </Box>
  );
};

function bootstrapRecommendedBooksState() {
  const { topic, age } = loadRecommendationActivity();
  const cached = getCachedRecommendations(topic, age);
  return {
    books: cached ? cached.slice(0, 5) : [],
    loading: cached === null,
    activeTopic: topic,
    activityAge: age,
    searchInput: topic,
  };
}

interface RecommendedBooksSectionProps {
  /** Override the default section heading. */
  sectionTitle?: string;
}

export const RecommendedBooksSection: React.FC<RecommendedBooksSectionProps> = ({
  sectionTitle = 'Recommended for You 📚',
}) => {
  const bootRef = React.useRef<ReturnType<typeof bootstrapRecommendedBooksState> | null>(null);
  if (bootRef.current === null) {
    bootRef.current = bootstrapRecommendedBooksState();
  }
  const boot = bootRef.current;

  const [books, setBooks] = useState<BookRecommendation[]>(boot.books);
  const [loading, setLoading] = useState(boot.loading);
  const [error, setError] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState(boot.activeTopic);
  const [activityAge, setActivityAge] = useState<number | null>(boot.activityAge);
  const [searchInput, setSearchInput] = useState(boot.searchInput);
  const [bookPageOffset, setBookPageOffset] = useState(0);

  const loadBooks = useCallback(async () => {
    const { topic, age } = loadRecommendationActivity();
    setActiveTopic(topic);
    setActivityAge(age);
    setSearchInput(topic);
    const cached = getCachedRecommendations(topic, age);
    if (cached !== null) {
      setBooks(cached.slice(0, 5));
      setLoading(false);
      setError(null);
    } else {
      setBooks([]);
      setLoading(true);
      setError(null);
    }
    try {
      const list = await fetchBookRecommendations(topic, age ?? undefined);
      const slice = list.slice(0, 5);
      setBooks(slice);
      setCachedRecommendations(topic, age, slice);
      setError(null);
    } catch (e) {
      if (cached === null) {
        setBooks([]);
        setError(e instanceof Error ? e.message : 'Could not load recommendations.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    setBookPageOffset(0);
  }, [books]);

  useEffect(() => {
    const handler = () => void loadBooks();
    window.addEventListener(RECS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(RECS_UPDATED_EVENT, handler);
  }, [loadBooks]);

  const visibleBooks = useMemo(
    () => books.slice(bookPageOffset, bookPageOffset + BOOKS_PAGE_SIZE),
    [books, bookPageOffset],
  );

  const canGoBookPrev = bookPageOffset > 0;
  const canGoBookNext = bookPageOffset + BOOKS_PAGE_SIZE < books.length;
  const showBookCarouselNav = books.length > BOOKS_PAGE_SIZE;

  const goBookPrev = () => {
    setBookPageOffset((o) => Math.max(0, o - BOOKS_PAGE_SIZE));
  };

  const goBookNext = () => {
    setBookPageOffset((o) => {
      if (o + BOOKS_PAGE_SIZE >= books.length) return o;
      return o + BOOKS_PAGE_SIZE;
    });
  };

  const handleSearchSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next = searchInput.trim();
    if (!next) {
      return;
    }
    const age = activityAge;
    setActiveTopic(next);
    saveRecommendationActivity(next, age, { notify: false });
    setBooks([]);
    setLoading(true);
    setError(null);
    try {
      const list = await fetchBookRecommendations(next, age ?? undefined);
      const slice = list.slice(0, 5);
      setBooks(slice);
      setCachedRecommendations(next, age, slice);
      setError(null);
    } catch (e) {
      setBooks([]);
      setError(e instanceof Error ? e.message : 'Could not load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const openBook = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const showInitialSpinner = loading && books.length === 0;
  const searchBusy = loading && books.length === 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" component="h2">
          {sectionTitle}
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <TextField
            label="Search by topic"
            placeholder="e.g. dinosaurs, ocean, friendship"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            fullWidth
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                background:
                  'linear-gradient(160deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.28) 100%)',
                backdropFilter: 'blur(14px) saturate(145%)',
                WebkitBackdropFilter: 'blur(14px) saturate(145%)',
                borderRadius: 3,
              },
            }}
          />
          <Button type="submit" variant="contained" disabled={searchBusy || !searchInput.trim()}>
            Search
          </Button>
        </Stack>
      </Box>

      {showInitialSpinner && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {!showInitialSpinner && error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!showInitialSpinner && !error && books.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No books found for this topic. Try another search under More.
        </Typography>
      )}

      {books.length > 0 && (
        <Stack
          direction="row"
          alignItems="stretch"
          sx={{
            width: '100%',
            gap: showBookCarouselNav ? { xs: 0.5, sm: 0.75 } : 0,
          }}
        >
          {showBookCarouselNav && (
            <IconButton
              aria-label="Show previous books"
              onClick={goBookPrev}
              disabled={!canGoBookPrev}
              size="small"
              sx={{
                alignSelf: 'center',
                flexShrink: 0,
                p: 0.25,
                minWidth: 32,
                width: 32,
                height: 32,
                color: 'primary.main',
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.5)',
                bgcolor: 'rgba(255,255,255,0.34)',
                backdropFilter: 'blur(12px) saturate(145%)',
                WebkitBackdropFilter: 'blur(12px) saturate(145%)',
                '&:disabled': { opacity: 0.35 },
              }}
            >
              <ChevronLeft size={20} strokeWidth={2.25} />
            </IconButton>
          )}

          <Grid container spacing={2} alignItems="stretch" sx={{ flex: 1, minWidth: 0 }}>
            {visibleBooks.map((book, index) => (
              <Grid
                item
                {...gridItemProps}
                key={`${book.link}-${book.title}-${bookPageOffset + index}`}
                sx={{ display: 'flex' }}
              >
                <KiddoCard
                  hoverEffect
                  onClick={() => openBook(book.link)}
                  sx={{
                    py: 1.75,
                    px: 1.5,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: COVER_BOX + 32,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="flex-start"
                    sx={{ flex: 1, minHeight: COVER_BOX }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                      <BookCoverBadge cover={book.cover} />
                      <Box sx={{ minWidth: 0, py: 0.25, flex: 1, minHeight: 42 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            lineHeight: 1.25,
                            fontSize: '1rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {book.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.125,
                            lineHeight: 1.25,
                            fontSize: '0.8125rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {book.author}
                          </Box>
                          {' · '}
                          {book.reason}
                        </Typography>
                      </Box>
                    </Stack>
                    <Box onClick={(e) => e.stopPropagation()} sx={{ flexShrink: 0, alignSelf: 'center', ml: 0.25 }}>
                      <InfoTooltip
                        title="Click the card to open this book on Open Library in a new tab."
                        placement="left"
                        ariaLabel={`More about ${book.title}`}
                      />
                    </Box>
                  </Stack>
                </KiddoCard>
              </Grid>
            ))}
          </Grid>

          {showBookCarouselNav && (
            <IconButton
              aria-label="Show more books"
              onClick={goBookNext}
              disabled={!canGoBookNext}
              size="small"
              sx={{
                alignSelf: 'center',
                flexShrink: 0,
                p: 0.25,
                minWidth: 32,
                width: 32,
                height: 32,
                color: 'primary.main',
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.5)',
                bgcolor: 'rgba(255,255,255,0.34)',
                backdropFilter: 'blur(12px) saturate(145%)',
                WebkitBackdropFilter: 'blur(12px) saturate(145%)',
                '&:disabled': { opacity: 0.35 },
              }}
            >
              <ChevronRight size={20} strokeWidth={2.25} />
            </IconButton>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default RecommendedBooksSection;
