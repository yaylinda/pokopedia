import { cp, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]

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
  plugins: [react(), sites()],
  base: process.env.GITHUB_ACTIONS === 'true' && repoName ? `/${repoName}/` : '/',
})
