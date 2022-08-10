import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {main, wait} from '../src/common'
import {expect, test} from '@jest/globals'
import { AlteryxSdk } from '@jupiterbak/ayx-node'
import fs from 'fs'

test('throws invalid number', async () => {
  const input = parseInt('foo', 10)
  await expect(wait(input)).rejects.toThrow('milliseconds not a number')
})

test('wait 500 ms', async () => {
  const start = new Date()
  await wait(500)
  const end = new Date()
  var delta = Math.abs(end.getTime() - start.getTime())
  expect(delta).toBeGreaterThan(450)
})

// test('test main', async () => {
//   const url = 'http://ec2-3-66-136-169.eu-central-1.compute.amazonaws.com/webapi/';
//   const clientId = '8DA78CE09C0E5D1abf4927846637f9a02e196b8eff52b61f03246ad16ad2c81125ef4a80920db80';
//   const clientSecret = '1f675a0f8d2c572ddd02005a3396fe7e89706fe4a39e0d5f39cf9b6463aecec8';
//   const collectionName = '00_Data_Ingestion'

//   const sdk = new AlteryxSdk({
//     gateway: url,
//     clientId,
//     clientSecret
//   })
//   const wClient = sdk.GetWorkflowManagementClient()
//   const cClient = sdk.GetCollectionManagementClient()
//   const jClient = sdk.GetJobManagementClient()

//   const rslt = await main(cClient, wClient, jClient, collectionName)

// }, 500000)

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_MILLISECONDS'] = '500'
  process.env['INPUT_AYX-SERVER-API-URL'] = 'http://ec2-3-66-136-169.eu-central-1.compute.amazonaws.com/webapi/'
  process.env['INPUT_AYX-SERVER-CLIENT-ID'] = '8DA78CE09C0E5D1abf4927846637f9a02e196b8eff52b61f03246ad16ad2c81125ef4a80920db80'
  process.env['INPUT_AYX-SERVER-CLIENT-SECRET'] = '1f675a0f8d2c572ddd02005a3396fe7e89706fe4a39e0d5f39cf9b6463aecec8'
  process.env['INPUT_AYX-COLLECTION-TO-TEST'] = '00_Data_Ingestion'  

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
}, 500000)
