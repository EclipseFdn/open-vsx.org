/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import {
    ExtensionRegistryService, SearchResult, ErrorResult, Extension, ExtensionReviewList, SuccessResult,
    UserData, ExtensionReview, PersonalAccessToken, CsrfTokenJson, ExtensionReference, Namespace,
    NamespaceMembershipList, AdminService, PublisherInfo
} from "openvsx-webui";

const avatarUrl = 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spongebob_Squarepants_as_a_balloon.jpg';

export class MockRegistryService extends ExtensionRegistryService {

    constructor() {
        // FIXME cannot reference `this` in super constructor call
        super('', new MockAdminService(undefined!));
        (this.admin.registry as any) = this;
    }

    search(): Promise<SearchResult | ErrorResult> {
        return Promise.resolve({
            offset: 0,
            totalSize: 0,
            extensions: []
        });
    }

    getExtensionDetail(): Promise<Extension | ErrorResult> {
        return Promise.resolve({
            name: 'foo',
            namespace: 'mock_extensions',
            files: {},
            displayName: 'Foo Extension',
            version: '1.0.0',
            versionAlias: ['latest'],
            allVersions: {},
            averageRating: 3.5,
            downloadCount: 4321,
            timestamp: new Date().toISOString(),
            description: 'This mock extension is for development of the web UI.',
            publishedBy: {
                loginName: 'test_user',
                avatarUrl
            } as UserData,
            namespaceAccess: 'public',
            reviewCount: 12,
            categories: ['Other'],
            tags: ['Mock'],
            license: 'MIT',
            dependencies: [] as ExtensionReference[],
            bundledExtensions: [] as ExtensionReference[]
        } as Extension);
    }

    getExtensionReadme(): Promise<string> {
        return Promise.resolve('# Mock Readme');
    }

    getExtensionReviews(): Promise<ExtensionReviewList> {
        return Promise.resolve({
            reviews: [] as ExtensionReview[]
        } as ExtensionReviewList);
    }

    postReview(): Promise<SuccessResult | ErrorResult> {
        return Promise.resolve({ success: 'ok' });
    }

    deleteReview(): Promise<SuccessResult | ErrorResult> {
        return Promise.resolve({ success: 'ok' });
    }

    getUser(): Promise<UserData | ErrorResult> {
        return Promise.resolve({
            loginName: 'test_user',
            fullName: 'Spongebob Squarepants',
            avatarUrl,
            role: 'admin',
            publisherAgreement: {
                status: 'none'
            },
            additionalLogins: [
                {
                    loginName: 'test_user',
                    provider: 'eclipse'
                }
            ]
        } as UserData);
    }

    getUserByName(): Promise<UserData[]> {
        return Promise.resolve([
            {
                loginName: 'test',
                provider: 'github'
            } as UserData
        ]);
    }

    getAccessTokens(): Promise<PersonalAccessToken[]> {
        return Promise.resolve([]);
    }

    createAccessToken(): Promise<PersonalAccessToken> {
        return Promise.resolve({
            id: 0,
            value: 'abcd',
            createdTimestamp: new Date().toISOString(),
            description: 'My cute little token'
        } as PersonalAccessToken);
    }

    deleteAccessToken(): Promise<SuccessResult | ErrorResult> {
        return Promise.resolve({ success: 'ok' });
    }

    deleteAllAccessTokens(): Promise<(SuccessResult | ErrorResult)[]> {
        return Promise.resolve([]);
    }

    getNamespaces(): Promise<Namespace[]> {
        return Promise.resolve([]);
    }

    getNamespaceMembers(): Promise<NamespaceMembershipList> {
        return Promise.resolve({
            namespaceMemberships: []
        });
    }

    setNamespaceMember(): Promise<(SuccessResult | ErrorResult)[]> {
        return Promise.resolve([]);
    }

    signPublisherAgreement(): Promise<UserData | ErrorResult> {
        return Promise.resolve({} as UserData);
    }

    getCsrfToken(): Promise<CsrfTokenJson | ErrorResult> {
        return Promise.resolve({ error: 'Mock service' });
    }

}

export class MockAdminService extends AdminService {

    findNamespace(): Promise<Namespace> {
        return Promise.resolve({
            name: 'foo',
            access: 'public',
            extensions: []
        } as any);
    }

    createNamespace(): Promise<SuccessResult> {
        return Promise.resolve({ success: 'ok' });
    }

    deleteExtension(): Promise<SuccessResult | ErrorResult> {
        return Promise.resolve({ success: 'ok' });
    }

    getPublisherInfo(): Promise<PublisherInfo> {
        return Promise.resolve({
            activeAccessTokenNum: 5,
            extensions: [],
            user: {
                loginName: 'test'
            } as UserData
        });
    }

    revokePublisherAgreement(provider: string, login: string): Promise<SuccessResult | ErrorResult> {
        return Promise.resolve({ success: 'ok' });
    }

}
