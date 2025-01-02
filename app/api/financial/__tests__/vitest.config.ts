import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Global test timeout
        timeout: 30000,

        // Environment setup
        environment: 'node',
        globals: true,

        // Coverage configuration
        coverage: {
            provider: 'c8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.d.ts',
                '**/*.test.ts',
                '**/types/',
                '**/mocks/'
            ],
            all: true,
            lines: 80,
            functions: 80,
            branches: 80,
            statements: 80
        },

        // Test file patterns
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['node_modules', 'dist'],

        // Parallel test execution
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: false,
                isolate: true
            }
        },

        // Watch mode configuration
        watch: false,
        watchExclude: ['**/node_modules/**', '**/dist/**'],

        // Test isolation
        isolate: true,

        // Mock configuration
        mockReset: true,

        // Retry configuration
        retry: 2,

        // Snapshot configuration
        snapshotFormat: {
            printBasicPrototype: false,
            escapeString: false
        },

        // Reporter configuration
        reporters: ['default', 'html'],
        outputFile: {
            html: './coverage/test-report.html'
        },

        // Setup files
        setupFiles: ['./setup.ts'],

        // Environment variables
        env: {
            NODE_ENV: 'test',
            REDIS_URL: 'redis://localhost:6379',
            DATABASE_URL: 'postgresql://localhost:5432/test_db'
        }
    },

    // Resolve configuration
    resolve: {
        alias: {
            '@': '/src',
            '@tests': '/__tests__'
        }
    }
}); 