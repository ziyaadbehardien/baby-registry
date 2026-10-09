import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

import { useLeaveRegistryMutation } from '../features/access/accessApiSlice';
import { useRole } from '../features/user/userApiSlice';

/** Header avatar for the current visitor, with their role and a "Leave" action. */
const VisitorMenu = () => {
  const navigate = useNavigate();
  const { name, isOwner } = useRole();
  const [leaveRegistry] = useLeaveRegistryMutation();
  const [anchor, setAnchor] = useState(null);

  const handleLeave = async () => {
    setAnchor(null);
    await leaveRegistry();
    navigate('/welcome', { replace: true });
  };

  return (
    <>
      <IconButton
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-label={`Account menu for ${name ?? 'visitor'}`}
        aria-haspopup="menu"
        sx={{ p: 0.5 }}
      >
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: 'primary.light',
            color: 'primary.dark',
            fontWeight: 700,
          }}
        >
          {name?.[0]?.toUpperCase() ?? '?'}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          disabled
          sx={{ opacity: '1 !important', flexDirection: 'column', alignItems: 'flex-start' }}
        >
          <Typography fontWeight={700}>{name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {isOwner ? 'Registry owner' : 'Guest'}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLeave}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Leave on this device
        </MenuItem>
      </Menu>
    </>
  );
};

export default VisitorMenu;
