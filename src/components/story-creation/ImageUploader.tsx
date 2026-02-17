import React, { useState, useRef, useCallback } from 'react';
import { Box, Typography, Stack, Alert, IconButton } from '@mui/material';
import { Upload, Camera, X, RotateCw } from 'lucide-react';
import { KiddoButton } from '../KiddoButton';
import { KiddoCard } from '../KiddoCard';
import {
  validateImageFile,
  createPreviewUrl,
  revokePreviewUrl,
  fileToBase64,
} from '../../utils/imageApi';

interface ImageUploaderProps {
  onImageSelect: (imageData: { file: File; base64: string; preview: string }) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, disabled = false }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError('');

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      try {
        // Create preview
        const previewUrl = createPreviewUrl(file);
        setPreview(previewUrl);

        // Convert to base64
        const base64 = await fileToBase64(file);

        // Notify parent
        onImageSelect({
          file,
          base64,
          preview: previewUrl,
        });
      } catch (err) {
        setError('Failed to process image. Please try again.');
        console.error('Image processing error:', err);
      }
    },
    [onImageSelect]
  );

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    if (preview) {
      revokePreviewUrl(preview);
    }
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        {!preview ? (
          <>
            {/* Upload Area */}
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{
                border: 2,
                borderStyle: 'dashed',
                borderColor: isDragging ? 'primary.main' : 'divider',
                borderRadius: 3,
                p: 6,
                textAlign: 'center',
                bgcolor: isDragging ? 'primary.light' : 'background.paper',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
              onClick={handleClickUpload}
            >
              <Stack spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Upload size={40} color="inherit" />
                </Box>

                <Typography variant="h6">
                  {isDragging ? 'Drop your image here' : 'Upload an Image'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Drag and drop or click to browse
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Supports: JPEG, PNG, GIF, WebP (Max 5MB)
                </Typography>
              </Stack>
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              disabled={disabled}
            />

            <KiddoButton
              variant="outlined"
              startIcon={<Camera size={20} />}
              onClick={handleClickUpload}
              disabled={disabled}
              fullWidth
            >
              Choose Image
            </KiddoButton>
          </>
        ) : (
          <>
            {/* Image Preview */}
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={preview}
                alt="Upload preview"
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              />

              <IconButton
                onClick={handleClear}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'error.main',
                  },
                }}
                size="small"
              >
                <X size={20} />
              </IconButton>
            </Box>

            <Stack direction="row" spacing={2}>
              <KiddoButton
                variant="outlined"
                startIcon={<RotateCw size={20} />}
                onClick={() => {
                  handleClear();
                  setTimeout(handleClickUpload, 100);
                }}
                disabled={disabled}
                fullWidth
              >
                Change Image
              </KiddoButton>
            </Stack>
          </>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Upload a drawing, photo, or any image to inspire a personalized story
        </Typography>
      </Stack>
    </KiddoCard>
  );
};
