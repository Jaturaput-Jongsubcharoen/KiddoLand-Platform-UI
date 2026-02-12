import React, { ReactNode } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  User,
  Home,
  School,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface AppShellLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export const AppShellLayout: React.FC<AppShellLayoutProps> = ({
  children,
  showNav = true,
}) => {
  const navigate = useNavigate();
  const { appState, logout } = useApp();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const isHome = appState.selectedMode === 'home';
  const isInstitution = appState.selectedMode === 'institution';

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const getModeLabel = () => {
    if (isHome) return 'Home Mode';
    if (isInstitution) return 'Institution Mode';
    return '';
  };

  const getModeIcon = () => {
    if (isHome) return <Home size={16} />;
    if (isInstitution) return <School size={16} />;
    return undefined;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showNav && (
        <AppBar position="sticky" elevation={0}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              <Box
                component="img"
                src="/KiddoLand_Logo.jpeg"
                alt="KiddoLand Logo"
                sx={{
                  height: { xs: 65, sm: 75, md: 85 },
                  width: 'auto',
                  objectFit: 'contain',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {appState.selectedMode && (
                <Chip
                  icon={getModeIcon()}
                  label={getModeLabel()}
                  color={isHome ? 'secondary' : 'info'}
                  sx={{
                    color: '#0F172A',
                    bgcolor: 'rgba(255,255,255,0.9)',
                  }}
                />
              )}

              {isInstitution && (
                <Tooltip title="Institution workspace">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.18)',
                      display: 'flex',
                      alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <School size={20} style={{ color: '#FFFFFF' }} />
                </Box>
                </Tooltip>
              )}

              {appState.isAuthenticated && (
                <>
                  <IconButton
                    size="large"
                    onClick={handleMenu}
                    sx={{
                      color: '#FFFFFF',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <User size={24} />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        borderRadius: 3,
                        mt: 1,
                      },
                    }}
                  >
                    <MenuItem disabled sx={{ fontSize: '0.875rem', opacity: 1 }}>
                      {appState.userEmail || 'Signed in'}
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <LogOut size={20} style={{ marginRight: '8px' }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: showNav ? 'calc(100vh - 72px)' : '100vh',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default AppShellLayout;
