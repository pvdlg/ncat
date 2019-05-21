'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _concatWithSourcemaps = require('concat-with-sourcemaps');

var _concatWithSourcemaps2 = _interopRequireDefault(_concatWithSourcemaps);

var _unixify = require('unixify');

var _unixify2 = _interopRequireDefault(_unixify);

var _getStdin = require('get-stdin');

var _getStdin2 = _interopRequireDefault(_getStdin);

var _sourceMapUrl = require('source-map-url');

var _sourceMapUrl2 = _interopRequireDefault(_sourceMapUrl);

var _sourceMapResolve = require('source-map-resolve');

var _sourceMapResolve2 = _interopRequireDefault(_sourceMapResolve);

var _readPkgUp = require('read-pkg-up');

var _readPkgUp2 = _interopRequireDefault(_readPkgUp);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _yargonaut = require('yargonaut');

var _yargonaut2 = _interopRequireDefault(_yargonaut);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_yargonaut2.default.helpStyle('bold.green').errorsStyle('red');
const chalk = _yargonaut2.default.chalk();
/**
 * Produce the default banner based on package.json info.
 *
 * @param {Object} pkg the parsed package.json.
 * @returns {String} the default banner.
 */
const getDefaultBanner = pkg => `/*!
 * ${pkg.name ? pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1) : 'unknown'} v${pkg.version || '0.0.0'}${pkg.homepage || pkg.name ? `\n * ${pkg.homepage || `https://npm.com/${pkg.name}`}` : ''}
 *
 * Copyright (c) ${new Date().getFullYear()}${pkg.author && pkg.author.name ? ` ${pkg.author.name}` : ''}
 *${pkg.license ? ` Licensed under the ${pkg.license} license\n *` : ''}/\n`;
/**
 * Log messages.
 *
 * @type {Object}
 */
const LOG = {
	add: args => `Concat file ${chalk.cyan(args[0])}`,
	write: args => `Write ${chalk.bold.green(args[0])}`,
	map: args => `Concat sourcemap ${chalk.cyan(args[0])}`,
	mapInline: args => `Concat inline sourcemap from ${chalk.cyan(args[0])}`,
	footer: args => `Concat footer from ${chalk.cyan(args[0])}`,
	banner: args => `Concat banner from ${chalk.cyan(args[0])}`,
	dbanner: args => `Concat default banner for ${chalk.cyan(args[0])}`
};

var _yargs$usage$option$o = _yargs2.default.usage(`${chalk.bold.green('Usage:')}
  ncat [<FILES ...>] [OPTIONS] [-o|--output <OUTPUT_FILE>]`).option('o', {
	alias: 'output',
	desc: 'Output file',
	type: 'string'
}).option('s', {
	alias: 'separator',
	desc: 'Define what separates the source files in the output',
	type: 'string'
}).option('m', {
	alias: 'map',
	desc: 'Create an external sourcemap (including the sourcemaps of existing files)',
	type: 'boolean'
}).option('e', {
	alias: 'map-embed',
	desc: 'Embed the code in the sourcemap (only apply to code without an existing sourcemap)',
	type: 'boolean'
}).option('b', {
	alias: 'banner',
	desc: `Add a banner built with the package.json file. Optionally pass the path
      to a .js file containing custom banner that can be called with 'require()'`,
	type: 'string'
}).option('f', {
	alias: 'footer',
	desc: "The path to .js file containing custom footer that can be called with 'require()'",
	type: 'string'
}).epilog(chalk.yellow(`If a file is a single dash ('-'), it reads from stdin.
If -o is not passed, the sourcemap is disabled and it writes to stdout.`)).example('ncat file_1.js file_2.js -o dist/bundle.js', 'Basic usage').example('ncat file_1.js file_2.js -m -o dist/bundle.js', 'Basic usage with sourcemap').example('cat file_1.js | ncat - input_2.js > bundle.js', 'Piping input & output').example('ncat file_1.js -b -o dist/bundle.js', 'Add the default banner').example('ncat file_1.js -b ./banner.js -o dist/bundle.js', 'Add a custom banner').example('ncat file_1.js -f ./footer.js -o dist/bundle.js', 'Add a footer').help('h').alias('h', 'help').version().alias('v', 'version');

const argv = _yargs$usage$option$o.argv;
/**
 * Concat object to wich will be added banner, footer and files and their sourcemaps.
 * Will produce the final output.
 *
 * @type {Concat}
 */

const concat = new _concatWithSourcemaps2.default(argv.output !== undefined && argv.output !== null && argv.map, argv.output ? _path2.default.basename(argv.output) : '', argv.separator ? argv.separator : '\n');
/**
 * Cache the content of stdin the first it's retrieve.
 * Allow to concatenate the content of stdin multiple times.
 *
 * @type {String}
 */
const stdinCache = _getStdin2.default.buffer();

/**
 * Main function of the CLI. Concat banner, then files, then footer and finnaly output concatenated file.
 *
 * @method main
 * @return {Promise} Promise that resolve when the output file is written.
 */
module.exports = () => concatBanner().then(() => concatFiles()).then(() => concatFooter()).then(() => output());

/**
 * Concatenate a default or custom banner.
 *
 * @return {Promise<Any>} Promise that resolve once the banner has been generated and concatenated.
 */
function concatBanner() {
	if (typeof argv.banner !== 'undefined') {
		if (argv.banner) {
			return Promise.resolve().then(() => {
				concat.add(null, require(_path2.default.join(process.cwd(), argv.banner)));
				return log('banner', argv.banner);
			});
		}
		return (0, _readPkgUp2.default)().then(pkg => {
			concat.add(null, getDefaultBanner(pkg.pkg));
			return log('dbanner', pkg.path);
		});
	}
	return Promise.resolve();
}

/**
 * Concatenate a custom banner.
 *
 * @return {Promise<Any>} Promise that resolve once the footer has been generated and concatenated.
 */
function concatFooter() {
	if (argv.footer) {
		return Promise.resolve().then(() => {
			concat.add(null, require(_path2.default.join(process.cwd(), argv.footer)));
			return log('footer', `Concat footer from ${argv.footer}`);
		});
	}
	return Promise.resolve();
}

/**
 * Concatenate the files in order.
 * Exit process with error if there is less than two files, banner or footer to concatenate.
 *
 * @return {Promise<Any>} Promise that resolve once the files have been read/created and concatenated.
 */
function concatFiles() {
	return Promise.all(argv._.map(handleGlob)).then(globs => {
		const files = globs.reduce((acc, cur) => acc.concat(cur), []);

		if (files.length < 2 && typeof argv.banner === 'undefined' && !argv.footer || files.length === 0 && (typeof argv.banner === 'undefined' || !argv.footer)) {
			throw new Error(chalk.bold.red('Require at least 2 file, banner or footer to concatenate. ("ncat --help" for help)\n'));
		}
		return files.forEach(file => {
			concat.add(file.file, file.content, file.map);
		});
	});
}

/**
 * FileToConcat describe the filename, content and sourcemap to concatenate.
 *
 * @typedef {Object} FileToConcat
 * @property {String} file
 * @property {String} content
 * @property {Object} sourcemap
 */

/**
 * Retrieve files matched by the gloc and call {@link handleFile} for each one found.
 * If the glob is '-' return one FileToConcat with stdin as its content.
 *
 * @param  {String} glob the glob expression for which to retrive files.
 * @return {Promise<FileToConcat[]>} a Promise that resolve to an Array of FileToConcat.
 */
function handleGlob(glob) {
	if (glob === '-') {
		return stdinCache.then(stdin => [{ content: stdin }]);
	}
	return (0, _globby2.default)(glob.split(' '), { nodir: true }).then(files => Promise.all(files.map(handleFile)));
}

/**
 * Update all the sources path to be relative to the file that will be written (parameter --output).
 *
 * @param {String} file path of the file being processed.
 * @param {String} content content of the file.
 * @param {Object} map existing sourcemap associated with the file.
 */
function prepareMap(file, content, map) {
	map.map.sources.forEach((source, i) => {
		map.map.sources[i] = (0, _unixify2.default)(_path2.default.relative(_path2.default.dirname(argv.output), _path2.default.join(_path2.default.dirname(file), source)));
	});
}

/**
 * Read a file to concatenate then, if the file content reference a sourcemap, read the sourcemap and
 * returns a FileToConcat with the retrieve filename, content and sourcemap.
 * In addition:
 * - If the file content reference a sourcemap, but it cannot be read, the sourcemap is ignore
 *   and a warning message is displayed.
 * - The sourceMap URL are removed from the file content.
 * - If a sourcemap exists, {@link prepareMap} is called to update the sources path.
 * - If no sourcemap exists, a new one is created (if map parameter is set)
 *   and the file content is added to its sourceContent attribute if the map-embed parameter is set.
 *
 * @param {String} file path of the file to concat.
 * @return {Promise<FileToConcat>} A Promise that resolve to a FileToConcat with filename, content and sourcemap to concatenate.
 */
function handleFile(file) {
	if (argv.map && argv.output) {
		return _fsExtra2.default.readFile(file).then(content => (0, _pify2.default)(_sourceMapResolve2.default.resolveSourceMap)(content.toString(), file, _fsExtra2.default.readFile).then(map => {
			if (map) {
				prepareMap(file, content, map);
				log('add', file);
				if (map.url) {
					log('map', map.url);
				} else {
					log('mapInline', file);
				}
				return {
					file: _path2.default.relative(_path2.default.dirname(argv.output), file),
					content: removeMapURL(content),
					map: map.map
				};
			}
			return null;
		}).catch(error => {
			console.log(chalk.bold.yellow(`The sourcemap ${error.path} referenced in ${file} cannot be read and will be ignored`));
		}).then(result => {
			if (!result) {
				log('add', file);
				return {
					file: _path2.default.relative(_path2.default.dirname(argv.output), file),
					content: removeMapURL(content),
					map: argv['map-embed'] ? { sourcesContent: [removeMapURL(content)] } : undefined
				};
			}
			return result;
		}));
	}
	return _fsExtra2.default.readFile(file).then(content => {
		log('add', file);
		return {
			file,
			content: removeMapURL(content)
		};
	});
}

/**
 * If --output is set, write the concatenated file to disk.
 * If --map is also is set, write the concatenated sourcemap file to disk.
 * If --output is not set, output concatenated to stdout.
 *
 * @return {Promise<Any>} Promise that resolves when the file(s) are written.
 */
function output() {
	if (argv.output) {
		return Promise.all([_fsExtra2.default.outputFile(argv.output, argv.map ? Buffer.concat([concat.content, Buffer.from(getSourceMappingURL())]) : concat.content).then(() => log('write', argv.output)), argv.map ? _fsExtra2.default.outputFile(`${argv.output}.map`, concat.sourceMap).then(() => log('write', `${argv.output}.map`)) : undefined]);
	}
	process.stdout.write(concat.content);
	return Promise.resolve();
}

/**
 * Return a source mapping URL comment based on the output file extension.
 *
 * @return {String} the sourceMappingURL comment.
 */
function getSourceMappingURL() {
	if (_path2.default.extname(argv.output) === '.css') {
		return `\n/*# sourceMappingURL=${_path2.default.basename(argv.output)}.map */`;
	}
	return `\n//# sourceMappingURL=${_path2.default.basename(argv.output)}.map`;
}

/**
 * Removes the sourceMappingURL comment in code and eventual double new line character.
 *
 * @param {Buffer} code the code to modify.
 * @return {String} the modified code.
 */
function removeMapURL(code) {
	return _sourceMapUrl2.default.removeFrom(code.toString()).replace(/\n\n$/, '\n');
}

/**
 * Log to the console, only if --output is set.
 *
 * @param {String} type Type of log (add, write, map, footer, banner, dbanner).
 * @param {...String} msg Value to interpolate.
 */
function log(type, ...rest) {
	if (argv.output) {
		console.log(LOG[type](rest));
	}
}
//# sourceMappingURL=index.js.map