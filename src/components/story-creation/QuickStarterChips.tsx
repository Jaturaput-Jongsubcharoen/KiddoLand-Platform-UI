import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { Moon, Rocket, BookOpen, Smile, Sparkles, Heart } from "lucide-react";

interface QuickStarterChipsProps {
  onSelect: (template: string) => void;
}

const quickStarters = [
  {
    label: "Bedtime Story",
    icon: <Moon size={16} />,
    template: "Tell a calming bedtime story about",
  },
  {
    label: "Adventure",
    icon: <Rocket size={16} />,
    template: "Create an exciting adventure story about",
  },
  {
    label: "Learning",
    icon: <BookOpen size={16} />,
    template: "Write an educational story that teaches",
  },
  {
    label: "Funny",
    icon: <Smile size={16} />,
    template: "Create a funny story about",
  },
  {
    label: "Magical",
    icon: <Sparkles size={16} />,
    template: "Tell a magical story about",
  },
  {
    label: "Friendship",
    icon: <Heart size={16} />,
    template: "Create a heartwarming story about friendship and",
  },
];

export const QuickStarterChips: React.FC<QuickStarterChipsProps> = ({
  onSelect,
}) => {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        💡 Need inspiration? Try a quick starter:
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {quickStarters.map((starter) => (
          <Chip
            key={starter.label}
            icon={starter.icon}
            label={starter.label}
            onClick={() => onSelect(starter.template)}
            clickable
            sx={{
              fontSize: "0.9rem",
              py: 2.5,
              px: 1,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 2,
              },
              transition: "all 0.2s ease",
              cursor: "pointer",
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};
