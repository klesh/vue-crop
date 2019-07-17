// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: ['plugin:vue/base', 'airbnb-base'],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // check if imports actually resolve
  'settings': {
    'import/resolver': {
      'webpack': {
        'config': 'build/webpack.base.conf.js'
      }
    }
  },
  // add your custom rules here
  'rules': {
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      'js': 'never',
      'vue': 'never'
    }],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['test/unit/index.js']
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-console': process.env.NODE_ENV === 'production' ? 1 : 0,
    'comma-dangle': 0,
    'indent': 0,
    'dot-notation': 0,
    'object-curly-spacing': 0,
    'object-curly-newline': 0,
    'no-new': 0,
    'no-prototype-builtins': 0,
    'arrow-parens': 0,
    'no-param-reassign': 0,
    'no-confusing-arrow': 0,
    'no-bitwise': 0,
    'no-plusplus': 0,
    'no-multi-assign': 0,
    'import/prefer-default-export': 0,
    'arrow-body-style': 0,
    'spaced-comment': 0,
    'max-len': ['error', {code: 120}],
    'import/no-dynamic-require': 0,
    'func-names': 0,
    'newline-per-chained-call': 0,
    'linebreak-style': 0
  }
};
