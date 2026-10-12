# Datadog Upload dSYMs Github Action
[![](https://github.com/DataDog/upload-dsyms-github-action/workflows/build-test/badge.svg)](https://github.com/Datadog/upload-dsyms-github-action/actions)

This Datadog GitHub Action uploads dSYM files to Datadog to symbolicate crash reports.
> This action runs only on `macos` environments.

## Setup

An [API key](https://app.datadoghq.com/organization-settings/api-keys) is required to upload dSYM files to Datadog. Store this key securely; for example, by using [GitHub encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets).


By default, the upload is sent to Datadog US ('datadoghq.com'). To configure this Action to use Datadog EU, set the `site` parameter to `datadoghq.eu`.

## Usage

```yml
name: Upload dSYM Files

jobs:
  build:
    runs-on: macos-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Generate/Download dSYM Files
        uses: ./release.sh

      - name: Upload dSYMs to Datadog
        uses: DataDog/upload-dsyms-github-action@v1
        with:
          api_key: ${{ secrets.DATADOG_API_KEY }}
          site: datadoghq.com
          dsym_paths: |
            path/to/dsyms/folder
            path/to/zip/dsyms.zip
```

## Inputs

|name|type|requirement|description|
|---|---|---|---|
|`api_key`|string|required|Datadog API key. Use a secret storage to store this parameter.|
|`site`|string|optional|Datadog site region. Defaults to `datadoghq.com`; use `datadoghq.eu` for the EU.|
|`dsym_paths`|list|required|List of dSYM files path to upload. Supports paths to folders and/or to zip files.|
|`dry_run`|Boolean|optional|If `true`, the command runs without the final upload step. All other checks are performed.|

## Building

Run `yarn install`, `yarn build`, and `yarn package` after updating dependencies, and commit `yarn.lock` and all generated files under `dist/`.

The packaging step builds `glob` separately from its unbundled entry point (`glob/raw`). Its default minified entry point embeds dependencies that Yarn resolutions cannot update. The separate bundle at `dist/node_modules/glob/` uses the versions from our lockfile and must ship with the action.

The `socks` resolution and the coverage-config loader's `js-yaml` resolution remove both dependency paths to the unpatched `sprintf-js` package. Keep these resolutions until the parent packages require the updated dependencies themselves.
