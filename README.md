# **ncat**

Node CLI to concatenate multiple files, with their sourcemaps and optionally stdin, a banner and a footer.

[![npm](https://img.shields.io/npm/v/ncat.svg)](https://www.npmjs.com/package/ncat)
[![npm](https://img.shields.io/npm/dt/ncat.svg)](https://www.npmjs.com/package/ncat)
[![Greenkeeper badge](https://badges.greenkeeper.io/vanduynslagerp/ncat.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/vanduynslagerp/ncat.svg)](https://github.com/vanduynslagerp/ncat/blob/master/LICENSE)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

[![Travis](https://img.shields.io/travis/vanduynslagerp/ncat.svg)](https://travis-ci.org/vanduynslagerp/ncat)
[![AppVeyor](https://img.shields.io/appveyor/ci/vanduynslagerp/ncat.svg)](https://ci.appveyor.com/project/vanduynslagerp/ncat)
[![Code Climate](https://img.shields.io/codeclimate/github/vanduynslagerp/ncat.svg)](https://codeclimate.com/github/vanduynslagerp/ncat)
[![Codecov](https://img.shields.io/codecov/c/github/vanduynslagerp/ncat.svg)](https://codecov.io/gh/vanduynslagerp/ncat)

## Installation

```bash
$ npm i -g|-D ncat
```

## Usage

```bash
$ ncat [<FILES ...>] [OPTIONS] [-o|--output <OUTPUT_FILE>]
```
The arguments may be a list of files:
```bash
$ ncat file_1.js file_2.js -o dist/bundle.js
```
or a list of globs:
```bash
$ ncat 'src/**/*.js !**/rainbow.js' src/**/{cake,unicorn}.css -o dist/bundle.js
```
If file is a single dash (`-`) ncat reads from the standard input:
```bash
$ echo 'Insert between file_1.js and file_2.js' | ncat file_1.js - file_2.js -o dist/bundle.js
```
If `-o|--output` is omitted ncat writes to the standard input:
```bash
$ ncat file_1.js file_2.js | uglifyjs > dist/bundle.min.js
```

## Options

|Name|Type|Default|Description|
|:---|:--:|:-----:|:----------|
|`-o, --output`|`{String}`|`undefined`|Output File|
|`-m, --map`|`{Boolean}`|`false`|Create an external sourcemap (including the sourcemaps of existing files)|
|`-e, --map-embed`|`{Boolean}`|`false`|Embed the code in the sourcemap (only apply to code without an existing sourcemap)|
|`-b, --banner`|`{Boolean\|String}`|`false`|Add a banner built with the package.json file. Optionally pass the path to a .js file containing custom banner that can be called with `require()`|
|`-f, --footer`|`{String}`|`undefined`|The path to .js file containing custom footer that can be called with `require()`|
|`-h, --help`|`{Boolean}`|`false`|CLI Help|
|`-v, --version`|`{Boolean}`|`false`|CLI Version|

## Examples

### Concatenate files and standard input

#### Files
```javascript
---------- file_1.min.js ----------
< First part of JS code (minified) ... >

---------- file_2.js ----------
<Second part of JS code ... >
```

#### Command
```bash
$ uglifyjs file_2.js | ncat file_1.min.js - --output dist/bundle.js
```

#### Result
```javascript
---------- dist/bundle.js ----------
< First part of JS code (minified) ... >

< Second part of JS code (minified) ... >
```

### Concatenate with sourcemaps

#### Files
```javascript
---------- file_1.js ----------
< First part of JS code ... >

/*# sourceMappingURL=file_1.js.map */

---------- file_1.js.map ----------
{"version": 3,"file": "file_1.js", ... }

---------- file_2.js ----------
< Second part of JS code ... >

/*# sourceMappingURL=file_2.js.map */

---------- file_2.js.map ----------
{"version": 3,"file": "file_2.js", ... }
```

#### Command
```bash
$ ncat file_1.js file_2.js --map --output dist/bundle.js
```

#### Result
```javascript
---------- dist/bundle.js ----------
< First part of JS code ... >

< Second part of JS code ... >

/*# sourceMappingURL=bundle.map */

---------- bundle.js.map ----------
{"version": 3,"file": "bundle.js", ... }
```

### Add a banner to a file

#### Files
```javascript
---------- bootstrap.js ----------
< JS code ... >
```

#### Command
```bash
$ ncat bootstrap.js --banner --output dist/bundle.js
```

#### Result
```javascript
---------- dist/bundle.js ----------
/*!
 * Bootstrap v4.0.0
 * https://getbootstrap.com
 *
 * Copyright 2017 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
 * Licensed under MIT license
 */

< JS code ... >
```

### Add a custom banner and footer to a file

#### Files
```javascript
---------- bootstrap.js ----------
< JS code ... >

---------- build/banner.js ----------
const pkg = require('read-pkg-up').sync().pkg;
module.exports =
`/*!
 * ${pkg.name} v${pkg.version} (${pkg.homepage})
 *
 * Copyright (c) 2011-${new Date().getFullYear()} ${pkg.author.name}
 * Licensed under the ${pkg.license} license */

(function () {`;

---------- build/footer.js ----------
module.exports = `
})()`
```

#### Command
```bash
$ ncat bootstrap.js --banner build/banner.js --footer build/footer.js --output dist/bundle.js
```

#### Result
```javascript
---------- dist/bundle.js ----------
/*!
 * Bootstrap v4.0.0 (https://getbootstrap.com)
 *
 * Copyright (c) 2011-2017 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
 * Licensed under the MIT license */

(function () {
< JS code ... >
})()
```
