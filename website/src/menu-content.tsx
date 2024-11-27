/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import React, { FunctionComponent, PropsWithChildren, useState, useRef } from 'react';
import { Theme, Typography, Menu, MenuItem, Link, Button, Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
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
import { UserSettingsRoutes } from 'openvsx-webui';

//-------------------- Mobile View --------------------//

const MobileMenuItem = styled(MenuItem)({
    cursor: 'auto',
    '&>a': {
        textDecoration: 'none'
    }
});

const itemIcon = {
    mr: 1,
    width: '16px',
    height: '16px',
};

const MobileMenuItemText: FunctionComponent<PropsWithChildren> = ({ children }) => {
    return (
        <Typography variant='body2' sx={{ color: 'text.primary', display: 'flex', alignItems: 'center' }}>
            {children}
        </Typography>
    );
};

export const MobileMenuContent: FunctionComponent = () => {
    return <>
        <MobileMenuItem>
            <Link target='_blank' href='https://github.com/eclipse/openvsx'>
                <MobileMenuItemText>
                    <GitHubIcon sx={itemIcon} />
                    Source Code
                </MobileMenuItemText>
            </Link>
        </MobileMenuItem>
        <MobileMenuItem>
            <Link href='https://github.com/EclipseFdn/open-vsx.org/wiki'>
                <MobileMenuItemText>
                    <MenuBookIcon sx={itemIcon} />
                    Documentation
                </MobileMenuItemText>
            </Link>
        </MobileMenuItem>
        <MobileMenuItem>
            <Link href='https://status.open-vsx.org/'>
                <MobileMenuItemText>
                    <StatusIcon sx={itemIcon} />
                    Status
                </MobileMenuItemText>
            </Link>
        </MobileMenuItem>
        <Accordion sx={{border: 0, borderRadius: 0, boxShadow: '0 0', background: 'transparent'}}>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="working-group-content"
            id="working-group-header"
            >
                <MobileMenuItemText>
                    <GroupWorkIcon sx={itemIcon} />
                    Working Group
                </MobileMenuItemText>
            </AccordionSummary>
            <AccordionDetails>
                <MobileMenuItem>
                    <RouteLink to='/members'>
                        <MobileMenuItemText>
                            <PeopleAltIcon sx={itemIcon} />
                            Members
                        </MobileMenuItemText>
                    </RouteLink>
                </MobileMenuItem>
                <MobileMenuItem>
                    <RouteLink to='/adopters'>
                        <MobileMenuItemText>
                            <HubIcon sx={itemIcon} />
                            Adopters
                        </MobileMenuItemText>
                    </RouteLink>
                </MobileMenuItem>
            </AccordionDetails>
        </Accordion>
        <MobileMenuItem>
            <Link href='https://www.eclipse.org/donate/openvsx/'>
                <MobileMenuItemText>
                    <StarIcon sx={itemIcon} />
                    Sponsor
                </MobileMenuItemText>
            </Link>
        </MobileMenuItem>
        <MobileMenuItem>
            <RouteLink to='/about'>
                <MobileMenuItemText>
                    <InfoIcon sx={itemIcon} />
                    About
                </MobileMenuItemText>
            </RouteLink>
        </MobileMenuItem>
        {
            !location.pathname.startsWith(UserSettingsRoutes.ROOT)
            ? <MobileMenuItem>
                <RouteLink to='/user-settings/extensions'>
                    <MobileMenuItemText>
                        <PublishIcon sx={itemIcon} />
                        Publish Extension
                    </MobileMenuItemText>
                </RouteLink>
            </MobileMenuItem>
            : null
        }
    </>;
}


//-------------------- Default View --------------------//

const headerItem = ({ theme }: { theme: Theme }) => ({
    margin: theme.spacing(2.5),
    color: theme.palette.text.primary,
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightLight,
    letterSpacing: 1,
    '&:hover': {
        color: theme.palette.secondary.main,
        textDecoration: 'none'
    }
});

const headerTypography = ({ theme }: { theme: Theme }) => ({
    ...headerItem({theme}),
    cursor: 'pointer'
});

const MenuLink = styled(Link)(headerItem);
const MenuRouteLink = styled(RouteLink)(headerItem);
const MenuTypography = styled(Typography)(headerTypography);

const subMenuItem = ({ theme }: { theme: Theme }) => ({
    '&:focus, &:hover': {
        background: 'transparent'
    }
});

const subMenuLink = ({ theme }: { theme: Theme }) => ({
    ...headerItem({theme}),
    margin: theme.spacing(0.5)
});

const SubMenuItem = styled(MenuItem)(subMenuItem);
const SubMenuLink = styled(Link)(subMenuLink);


export const DefaultMenuContent: FunctionComponent = () => {
    const [workingGroupMenuOpen, setWorkingGroupMenuOpen] = useState(false);
    const workingGroupMenuEl = useRef<HTMLButtonElement | null>(null);
    const toggleWorkingGroupMenu = () => setWorkingGroupMenuOpen(!workingGroupMenuOpen);
    const closeWorkingGroupMenu = () => setWorkingGroupMenuOpen(false);

    return <>
        <MenuLink href='https://github.com/EclipseFdn/open-vsx.org/wiki'>
            Documentation
        </MenuLink>
        <MenuLink href='https://status.open-vsx.org/'>
            Status
        </MenuLink>
        <MenuTypography onClick={toggleWorkingGroupMenu} ref={workingGroupMenuEl}>Working Group</MenuTypography>
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
        <MenuLink href='https://www.eclipse.org/donate/openvsx/'>
            Sponsor
        </MenuLink>
        <MenuRouteLink to='/about'>
            About
        </MenuRouteLink>
        <Button variant='contained' color='secondary' href='/user-settings/extensions' sx={{ mx: 2.5 }}>
            Publish
        </Button>
    </>;
}
