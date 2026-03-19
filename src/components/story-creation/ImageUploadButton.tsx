import React, { useRef, useState } from "react";
import { Button, CircularProgress, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { Camera, Check, Image as ImageIcon, Upload } from "lucide-react";

interface ImageUploadButtonProps {
  onAddImages: (files: File[]) => void;
  imagesCount: number;
  isProcessing?: boolean;
  variant?: "button" | "icon";
}

export const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  onAddImages,
  imagesCount,
  isProcessing = false,
  variant = "button",
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length) {
      onAddImages(files);
    }
    event.target.value = "";
    handleMenuClose();
  };

  const handleTakePhoto = () => {
    handleMenuClose();
    cameraInputRef.current?.click();
  };

  const handleUploadImage = () => {
    handleMenuClose();
    uploadInputRef.current?.click();
  };

  const buttonColor = imagesCount > 0 ? "success.main" : "primary.main";
  const buttonLabel = isProcessing
    ? "Analyzing..."
    : imagesCount > 0
    ? "Images Added ✓"
    : "Add Image";

  const tooltipText = isProcessing
    ? "Analyzing your images..."
    : imagesCount > 0
    ? "Add more images or replace existing ones below"
    : "Upload or capture images to inspire the story";

  return (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {variant === "icon" ? (
        <Tooltip title={tooltipText}>
          <span>
            <IconButton
              onClick={handleMenuOpen}
              disabled={isProcessing}
              aria-label={
                isProcessing
                  ? "Analyzing images"
                  : imagesCount > 0
                  ? "Manage images"
                  : "Add image"
              }
              sx={{
                color: buttonColor,
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid",
                borderColor: buttonColor,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                boxShadow: "none",
                "&:hover": {
                  borderColor: buttonColor,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                },
                "&:disabled": {
                  borderColor: "text.disabled",
                  color: "text.disabled",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                },
              }}
            >
              {isProcessing ? (
                <CircularProgress size={18} />
              ) : imagesCount > 0 ? (
                <Check size={18} />
              ) : (
                <Camera size={18} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <Tooltip title={tooltipText}>
          <Button
            onClick={handleMenuOpen}
            disabled={isProcessing}
            startIcon={
              isProcessing ? (
                <CircularProgress size={18} />
              ) : imagesCount > 0 ? (
                <Check size={18} />
              ) : (
                <Camera size={18} />
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
              backgroundColor: "transparent",
              "&:hover": {
                borderColor: buttonColor,
                backgroundColor: "rgba(0, 0, 0, 0.04)",
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
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={handleTakePhoto}>
          <Camera size={16} style={{ marginRight: 8 }} />
          Take Photo
        </MenuItem>
        <MenuItem onClick={handleUploadImage}>
          <Upload size={16} style={{ marginRight: 8 }} />
          Upload Image from Device
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ImageIcon size={16} style={{ marginRight: 8 }} />
          Cancel
        </MenuItem>
      </Menu>
    </>
  );
};
