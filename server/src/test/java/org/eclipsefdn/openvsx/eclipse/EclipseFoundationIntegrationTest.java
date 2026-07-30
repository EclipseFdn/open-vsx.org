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

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import org.eclipse.openvsx.RegistryApplication;
import org.eclipse.openvsx.publish.PublisherAgreementService;
import org.eclipse.openvsx.security.OAuth2LoginHandler;
import org.eclipsefdn.openvsx.eclipse.support.AbstractRegistryIntegrationTest;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Boots upstream's RegistryApplication with this module's auto-configuration on the
 * classpath and verifies that the publisher agreement integration is wired in.
 */
@SpringBootTest(classes = RegistryApplication.class, webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class EclipseFoundationIntegrationTest extends AbstractRegistryIntegrationTest {

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate restTemplate;

    @Autowired
    ApplicationContext context;

    @Test
    void upstreamEndpointsRespond() {
        var response = restTemplate.getForEntity("http://localhost:" + port + "/user", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("Not logged in.");
    }

    @Test
    void publisherAgreementEndpointIsMapped() {
        assertThat(publisherAgreementMappings(context)).isPositive();
    }

    @Test
    void publisherAgreementSwaggerGroupIsPublished() {
        var swaggerConfig = restTemplate
                .getForEntity("http://localhost:" + port + "/v3/api-docs/swagger-config", String.class);
        assertThat(swaggerConfig.getBody()).contains("/v3/api-docs/publisher-agreement");

        var groupDocs = restTemplate
                .getForEntity("http://localhost:" + port + "/v3/api-docs/publisher-agreement", String.class);
        assertThat(groupDocs.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(groupDocs.getBody()).contains("\"/user/publisher-agreement\"");
    }

    @Test
    void eclipseBeansAreRegistered() {
        assertThat(context.getBean(PublisherAgreementService.class)).isInstanceOf(EclipseService.class);
        assertThat(context.getBean(OAuth2LoginHandler.class)).isInstanceOf(EclipseLoginHandler.class);
        assertThat(context.getBean(OAuth2LoginHandler.class).getRegistrationId()).isEqualTo("eclipse");
        assertThat(context.getBean(PublisherComplianceChecker.class)).isNotNull();
    }

    static long publisherAgreementMappings(ApplicationContext context) {
        var mappings = context.getBean("requestMappingHandlerMapping", RequestMappingHandlerMapping.class);
        return mappings.getHandlerMethods().keySet().stream()
                .filter(info -> info.getPathPatternsCondition() != null
                        && info.getPathPatternsCondition().getPatternValues().contains("/user/publisher-agreement"))
                .count();
    }
}
