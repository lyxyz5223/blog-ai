import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 5000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'text-summary'],
      reportsDirectory: './coverage',
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
        'src/components/FloatingElements.jsx',
        'src/components/DailyQuote.jsx',
        'src/components/GitHubComments.jsx',
        'src/components/MarkdownEditor.jsx',
        '**/*.config.js',
        'dist/',
        'coverage/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
