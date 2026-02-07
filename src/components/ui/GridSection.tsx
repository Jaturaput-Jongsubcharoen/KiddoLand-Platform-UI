import React from 'react';
import { Box, Typography, Grid, SxProps, Theme } from '@mui/material';

interface GridSectionProps {
  title: string;
  spacing?: number;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const GridSection: React.FC<GridSectionProps> = ({
  title,
  spacing = 3,
  columns = { xs: 12, md: 4 },
  children,
  sx,
}) => {
  return (
    <Box sx={sx}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
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
