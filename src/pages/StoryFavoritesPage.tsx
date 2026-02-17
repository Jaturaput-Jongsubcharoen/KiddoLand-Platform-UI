import React, { useEffect, useState } from 'react';
import { Stack, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout, KiddoCard } from '../components';
import BackButton from '../components/BackButton';
import { StoryHistoryItem, getFavoriteStories } from '../utils/aiApi';

export const StoryFavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<StoryHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('You are not logged in. Please log in to view your favorites.');
      return;
    }
    const fetchFavorites = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFavoriteStories(token);
        setFavorites(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load favorites.');
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <AppShellLayout>
      <Stack spacing={3}>
        <div>
          <BackButton />
        </div>
        <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
          <Typography variant="h4">Favourite Stories</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Newest favorite stories appear first.
          </Typography>
        </KiddoCard>

        {loading && (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body1">Loading favorites...</Typography>
          </Stack>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {!loading && !error && favorites.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No favorite stories yet.
          </Typography>
        )}
        {!loading && !error && favorites.length > 0 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {[...favorites].reverse().map((item) => (
              <KiddoCard key={item.id} hoverEffect sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Age {item.age ?? 'N/A'} • {item.type} • {item.child_name ?? 'Unknown'}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
                  Prompt
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.prompt}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
                  Story
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {item.story}
                </Typography>
              </KiddoCard>
            ))}
          </Stack>
        )}
      </Stack>
    </AppShellLayout>
  );
};

export default StoryFavoritesPage;
