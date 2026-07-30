/********************************************************************************
 * Copyright (c) 2026 Eclipse Foundation and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/
package org.eclipsefdn.openvsx.eclipse;

import jakarta.persistence.EntityManager;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;

import org.eclipse.openvsx.entities.UserData;
import org.eclipse.openvsx.security.CodedAuthException;
import org.eclipse.openvsx.security.IdPrincipal;
import org.eclipse.openvsx.security.OAuth2LoginHandler;
import org.eclipse.openvsx.util.ErrorResultException;
import org.eclipse.openvsx.util.UrlUtil;

import static org.eclipse.openvsx.security.CodedAuthException.NEED_MAIN_LOGIN;

/**
 * Handles the 'eclipse' OAuth2 registration: it links an Eclipse Foundation
 * account to the already logged-in user instead of creating a new account, and
 * stores the Eclipse access token for publisher agreement API requests.
 */
public class EclipseLoginHandler implements OAuth2LoginHandler {

    public static final String ECLIPSE_MISSING_GITHUB_ID = "eclipse-missing-github-id";
    public static final String ECLIPSE_MISMATCH_GITHUB_ID = "eclipse-mismatch-github-id";

    private final EclipseService eclipse;
    private final EclipseTokenService tokens;
    private final EntityManager entityManager;

    public EclipseLoginHandler(EclipseService eclipse, EclipseTokenService tokens, EntityManager entityManager) {
        this.eclipse = eclipse;
        this.tokens = tokens;
        this.entityManager = entityManager;
    }

    @Override
    public String getRegistrationId() {
        return "eclipse";
    }

    @Override
    public IdPrincipal loadUser(OAuth2UserRequest userRequest) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new CodedAuthException(
                    "Please log in with GitHub before connecting your Eclipse account.",
                    NEED_MAIN_LOGIN);
        }
        if (!(authentication.getPrincipal() instanceof IdPrincipal)) {
            throw new CodedAuthException("The current authentication is invalid.", NEED_MAIN_LOGIN);
        }
        var principal = (IdPrincipal) authentication.getPrincipal();
        var userData = entityManager.find(UserData.class, principal.getId());
        if (userData == null) {
            throw new CodedAuthException("The current authentication has no backing data.", NEED_MAIN_LOGIN);
        }
        try {
            var accessToken = userRequest.getAccessToken().getTokenValue();
            var profile = eclipse.getUserProfile(accessToken);
            if (StringUtils.isEmpty(profile.getGithubHandle())) {
                throw new CodedAuthException(
                        "Your Eclipse profile is missing a GitHub username.",
                        ECLIPSE_MISSING_GITHUB_ID);
            }
            if (!profile.getGithubHandle().equalsIgnoreCase(userData.getLoginName())) {
                throw new CodedAuthException(
                        "The GitHub username setting in your Eclipse profile ("
                                + profile.getGithubHandle()
                                + ") does not match your GitHub authentication ("
                                + userData.getLoginName() + ").",
                        ECLIPSE_MISMATCH_GITHUB_ID);
            }

            eclipse.updateUserData(userData, profile);
            return principal;
        } catch (ErrorResultException exc) {
            throw new AuthenticationServiceException(exc.getMessage(), exc);
        }
    }

    @Override
    public void authenticationSucceeded(
            IdPrincipal principal,
            OAuth2AccessToken accessToken,
            OAuth2RefreshToken refreshToken
    ) {
        tokens.updateEclipseToken(principal.getId(), accessToken, refreshToken);
    }

    @Override
    public String getSuccessRedirectUrl(String defaultTargetUrl) {
        // Redirect to user profile page after login to Eclipse
        return UrlUtil.createApiUrl(defaultTargetUrl, "user-settings", "profile");
    }
}
