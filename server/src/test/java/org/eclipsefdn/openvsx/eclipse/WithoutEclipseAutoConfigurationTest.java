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

import org.eclipse.openvsx.RegistryApplication;
import org.eclipse.openvsx.publish.PublisherAgreementService;
import org.eclipsefdn.openvsx.eclipse.support.AbstractRegistryIntegrationTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.eclipsefdn.openvsx.eclipse.EclipseFoundationIntegrationTest.publisherAgreementMappings;

/**
 * Negative test: with the auto-configuration excluded, the application must boot
 * and serve like a vanilla registry, with the publisher agreement absent.
 */
@SpringBootTest(
        classes = RegistryApplication.class,
        webEnvironment = WebEnvironment.RANDOM_PORT,
        properties = "spring.autoconfigure.exclude=org.eclipsefdn.openvsx.eclipse.EclipseFoundationAutoConfiguration"
)
@AutoConfigureTestRestTemplate
class WithoutEclipseAutoConfigurationTest extends AbstractRegistryIntegrationTest {

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate restTemplate;

    @Autowired
    ApplicationContext context;

    @Test
    void applicationIsHealthyWithoutAgreementSupport() {
        var response = restTemplate.getForEntity("http://localhost:" + port + "/user", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("Not logged in.");
    }

    @Test
    void publisherAgreementIsAbsent() {
        assertThat(context.getBeanProvider(PublisherAgreementService.class).getIfAvailable()).isNull();
        assertThat(publisherAgreementMappings(context)).isZero();

        var swaggerConfig = restTemplate
                .getForEntity("http://localhost:" + port + "/v3/api-docs/swagger-config", String.class);
        assertThat(swaggerConfig.getBody()).doesNotContain("publisher-agreement");
    }
}
