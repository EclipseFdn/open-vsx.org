/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Link, Theme, Box, useMediaQuery, useTheme } from '@material-ui/core';
import { Link as RouteLink } from 'react-router-dom';
import GitHubIcon from '@material-ui/icons/GitHub';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

const footerStyle = makeStyles((theme: Theme) => ({
    link: {
        color: theme.palette.text.primary,
        textDecoration: 'none',
        '&:hover': {
            color: theme.palette.secondary.main,
            textDecoration: 'none'
        }
    },
    repositoryLink: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.1rem'
    },
    legalText: {
        fontWeight: theme.typography.fontWeightLight
    },
    cookieText: {
        cursor: 'pointer',
        fontWeight: 300
    }
}));

const FooterContent: React.FunctionComponent<{ expanded: boolean }> = ({ expanded }) => {
    const classes = footerStyle();
    const theme = useTheme();
    const isSmallDisplay = useMediaQuery(theme.breakpoints.down('sm'));
    const isLargeDisplay = useMediaQuery(theme.breakpoints.up('xl'));

    const MainFooter = () => {
        const itemSpacing = 2.5;
        return <Box display='flex' justifyContent='space-between' alignItems='center'>
            {isSmallDisplay ? null : repositoryLink(classes)}
            {
                isLargeDisplay ?
                <Box display='flex'>
                    <Box>
                        {privacyPolicy(classes)}
                    </Box>
                    <Box ml={itemSpacing}>
                        {termsOfUse(classes)}
                    </Box>
                    <Box ml={itemSpacing}>
                        {publisherAgreement(classes)}
                    </Box>
                    <Box ml={itemSpacing}>
                        {copyrightAgent(classes)}
                    </Box>
                    <Box ml={itemSpacing}>
                        {legalResources(classes)}
                    </Box>
                    <Box ml={itemSpacing}>
                        {manageCookies(classes)}
                    </Box>
                    <Box ml={itemSpacing}>
                        {copyrightText(classes)}
                    </Box>
                    <Box ml={itemSpacing}>
                        {rightsReservedText(classes)}
                    </Box>
                </Box>
                :
                <>
                    {copyrightText(classes)}
                    <Box display='flex' alignItems='center'>
                        <ExpandLessIcon /> Legal
                    </Box>
                </>
            }
        </Box>;
    }

    if (expanded && !isLargeDisplay) {
        const itemSpacing = 1;
        return <Box display='flex' flexDirection='column' alignItems='stretch'>
            <Box display='flex' flexDirection='column' alignItems='flex-end'>
                <Box mb={itemSpacing}>
                    {privacyPolicy(classes)}
                </Box>
                <Box mb={itemSpacing}>
                    {termsOfUse(classes)}
                </Box>
                <Box mb={itemSpacing}>
                    {publisherAgreement(classes)}
                </Box>
                <Box mb={itemSpacing}>
                    {copyrightAgent(classes)}
                </Box>
                <Box mb={itemSpacing}>
                    {legalResources(classes)}
                </Box>
                <Box mb={itemSpacing + 1}>
                    {manageCookies(classes)}
                </Box>
            </Box>
            <MainFooter />
        </Box>;
    } else {
        return <MainFooter />;
    }
};

type FooterStyle = ReturnType<typeof footerStyle>;

const repositoryLink = (classes: FooterStyle) =>
    <Link
        target='_blank'
        href='https://github.com/eclipse/openvsx'
        className={`${classes.link} ${classes.repositoryLink}`} >
        <GitHubIcon />&nbsp;eclipse/openvsx
    </Link>;

const privacyPolicy = (classes: FooterStyle) =>
    <Link
        href='https://www.eclipse.org/legal/privacy.php'
        className={`${classes.link} ${classes.legalText}`} >
        Privacy Policy
    </Link>;

const termsOfUse = (classes: FooterStyle) =>
    <RouteLink
        to='/terms-of-use'
        className={`${classes.link} ${classes.legalText}`} >
        Terms of Use
    </RouteLink>;

const publisherAgreement = (classes: FooterStyle) =>
    <RouteLink
        to='/publisher-agreement-v1.0'
        className={`${classes.link} ${classes.legalText}`} >
        Publisher Agreement
    </RouteLink>;

const copyrightAgent = (classes: FooterStyle) =>
    <Link
        href='https://www.eclipse.org/legal/copyright.php'
        className={`${classes.link} ${classes.legalText}`} >
        Copyright Agent
    </Link>;

const legalResources = (classes: FooterStyle) =>
    <Link
        href='http://www.eclipse.org/legal'
        className={`${classes.link} ${classes.legalText}`} >
        Legal Resources
    </Link>;

const copyrightText = (classes: FooterStyle) =>
    <Box className={classes.legalText}>
        Copyright &copy; <Link
            href='https://www.eclipse.org'
            className={classes.link} >
            Eclipse Foundation, Inc.
        </Link>
    </Box>;

const rightsReservedText = (classes: FooterStyle) =>
    <Box className={classes.legalText}>
        All Rights Reserved.
    </Box>;

const manageCookies = (classes: FooterStyle) =>
    <Box className={`${classes.link} ${classes.cookieText} toolbar-manage-cookies`}>
        Manage Cookies
    </Box>;
export default FooterContent;
