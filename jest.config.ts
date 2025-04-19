import type { Config } from "jest";

export default async (): Promise<Config> => {
  return {
    // An array of regexp pattern strings used to skip coverage collection
    coveragePathIgnorePatterns: [
      "/node_modules/"
    ],

    // Indicates which provider should be used to instrument code for coverage
    coverageProvider: "v8",
    
    // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
    testPathIgnorePatterns: [
      "/node_modules/"
    ],

    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    transformIgnorePatterns: [
      "/node_modules/",
      "\\.pnp\\.[^\\/]+$"
    ],
    projects: [
      {
        displayName: "fuck-platform",

        // The directory where Jest should output its coverage files
        coverageDirectory: "<rootDir>/coverage",

        // The test environment that will be used for testing
        testEnvironment: "jsdom",

        // The root directory that Jest should scan for tests and modules within
        rootDir: "./packages/fuck-platform",

        // A list of paths to directories that Jest should use to search for files in
        roots: [
          "<rootDir>/__mocks",
          "<rootDir>/__tests__",
        ],

        // The paths to modules that run some code to configure or set up the testing environment before each test
        setupFiles: ["<rootDir>/__tests__/setup.ts"],

        // A list of paths to modules that run some code to configure or set up the testing framework before each test
        setupFilesAfterEnv: ["<rootDir>/__tests__/setupAfterEnv.ts"],

        // A map from regular expressions to paths to transformers
        transform: {
          "^.+\\.ts$": [
            "ts-jest",
            {
              tsconfig: "<rootDir>/tsconfig.json",
            }
          ],
        },

        // The glob patterns Jest uses to detect test files
        testMatch: [
          "<rootDir>/**/__tests__/**/*.[jt]s?(x)",
          "<rootDir>/**/?(*.)+(spec|test).[tj]s?(x)"
        ],
      },
    ]
  };
};
