import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const groupingStudioFile = resolve('data', 'grouping-studio.json')
const groupingStudioTempFile = resolve('data', 'grouping-studio.json.tmp')

function groupingStudioFiles(): Plugin {
  return {
    name: 'grouping-studio-files',
    configureServer(server) {
      server.middlewares.use('/api/grouping-studio', async (request, response) => {
        response.setHeader('Cache-Control', 'no-store')

        if (request.method === 'GET') {
          try {
            const contents = await readFile(groupingStudioFile, 'utf8')
            response.statusCode = 200
            response.setHeader('Content-Type', 'application/json; charset=utf-8')
            response.setHeader('X-Grouping-Studio-Writable', 'true')
            response.end(contents)
          } catch (error) {
            response.statusCode = 500
            response.end(
              error instanceof Error
                ? `Could not read grouping studio data: ${error.message}`
                : 'Could not read grouping studio data.',
            )
          }
          return
        }

        if (request.method === 'PUT') {
          try {
            const chunks: Buffer[] = []
            let byteCount = 0

            for await (const chunk of request) {
              const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
              byteCount += buffer.length
              if (byteCount > 1_000_000) {
                response.statusCode = 413
                response.end('Grouping studio data must be smaller than 1 MB.')
                return
              }
              chunks.push(buffer)
            }

            const contents = Buffer.concat(chunks).toString('utf8')
            const document = JSON.parse(contents) as {
              schemaVersion?: unknown
              scopes?: unknown
            }

            if (
              document.schemaVersion !== 1 ||
              !document.scopes ||
              typeof document.scopes !== 'object' ||
              Array.isArray(document.scopes)
            ) {
              response.statusCode = 400
              response.end('Grouping studio data has an invalid schema.')
              return
            }

            await writeFile(groupingStudioTempFile, `${JSON.stringify(document, null, 2)}\n`)
            await rename(groupingStudioTempFile, groupingStudioFile)
            response.statusCode = 204
            response.end()
          } catch (error) {
            response.statusCode = 400
            response.end(
              error instanceof Error
                ? `Could not save grouping studio data: ${error.message}`
                : 'Could not save grouping studio data.',
            )
          }
          return
        }

        response.statusCode = 405
        response.setHeader('Allow', 'GET, PUT')
        response.end('Method not allowed.')
      })
    },
  }
}

function sites(): Plugin {
  return {
    name: 'sites',
    apply: 'build',
    async closeBundle() {
      const outputDirectory = resolve('dist', '.openai')

      await rm(outputDirectory, { force: true, recursive: true })
      await mkdir(outputDirectory, { recursive: true })
      await mkdir(resolve('dist', 'server'), { recursive: true })
      await cp('.openai/hosting.json', resolve(outputDirectory, 'hosting.json'))
      await cp('worker/index.js', resolve('dist', 'server', 'index.js'))
    },
  }
}

export default defineConfig({
  plugins: [react(), groupingStudioFiles(), sites()],
  base: process.env.GITHUB_ACTIONS === 'true' && repoName ? `/${repoName}/` : '/',
  build: {
    // Sites serves static assets from dist/client alongside dist/server/index.js.
    outDir: 'dist/client',
  },
})
