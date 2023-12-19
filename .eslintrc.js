require('@rushstack/eslint-config/patch/modern-module-resolution');
module.exports = {
    extends: ['@microsoft/eslint-config-spfx/lib/profiles/react'],
    parserOptions: { tsconfigRootDir: __dirname },
    ignorePatterns: ['**/node_modules', '**/*.js', '**/*.json', '**/*.scss'],
    overrides: [
        {
            files: ['*.ts', '*.tsx'], // Your TypeScript files extension

            parserOptions: {
                project: ['./tsconfig.json'], // Specify it only for TypeScript files
            },

            rules: {
                'react/prop-types': 'off',
                'react/display-name': 'off',
                'no-useless-escape': 'off',
                "@microsoft/spfx/no-async-await": "off",
                "@typescript-eslint/no-floating-promises" : "off",
                "@typescript-eslint/no-unnecessary-type-constraint": "off",
                "@typescript-eslint/explicit-function-return-type" : "off",
                "@typescript-eslint/no-unnecessary-type-assertion" : "off",
                "@typescript-eslint/typedef" : "off",
                "@typescript-eslint/no-unused-vars": "off",
                "@typescript-eslint/no-inferrable-types": "off",
                "@typescript-eslint/no-explicit-any": "off",
                "react/jsx-no-bind": "off"
            },
        },
    ],
};