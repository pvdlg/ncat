module.exports = {
  'root': true,
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaVersion': 8,
    'sourceType': 'module',
    'ecmaFeatures': {
      'globalReturn': true
    }
  },
  'plugins': ['import'],
  'env': {
    'es6': true,
    'node': true
  },
  'rules': {
    // Possible Errors
    'no-compare-neg-zero': 2,
    'no-cond-assign': 2,
    'no-console': 0,
    'no-constant-condition': 2,
    'no-control-regex': 2,
    'no-debugger': 2,
    'no-dupe-args': 2,
    'no-dupe-keys': 2,
    'no-duplicate-case': 2,
    'no-empty-character-class': 2,
    'no-empty': 2,
    'no-ex-assign': 2,
    'no-extra-boolean-cast': 2,
    'no-extra-parens': 2,
    'no-extra-semi': 2,
    'no-func-assign': 2,
    'no-inner-declarations': 2,
    'no-invalid-regexp': 2,
    'no-irregular-whitespace': 2,
    'no-obj-calls': 2,
    'no-prototype-builtins': 2,
    'no-regex-spaces': 2,
    'no-sparse-arrays': 2,
    'no-template-curly-in-string': 2,
    'no-unexpected-multiline': 2,
    'no-unreachable': 2,
    'no-unsafe-finally': 2,
    'no-unsafe-negation': 2,
    'use-isnan': 2,
    'valid-jsdoc': [2, {
      'requireReturn': false
    }],
    'valid-typeof': 2,

    //Best Practices
    'accessor-pairs': 2,
    'array-callback-return': 2,
    'block-scoped-var': 2,
    'class-methods-use-this': 2,
    'complexity': [2, 15],
    'consistent-return': 2,
    'curly': 2,
    'default-case': 2,
    'dot-location': [2, 'property'],
    'dot-notation': 2,
    'eqeqeq': 2,
    'guard-for-in': 2,
    'no-alert': 2,
    'no-caller': 2,
    'no-case-declarations': 2,
    'no-div-regex': 2,
    'no-else-return': 0,
    'no-empty-function': 2,
    'no-empty-pattern': 2,
    'no-eq-null': 2,
    'no-eval': 2,
    'no-extend-native': 2,
    'no-extra-bind': 2,
    'no-extra-label': 2,
    'no-fallthrough': 2,
    'no-floating-decimal': 2,
    'no-global-assign': 2,
    'no-implicit-coercion': 2,
    'no-implicit-globals': 2,
    'no-implied-eval': 2,
    'no-invalid-this': 0,
    'no-iterator': 2,
    'no-labels': 2,
    'no-lone-blocks': 2,
    'no-loop-func': 2,
    'no-magic-numbers': [2, {
      'ignore': [0, 1, 2, -1, 0.99, 1000],
      'ignoreArrayIndexes': true,
      'enforceConst': true
    }],
    'no-multi-spaces': 0,
    'no-multi-str': 2,
    'no-new-func': 2,
    'no-new-wrappers': 2,
    'no-new': 2,
    'no-octal-escape': 2,
    'no-octal': 2,
    'no-param-reassign': 2,
    'no-proto': 2,
    'no-redeclare': 2,
    'no-return-assign': 2,
    'no-return-await': 2,
    'no-script-url': 2,
    'no-self-assign': 2,
    'no-self-compare': 2,
    'no-sequences': 2,
    'no-throw-literal': 2,
    'no-unmodified-loop-condition': 2,
    'no-unused-expressions': 2,
    'no-unused-labels': 2,
    'no-useless-call': 2,
    'no-useless-concat': 2,
    'no-useless-escape': 2,
    'no-useless-return': 2,
    'no-void': 2,
    'no-warning-comments': [1, {
      'terms': ['todo', 'fixme'],
      'location': 'start'
    }],
    'no-with': 2,
    'prefer-promise-reject-errors': 2,
    'radix': 2,
    'require-await': 2,
    'vars-on-top': 0,
    'wrap-iife': 2,
    'yoda': 2,

    // Variables
    'init-declarations': 0,
    'no-catch-shadow': 2,
    'no-delete-var': 2,
    'no-label-var': 2,
    'no-shadow-restricted-names': 2,
    'no-shadow': 2,
    'no-undef-init': 2,
    'no-undef': 2,
    'no-undefined': 0,
    'no-unused-vars': 2,
    'no-use-before-define': 0,

    // Stylistic
    'array-bracket-spacing': 2,
    'block-spacing': 2,
    'brace-style': 2,
    'camelcase': [2, {
      'properties': 'never'
    }],
    'capitalized-comments': [1, 'always', {
      'ignoreConsecutiveComments': true
    }],
    'comma-dangle': [2, 'never'],
    'comma-spacing': 2,
    'comma-style': 2,
    'computed-property-spacing': 2,
    'consistent-this': 2,
    'eol-last': 2,
    'func-call-spacing': 2,
    'func-name-matching': 2,
    'func-names': [2, 'as-needed'],
    'func-style': 0,
    'indent': [2, 2],
    'jsx-quotes': 2,
    'key-spacing': 2,
    'keyword-spacing': 2,
    'line-comment-position': 2,
    'linebreak-style': 2,
    'lines-around-comment': 0,
    'lines-around-directive': 2,
    'max-depth': 2,
    'max-len': [2, 120],
    'max-lines': 0,
    'max-nested-callbacks': [2, 5],
    'max-params': [2, 7],
    'max-statements-per-line': 2,
    'max-statements': 0,
    'multiline-ternary': 0,
    'new-cap': 0,
    'new-parens': 2,
    'newline-after-var': 2,
    'newline-before-return': 0,
    'newline-per-chained-call': [2, {
      'ignoreChainWithDepth': 4
    }],
    'no-array-constructor': 2,
    'no-bitwise': 2,
    'no-continue': 0,
    'no-inline-comments': 2,
    'no-lonely-if': 2,
    'no-mixed-spaces-and-tabs': 2,
    'no-multiple-empty-lines': [2, {
      'max': 1
    }],
    'no-negated-condition': 2,
    'no-nested-ternary': 0,
    'no-new-object': 2,
    'no-plusplus': [2, {
      'allowForLoopAfterthoughts': true
    }],
    'no-tabs': 2,
    'no-ternary': 0,
    'no-trailing-spaces': 2,
    'no-underscore-dangle': 0,
    'no-unneeded-ternary': 2,
    'no-whitespace-before-property': 2,
    'nonblock-statement-body-position': [2, 'beside'],
    'object-curly-newline': [1, {
      'minProperties': 1,
      'multiline': true
    }],
    'object-curly-spacing': [1, 'always'],
    'object-property-newline': 2,
    'one-var-declaration-per-line': 2,
    'one-var': [2, 'never'],
    'operator-assignment': 2,
    'operator-linebreak': [2, 'after'],
    'padded-blocks': [2, 'never'],
    'quote-props': [2, 'consistent-as-needed'],
    'quotes': [2, 'single'],
    'require-jsdoc': [1, {
      'require': {
        'FunctionDeclaration': true,
        'MethodDefinition': true,
        'ClassDeclaration': true
      }
    }],
    'semi-spacing': 2,
    'semi': [2, 'always'],
    'sort-keys': 0,
    'sort-vars': 0,
    'space-before-blocks': 2,
    'space-before-function-paren': [2, 'never'],
    'space-in-parens': 2,
    'space-infix-ops': 2,
    'space-unary-ops': 2,
    'spaced-comment': 2,
    'template-tag-spacing': 2,
    'unicode-bom': 2,
    'wrap-regex': 2,

    // ES2015
    'arrow-body-style': 2,
    'arrow-parens': 2,
    'arrow-spacing': 2,
    'constructor-super': 2,
    'generator-star-spacing': 2,
    'no-confusing-arrow': 2,
    'no-const-assign': 2,
    'no-dupe-class-members': 2,
    'no-duplicate-imports': 2,
    'no-new-symbol': 2,
    'no-this-before-super': 2,
    'no-useless-computed-key': 2,
    'no-useless-constructor': 2,
    'no-useless-rename': 2,
    'no-var': 2,
    'object-shorthand': 2,
    'prefer-arrow-callback': 2,
    'prefer-const': 2,
    'prefer-destructuring': 0,
    'prefer-numeric-literals': 2,
    'prefer-rest-params': 2,
    'prefer-spread': 2,
    'prefer-template': 2,
    'require-yield': 2,
    'rest-spread-spacing': 2,
    'sort-imports': 0,
    'symbol-description': 2,
    'template-curly-spacing': 2,
    'yield-star-spacing': 2,

    // Imports
    'import/no-unresolved': [2, {
      'commonjs': true,
      'amd': true,
      'ignore': ['window', 'document', 'glob']
    }],
    'import/named': 2,
    'import/default': 2,
    'import/namespace': 2,
    'import/no-absolute-path': 2,
    'import/no-dynamic-require': 0,
    'import/no-internal-modules': 0,
    'import/no-webpack-loader-syntax': 2,
    'import/export': 2,
    'import/no-named-as-default': 2,
    'import/no-named-as-default-member': 2,
    'import/no-deprecated': 2,
    'import/no-extraneous-dependencies': 0,
    'import/no-mutable-exports': 2,
    'import/unambiguous': 0,
    'import/no-commonjs': 0,
    'import/no-amd': 2,
    'import/no-nodejs-modules': 0,
    'import/first': 2,
    'import/no-duplicates': 2,
    'import/no-namespace': 2,
    'import/extensions': 2,
    'import/order': 2,
    'import/newline-after-import': 2,
    'import/prefer-default-export': 0,
    'import/max-dependencies': 0,
    'import/no-unassigned-import': 0,
    'import/no-named-default': 2
  }
}
