# Alteryx Test Reporter
  
[![build-test](https://github.com/jupiterbak/ayx-test-reporter/actions/workflows/test.yml/badge.svg)](https://github.com/jupiterbak/ayx-test-reporter/actions/workflows/test.yml)  [![The MIT License](https://img.shields.io/github/license/jupiterbak/ayx-node)](./LICENSE) [![Total alerts](https://img.shields.io/lgtm/alerts/g/jupiterbak/ayx-node.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/jupiterbak/ayx-node/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/jupiterbak/ayx-node.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/jupiterbak/ayx-node/context:javascript)
[![GitHub release](https://img.shields.io/github/release/jupiterbak/ayx-test-reporter.svg)](https://github.com/jupiterbak/ayx-test-reporter/releases/latest)


This [Github Action](https://github.com/features/actions) displays execute tests (workflows) inside a collection on an Alteryx Server and display test results directly in GitHub.

✔️ List all the worflows of a collection and execute directly on an Alteryx Server.

✔️ Retrieve the test results in JSON format and creates nice report as Github Check Run

✔️ Highlights workflows where it failed based on message and stack trace captured during test execution

✔️ Retrive outputs of the invidual tests if needed

✔️ Provides final `conclusion` and counts of `passed`, `failed` and `skipped` tests as output parameters


Do you miss something or have an issue? Please create [Issue](https://github.com/jupiterbak/ayx-test-reporter/issues/new) or contribute with PR.


## Example

Following setup does not work in workflows triggered by pull request from forked repository.
If that's fine for you, using this action is as simple as:

```yaml
on:
  pull_request:
  push:
jobs:
  build-test:
    name: Build & Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2     # checkout the repo
      - name: Test Report
        uses: jupiterbak/ayx-test-reporter@v1.0.1
        with:
          ayx-server-api-url: 'http://loxcalhost/webapi/'
          ayx-server-client-id: '8DA78CE09C0E5D1abf4927846637f9a02e196b8eff52b61f03246ad16ad2c81125ef4a80920db80'
          ayx-server-client-secret: '1f675a0f8d2c572ddd02005a3396fe7e89706fe4a39e0d5f39cf9b6463aecec8'
          collection-to-test: '00_Data_Ingestion'
      - name: Upload a Build Artifact
        uses: actions/upload-artifact@v2.2.3
        with:
            path: |
              *.tgz
              results.json
      - name: Test Report
        uses: dorny/test-reporter@v1
        if: success() || failure()    
        with:
          name: Test Results            
          path: results.json            
          reporter: mocha-json
```

> **NOTE:** Please follow these intructions to read the clientId and the clientSecret of your server.
>
> Alteryx Help:  [https://help.alteryx.com/developer-help/server-api-overview](https://help.alteryx.com/developer-help/server-api-overview)

## Usage

```yaml
- uses: jupiterbak/ayx-test-reporter@v1.0.1
  with:
    # URL of the Alteryx server API.
    ayx-server-api-url: 'http://loxcalhost/webapi/'

    # ClienId used for the Alteryx server API.
    # Reference to the help to get the credentials https://help.alteryx.com/developer-help/server-api-overview
    ayx-server-client-id: 'XXXX...a80920db80'

    # ClientSecret used for the Alteryx server API.
    # Reference to the help to get the credentials https://help.alteryx.com/developer-help/server-api-overview
    ayx-server-client-secret: '1f67...3aecec8'

    # Alteryx Server Collection to test
    collection-to-test: '00_Data_Ingestion'
```

## Output parameters
| Name       | Description              |
| :--        | :--                      |
| conclusion | `success` or `failure`   |
| passed     | Count of passed tests    |
| failed     | Count of failed tests    |
| skipped    | Count of skipped tests   |
| time       | Test execution time [ms] |
| test-report-file    | Gnerated test report file in mocha-json   |


## License

The scripts and documentation in this project are released under the [MIT License](https://github.com/dorny/test-reporter/blob/main/LICENSE)