import React from 'react';
import { Box, Typography, Grid, SxProps, Theme } from '@mui/material';

interface GridSectionProps {
  title: string;
  /** Optional line under the title (e.g. section intro copy). */
  description?: string;
  spacing?: number;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  /** Merged into the section title typography (e.g. gradient text). */
  titleSx?: SxProps<Theme>;
}

export const GridSection: React.FC<GridSectionProps> = ({
  title,
  description,
  spacing = 3,
  columns = { xs: 12, md: 4 },
  children,
  sx,
  titleSx,
}) => {
  return (
    <Box sx={sx}>
      <Typography
        variant="h5"
        sx={{
          mb: description ? 0.75 : 2,
          fontWeight: 800,
          fontFamily: '"Fredoka", "Nunito", sans-serif',
          letterSpacing: '-0.02em',
          ...titleSx,
        }}
      >
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720, lineHeight: 1.65 }}>
          {description}
        </Typography>
      ) : null}
      <Grid container spacing={spacing}>
        {React.Children.map(children, (child) => (
          <Grid item {...columns}>
            {child}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GridSection;
