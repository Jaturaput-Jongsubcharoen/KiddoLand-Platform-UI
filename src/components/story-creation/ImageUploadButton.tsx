import React, { useState, useRef } from "react";
import { Box, Button, CircularProgress, Tooltip, Avatar } from "@mui/material";
import { Image, Camera, Check, X } from "lucide-react";

interface ImageUploadButtonProps {
  onUpload: (file: File, analysis: string) => void;
  onRemove: () => void;
  uploadedImage: File | null;
  imageAnalysis: string | null;
}

export const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  onUpload,
  onRemove,
  uploadedImage,
  imageAnalysis,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = async (file: File): Promise<string> => {
    // Simulate AI image analysis
    // In production, this would call your AI vision API (GPT-4 Vision, Claude Vision, etc.)
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock analysis based on file name or random elements
        const elements = [
          "a colorful toy",
          "a cute drawing",
          "a stuffed animal",
          "an artistic creation",
          "a creative picture",
        ];
        const colors = ["bright colors", "blue and green", "rainbow colors", "soft pastels"];
        const moods = ["cheerful", "playful", "imaginative", "whimsical"];

        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomMood = moods[Math.floor(Math.random() * moods.length)];

        resolve(`${randomElement} with ${randomColor}, ${randomMood} style`);
      }, 2000);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB");
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeImage(file);
      onUpload(file, analysis);
    } catch (error) {
      console.error("Image analysis failed:", error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (uploadedImage) {
      onRemove();
    } else {
      fileInputRef.current?.click();
    }
  };

  const buttonColor = uploadedImage ? "success.main" : "primary.main";
  const buttonLabel = isAnalyzing
    ? "Analyzing..."
    : uploadedImage
    ? "Image Added ✓"
    : "Add Image";

  const tooltipText = isAnalyzing
    ? "Analyzing your image..."
    : uploadedImage
    ? "Click to remove and upload a different image"
    : "Upload or capture an image to inspire the story";

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      
      <Tooltip title={tooltipText}>
        <Button
          onClick={handleClick}
          disabled={isAnalyzing}
          startIcon={
            isAnalyzing ? (
              <CircularProgress size={18} />
            ) : uploadedImage ? (
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
    </>
  );
};
