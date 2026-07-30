# PoC: open-vsx.org as a Spring Boot app on top of the OSS registry

This branch demonstrates that `EclipseFdn/open-vsx.org` can run as its own Spring
Boot application that consumes `eclipse-openvsx/openvsx` (the `server` project) as a
library, contributing deployment-specific code via Spring Boot auto-configuration.
The functionality used to prove it: the Eclipse publisher agreement, extracted from
upstream's `org.eclipse.openvsx.eclipse` into this repository.

Paired branches:

- upstream: `poc/eclipse-extraction` (gnugomez/openvsx, fork of eclipse-openvsx/openvsx)
- instance: `poc/openvsx-eclipse-module` (this repository; gnugomez/open-vsx.org)

## How to build and run locally

All Gradle machinery lives under `server/` (mirroring the upstream repo layout);
the repo root stays website + deployment config. The upstream server is consumed
as source through a Gradle composite build over the `server/upstream` git
submodule, pinned to the paired upstream branch. Any other checkout can be used
instead with `-PopenvsxServerPath=<path-to-openvsx>/server`.

```bash
# fresh clone, no other checkouts needed
git clone --recurse-submodules -b poc/openvsx-eclipse-module <this fork>
cd open-vsx.org/server
./gradlew test       # incl. booting the merged app on Testcontainers PostgreSQL
./gradlew bootJar    # the deployable jar

# dev server on the host JVM, like upstream's `./gradlew runServer`
# (first run generates upstream's gitignored dev profile automatically)
docker compose -f upstream/docker-compose.yml up -d postgres
./gradlew runServer                   # http://localhost:8080

# Docker image (from the repo root): by default the server-src stage clones
# SERVER_REPO at SERVER_VERSION (the pinned fork branch), so this works with no
# local upstream at all
docker build -t openvsx-website:poc .

# or build offline from the submodule / any local checkout
docker build --build-context server-src=server/upstream -t openvsx-website:poc .
```

In production the composite build would be replaced by a published
`org.eclipse.openvsx:openvsx-server` artifact — see the productionizing section.

### Baseline (recorded before any change)

- upstream `main` (36de5ace): `./gradlew build` — BUILD SUCCESSFUL, 798 tests, 2m33s
  (Testcontainers; Docker required)
- instance `aws-main` (90036b9): `cd website && yarn install --immutable && yarn build`
  — built in ~5s

## Packaging design

- `server/` is a single-project Spring Boot build. Its `bootJar` (named
  `openvsx-server.jar` like upstream's) has the upstream server and all its
  dependencies in `BOOT-INF/lib` and (eventually) only the deployment-specific
  classes in `BOOT-INF/classes`.
- Main class is upstream's `org.eclipse.openvsx.RegistryApplication` — the module
  deliberately has no `@SpringBootApplication` of its own.
- The Spring Boot plugin version and the Java version are parsed out of the upstream
  checkout's `gradle/libs.versions.toml` in `settings.gradle`; this build declares
  neither independently.
- No `application.yml` is packaged in the module jar. Configuration keeps flowing
  through the image's `config/application.yml` (copied from `configuration/`, version
  placeholder sed-replaced) plus `spring.config.import: file:${DEPLOYMENT_CONFIG}`,
  exactly as today.
- The final Docker image replicates the upstream-derived image byte for byte in
  layout: exploded boot jar in `/home/openvsx/server`, upstream's `run-server.sh`
  as entrypoint (`java -cp BOOT-INF/classes:BOOT-INF/lib/* ...`), website dist at
  `BOOT-INF/classes/static/`, logback config and mail templates in
  `BOOT-INF/classes/`. Helm charts, ESO secrets and environment variables are
  untouched. The base image is a plain JRE (`eclipse-temurin:25-jre`) instead of
  `ghcr.io/eclipse-openvsx/openvsx-server-snapshot`.

### Packaging parity evidence

`BOOT-INF/lib` of the instance bootJar is identical to upstream's bootJar except for
`openvsx-server-plain.jar` itself (upstream ships those classes as `BOOT-INF/classes`
instead). `BOOT-INF/classes` of the module jar is empty at the packaging-only
milestone.

## Upstream changes (the "consumable library" enablement)

1. **Publish the `java` component** (`from components.java`): the plain jar
   (classifier `plain`, already produced by the Boot plugin) plus real dependency
   metadata in the POM/Gradle module metadata. The executable `bootJar` stays the
   main artifact, so nothing changes for existing consumers of the publication.
2. **Expose the effective dependency versions to consumers.** The
   `io.spring.dependency-management` plugin (managed BOM versions, declared-version
   pins) applies only inside the upstream project; a consumer resolving the library
   would find versionless dependencies it cannot resolve at all. The fix (applied
   with `java-library` so the constraints reach both the api and runtime variants):
   mirror the effective managed versions — Spring Boot BOM + upstream's property
   overrides, with explicitly declared versions winning like they do upstream — as
   plain dependency constraints on `api`.
   The constraints are deliberately **not strict**. A first attempt with
   `strictly` pins blew up: a strict constraint does not downgrade a *sibling*
   dependency edge that requires a higher version — it fails resolution — and
   Jackson 3's Gradle module metadata (fetched lazily; failures appeared only after
   the metadata landed in the cache, which made them look nondeterministic) requires
   e.g. `woodstox-core 7.1.1` while upstream pins 6.4.0. Where Maven-like
   "managed version wins" resolution differs from Gradle's highest-version-wins,
   parity is enforced on the *instance* side with a short, documented
   `resolutionStrategy.force` list (gson, woodstox-core, the two CVE range floors,
   and test-only byte-buddy/mockito) in `server/build.gradle`, verified by
   diffing `BOOT-INF/lib` against an upstream bootJar.
   The tomcat→jetty module replacement (`modules { replacedBy ... }`) cannot be
   exported at all — Gradle component metadata rules are project-local — so the
   instance module repeats those 3 lines. Without it, Tomcat lands on the classpath
   alongside Jetty and Spring Boot silently auto-configures Tomcat.

## Seams introduced upstream

Every point where core upstream code called into `org.eclipse.openvsx.eclipse` was
converted to one of two small, generically named interfaces (or the code moved out
entirely). What a third-party deployment could do with them is noted per seam.

### 1. `org.eclipse.openvsx.publish.PublisherAgreementService` (interface, all methods default no-op)

Consumed via `@Nullable PublisherAgreementService` constructor injection with a
no-op anonymous default (`publisherAgreement != null ? publisherAgreement : new
PublisherAgreementService() {}`), so a vanilla registry runs without extra
configuration. `@Nullable` (the repo's existing pattern for optional beans, see
`SimilarityCheckService`) was chosen over `Optional<>` because Mockito's
`@InjectMocks` cannot supply `Optional` constructor parameters — `Optional<>` broke
`AdminServiceTest`. The instance auto-configuration contributes `EclipseService` as
the implementation. Call sites:

| method | caller | purpose |
|---|---|---|
| `checkPublisherAgreement(user)` | `LocalRegistryService.createNamespace` / `.publish` | the publishing gate |
| `enrichUserJsonWithPublisherAgreement(json, user)` | `UserAPI.getUserData` (`GET /user`) | agreement status in the profile response |
| `adminEnrichUserJson(json, user)` | `AdminService.getUserPublishInfo` | agreement status in the admin view |
| `revokePublisherAgreement(user, admin)` | `AdminService.revokePublisherContributions` | external revocation on admin action |

The `isActive() && eclipsePersonId != null` guard that used to sit in `AdminService`
moved *inside* the implementation — the interface contract is "called
unconditionally, implementation decides". A third-party deployment could implement
this to require any kind of publisher vetting (a CLA, a paid plan, a manual allow
list) without touching upstream.

### 2. `org.eclipse.openvsx.security.OAuth2LoginHandler` (interface)

`OAuth2UserServices`, `SecurityConfig` and `CustomAuthenticationSuccessHandler`
previously hard-coded the `"eclipse"` registration id in three behaviors. They now
consume a `List<OAuth2LoginHandler>` (empty by default) keyed by
`getRegistrationId()`:

- `loadUser(userRequest)` — replaces the `case "eclipse" -> loadEclipseUser(...)`
  switch arm; registrations without a handler use the generic attribute-mapping flow.
- `authenticationSucceeded(principal, accessToken, refreshToken)` — replaces the
  event-listener branch that stored the Eclipse token.
- `getSuccessRedirectUrl(defaultTargetUrl)` — replaces the hard-coded post-login
  redirect to `/user-settings/profile`.

The instance contributes `EclipseLoginHandler`, which links the Eclipse account to
the logged-in GitHub user (profile fetch, GitHub-handle cross-check), stores the
token, and redirects to the profile page. A third party could use the same SPI for
any "secondary account linking" provider. The `ECLIPSE_MISSING_GITHUB_ID` /
`ECLIPSE_MISMATCH_GITHUB_ID` error codes moved out of upstream's
`CodedAuthException` into the handler (the wire format is unchanged — they were
plain strings).

### 3. Moves without a seam

- `POST /user/publisher-agreement` existed solely for the agreement → the endpoint
  moved verbatim to `PublisherAgreementAPI` in this module (same path, same
  request/response shapes, same CSRF posture). On top of the move, the module
  contributes a "Publisher Agreement" Swagger UI group (`GroupedOpenApi` bean in the
  auto-configuration) documenting the endpoint — upstream's groups only cover
  `/api/**`, `/vscode/**` and `/admin/**`, so `/user/**` endpoints were never in the
  Swagger UI. The extra dropdown entry doubles as a visible marker that the registry
  is running with the Eclipse extension; it disappears with the auto-configuration
  (covered by the negative test).
- `PublisherComplianceChecker` (the `ovsx.eclipse.check-compliance-on-start` startup
  check) only depends on public upstream services → moved wholesale.
- `EclipseService`, `EclipseTokenService` and the DTOs
  (`EclipseProfile`, `PublisherAgreement`, `PublisherAgreementResponse`,
  `SignAgreementParam`) moved to `org.eclipsefdn.openvsx.eclipse` unchanged apart
  from the package statement, the `PublisherAgreementService` implementation
  declaration and the relocated revocation guard. All `ovsx.eclipse.*` configuration
  keys are unchanged.

### Accepted residue upstream (documented, not moved)

- `UserData.eclipsePersonId` / `UserData.eclipseToken` — database columns; the PoC
  brief forbids schema changes. Productionizing the extraction fully would need a
  generic "linked account / auth token" storage or instance-owned persistence.
- `UserJson.PublisherAgreement` — part of the public API response shape consumed by
  the web UI; treated as a generic "publisher agreement" concept in the API model.
  The seam interface reuses it, so it arguably belongs upstream anyway.

## Verification results

- **Upstream suite** (`./gradlew build`, Testcontainers): green before the change
  (798 tests) and green after the extraction (784 tests — the missing 14 are
  `EclipseServiceTest`, relocated here and passing).
- **Instance build** (`./gradlew test` in `server/`): all green —
  the 14 relocated `EclipseServiceTest` cases, a `@SpringBootTest` booting the
  merged application against Testcontainers PostgreSQL (upstream endpoints respond,
  `POST /user/publisher-agreement` is mapped, `PublisherAgreementService` resolves
  to `EclipseService`, the `eclipse` login handler and compliance checker are
  registered), and the negative test (auto-configuration excluded via
  `spring.autoconfigure.exclude` → application healthy, agreement bean and endpoint
  absent).
- **Dependency parity**: `BOOT-INF/lib` of the module's bootJar is identical to an
  upstream bootJar's, except `openvsx-server-plain.jar` itself (whose classes are
  upstream's `BOOT-INF/classes`).
- **Docker image**: boots on a plain JRE base with a production-shaped
  `DEPLOYMENT_CONFIG`; Jetty (not Tomcat) serves; website, `/user`,
  `/login-providers`, `/api/version` (sed-substituted version string) and database
  search respond as before; the agreement endpoint is mapped.
- **Helm/ESO**: `git diff aws-main..HEAD -- charts kubernetes dashboards
  configuration mail-templates Jenkinsfile` is empty.

## Gotchas encountered

- Upstream's `bootJar`/`jar` names carry no version (`version` is unset), so the
  library publishes as `org.eclipse.openvsx:openvsx-server:unspecified`. Composite
  builds don't care (substitution ignores versions), but real artifact publication
  needs a version scheme.
- The upstream main jar ships **no** `application.yml` (only `src/dev` and
  `src/test` do), so the "no application.yml in the instance jar" rule is naturally
  satisfied; the deployment already gets its base config from `config/application.yml`
  in the image.
- Named Docker build contexts (`--build-context server-src=…`) replace the
  `server-src` stage wholesale; the stage is normalized (`FROM scratch` +
  `COPY --from=server-clone`) so both the clone default and the local override
  present the same layout to later stages.
- Gradle rich-version gotcha (cost the most time of anything here): a `strictly`
  constraint does not downgrade a sibling dependency edge that requires a higher
  version — resolution fails. And because Jackson 3 ships Gradle module metadata
  that is only fetched when first needed, the failures appeared a build *after* the
  change that triggered the fetch. Hence plain constraints + instance-side forces.
- Boot 4 modularization details surface in a consumer that upstream never sees:
  `TestRestTemplate` lives in `spring-boot-resttestclient` (via
  `spring-boot-starter-webmvc-test`), Testcontainers 2.x uses
  `org.testcontainers:testcontainers-postgresql` (not 1.x `:postgresql`), and
  Mockito cannot `@InjectMocks` an `Optional<>` constructor parameter (hence the
  `@Nullable` seam injection upstream).
- The instance module compiles against Spring/Jakarta/etc. directly, so it declares
  those dependencies itself (versionless, resolved via the server's published
  constraints) instead of leaning on upstream's `implementation` classpath leaking
  through.
- **The sneakiest one:** `bootJar` hoists the application's own `META-INF/**`
  resources to the *jar root*, not `BOOT-INF/classes` — and `run-server.sh` launches
  with `java -cp BOOT-INF/classes:BOOT-INF/lib/*`, which never sees the exploded
  jar root. The auto-configuration registration
  (`META-INF/spring/….AutoConfiguration.imports`) silently vanished from the
  runtime classpath: the container booted healthy but *without* the publisher
  agreement, while every Gradle-run test (which uses the plain resources dir)
  passed. Caught only by smoke-testing the real image. Fixed by copying
  `META-INF/spring/**` into `BOOT-INF/classes` in the `bootJar` task; the
  moved-endpoint probe is part of the container smoke test now.

## Productionizing (honest assessment)

- Publish `org.eclipse.openvsx:openvsx-server` (plain jar + POM + module metadata)
  to a real repository (Maven Central or GitHub Packages) with a version scheme;
  the composite build is a stopgap that compiles upstream from source on every image
  build.
- CI: the instance build needs a pinned upstream ref (build arg `SERVER_VERSION`)
  and a cache for Gradle dependencies; the current Dockerfile downloads everything
  per build, like upstream's own Dockerfile.
- Upgrade workflow: bumping upstream = bumping one ref/version and re-running the
  instance test suite; API-breaking upstream changes surface as compile errors in
  the instance build instead of image-assembly surprises.
