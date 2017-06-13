#!/usr/bin/env node
const path = require('path');
const fs = require('fs-extra');
const Concat = require('concat-with-sourcemaps');
const async = require('async');
const getStdin = require('get-stdin');
const sourceMappingURL = require('source-map-url');
const sourceMapResolve = require('source-map-resolve');
const readPkg = require('read-pkg-up');
const glob = require('glob');
const yargonaut = require('yargonaut');
const yargs = require('yargs');

const chalk = yargonaut.chalk();
const LOGGERS = {
  ADD: chalk.dim.cyan,
  WRITE: chalk.cyan,
  ERROR: chalk.bold.red,
  WARN: chalk.bold.yellow
};
const DEFAULT_BANNER = (pkg) =>
  `/*!
 * ${pkg.name ? pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1) : 'unknown'} v${
  pkg.version || '0.0.0'}${pkg.homepage || pkg.name ? `\n * ${pkg.homepage || `https://npm.com/${pkg.name}`}` : ''}
 *
 * Copyright (c) ${new Date().getFullYear()}${pkg.author && pkg.author.name ? ` ${pkg.author.name}` : ''}
 *${pkg.license ? ` Licensed under the ${pkg.license} license\n *` : ''}/\n`;

yargonaut.helpStyle('bold.green').errorsStyle('red');

const {argv} = yargs.usage(
  `${chalk.bold.green('Usage:')}
  ncat [<FILES ...>] [OPTIONS] [-o|--output <OUTPUT_FILE>]`
)
  .option('o', {
    alias: 'output',
    desc: 'Output file',
    type: 'string'
  })
  .option('m', {
    alias: 'map',
    desc: 'Create an external sourcemap (including the sourcemaps of existing files)',
    type: 'boolean'
  })
  .option('e', {
    alias: 'map-embed',
    desc: 'Embed the code in the sourcemap',
    type: 'boolean'
  })
  .option('b', {
    alias: 'banner',
    desc:
      `Add a banner built with the package.json file. Optionally pass the path
      to a .js file containing custom banner that can be called with 'require()'`,
    type: 'string'
  })
  .option('f', {
    alias: 'footer',
    desc:
      'The path to .js file containing custom footer that can be called with \'require()\'',
    type: 'string'
  })
  .epilog(chalk.yellow(
    `If a file is a single dash ('-'), it reads from stdin.
If -o is not passed, the sourcemap is disabled and it writes to stdout.`
  ))
  .example('ncat file_1.js file_2.js -o dist/bundle.js', 'Basic usage')
  .example('ncat file_1.js file_2.js -m -o dist/bundle.js', 'Basic usage with sourcemap')
  .example('cat file_1.js | ncat - input_2.js > bundle.js', 'Piping input & output')
  .example('ncat file_1.js -b -o dist/bundle.js', 'Add the default banner')
  .example('ncat file_1.js -b ./banner.js -o dist/bundle.js', 'Add a custom banner')
  .example('ncat file_1.js -f ./footer.js -o dist/bundle.js', 'Add a footer')
  .help('h')
  .alias('h', 'help')
  .version()
  .alias('v', 'version');
const concatFiles =
  new Concat(argv.output !== undefined && argv.output !== null && argv.map, argv.output || '', '\n');

if (typeof argv.banner !== 'undefined') {
  const pkg = readPkg.sync();

  if (argv.banner) {
    concatFiles.add(null, require(`${process.cwd()}/${argv.banner}`)); // eslint-disable-line global-require
    log(LOGGERS.ADD, `Add banner from ${argv.banner}`);
  } else {
    concatFiles.add(null, DEFAULT_BANNER(pkg.pkg));
    log(LOGGERS.ADD, `Add banner for ${pkg.path}`);
  }
}
const files = [];

argv._.forEach((file) => {
  if (file === '-') {
    files.push(file);
  } else {
    files.push(...glob.sync(file, {nodir: true}));
  }
});

if (files.length < 2 && typeof argv.banner === 'undefined' && !argv.footer ||
  files.length < 1 && (typeof argv.banner === 'undefined' || !argv.footer)) {
  console.error(LOGGERS.ERROR('Require at least 2 file, banner or footer to concatenate.\n'));
  yargs.showHelp();
  process.exit(1);
}

async.eachSeries(files, (filename, cb) => {
  if (filename === '-') {
    getStdin.buffer().then((stdin) => {
      log(LOGGERS.ADD, 'Add stdin');
      concatFiles.add(null, stdin);
      cb();
    });
  } else {
    fs.readFile(filename, (err, content) => {
      if (err) {
        cb(err);
      } else if (argv.map && argv.output) {
        sourceMapResolve.resolveSourceMap(content.toString(), filename, fs.readFile, (readMapErr,
          result) => {
          if (result && !readMapErr) {
            log(LOGGERS.ADD, `Add: ${filename}`);
            log(LOGGERS.ADD, `Add sourcemap: ${result.url}`);
            result.map.sources.forEach((source, i) => {
              result.map.sources[i] = path.relative(path.dirname(argv.output), path.join(path.dirname(
                filename), source));
              if (argv['map-embed']) {
                if (!result.map.sourcesContent) {
                  result.map.sourcesContent = [];
                }
                if (!result.map.sourcesContent[i]) {
                  result.map.sourcesContent[i] = removeMapURL(content.toString());
                }
              }
            });
            concatFiles.add(path.relative(path.dirname(argv.output), filename),
              removeMapURL(content.toString()), result.map);
          } else {
            log(LOGGERS.ADD, `Add: ${filename}`);
            concatFiles.add(path.relative(path.dirname(argv.output), filename),
              removeMapURL(content.toString()),
              argv['map-embed'] ? {sourcesContent: [removeMapURL(content.toString())]} : undefined);
          }
          if (readMapErr) {
            log(LOGGERS.WARN,
              `The sourcemap ${readMapErr.path} referenced in ${filename} cannot be read and will be ignored`
            );
          }
          cb();
        });
      } else {
        log(LOGGERS.ADD, `Add: ${filename}`);
        concatFiles.add(filename, removeMapURL(content.toString()));
        cb();
      }
    });
  }
}, (readErr) => {
  if (readErr) {
    console.trace(readErr);
    process.exit(1);
  }
  if (argv.footer) {
    concatFiles.add(null, require(`${process.cwd()}/${argv.footer}`)); // eslint-disable-line global-require
    log(LOGGERS.ADD, `Add footer from ${argv.banner}`);
  }
  output();
});

/**
* Removes the sourceMappingURL comment in code and eventual double new line character.
*
* @param  {String}     code the code to modify
* @return {String}          the modified code
*/
function removeMapURL(code) {
  return sourceMappingURL.removeFrom(code).replace(/\n\n$/, '\n');
}

/**
 * Write the output to he file passed in --output or to the stdout if not set.
 * Also write the sourcemap file if both --map and --output are set.
 */
function output() {
  if (argv.output) {
    async.each([{
      path: argv.output,
      content: argv.map ? Buffer.concat(
        [concatFiles.content, Buffer.from(`\n/*# sourceMappingURL=${path.basename(argv.output)}.map */`)]
      ) : concatFiles.content
    },
    argv.map ? {
      path: `${argv.output}.map`,
      content: concatFiles.sourceMap
    } : null], (file, cb) => {
      if (file) {
        fs.outputFile(file.path, file.content, (err) => {
          if (!err) {
            log(LOGGERS.WRITE, `Write: ${file.path}`);
          }
          cb(err);
        });
      }
    }, (writeErr) => {
      if (writeErr) {
        console.trace(writeErr);
        process.exit(1);
      }
      process.exit(0);
    });
  } else {
    process.stdout.write(concatFiles.content);
    process.exit(0);
  }
}

/**
 * Log to the console, only if --output is set.
 *
 * @param  {Function} logger Chalk logger
 * @param  {String}   msg    Message to log
 */
function log(logger, msg) {
  if (argv.output) {
    console.log(logger(msg));
  }
}
