import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Camera, X } from "lucide-react";

interface CameraCaptureDialogProps {
  open: boolean;
  stream: MediaStream | null;
  isLoading: boolean;
  onCapture: (file: File) => void;
  onClose: () => void;
}

const buildPhotoFile = async (
  video: HTMLVideoElement,
): Promise<File | null> => {
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );
  if (!blob) return null;

  const fileName = `photo-${Date.now()}.jpg`;
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
};

export const CameraCaptureDialog: React.FC<CameraCaptureDialogProps> = ({
  open,
  stream,
  isLoading,
  onCapture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsReady(false);
      return;
    }

    const video = videoRef.current;
    if (!video || !stream) return;

    const videoWithSource = video as HTMLVideoElement & {
      srcObject?: MediaStream | null;
    };

    if (typeof videoWithSource.srcObject !== "undefined") {
      videoWithSource.srcObject = stream;
    } else {
      // Fallback for older browsers
      videoWithSource.src = window.URL.createObjectURL(
        stream as unknown as MediaSource,
      );
    }

    const handleLoaded = () => {
      video.play().catch(() => undefined);
      setIsReady(true);
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, [open, stream]);

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video) return;

    const file = await buildPhotoFile(video);
    if (file) {
      onCapture(file);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Camera size={18} />
        Take Photo
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            paddingTop: "75%",
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: "rgba(15, 23, 42, 0.9)",
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
                color: "white",
                backgroundColor: "rgba(15, 23, 42, 0.6)",
              }}
            >
              <CircularProgress size={28} color="inherit" />
            </Box>
          )}
          <Box
            component="video"
            ref={videoRef}
            autoPlay
            muted
            playsInline
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          Align your camera and tap Capture.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} startIcon={<X size={16} />}>
          Cancel
        </Button>
        <Button
          onClick={handleCapture}
          variant="contained"
          startIcon={<Camera size={16} />}
          disabled={!stream || !isReady || isLoading}
        >
          Capture
        </Button>
      </DialogActions>
    </Dialog>
  );
};
