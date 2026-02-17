import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Stack, IconButton, Alert } from '@mui/material';
import { Mic, MicOff, RotateCcw } from 'lucide-react';
import { KiddoButton } from '../KiddoButton';
import { KiddoCard } from '../KiddoCard';
import { VoiceRecorder } from '../../utils/speechApi';

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void;
  disabled?: boolean;
}

export const VoiceRecorderComponent: React.FC<VoiceRecorderProps> = ({
  onTranscriptChange,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const recorderRef = useRef<VoiceRecorder | null>(null);

  const isSupportedBrowser = VoiceRecorder.isSpeechRecognitionSupported();

  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.stop();
      }
    };
  }, []);

  const handleStartRecording = () => {
    try {
      setError('');
      const recorder = new VoiceRecorder();
      recorderRef.current = recorder;

      recorder.start(
        (text: string, isFinal: boolean) => {
          if (isFinal) {
            setTranscript((prev) => {
              const newTranscript = prev ? `${prev} ${text}` : text;
              onTranscriptChange(newTranscript);
              return newTranscript;
            });
            setInterimTranscript('');
          } else {
            setInterimTranscript(text);
          }
        },
        (errorMessage: string) => {
          setError(errorMessage);
          setIsRecording(false);
        }
      );

      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  const handleStopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
      setInterimTranscript('');
    }
  };

  const handleReset = () => {
    setTranscript('');
    setInterimTranscript('');
    onTranscriptChange('');
  };

  if (!isSupportedBrowser) {
    return (
      <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
        <Alert severity="warning">
          Voice recording is not supported in your browser. Please use Chrome, Edge, or Safari for
          voice input features.
        </Alert>
      </KiddoCard>
    );
  }

  return (
    <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
      <Stack spacing={3} alignItems="center">
        {/* Microphone Button */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: isRecording ? 140 : 120,
              height: isRecording ? 140 : 120,
              borderRadius: '50%',
              bgcolor: isRecording ? 'error.light' : 'primary.light',
              opacity: 0.2,
              animation: isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                  opacity: 0.3,
                },
                '50%': {
                  transform: 'scale(1.1)',
                  opacity: 0.1,
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 0.3,
                },
              },
            }}
          />
          <IconButton
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={disabled}
            sx={{
              width: 100,
              height: 100,
              bgcolor: isRecording ? 'error.main' : 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: isRecording ? 'error.dark' : 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'action.disabledBackground',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isRecording ? <MicOff size={40} /> : <Mic size={40} />}
          </IconButton>
        </Box>

        {/* Status Text */}
        <Typography
          variant="h6"
          color={isRecording ? 'error.main' : 'text.secondary'}
          sx={{ fontWeight: 600 }}
        >
          {isRecording ? '🔴 Recording... Tap to stop' : '🎤 Tap to start recording'}
        </Typography>

        {/* Error Message */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Transcript Display */}
        {(transcript || interimTranscript) && (
          <Box
            sx={{
              width: '100%',
              minHeight: 120,
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              position: 'relative',
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {transcript}
              {transcript && interimTranscript && ' '}
              {interimTranscript && (
                <Box component="span" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  {interimTranscript}
                </Box>
              )}
            </Typography>

            {transcript && (
              <IconButton
                size="small"
                onClick={handleReset}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'text.secondary',
                }}
                title="Clear transcript"
              >
                <RotateCcw size={18} />
              </IconButton>
            )}
          </Box>
        )}

        {/* Instructions */}
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Speak naturally about the story you'd like to create. Include details like the child's
          name, age, interests, and what kind of story you want.
        </Typography>
      </Stack>
    </KiddoCard>
  );
};
