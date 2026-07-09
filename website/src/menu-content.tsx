/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import { FunctionComponent, PropsWithChildren, useState, useRef, useContext } from 'react';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { styled, alpha } from '@mui/material/styles';
import { Link as RouteLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import StatusIcon from '@mui/icons-material/NetworkCheck';
import PublishIcon from '@mui/icons-material/Publish';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HubIcon from '@mui/icons-material/Hub';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import { UserSettingsRoutes } from 'openvsx-webui/lib/pages/user/user-settings-routes';
import { MainContext } from 'openvsx-webui/lib/context';
import { itemIcon, MobileUserAvatar, headerItem, MenuLink, MenuItemText } from 'openvsx-webui/lib/default/menu-content';
import { KbdKey } from 'openvsx-webui/lib/components/kbd-key';
import { useShortcut } from 'openvsx-webui/lib/hooks/use-shortcut';
import { LoginComponent } from 'openvsx-webui/lib/default/login';
import { UserAvatar } from 'openvsx-webui/lib/pages/user/avatar';

// Shared decorator that appends an up-right arrow to mark a link as external.
const ExternalLinkLabel: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
    {children}
    <ArrowOutwardIcon sx={{ fontSize: '0.875rem', opacity: 0.6 }} />
  </Box>
);

//-------------------- Mobile View --------------------//

export const MobileMenuContent: FunctionComponent = () => {
  const { user, loginProviders } = useContext(MainContext);
  const [workingGroupOpen, setWorkingGroupOpen] = useState(false);
  const workingGroupAnchor = useRef<HTMLLIElement | null>(null);
  const closeWorkingGroup = () => setWorkingGroupOpen(false);
  return (
    <>
      {loginProviders &&
        (user ? (
          <MobileUserAvatar />
        ) : (
          <LoginComponent
            loginProviders={loginProviders}
            renderButton={(href, onClick) => {
              return (
                <MenuItem component={Link} href={href} onClick={onClick}>
                  <MenuItemText>
                    <AccountBoxIcon sx={itemIcon} />
                    Log In
                  </MenuItemText>
                </MenuItem>
              );
            }}
          />
        ))}
      {loginProviders && !location.pathname.startsWith(UserSettingsRoutes.ROOT) && (
        <MenuItem component={RouteLink} to='/user-settings/extensions'>
          <MenuItemText>
            <PublishIcon sx={itemIcon} />
            Publish Extension
          </MenuItemText>
        </MenuItem>
      )}
      <MenuItem component={Link} href='https://github.com/eclipse-openvsx/openvsx'>
        <MenuItemText>
          <GitHubIcon sx={itemIcon} />
          Source Code
        </MenuItemText>
      </MenuItem>
      <MenuItem component={Link} href='https://managed.open-vsx.org/'>
        <MenuItemText>
          <BusinessIcon sx={itemIcon} />
          Commercial Usage
        </MenuItemText>
      </MenuItem>
      <MenuItem component={Link} href='https://researcher-recognition.open-vsx.org'>
        <MenuItemText>
          <SecurityIcon sx={itemIcon} />
          Report a Vulnerability
        </MenuItemText>
      </MenuItem>
      <MenuItem component={Link} href='https://github.com/EclipseFdn/open-vsx.org/wiki'>
        <MenuItemText>
          <MenuBookIcon sx={itemIcon} />
          Documentation
        </MenuItemText>
      </MenuItem>
      <MenuItem component={Link} href='https://status.open-vsx.org/'>
        <MenuItemText>
          <StatusIcon sx={itemIcon} />
          Status
        </MenuItemText>
      </MenuItem>
      <MenuItem
        ref={workingGroupAnchor}
        onClick={() => setWorkingGroupOpen(true)}
        aria-haspopup='menu'
        aria-expanded={workingGroupOpen}>
        <MenuItemText>
          <GroupWorkIcon sx={itemIcon} />
          Working Group
        </MenuItemText>
        <MoreVertIcon fontSize='small' sx={{ ml: 'auto', color: 'text.secondary' }} />
      </MenuItem>
      <Menu
        open={workingGroupOpen}
        anchorEl={workingGroupAnchor.current}
        onClose={closeWorkingGroup}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem component={RouteLink} to='/members' onClick={closeWorkingGroup}>
          <MenuItemText>
            <PeopleAltIcon sx={itemIcon} />
            Members
          </MenuItemText>
        </MenuItem>
        <MenuItem component={RouteLink} to='/adopters' onClick={closeWorkingGroup}>
          <MenuItemText>
            <HubIcon sx={itemIcon} />
            Adopters
          </MenuItemText>
        </MenuItem>
      </Menu>
      <MenuItem component={Link} href='https://www.eclipse.org/donate/openvsx/'>
        <MenuItemText>
          <StarIcon sx={itemIcon} />
          Sponsor
        </MenuItemText>
      </MenuItem>
      <MenuItem component={RouteLink} to='/about'>
        <MenuItemText>
          <InfoIcon sx={itemIcon} />
          About
        </MenuItemText>
      </MenuItem>
    </>
  );
};

//-------------------- Default View --------------------//

// A text button styled like the header links (reusing the library's `headerItem`),
// used as the trigger for the Resources dropdown.
const ResourcesTrigger = styled('button')(({ theme }) => ({
  ...headerItem({ theme }),
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer'
}));

// All secondary navigation lives under a single "Resources" dropdown so the
// header stays clean; only Publish and the account control remain top-level.
export const DefaultMenuContent: FunctionComponent = () => {
  const { loginProviders, user } = useContext(MainContext);
  const navigate = useNavigate();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesAnchor = useRef<HTMLButtonElement | null>(null);
  const closeResources = () => setResourcesOpen(false);

  useShortcut({
    key: 'p',
    label: 'Publish',
    order: 3,
    callback: () => navigate(UserSettingsRoutes.EXTENSIONS),
    enabled: !!loginProviders
  });

  return (
    <>
      <MenuLink href='https://researcher-recognition.open-vsx.org'>Report a Vulnerability</MenuLink>
      <ResourcesTrigger
        ref={resourcesAnchor}
        onClick={() => setResourcesOpen(true)}
        aria-haspopup='menu'
        aria-expanded={resourcesOpen}
        aria-controls={resourcesOpen ? 'resources-menu' : undefined}>
        Resources
        <ExpandMoreIcon fontSize='small' />
      </ResourcesTrigger>
      <Menu
        id='resources-menu'
        open={resourcesOpen}
        anchorEl={resourcesAnchor.current}
        onClose={closeResources}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
        <MenuItem component={Link} href='https://managed.open-vsx.org/' onClick={closeResources}>
          <MenuItemText>
            <ExternalLinkLabel>Commercial Usage</ExternalLinkLabel>
          </MenuItemText>
        </MenuItem>
        <MenuItem component={Link} href='https://github.com/EclipseFdn/open-vsx.org/wiki' onClick={closeResources}>
          <MenuItemText>
            <ExternalLinkLabel>Documentation</ExternalLinkLabel>
          </MenuItemText>
        </MenuItem>
        <MenuItem component={Link} href='https://status.open-vsx.org/' onClick={closeResources}>
          <MenuItemText>
            <ExternalLinkLabel>Status</ExternalLinkLabel>
          </MenuItemText>
        </MenuItem>
        <MenuItem component={RouteLink} to='/members' onClick={closeResources}>
          <MenuItemText>Members</MenuItemText>
        </MenuItem>
        <MenuItem component={RouteLink} to='/adopters' onClick={closeResources}>
          <MenuItemText>Adopters</MenuItemText>
        </MenuItem>
        <MenuItem component={Link} href='https://www.eclipse.org/donate/openvsx/' onClick={closeResources}>
          <MenuItemText>
            <ExternalLinkLabel>Sponsor</ExternalLinkLabel>
          </MenuItemText>
        </MenuItem>
        <MenuItem component={RouteLink} to='/about' onClick={closeResources}>
          <MenuItemText>About</MenuItemText>
        </MenuItem>
      </Menu>
      {loginProviders && (
        <>
          <Button
            variant='text'
            color='secondary'
            component={RouteLink}
            to={UserSettingsRoutes.EXTENSIONS}
            sx={(theme) => ({
              mx: 0.5,
              px: 2.25,
              py: 1,
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: `${theme.shape.borderRadius}px`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4375rem',
              '&:hover': { backgroundColor: alpha(theme.palette.secondary.main, 0.08) }
            })}>
            Publish
            <KbdKey>p</KbdKey>
          </Button>
          {user ? (
            <UserAvatar />
          ) : (
            <LoginComponent
              loginProviders={loginProviders}
              renderButton={(href, onClick) => {
                if (href) {
                  return (
                    <IconButton href={href} color='inherit' title='Log In' aria-label='Log In'>
                      <AccountBoxIcon />
                    </IconButton>
                  );
                } else {
                  return (
                    <IconButton onClick={onClick} color='inherit' title='Log In' aria-label='Log In'>
                      <AccountBoxIcon />
                    </IconButton>
                  );
                }
              }}
            />
          )}
        </>
      )}
    </>
  );
};
