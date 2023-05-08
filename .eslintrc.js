/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

module.exports = {
    extends: 'eslint:recommended',
    env: {
        browser: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
        //allow implict def
        // 'no-undef': 'off',
        //use === or !==
        eqeqeq: 'error',
        //check only var, not args
        'no-unused-vars': "off",
        '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
    },
};
