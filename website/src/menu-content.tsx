/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import { FunctionComponent, useState, useRef, useContext } from 'react';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles/createTheme';
import { styled } from '@mui/material/styles';
import { Link as RouteLink } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import {
  itemIcon,
  MobileUserAvatar,
  headerItem,
  MenuLink,
  MenuRouteLink,
  MenuItemText
} from 'openvsx-webui/lib/default/menu-content';
import { LoginComponent } from 'openvsx-webui/lib/default/login';
import { UserAvatar } from 'openvsx-webui/lib/pages/user/avatar';

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
      <Accordion sx={{ border: 0, borderRadius: 0, boxShadow: '0 0', background: 'transparent' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='working-group-content'
          id='working-group-header'>
          <MenuItemText>
            <GroupWorkIcon sx={itemIcon} />
            Working Group
          </MenuItemText>
        </AccordionSummary>
        <AccordionDetails>
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
        </AccordionDetails>
      </Accordion>
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

const headerTypography = ({ theme }: { theme: Theme }) => ({
  ...headerItem({ theme }),
  cursor: 'pointer'
});

const MenuTypography = styled(Typography)(headerTypography);

const subMenuItem = ({ theme }: { theme: Theme }) => ({
  '&:focus, &:hover': {
    background: 'transparent'
  }
});

const subMenuLink = ({ theme }: { theme: Theme }) => ({
  ...headerItem({ theme }),
  margin: theme.spacing(0.5)
});

const SubMenuItem = styled(MenuItem)(subMenuItem);
const SubMenuLink = styled(Link)(subMenuLink);

export const DefaultMenuContent: FunctionComponent = () => {
  const { loginProviders, user } = useContext(MainContext);
  const [workingGroupMenuOpen, setWorkingGroupMenuOpen] = useState(false);
  const workingGroupMenuEl = useRef<HTMLButtonElement | null>(null);
  const toggleWorkingGroupMenu = () => setWorkingGroupMenuOpen(!workingGroupMenuOpen);
  const closeWorkingGroupMenu = () => setWorkingGroupMenuOpen(false);

  return (
    <>
      <MenuLink href='https://managed.open-vsx.org/'>Commercial Usage</MenuLink>
      <MenuLink href='https://researcher-recognition.open-vsx.org'>Report a Vulnerability</MenuLink>
      <MenuLink href='https://github.com/EclipseFdn/open-vsx.org/wiki'>Documentation</MenuLink>
      <MenuLink href='https://status.open-vsx.org/'>Status</MenuLink>
      <MenuTypography onClick={toggleWorkingGroupMenu} ref={workingGroupMenuEl}>
        Working Group
      </MenuTypography>
      <Menu open={workingGroupMenuOpen} onClose={closeWorkingGroupMenu} anchorEl={workingGroupMenuEl.current}>
        <SubMenuItem>
          <SubMenuLink href='/members' onClick={closeWorkingGroupMenu}>
            Members
          </SubMenuLink>
        </SubMenuItem>
        <SubMenuItem>
          <SubMenuLink href='/adopters' onClick={closeWorkingGroupMenu}>
            Adopters
          </SubMenuLink>
        </SubMenuItem>
      </Menu>
      <MenuLink href='https://www.eclipse.org/donate/openvsx/'>Sponsor</MenuLink>
      <MenuRouteLink to='/about'>About</MenuRouteLink>
      {loginProviders && (
        <>
          <Button variant='contained' color='secondary' href='/user-settings/extensions' sx={{ mx: 2.5 }}>
            Publish
          </Button>
          {user ? (
            <UserAvatar />
          ) : (
            <LoginComponent
              loginProviders={loginProviders}
              renderButton={(href, onClick) => {
                if (href) {
                  return (
                    <IconButton href={href} title='Log In' aria-label='Log In'>
                      <AccountBoxIcon />
                    </IconButton>
                  );
                } else {
                  return (
                    <IconButton onClick={onClick} title='Log In' aria-label='Log In'>
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
