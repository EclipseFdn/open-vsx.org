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

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import org.eclipse.openvsx.UserService;
import org.eclipse.openvsx.json.UserJson;
import org.eclipse.openvsx.util.ErrorResultException;
import org.eclipse.openvsx.util.UrlUtil;

import static org.eclipse.openvsx.util.UrlUtil.createApiUrl;

@RestController
public class PublisherAgreementAPI {

    private final UserService users;
    private final EclipseService eclipse;

    public PublisherAgreementAPI(UserService users, EclipseService eclipse) {
        this.users = users;
        this.eclipse = eclipse;
    }

    @Operation(summary = "Sign the Eclipse Foundation publisher agreement on behalf of the logged-in user")
    @PostMapping(
        path = "/user/publisher-agreement",
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<UserJson> signPublisherAgreement() {
        var user = users.findLoggedInUser();
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        try {
            var agreement = eclipse.signPublisherAgreement(user);
            var json = user.toUserJson();
            var serverUrl = UrlUtil.getBaseUrl();
            json.setRole(user.getRoleAsString());
            json.setTokensUrl(createApiUrl(serverUrl, "user", "tokens"));
            json.setCreateTokenUrl(createApiUrl(serverUrl, "user", "token", "create"));
            eclipse.enrichUserJson(json, user, agreement);

            return ResponseEntity.ok(json);
        } catch (ErrorResultException exc) {
            return exc.toResponseEntity(UserJson.class);
        }
    }
}
