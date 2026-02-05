<h1 align="center">

<a href="https://open-vsx.org">
  <img src="https://outreach.eclipse.foundation/hs-fs/hubfs/OpenVSX-logo.png?width=369&height=117&name=OpenVSX-logo.png">
</a>

</h1>

<p align="center">
  <a href="https://join.slack.com/t/openvsxworkinggroup/shared_invite/zt-2y07y1ggy-ct3IfJljjGI6xWUQ9llv6A"><img alt="Slack workspace" src="https://img.shields.io/badge/Slack-Join%20workspace-4A154B?logo=slack&logoColor=white" /></a>
  <a href="https://github.com/EclipseFdn/open-vsx.org/blob/main/LICENSE"><img alt="EPLv2 License" src="https://img.shields.io/github/license/EclipseFdn/open-vsx.org" /></a>
  <a href="https://github.com/EclipseFdn/open-vsx.org/actions/workflows/main.yml?query=branch%3Aproduction"><img alt="Build Status @ production" src="https://github.com/EclipseFdn/open-vsx.org/actions/workflows/main.yml/badge.svg?branch:main" /></a>
  <a href="https://scorecard.dev/viewer/?uri=github.com/EclipseFdn/open-vsx.org"><img alt="OpenSSF Scorecard" src="https://api.securityscorecards.dev/projects/github.com/EclipseFdn/open-vsx.org/badge" /></a>
</p>

# open-vsx.org

This repository contains the source of [open-vsx.org](https://open-vsx.org), the public instance of [Eclipse Open VSX](https://github.com/eclipse/openvsx). Most of the code is maintained in [eclipse/openvsx](https://github.com/eclipse/openvsx), while here you'll find only adaptations specific to the public instance.

The main artifact is the Docker image available at [ghcr.io/eclipsefdn/openvsx-website](https://github.com/orgs/EclipseFdn/packages/container/package/openvsx-website). It contains the server application with customized frontend and base configuration.

## Publishing and Managing Extensions

For information on publishing and managing extensions at [open-vsx.org](https://open-vsx.org), please see 
the [open-vsx.org wiki](https://github.com/EclipseFdn/open-vsx.org/wiki).

## Claiming Namespace Ownership

[Open VSX namespaces](https://github.com/eclipse/openvsx/wiki/Namespace-Access) are public by default. [Create an issue here](https://github.com/EclipseFdn/open-vsx.org/issues/new/choose) to claim ownership of a namespace.

If you want to refute a previously granted ownership, please comment on the corresponding issue.

## Getting started

Enable Yarn, install dependencies, build assets and start a dev server:

```bash
cd website
corepack enable
corepack prepare yarn@stable --activate
yarn --cwd website
yarn --cwd website compile
yarn --cwd website build
yarn --cwd website build:dev
yarn --cwd website start:dev
```

### Development 

We recommend running `watch:tsc` and `watch:dev` afterwards to run the TypeScript compiler and Webpack in watch mode.

## Contributing

1. [Fork](https://help.github.com/articles/fork-a-repo/) the [eclipsefdn/open-vsx.org](https://github.com/eclipsefdn/open-vsx.org) repository
2. Clone repository: `git clone https://github.com/[your_github_username]/open-vsx.org.git`
3. Create your feature branch: `git checkout -b my-new-feature`
4. Commit your changes: `git commit -m 'Add some feature' -s`
5. Push feature branch: `git push origin my-new-feature`
6. Submit a pull request

### Declared Project Licenses

This program and the accompanying materials are made available under the terms
of the Eclipse Public License v. 2.0 which is available at
http://www.eclipse.org/legal/epl-2.0.

SPDX-License-Identifier: EPL-2.0

## Bugs and feature requests

Have a bug or a feature request? Please search for existing and closed issues. If your problem or idea is not addressed yet, [please open a new issue](https://github.com/eclipsefdn/open-vsx.org/issues/new).

## Trademarks

* Eclipse® is a Trademark of the Eclipse Foundation, Inc.
* Eclipse Foundation is a Trademark of the Eclipse Foundation, Inc.

## Copyright and license

Copyright 2021-2025 the [Eclipse Foundation, Inc.](https://www.eclipse.org) and the [open-vsx.org authors](https://github.com/eclipsefdn/open-vsx.org/graphs/contributors). Code released under the [Eclipse Public License Version 2.0 (EPL-2.0)](https://github.com/EclipseFdn/open-vsx.org/blob/main/LICENSE).
