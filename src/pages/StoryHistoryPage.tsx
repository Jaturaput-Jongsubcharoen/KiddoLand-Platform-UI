import React, { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout, KiddoButton, KiddoCard } from '../components';
import { useApp } from '../context/AppContext';
import { getStoryHistory, StoryHistoryItem } from '../utils/aiApi';
import { SharedNavBar } from '../components/SharedNavBar';
import BackButton from '../components/BackButton';

const formatDate = (value: string | null): string => {
  if (!value) {
    return 'Unknown';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
};

export const StoryHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { appState } = useApp();

  const [items, setItems] = useState<StoryHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      if (!appState.accessToken) {
        setErrorMessage('You are not authenticated. Please sign in again.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');
        const historyItems = await getStoryHistory(appState.accessToken);
        setItems(historyItems);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load story history.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [appState.accessToken]);

  return (
    <AppShellLayout>
      <Stack spacing={3}>
        <KiddoCard hoverEffect={false} sx={{ p: 2.5 }}>
          <SharedNavBar />
        </KiddoCard>

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
              <Typography variant="body1">Loading history...</Typography>
            </Stack>
          </KiddoCard>
        ) : items.length === 0 ? (
          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Typography variant="body1">No story history yet.</Typography>
          </KiddoCard>
        ) : (
          items.map((item) => (
            <KiddoCard key={item.id} hoverEffect={false} sx={{ p: 4 }}>
              <Stack spacing={1.25}>
                <Typography variant="subtitle2" color="text.secondary">
                  {formatDate(item.created_at)} • {item.type} • Age {item.age ?? 'N/A'} • Child {item.child_name}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
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
              </Stack>
            </KiddoCard>
          ))
        )}
      </Stack>
    </AppShellLayout>
  );
};

export default StoryHistoryPage;
