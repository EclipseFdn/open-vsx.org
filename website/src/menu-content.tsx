/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Theme, Typography, MenuItem, Link, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouteLink } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HelpIcon from '@mui/icons-material/Help';
import ForumIcon from '@mui/icons-material/Forum';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import StatusIcon from '@mui/icons-material/NetworkCheck';
import PublishIcon from '@mui/icons-material/Publish';
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
            <Link href='https://github.com/eclipse/openvsx/wiki'>
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
        <MobileMenuItem>
            <Link href='https://www.eclipse.org/legal/open-vsx-registry-faq/'>
                <MobileMenuItemText>
                    <HelpIcon sx={itemIcon} />
                    FAQ
                </MobileMenuItemText>
            </Link>
        </MobileMenuItem>
        <MobileMenuItem>
            <Link href='https://gitter.im/eclipse/openvsx'>
                <MobileMenuItemText>
                    <ForumIcon sx={itemIcon} />
                    Community
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
        <MobileMenuItem>
            <Link href='https://www.eclipse.org/donate/openvsx/'>
                <MobileMenuItemText>
                    <StarIcon sx={itemIcon} />
                    Sponsor
                </MobileMenuItemText>
            </Link>
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

const MenuLink = styled(Link)(headerItem);
const MenuRouteLink = styled(RouteLink)(headerItem);

export const DefaultMenuContent: FunctionComponent = () => {
    return <>
        <MenuLink href='https://github.com/eclipse/openvsx/wiki'>
            Documentation
        </MenuLink>
        <MenuLink href='https://www.eclipse.org/legal/open-vsx-registry-faq/'>
            FAQ
        </MenuLink>
        <MenuLink href='https://status.open-vsx.org/'>
            Status
        </MenuLink>
        <MenuLink href='https://gitter.im/eclipse/openvsx'>
            Community
        </MenuLink>
        <MenuRouteLink to='/about'>
            About
        </MenuRouteLink>
        <MenuLink href='https://www.eclipse.org/donate/openvsx/'>
            Sponsor
        </MenuLink>
        <Button variant='contained' color='secondary' href='/user-settings/extensions' sx={{ mx: 2.5 }}>
            Publish
        </Button>
    </>;
}
