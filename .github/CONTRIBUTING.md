# How to contribute

# Table of Contents

- [Branching model](#branching-model)
- [Pull Request](#pull-request)
- [Release process](#release-process)
   - [Versioning](#versioning)
   - [Publishing](#publishing)
- [License](#license)
- [Code of Conduct](#code-of-conduct)
- [Contributor License Agreement](#contributor-license-agreement)

# Branching model

The repository follows a branching model based on two main branches: `main` and `release`. The `main` branch reflects the latest stable published version of the packages, while the `release` branch is used to prepare the next release.

Some important points to consider:

* __The "main" branch must always reflect the latest stable published version of the packages in the repository__.
* We have a "release" branch for the following reasons:
   * To enable the maintainer to prepare the release of features without having to promote any unpublished changes to the "main" branch. By preparing the release we mainly mean to decide how to group changes in different releases and to update the `CHANGELOG.md` files and the version number of the package accordingly.
   * It is long-lived because we also have bots that will open PRs. So, they can be configured to open PRs to the "release" branch, and their changes will also enter in the process of preparing the release, such as changes from any other contributor.
* __The "release" branch is the default branch for PRs.__ Only a project maintainer should open a PR to the "main" branch, and only when the release is ready to be published.
* Usually, feature branches should be short-lived, and they should be merged into the "release" branch as soon as possible. This way, the changes will be included in the next release, and the feature branch can be deleted.

## Merging strategy

We use the __squash and merge strategy for merging PRs to the release branch__. This means that all the changes in the PR will be squashed into a single commit before being merged. The reasons are:

* To keep the history clean in the release branch
* To make easier to understand the changes in each release.

But we use the __merge commit strategy for merging PRs to the main branch from the release branch__. The reasons are:

* To keep in the history the information about the features that were merged separately into the release branch. This is very important, because we may have changes from different packages in the release branch, or from features that are not related. Squashing all the changes into a single commit would make it difficult to understand or revert the changes for a specific package or feature.
* To avoid having to rebase the release branch every time a PR is merged to the main branch.

# Pull Request

When you're finished with the changes, please ensure the following:

* You have added tests for your changes.
* You have updated the documentation if necessary.
* You have run the linter and fixed any issues.
* __You have added the necessary changes to the `CHANGELOG.md` file__, under the "unreleased" section at the beginning of the file.
* You have modified the version of the package in the `package.json` file according to the [versioning](#versioning) section.

When you have checked these points, then you are ready to submit your pull request. To do so, follow these steps:

* __The target branch for the PR should be `release`.__ (Read [branching-model](#branching-model) for more information)
* Fill the PR template. This template helps reviewers understand your changes as well as the purpose of your pull request.
* Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue) if you are solving one.
* Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so the branch can be updated for a merge. Once you submit your PR, a maintainer will review your proposal. We may ask questions or request additional information.
* We may ask for changes to be made before a PR can be merged, either using suggested changes or pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.
* As you update your PR and apply changes, mark each conversation as resolved.

# Release process

## Versioning

First of all, you should know that the repository follows the [Semantic Versioning](https://semver.org/) specification. This means that the version number is composed of three parts: `MAJOR.MINOR.PATCH`. __Each package in the repository has its own version number, and it is independent of the others.__ (Except for the dependencies between them, of course)
 
Please, follow these rules to update the version number:

* __MAJOR__: When you make incompatible API changes.
* __MINOR__: When you add functionality in a backwards-compatible manner.
* __PATCH__: When:
   * You make backwards-compatible bug fixes.
   * You bump the version of a dependency which doesn't affect the API of the package. __This includes internal dependencies.__

## Publishing

Once the PR is approved and merged into the release branch, a project maintainer can start the release process when corresponding (sometimes it is not desired to release the changes immediately, so the maintainer can wait until more changes are merged to release them all together).

The release process is as follows:

* Checkout the `release` branch, and:
   * Move changes in the "unreleased" section of the `CHANGELOG.md` files to a new version section that includes the version number and the release date.
   * Check that every affected package has the correct version number in the `package.json` file.
   * Commit the changes with the message `chore(release): description`.
* Open a PR from the `release` branch to the `main` branch.
   * Once the PR is approved and merged, the build pipeline will run in the `main` branch, but packages will not be published yet.
   * Create a new release in GitHub for each package modified in the release, following the next instructions:
      * Tag: `vX.Y.Z`
      * Title: `Human readable title for the release`.
      * Description: Copy the changes from the corresponding `CHANGELOG.md` file for the version you are releasing.
   * Once the release is created, the package will be published to the npm registry automatically.

# License

By contributing to this project, you agree that your contributions will be licensed under the [LICENSE](../LICENSE) file in the root of this repository, and that you agree to the [Contributor License Agreement](#contributor-license-agreement).

# Code of Conduct

Please read our [Code of Conduct](../.github/CODE_OF_CONDUCT.md) before contributing.

# Contributor License Agreement

This is a human-readable summary of (and not a substitute for) the [full agreement](./CLA.md). This highlights only some of the key terms of the CLA. It has no legal value and you should carefully review all the terms of the [actual CLA before agreeing](./CLA.md).

* __No Warranty or Support Obligations__. By making a contribution, you are not obligating yourself to provide support for the contribution, and you are not taking on any warranty obligations or providing any assurances about how it will perform.

The [CLA](./CLA.md) does not change the terms of the underlying license used by our software such as the Business Source License, Mozilla Public License, or MIT License. You are still free to use our projects within your own projects or businesses, republish modified source code, and more subject to the terms of the project license. Please reference the appropriate license for the project you're contributing to to learn more.