/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import React, { FunctionComponent } from 'react';
import { styled } from '@mui/material/styles';
import { Link, Theme, Box, useMediaQuery, useTheme } from '@mui/material';
import { Link as RouteLink } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const styles = {
    link: (theme: Theme) =>({
        color: theme.palette.text.primary,
        textDecoration: 'none',
        '&:hover': {
            color: theme.palette.secondary.main,
            textDecoration: 'none'
        }
    }),
    repositoryLink: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.1rem'
    },
    legalText: {
        fontWeight: 'fontWeightLight'
    },
    cookieText: {
        cursor: 'pointer',
        fontWeight: 300
    }
};

const LegalLink = styled(RouteLink)(({ theme }: { theme: Theme }) => ({
    ...styles.link(theme),
    fontWeight: theme.typography.fontWeightLight
}));

interface MainFooterProps {
    isSmallDisplay: boolean
    isLargeDisplay: boolean
}

const MainFooter = ({isSmallDisplay, isLargeDisplay}: MainFooterProps) => {
    const itemSpacing = 2.5;
    return <Box display='flex' justifyContent='space-between' alignItems='center'>
        {isSmallDisplay ? null : repositoryLink()}
        {
            isLargeDisplay ?
            <Box display='flex'>
                <Box>
                    {privacyPolicy()}
                </Box>
                <Box ml={itemSpacing}>
                    {termsOfUse()}
                </Box>
                <Box ml={itemSpacing}>
                    {publisherAgreement()}
                </Box>
                <Box ml={itemSpacing}>
                    {copyrightAgent()}
                </Box>
                <Box ml={itemSpacing}>
                    {legalResources()}
                </Box>
                <Box ml={itemSpacing}>
                    {manageCookies()}
                </Box>
                <Box ml={itemSpacing}>
                    {copyrightText()}
                </Box>
                <Box ml={itemSpacing}>
                    {rightsReservedText()}
                </Box>
            </Box>
            :
            <>
                {copyrightText()}
                <Box display='flex' alignItems='center'>
                    <ExpandLessIcon /> Legal
                </Box>
            </>
        }
    </Box>;
}

const FooterContent: FunctionComponent<{ expanded: boolean }> = ({ expanded }) => {
    const theme = useTheme();
    const isSmallDisplay = useMediaQuery(theme.breakpoints.down('sm'));
    const isLargeDisplay = useMediaQuery(theme.breakpoints.up('xl'));

    if (expanded && !isLargeDisplay) {
        const itemSpacing = 1;
        return <Box display='flex' flexDirection='column' alignItems='stretch'>
            <Box display='flex' flexDirection='column' alignItems='flex-end'>
                <Box mb={itemSpacing}>
                    {privacyPolicy()}
                </Box>
                <Box mb={itemSpacing}>
                    {termsOfUse()}
                </Box>
                <Box mb={itemSpacing}>
                    {publisherAgreement()}
                </Box>
                <Box mb={itemSpacing}>
                    {copyrightAgent()}
                </Box>
                <Box mb={itemSpacing}>
                    {legalResources()}
                </Box>
                <Box mb={itemSpacing + 1}>
                    {manageCookies()}
                </Box>
            </Box>
            <MainFooter isSmallDisplay={isSmallDisplay} isLargeDisplay={isLargeDisplay}/>
        </Box>;
    } else {
        return <MainFooter isSmallDisplay={isSmallDisplay} isLargeDisplay={isLargeDisplay}/>;
    }
};

const repositoryLink = () =>
    <Link
        target='_blank'
        href='https://github.com/eclipse/openvsx'
        sx={[styles.link, styles.repositoryLink]}>
        <GitHubIcon />&nbsp;eclipse/openvsx
    </Link>;

const privacyPolicy = () =>
    <Link
        href='https://www.eclipse.org/legal/privacy.php'
        sx={[styles.link, styles.legalText]}>
        Privacy Policy
    </Link>;

const termsOfUse = () =>
    <LegalLink to='/terms-of-use'>
        Terms of Use
    </LegalLink>;

const publisherAgreement = () =>
    <LegalLink to='/publisher-agreement-v1.0'>
        Publisher Agreement
    </LegalLink>;

const copyrightAgent = () =>
    <Link
        href='https://www.eclipse.org/legal/copyright.php'
        sx={[styles.link, styles.legalText]}>
        Copyright Agent
    </Link>;

const legalResources = () =>
    <Link
        href='http://www.eclipse.org/legal'
        sx={[styles.link, styles.legalText]}>
        Legal Resources
    </Link>;

const copyrightText = () =>
    <Box sx={styles.legalText}>
        Copyright &copy; <Link
            href='https://www.eclipse.org'
            sx={styles.link}>
            Eclipse Foundation, Inc.
        </Link>
    </Box>;

const rightsReservedText = () =>
    <Box sx={styles.legalText}>
        All Rights Reserved.
    </Box>;

const manageCookies = () =>
    <Box sx={[styles.link, styles.cookieText]} className='toolbar-manage-cookies'>
        Manage Cookies
    </Box>;
export default FooterContent;
