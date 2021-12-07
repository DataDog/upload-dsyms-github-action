# Datadog Upload dSYMs Github Action
[![](https://github.com/DataDog/upload-dsyms-github-action/workflows/build-test/badge.svg)](https://github.com/Datadog/upload-dsyms-github-action/actions)

This Datadog Github Action uploads dSYM files to Datadog in order to symbolicate crash reports.
> This action runs on a `macos` environment only.

## Setup

An [API key](https://app.datadoghq.com/organization-settings/api-keys) is required to upload dSYM files to Datadog.
It is possible to configure the action to use Datadog EU by defining the `site` parameter to `datadoghq.eu`. By default the upload is sent to Datadog US.

## Usage

```yml
name: Upload dSYM Files

jobs:
  build:
    runs-on: macos-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v2

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
|`site`|string|optional|Datadog site region. `datadoghq.com` by default, use `datadoghq.eu` for the EU.|
|`dsym_paths`|list|required|List of dSYM files path to upload. Support paths to folder and/or to zip files.|
|`dry_run`|boolean|optional|If `true`, it will run the command without the final step of upload. All other checks are performed.|

