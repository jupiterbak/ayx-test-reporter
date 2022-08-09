import * as core from '@actions/core'
import {AYXTestResults, main, wait} from './common'
import {AlteryxSdk} from '@jupiterbak/ayx-node'
import fs from 'fs'

async function run(): Promise<void> {
  try {
    // read the inputs
    const ms: string = core.getInput('milliseconds')
    const url: string = core.getInput('ayx-server-api-url')
    const clientId: string = core.getInput('ayx-server-client-id')
    const clientSecret: string = core.getInput('ayx-server-client-secret')
    const collectionName: string = core.getInput('collection-to-test')

    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    // Instantiate the clients
    // Instantiate the library
    const sdk = new AlteryxSdk({
      gateway: url,
      clientId,
      clientSecret
    })
    const wClient = sdk.GetWorkflowManagementClient()
    const cClient = sdk.GetCollectionManagementClient()
    const jClient = sdk.GetJobManagementClient()

    const rslt: AYXTestResults = await main(
      cClient,
      wClient,
      jClient,
      collectionName
    )

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    // create test report
    const tests = rslt.statuses.map((status, i) => {
      return {
        title: rslt.workflows[i].name,
        fullTitle: rslt.workflows[i].name,
        file: rslt.workflows[i].name,
        duration: 0,
        currentRetry: 0,
        speed: 'fast',
        err: {},
        createDate: status.createDate,
        disposition: status.disposition,
        status: status.status,
        name: rslt.workflows[i].name,
        job: status.id,
        runWithE2: status.runWithE2,
        outputCount: status.outputs?.length
      }
    })

    const passes = rslt.statuses
      .filter(status => status.disposition === 'Success')
      .map((status, i) => {
        return {
          title: rslt.workflows[i].name,
          fullTitle: rslt.workflows[i].name,
          file: rslt.workflows[i].name,
          duration: 0,
          currentRetry: 0,
          speed: 'fast',
          err: {},
          createDate: status.createDate,
          disposition: status.disposition,
          status: status.status,
          name: rslt.workflows[i].name,
          job: status.id,
          runWithE2: status.runWithE2,
          outputCount: status.outputs?.length
        }
      })

    const failures = rslt.statuses
      .filter(status => status.disposition !== 'Success')
      .map((status, i) => {
        return {
          title: rslt.workflows[i].name,
          fullTitle: rslt.workflows[i].name,
          file: rslt.workflows[i].name,
          duration: 0,
          currentRetry: 0,
          speed: 'fast',
          err: {},
          createDate: status.createDate,
          disposition: status.disposition,
          status: status.status,
          name: rslt.workflows[i].name,
          job: status.id,
          runWithE2: status.runWithE2,
          outputCount: status.outputs?.length
        }
      })

    const pending = rslt.statuses
      .filter(
        status =>
          status.disposition === 'Running' || status.disposition === 'Queued'
      )
      .map((status, i) => {
        return {
          title: rslt.workflows[i].name,
          fullTitle: rslt.workflows[i].name,
          file: rslt.workflows[i].name,
          duration: 0,
          currentRetry: 0,
          speed: 'fast',
          err: {},
          createDate: status.createDate,
          disposition: status.disposition,
          status: status.status,
          name: rslt.workflows[i].name,
          job: status.id,
          runWithE2: status.runWithE2,
          outputCount: status.outputs?.length
        }
      })

    const test_result = {
      stats: {
        suites: 1,
        tests: rslt.workflows.length,
        passes: rslt.statuses.filter(status => status.disposition === 'Success')
          .length,
        pending: rslt.statuses.filter(
          status =>
            status.disposition === 'Running' || status.disposition === 'Queued'
        ).length,
        failures: rslt.statuses.filter(
          status => status.disposition !== 'Success'
        ).length,
        start: rslt.statuses.reduce((p, c) => {
          return new Date(c.createDate!) > new Date(p.createDate!) ? p : c
        }).createDate,
        end: rslt.statuses.reduce((p, c) => {
          return new Date(c.createDate!) > new Date(p.createDate!) ? c : p
        }).createDate,
        duration: 0
      },
      tests,
      pending,
      failures,
      passes
    }

    // Write results to file
    fs.writeFileSync('results.json', JSON.stringify(test_result, null, 4))

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
