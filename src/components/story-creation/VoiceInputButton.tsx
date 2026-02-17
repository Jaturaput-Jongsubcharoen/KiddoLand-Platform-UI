import React, { useState, useEffect, useRef } from "react";
import { Box, Button, CircularProgress, Tooltip, keyframes } from "@mui/material";
import { Mic, MicOff, Check } from "lucide-react";

interface VoiceInputButtonProps {
  onTranscribe: (transcription: string) => void;
  currentTranscription: string | null;
}

// Pulse animation for recording state
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
`;

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscribe,
  currentTranscription,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscribe(transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setError(event.error === "no-speech" ? "No speech detected. Please try again." : "Voice input failed. Please try again.");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscribe]);

  const handleClick = () => {
    if (!isSupported) {
      setError("Voice input is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      setError(null);
      setIsRecording(true);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error("Failed to start recognition:", err);
        setError("Failed to start voice input. Please try again.");
        setIsRecording(false);
      }
    }
  };

  const buttonColor = currentTranscription
    ? "success.main"
    : isRecording
    ? "error.main"
    : "primary.main";

  const buttonLabel = currentTranscription
    ? "Voice Added ✓"
    : isRecording
    ? "Listening..."
    : "Add Voice";

  const tooltipText = !isSupported
    ? "Voice input not supported in this browser"
    : error
    ? error
    : currentTranscription
    ? "Voice input captured. Click to record again."
    : isRecording
    ? "Click to stop recording"
    : "Click to record your voice";

  return (
    <Tooltip title={tooltipText}>
      <Button
        onClick={handleClick}
        disabled={!isSupported}
        startIcon={
          isRecording ? (
            <MicOff size={18} />
          ) : currentTranscription ? (
            <Check size={18} />
          ) : (
            <Mic size={18} />
          )
        }
        sx={{
          minWidth: 140,
          px: 2,
          py: 1,
          borderRadius: 3,
          textTransform: "none",
          fontWeight: 600,
          border: 2,
          borderColor: buttonColor,
          color: buttonColor,
          backgroundColor: isRecording ? "rgba(239, 68, 68, 0.1)" : "transparent",
          animation: isRecording ? `${pulse} 2s infinite` : "none",
          "&:hover": {
            borderColor: buttonColor,
            backgroundColor: isRecording
              ? "rgba(239, 68, 68, 0.15)"
              : "rgba(0, 0, 0, 0.04)",
          },
          "&:disabled": {
            borderColor: "text.disabled",
            color: "text.disabled",
          },
        }}
      >
        {buttonLabel}
      </Button>
    </Tooltip>
  );
};
