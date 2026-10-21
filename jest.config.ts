import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@renderer/(.*)$': '<rootDir>/src/renderer/src/$1'
  },
  transform: {
    '^.+\\.js$': ['ts-jest', { tsconfig: { allowJs: true, module: 'CommonJS', target: 'ES2022' } }],
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.web.json'
      }
    ]
  },
  transformIgnorePatterns: ['/node_modules/(?!react-error-boundary/)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};

export default config;
