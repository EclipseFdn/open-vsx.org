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
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.RestTemplate;

import org.eclipse.openvsx.ExtensionService;
import org.eclipse.openvsx.UserService;
import org.eclipse.openvsx.repositories.RepositoryService;

/**
 * Registers the Eclipse Foundation publisher agreement integration on top of the
 * upstream registry. The package is outside upstream's component scan, so every
 * bean is declared explicitly here and the class is registered in
 * {@code META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports}.
 */
@AutoConfiguration
public class EclipseFoundationAutoConfiguration {

    @Bean
    public EclipseTokenService eclipseTokenService(
            TransactionTemplate transactions,
            EntityManager entityManager,
            ObjectProvider<ClientRegistrationRepository> clientRegistrationRepository
    ) {
        return new EclipseTokenService(transactions, entityManager, clientRegistrationRepository.getIfAvailable());
    }

    @Bean
    public EclipseService eclipseService(
            EclipseTokenService tokens,
            ExtensionService extensions,
            EntityManager entityManager,
            @Qualifier("restTemplate") RestTemplate restTemplate
    ) {
        return new EclipseService(tokens, extensions, entityManager, restTemplate);
    }

    @Bean
    public EclipseLoginHandler eclipseLoginHandler(
            EclipseService eclipse,
            EclipseTokenService tokens,
            EntityManager entityManager
    ) {
        return new EclipseLoginHandler(eclipse, tokens, entityManager);
    }

    @Bean
    public PublisherAgreementAPI publisherAgreementAPI(UserService users, EclipseService eclipse) {
        return new PublisherAgreementAPI(users, eclipse);
    }

    /**
     * Extra Swagger UI group for the endpoint this deployment contributes; upstream's
     * groups (see its DocumentationConfig) are untouched. Also serves as a visible
     * marker that the registry is running with the Eclipse extension.
     */
    @Bean
    public GroupedOpenApi publisherAgreementOpenApi(OpenApiCustomizer sortSchemasAlphabetically) {
        var description = "Eclipse Foundation publisher agreement management,"
                + " contributed by the open-vsx.org deployment on top of the open-source registry.";
        return GroupedOpenApi.builder()
                .group("publisher-agreement")
                .displayName("Publisher Agreement")
                .pathsToMatch("/user/publisher-agreement")
                .addOpenApiCustomizer(
                        openApi -> openApi.getInfo().title("Eclipse Publisher Agreement API").description(description))
                .addOpenApiCustomizer(sortSchemasAlphabetically)
                .build();
    }

    @Bean
    public PublisherComplianceChecker publisherComplianceChecker(
            TransactionTemplate transactions,
            EntityManager entityManager,
            RepositoryService repositories,
            ExtensionService extensions,
            EclipseService eclipseService
    ) {
        return new PublisherComplianceChecker(transactions, entityManager, repositories, extensions, eclipseService);
    }
}
