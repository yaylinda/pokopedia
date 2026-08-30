import bundledGroupingStudioJson from '../../../data/grouping-studio.json'
import {
  parseGroupingStudioDocument,
  type GroupingStudioDocument,
} from './groupingStudioModel'

const apiPath = `${import.meta.env.BASE_URL}api/grouping-studio`

export type GroupingStudioLoadResult = {
  document: GroupingStudioDocument
  writable: boolean
}

export const getBundledGroupingStudioDocument = () =>
  parseGroupingStudioDocument(bundledGroupingStudioJson)

export const loadGroupingStudioDocument = async (): Promise<GroupingStudioLoadResult> => {
  try {
    const response = await fetch(apiPath, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) throw new Error(`Load failed with ${response.status}`)

    return {
      document: parseGroupingStudioDocument(await response.json()),
      writable:
        response.headers.get('X-Grouping-Studio-Writable') === 'true',
    }
  } catch {
    return {
      document: getBundledGroupingStudioDocument(),
      writable: false,
    }
  }
}

export const saveGroupingStudioDocument = async (
  document: GroupingStudioDocument,
) => {
  const response = await fetch(apiPath, {
    body: `${JSON.stringify(document, null, 2)}\n`,
    headers: { 'Content-Type': 'application/json' },
    method: 'PUT',
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Save failed with ${response.status}`)
  }
}
