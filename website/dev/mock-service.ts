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
    ExtensionRegistryService,
    SearchResult,
    ErrorResult,
    Extension,
    ExtensionReviewList,
    SuccessResult,
    UserData,
    ExtensionReview,
    PersonalAccessToken,
    CsrfTokenJson,
    ExtensionReference,
    Namespace,
    NamespaceMembershipList,
    AdminService,
    PublisherInfo,
    NewReview,
    ExtensionFilter,
    UrlString,
    MembershipRole,
    RegistryVersion,
    FileDecisionCountsJson,
    FileDecisionDeleteRequest,
    FileDecisionDeleteResponse,
    FileDecisionRequest,
    FileDecisionResponse,
    FilesResponse,
    ScanCounts,
    ScanDecisionRequest,
    ScanDecisionResponse,
    ScanFilterOptions,
    ScanResultJson,
    ScanResultsResponse,
    CustomerList,
    Customer,
    Tier,
    TierList,
    UsageStatsList,
    LogPageableList
} from "openvsx-webui";

const avatarUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/99/Avatar_cupcake.png';

export class MockRegistryService extends ExtensionRegistryService {

    constructor() {
        super('', MockAdminService);
    }

    search(abortController: AbortController, filter?: ExtensionFilter): Promise<Readonly<SearchResult | ErrorResult>> {
        return Promise.resolve({
            offset: 0,
            totalSize: 0,
            extensions: []
        });
    }

    getExtensionDetail(abortController: AbortController, extensionUrl: UrlString): Promise<Readonly<Extension | ErrorResult>> {
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
            verified: true,
            reviewCount: 12,
            categories: ['Other'],
            tags: ['Mock'],
            license: 'MIT',
            dependencies: [] as ExtensionReference[],
            bundledExtensions: [] as ExtensionReference[]
        } as Extension);
    }

    getExtensionReadme(abortController: AbortController, extension: Extension): Promise<string> {
        return Promise.resolve('# Mock Readme');
    }

    getExtensionReviews(abortController: AbortController, extension: Extension): Promise<Readonly<ExtensionReviewList>> {
        return Promise.resolve({
            reviews: [] as ExtensionReview[]
        } as ExtensionReviewList);
    }

    async postReview(abortController: AbortController, review: NewReview, postReviewUrl: UrlString): Promise<Readonly<SuccessResult | ErrorResult>> {
        return Promise.resolve({success: 'ok'});
    }

    async deleteReview(abortController: AbortController, deleteReviewUrl: string): Promise<Readonly<SuccessResult | ErrorResult>> {
        return Promise.resolve({success: 'ok'});
    }

    getUser(abortController: AbortController): Promise<Readonly<UserData | ErrorResult>> {
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

    getUserByName(abortController: AbortController, name: string): Promise<Readonly<UserData>[]> {
        return Promise.resolve([
            {
                loginName: 'test',
                provider: 'github'
            } as UserData
        ]);
    }

    getAccessTokens(abortController: AbortController, user: UserData): Promise<Readonly<PersonalAccessToken>[]> {
        return Promise.resolve([]);
    }

    async createAccessToken(abortController: AbortController, user: UserData, description: string): Promise<Readonly<PersonalAccessToken>> {
        return Promise.resolve({
            id: 0,
            value: 'abcd',
            createdTimestamp: new Date().toISOString(),
            description: 'My cute little token'
        } as PersonalAccessToken);
    }

    async deleteAccessToken(abortController: AbortController, token: PersonalAccessToken): Promise<Readonly<SuccessResult | ErrorResult>> {
        return Promise.resolve({success: 'ok'});
    }

    async deleteAllAccessTokens(abortController: AbortController, tokens: PersonalAccessToken[]): Promise<Readonly<SuccessResult | ErrorResult>[]> {
        return Promise.resolve([]);
    }

    getCsrfToken(abortController: AbortController): Promise<Readonly<CsrfTokenJson | ErrorResult>> {
        return Promise.resolve({error: 'Mock service'});
    }

    getNamespaces(abortController: AbortController): Promise<Readonly<Namespace>[]> {
        return Promise.resolve([]);
    }

    getNamespaceMembers(abortController: AbortController, namespace: Namespace): Promise<Readonly<NamespaceMembershipList>> {
        return Promise.resolve({
            namespaceMemberships: []
        });
    }

    async setNamespaceMember(abortController: AbortController, endpoint: UrlString, user: UserData, role: MembershipRole | 'remove'): Promise<Readonly<SuccessResult | ErrorResult>[]> {
        return Promise.resolve([]);
    }

    async signPublisherAgreement(abortController: AbortController): Promise<Readonly<UserData | ErrorResult>> {
        return Promise.resolve({} as UserData);
    }

    async getRegistryVersion(abortController: AbortController): Promise<Readonly<RegistryVersion>> {
        return Promise.resolve({version: 'v0.15.0'})
    }
}

export class MockAdminService implements AdminService {

    constructor(readonly registry: ExtensionRegistryService) {
    }

    getExtension(abortController: AbortController, namespace: string, extension: string): Promise<Readonly<Extension>> {
        return this.registry.getExtensionDetail(abortController, '') as Promise<Extension>;
    }

    async deleteExtensions(abortController: AbortController, req: { namespace: string, extension: string, targetPlatformVersions?: object[] }): Promise<Readonly<SuccessResult | ErrorResult>> {
        return Promise.resolve({ success: 'ok' });
    }

    getNamespace(abortController: AbortController, name: string): Promise<Readonly<Namespace>> {
        return Promise.resolve({
            name: 'foo',
            access: 'public',
            extensions: []
        } as any);
    }

    async createNamespace(abortController: AbortController, namespace: { name: string }): Promise<Readonly<SuccessResult | ErrorResult>> {
        return Promise.resolve({ success: 'ok' });
    }

    async getPublisherInfo(abortController: AbortController, provider: string, login: string): Promise<Readonly<PublisherInfo>> {
        return Promise.resolve({
            activeAccessTokenNum: 5,
            extensions: [],
            user: {
                loginName: 'test'
            } as UserData
        });
    }

    async revokePublisherContributions(abortController: AbortController, provider: string, login: string): Promise<Readonly<SuccessResult | ErrorResult>> {
        return Promise.resolve({ success: 'ok' });
    }

    changeNamespace(abortController: AbortController, req: {oldNamespace: string, newNamespace: string, removeOldNamespace: boolean, mergeIfNewNamespaceAlreadyExists: boolean}): Promise<Readonly<SuccessResult | ErrorResult>> {
        return Promise.resolve({ success: 'ok' });
    }

    revokeAccessTokens(abortController: AbortController, provider: string, login: string): Promise<Readonly<SuccessResult | ErrorResult>> {
        return Promise.resolve({ success: 'ok' });
    }

    getAllScans(abortController: AbortController, params?: { size?: number | undefined; offset?: number | undefined; status?: string | string[] | undefined; publisher?: string | undefined; namespace?: string | undefined; name?: string | undefined; validationType?: string[] | undefined; threatScannerName?: string[] | undefined; dateStartedFrom?: string | undefined; dateStartedTo?: string | undefined; enforcement?: "enforced" | "notEnforced" | "all" | undefined; } | undefined): Promise<Readonly<ScanResultsResponse>> {
        throw new Error("Method not implemented.");
    }
    getScan(abortController: AbortController, scanId: string): Promise<Readonly<ScanResultJson>> {
        throw new Error("Method not implemented.");
    }
    getScanCounts(abortController: AbortController, params?: { dateStartedFrom?: string | undefined; dateStartedTo?: string | undefined; enforcement?: "enforced" | "notEnforced" | "all" | undefined; threatScannerName?: string[] | undefined; validationType?: string[] | undefined; } | undefined): Promise<Readonly<ScanCounts>> {
        throw new Error("Method not implemented.");
    }
    getScanFilterOptions(abortController: AbortController): Promise<Readonly<ScanFilterOptions>> {
        throw new Error("Method not implemented.");
    }
    getFiles(abortController: AbortController, params?: { size?: number | undefined; offset?: number | undefined; decision?: string | undefined; publisher?: string | undefined; namespace?: string | undefined; name?: string | undefined; dateDecidedFrom?: string | undefined; dateDecidedTo?: string | undefined; sortBy?: string | undefined; sortOrder?: "asc" | "desc" | undefined; } | undefined): Promise<Readonly<FilesResponse>> {
        throw new Error("Method not implemented.");
    }
    getFileCounts(abortController: AbortController, params?: { dateDecidedFrom?: string | undefined; dateDecidedTo?: string | undefined; } | undefined): Promise<Readonly<FileDecisionCountsJson>> {
        throw new Error("Method not implemented.");
    }
    makeScanDecision(abortController: AbortController, request: ScanDecisionRequest): Promise<Readonly<ScanDecisionResponse>> {
        throw new Error("Method not implemented.");
    }
    makeFileDecision(abortController: AbortController, request: FileDecisionRequest): Promise<Readonly<FileDecisionResponse>> {
        throw new Error("Method not implemented.");
    }
    deleteFileDecisions(abortController: AbortController, request: FileDecisionDeleteRequest): Promise<Readonly<FileDecisionDeleteResponse>> {
        throw new Error("Method not implemented.");
    }
    createCustomer(abortController: AbortController, customer: Customer): Promise<Readonly<Customer>> {
        throw new Error("Method not implemented.");
    }
    createTier(abortController: AbortController, tier: Tier): Promise<Readonly<Tier>> {
        throw new Error("Method not implemented.");
    }
    deleteCustomer(abortController: AbortController, name: string): Promise<Readonly<SuccessResult | ErrorResult>> {
        throw new Error("Method not implemented.");
    }
    deleteTier(abortController: AbortController, name: string): Promise<Readonly<SuccessResult | ErrorResult>> {
        throw new Error("Method not implemented.");
    }
    getCustomers(abortController: AbortController): Promise<Readonly<CustomerList>> {
        throw new Error("Method not implemented.");
    }
    getTiers(abortController: AbortController): Promise<Readonly<TierList>> {
        throw new Error("Method not implemented.");
    }
    getUsageStats(abortController: AbortController, customerName: string, date: Date): Promise<Readonly<UsageStatsList>> {
        throw new Error("Method not implemented.");
    }
    updateCustomer(abortController: AbortController, name: string, customer: Customer): Promise<Readonly<Customer>> {
        throw new Error("Method not implemented.");
    }
    updateTier(abortController: AbortController, name: string, tier: Tier): Promise<Readonly<Tier>> {
        throw new Error("Method not implemented.");
    }
    getLogs(abortController: AbortController, page?: number, size?: number, period?: string): Promise<Readonly<LogPageableList>> {
        throw new Error("Method not implemented.");
    }
}
