import {
  CollectionManagementClient,
  JobManagementClient,
  SDKModels,
  SDKModelsV1,
  WorkflowManagementClient
} from '@jupiterbak/ayx-node'
import tryer from 'tryer'

export interface AYXTestResults {
  workflows: SDKModels.WorkflowView[]
  statuses: SDKModelsV1.JobApiView[]
}

export async function wait(milliseconds: number): Promise<string> {
  return new Promise(resolve => {
    if (isNaN(milliseconds)) {
      throw new Error('milliseconds not a number')
    }

    setTimeout(() => resolve('done!'), milliseconds)
  })
}

export async function main(
  cClient: CollectionManagementClient,
  wClient: WorkflowManagementClient,
  jClient: JobManagementClient,
  collectionName: string,
  args: string
): Promise<AYXTestResults> {
  return new Promise(async resolve => {
    // list and filter the collectionc by name
    const collectionIds = (await cClient.GetCollections('Full'))
      .filter(x => {
        let _a
        return (_a = x.name) === null || _a === void 0
          ? void 0
          : _a.startsWith(collectionName)
      })
      .map(col => {
        return col.id
      })
      .flat()

    // Get all the workflows
    const collections = await Promise.all(
      collectionIds.map(async col_id => {
        const col = await cClient.GetCollection(col_id)
        return col
      })
    )

    // get the workflow Ids to post a new Job
    const workflowIds = collections
      .map(col => {
        return col.workflowIds
      })
      .flat()

    // get the workflows informations
    const workflows: SDKModels.WorkflowView[] = await Promise.all(
      workflowIds.map(async wId => {
        const workflow = await wClient.GetWorkflow(String(wId))
        return workflow
      })
    )
    // Post new Jobs
    const questions = JSON.parse(args)

    const jobs = await Promise.all(
      workflowIds.map(async workflow => {
        const job = await wClient.PostNewJobV1(String(workflow), {
          questions
        })
        return job
      })
    )

    let completed = false
    let statuses: SDKModelsV1.JobApiView[] = []
    tryer({
      action: async (done: () => void) => {
        statuses = await Promise.all(
          jobs.map(async job => {
            const status = await jClient.GetJobDetailsV1(String(job.id))
            return status
          })
        )

        const unfinished_jobs = statuses.filter(
          val => val.status === 'Queued' || val.status === 'Running'
        )
        completed = unfinished_jobs.length === 0

        done()
      },
      until: () => completed,
      pass: async () => {
        resolve({workflows, statuses})
      },
      interval: 10000,
      limit: -1
    })
  })
}
