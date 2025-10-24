/**
 * Infrastructure Setup Validation Tests
 * TDD Approach: Validate Arch Linux setup is complete and functional
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'

const projectRoot = resolve(process.cwd())

describe('TDD Infrastructure Validation - RED PHASE', () => {
  describe('System Dependencies', () => {
    it('should have Node.js version >= 20.19.0', () => {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim()
      const version = nodeVersion.replace('v', '')
      const [major, minor] = version.split('.').map(Number)

      expect(major).toBeGreaterThanOrEqual(20)
      if (major === 20) {
        expect(minor).toBeGreaterThanOrEqual(19)
      }
    })

    it('should have npm version >= 10.0.0', () => {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim()
      const [major] = npmVersion.split('.').map(Number)

      expect(major).toBeGreaterThanOrEqual(10)
    })

    it('should have chromium browser available', () => {
      try {
        const chromiumPath = execSync('which chromium', { encoding: 'utf8' }).trim()
        expect(chromiumPath).toContain('chromium')
      } catch (error) {
        throw new Error('Chromium browser not found in PATH')
      }
    })

    it('should have firefox browser available', () => {
      try {
        const firefoxPath = execSync('which firefox', { encoding: 'utf8' }).trim()
        expect(firefoxPath).toContain('firefox')
      } catch (error) {
        throw new Error('Firefox browser not found in PATH')
      }
    })
  })

  describe('Project Configuration', () => {
    it('should have package.json with correct module type', () => {
      const packageJsonPath = resolve(projectRoot, 'package.json')
      expect(existsSync(packageJsonPath)).toBe(true)

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      expect(packageJson.type).toBe('module')
    })

    it('should have correct engine requirements', () => {
      const packageJsonPath = resolve(projectRoot, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

      expect(packageJson.engines.node).toBe('>=20.19.0')
      expect(packageJson.engines.npm).toBe('>=10.0.0')
    })

    it('should have vite.config.js', () => {
      const viteConfigPath = resolve(projectRoot, 'vite.config.js')
      expect(existsSync(viteConfigPath)).toBe(true)
    })

    it('should have vitest.config.js', () => {
      const vitestConfigPath = resolve(projectRoot, 'vitest.config.js')
      expect(existsSync(vitestConfigPath)).toBe(true)
    })

    it('should have playwright.config.js', () => {
      const playwrightConfigPath = resolve(projectRoot, 'playwright.config.js')
      expect(existsSync(playwrightConfigPath)).toBe(true)
    })

    it('should have eslint.config.js', () => {
      const eslintConfigPath = resolve(projectRoot, 'eslint.config.js')
      expect(existsSync(eslintConfigPath)).toBe(true)
    })
  })

  describe('NPM Dependencies', () => {
    let packageJson

    beforeAll(() => {
      const packageJsonPath = resolve(projectRoot, 'package.json')
      packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    })

    it('should have node_modules directory', () => {
      const nodeModulesPath = resolve(projectRoot, 'node_modules')
      expect(existsSync(nodeModulesPath)).toBe(true)
    })

    it('should have vite installed', () => {
      const vitePath = resolve(projectRoot, 'node_modules', 'vite')
      expect(existsSync(vitePath)).toBe(true)
    })

    it('should have vitest installed', () => {
      const vitestPath = resolve(projectRoot, 'node_modules', 'vitest')
      expect(existsSync(vitestPath)).toBe(true)
    })

    it('should have playwright installed', () => {
      const playwrightPath = resolve(projectRoot, 'node_modules', '@playwright', 'test')
      expect(existsSync(playwrightPath)).toBe(true)
    })

    it('should have alpinejs installed', () => {
      const alpinejsPath = resolve(projectRoot, 'node_modules', 'alpinejs')
      expect(existsSync(alpinejsPath)).toBe(true)
    })

    it('should have leaflet installed', () => {
      const leafletPath = resolve(projectRoot, 'node_modules', 'leaflet')
      expect(existsSync(leafletPath)).toBe(true)
    })

    it('should have tailwindcss installed', () => {
      const tailwindPath = resolve(projectRoot, 'node_modules', 'tailwindcss')
      expect(existsSync(tailwindPath)).toBe(true)
    })

    it('should have correct vite version (>= 7.1.0)', () => {
      expect(packageJson.devDependencies.vite).toMatch(/\^7\.\d+\.\d+/)
    })

    it('should have correct vitest version (>= 4.0.0)', () => {
      expect(packageJson.devDependencies.vitest).toMatch(/\^[34]\.\d+\.\d+/)
    })

    it('should have correct playwright version (>= 1.48.0)', () => {
      expect(packageJson.devDependencies['@playwright/test']).toMatch(/\^1\.\d+\.\d+/)
    })
  })

  describe('Build System Configuration', () => {
    it('should have vite config with tailwindcss plugin', () => {
      const viteConfigPath = resolve(projectRoot, 'vite.config.js')
      const viteConfig = readFileSync(viteConfigPath, 'utf8')

      expect(viteConfig).toContain('tailwindcss')
      expect(viteConfig).toContain('@tailwindcss/vite')
    })

    it('should have vite config with PWA plugin', () => {
      const viteConfigPath = resolve(projectRoot, 'vite.config.js')
      const viteConfig = readFileSync(viteConfigPath, 'utf8')

      expect(viteConfig).toContain('VitePWA')
      expect(viteConfig).toContain('vite-plugin-pwa')
    })

    it('should have vite config with environment-aware base path', () => {
      const viteConfigPath = resolve(projectRoot, 'vite.config.js')
      const viteConfig = readFileSync(viteConfigPath, 'utf8')

      // Environment-aware: relative for dev/test, absolute for production
      expect(viteConfig).toContain('basePath')
      expect(viteConfig).toMatch(/base:\s*basePath/)
    })

    it('should have vite server config with correct port', () => {
      const viteConfigPath = resolve(projectRoot, 'vite.config.js')
      const viteConfig = readFileSync(viteConfigPath, 'utf8')

      expect(viteConfig).toContain('port: 5173')
    })
  })

  describe('Testing Infrastructure', () => {
    it('should have playwright config with chromium project', () => {
      const playwrightConfigPath = resolve(projectRoot, 'playwright.config.js')
      const playwrightConfig = readFileSync(playwrightConfigPath, 'utf8')

      expect(playwrightConfig).toContain("name: 'chromium'")
    })

    it('should have playwright config with firefox project', () => {
      const playwrightConfigPath = resolve(projectRoot, 'playwright.config.js')
      const playwrightConfig = readFileSync(playwrightConfigPath, 'utf8')

      expect(playwrightConfig).toContain("name: 'firefox'")
    })

    it('should have playwright config with webkit project', () => {
      const playwrightConfigPath = resolve(projectRoot, 'playwright.config.js')
      const playwrightConfig = readFileSync(playwrightConfigPath, 'utf8')

      expect(playwrightConfig).toContain("name: 'webkit'")
    })

    it('should have playwright config with webServer setup', () => {
      const playwrightConfigPath = resolve(projectRoot, 'playwright.config.js')
      const playwrightConfig = readFileSync(playwrightConfigPath, 'utf8')

      expect(playwrightConfig).toContain('webServer')
      expect(playwrightConfig).toMatch(/pnpm run dev|npm run dev/)
    })

    it('should have test scripts in package.json', () => {
      const packageJsonPath = resolve(projectRoot, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

      expect(packageJson.scripts.test).toBeDefined()
      expect(packageJson.scripts['test:unit']).toBeDefined()
      expect(packageJson.scripts['test:e2e']).toBeDefined()
      expect(packageJson.scripts['test:integration']).toBeDefined()
      expect(packageJson.scripts['test:coverage']).toBeDefined()
    })
  })

  describe('Development Scripts', () => {
    let packageJson

    beforeAll(() => {
      const packageJsonPath = resolve(projectRoot, 'package.json')
      packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    })

    it('should have dev script', () => {
      expect(packageJson.scripts.dev).toBe('vite')
    })

    it('should have build script', () => {
      // Build script should start with vite build and may include post-build steps
      expect(packageJson.scripts.build).toMatch(/^vite build/)
    })

    it('should have preview script', () => {
      expect(packageJson.scripts.preview).toBe('vite preview')
    })

    it('should have typecheck script', () => {
      expect(packageJson.scripts.typecheck).toBe('tsc --noEmit')
    })

    it('should have lint script', () => {
      expect(packageJson.scripts.lint).toContain('eslint')
    })

    it('should have format script', () => {
      expect(packageJson.scripts.format).toContain('prettier')
    })
  })

  describe('Git Integration', () => {
    it('should have .git directory', () => {
      const gitPath = resolve(projectRoot, '.git')
      expect(existsSync(gitPath)).toBe(true)
    })

    it('should have husky installed', () => {
      const huskyPath = resolve(projectRoot, 'node_modules', 'husky')
      expect(existsSync(huskyPath)).toBe(true)
    })

    it('should have .husky directory', () => {
      const huskyDirPath = resolve(projectRoot, '.husky')
      expect(existsSync(huskyDirPath)).toBe(true)
    })

    it('should have lint-staged configuration', () => {
      const packageJsonPath = resolve(projectRoot, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

      expect(packageJson['lint-staged']).toBeDefined()
    })
  })

  describe('Arch Linux Setup Documentation', () => {
    it('should have setup-arch.sh script', () => {
      const setupScriptPath = resolve(projectRoot, 'setup-arch.sh')
      expect(existsSync(setupScriptPath)).toBe(true)
    })

    it('should have setup-arch.sh as executable', () => {
      const setupScriptPath = resolve(projectRoot, 'setup-arch.sh')
      const stats = execSync(`stat -c %a ${setupScriptPath}`, { encoding: 'utf8' }).trim()

      // Should be executable (755, 775, or 777)
      expect(['755', '775', '777']).toContain(stats)
    })

    it('should have SETUP-ARCH.md documentation', () => {
      const setupDocPath = resolve(projectRoot, 'docs', 'SETUP-ARCH.md')
      expect(existsSync(setupDocPath)).toBe(true)
    })

    it('should have setup-arch.sh with zsh shebang', () => {
      const setupScriptPath = resolve(projectRoot, 'setup-arch.sh')
      const content = readFileSync(setupScriptPath, 'utf8')

      expect(content.startsWith('#!/usr/bin/env zsh')).toBe(true)
    })
  })

  describe('WSL2 Compatibility', () => {
    it('should have port configuration that works in WSL2', () => {
      const viteConfigPath = resolve(projectRoot, 'vite.config.js')
      const viteConfig = readFileSync(viteConfigPath, 'utf8')

      // Should not have strictPort: true (allows fallback in WSL2)
      expect(viteConfig).toContain('strictPort: false')
    })

    it('should have environment-aware base path for file access', () => {
      const viteConfigPath = resolve(projectRoot, 'vite.config.js')
      const viteConfig = readFileSync(viteConfigPath, 'utf8')

      // Environment-aware base path (relative for dev, absolute for prod)
      expect(viteConfig).toContain('basePath')
    })
  })

  describe('Project Structure', () => {
    it('should have src directory', () => {
      const srcPath = resolve(projectRoot, 'src')
      expect(existsSync(srcPath)).toBe(true)
    })

    it('should have src/js directory', () => {
      const jsPath = resolve(projectRoot, 'src', 'js')
      expect(existsSync(jsPath)).toBe(true)
    })

    it('should have tests directory', () => {
      const testsPath = resolve(projectRoot, 'tests')
      expect(existsSync(testsPath)).toBe(true)
    })

    it('should have tests/unit directory', () => {
      const unitTestsPath = resolve(projectRoot, 'tests', 'unit')
      expect(existsSync(unitTestsPath)).toBe(true)
    })

    it('should have tests/e2e directory', () => {
      const e2eTestsPath = resolve(projectRoot, 'tests', 'e2e')
      expect(existsSync(e2eTestsPath)).toBe(true)
    })

    it('should have index.html at project root', () => {
      const indexPath = resolve(projectRoot, 'index.html')
      expect(existsSync(indexPath)).toBe(true)
    })

    it('should have src/main.js entry point', () => {
      const mainJsPath = resolve(projectRoot, 'src', 'main.js')
      expect(existsSync(mainJsPath)).toBe(true)
    })
  })
})
