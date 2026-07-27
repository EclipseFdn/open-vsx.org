/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import { forwardRef, FunctionComponent, PropsWithChildren, useState, useRef, useContext } from 'react';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { styled, alpha } from '@mui/material/styles';
import { Link as RouteLink, useNavigate } from 'react-router';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import StatusIcon from '@mui/icons-material/NetworkCheck';
import PublishIcon from '@mui/icons-material/Publish';
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
            Publish
          </MenuItemText>
        </MenuItem>
      )}
      <MenuItem component={Link} href='https://managed.open-vsx.org/' target='_blank' rel='noopener'>
        <MenuItemText>
          <BusinessIcon sx={itemIcon} />
          <ExternalLinkLabel>Commercial usage</ExternalLinkLabel>
        </MenuItemText>
      </MenuItem>
      <MenuItem component={Link} href='https://researcher-recognition.open-vsx.org' target='_blank' rel='noopener'>
        <MenuItemText>
          <SecurityIcon sx={itemIcon} />
          <ExternalLinkLabel>Report a vulnerability</ExternalLinkLabel>
        </MenuItemText>
      </MenuItem>
      <MenuItem component={Link} href='https://www.eclipse.org/donate/openvsx/' target='_blank' rel='noopener'>
        <MenuItemText>
          <StarIcon sx={itemIcon} />
          <ExternalLinkLabel>Sponsor</ExternalLinkLabel>
        </MenuItemText>
      </MenuItem>
      <MenuItem component={Link} href='https://status.open-vsx.org/' target='_blank' rel='noopener'>
        <MenuItemText>
          <StatusIcon sx={itemIcon} />
          <ExternalLinkLabel>Status</ExternalLinkLabel>
        </MenuItemText>
      </MenuItem>
      <MenuItem component={Link} href='https://github.com/EclipseFdn/open-vsx.org/wiki' target='_blank' rel='noopener'>
        <MenuItemText>
          <MenuBookIcon sx={itemIcon} />
          <ExternalLinkLabel>Documentation</ExternalLinkLabel>
        </MenuItemText>
      </MenuItem>
      <MenuItem component={RouteLink} to='/members'>
        <MenuItemText>
          <PeopleAltIcon sx={itemIcon} />
          Members
        </MenuItemText>
      </MenuItem>
      <MenuItem component={RouteLink} to='/adopters'>
        <MenuItemText>
          <HubIcon sx={itemIcon} />
          Adopters
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

// A menu entry that opens its children in a flyout submenu. It forwards the ref
// and props `MenuList` injects onto its trigger `MenuItem`, so the trigger takes
// part in the parent menu's keyboard navigation like any other item. `onClose`
// closes the parent menu; clicking any child closes the whole chain.
type SubMenuItemProps = PropsWithChildren<{ label: string; onClose: () => void }>;
const SubMenuItem = forwardRef<HTMLLIElement, SubMenuItemProps>(
  ({ label, onClose, children, ...menuListProps }, ref) => {
    const [open, setOpen] = useState(false);
    const anchor = useRef<HTMLLIElement | null>(null);
    const close = () => setOpen(false);
    const closeAll = () => {
      close();
      onClose();
    };
    const menuId = `${label.toLowerCase().replace(/\s+/g, '-')}-submenu`;
    return (
      <>
        <MenuItem
          {...menuListProps}
          ref={(node) => {
            anchor.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          onClick={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setOpen(true);
            }
          }}
          aria-haspopup='menu'
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          sx={{ justifyContent: 'space-between', gap: 3 }}>
          <MenuItemText>{label}</MenuItemText>
          <ChevronRightIcon fontSize='small' sx={{ color: 'text.secondary', mr: '-13px' }} />
        </MenuItem>
        <Menu
          id={menuId}
          open={open}
          anchorEl={anchor.current}
          onClose={close}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          MenuListProps={{
            onClick: closeAll,
            // Keystrokes must not bubble through the portal to the parent
            // `MenuList`, which would steal focus back. stopPropagation also cuts
            // off the modal's own Escape and Tab handling, so both live here.
            onKeyDown: (event) => {
              event.stopPropagation();
              if (event.key === 'ArrowLeft' || event.key === 'Escape') {
                close();
              } else if (event.key === 'Tab') {
                event.preventDefault();
                closeAll();
              }
            }
          }}>
          {children}
        </Menu>
      </>
    );
  }
);
SubMenuItem.displayName = 'SubMenuItem';

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
      <MenuLink href='https://managed.open-vsx.org/' target='_blank' rel='noopener'>
        <ExternalLinkLabel>Commercial usage</ExternalLinkLabel>
      </MenuLink>
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
        <MenuItem
          component={Link}
          href='https://researcher-recognition.open-vsx.org'
          target='_blank'
          rel='noopener'
          onClick={closeResources}>
          <MenuItemText>
            <ExternalLinkLabel>Report a vulnerability</ExternalLinkLabel>
          </MenuItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          href='https://www.eclipse.org/donate/openvsx/'
          target='_blank'
          rel='noopener'
          onClick={closeResources}>
          <MenuItemText>
            <ExternalLinkLabel>Sponsor</ExternalLinkLabel>
          </MenuItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          href='https://status.open-vsx.org/'
          target='_blank'
          rel='noopener'
          onClick={closeResources}>
          <MenuItemText>
            <ExternalLinkLabel>Status</ExternalLinkLabel>
          </MenuItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          href='https://github.com/EclipseFdn/open-vsx.org/wiki'
          target='_blank'
          rel='noopener'
          onClick={closeResources}>
          <MenuItemText>
            <ExternalLinkLabel>Documentation</ExternalLinkLabel>
          </MenuItemText>
        </MenuItem>
        <SubMenuItem label='Working group' onClose={closeResources}>
          <MenuItem component={RouteLink} to='/members'>
            <MenuItemText>Members</MenuItemText>
          </MenuItem>
          <MenuItem component={RouteLink} to='/adopters'>
            <MenuItemText>Adopters</MenuItemText>
          </MenuItem>
        </SubMenuItem>
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
