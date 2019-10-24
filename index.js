const {EOL} = require('os');
const path = require('path');
const fs = require('fs-extra');
const pify = require('pify');
const Concat = require('concat-with-sourcemaps');
const unixify = require('unixify');
const getStdin = require('get-stdin');
const sourceMappingURL = require('source-map-url');
const sourceMapResolve = require('source-map-resolve');
const readPkg = require('read-pkg-up');
const globby = require('globby');
const yargonaut = require('yargonaut');
const yargs = require('yargs');

yargonaut.helpStyle('bold.green').errorsStyle('red');
const chalk = yargonaut.chalk();
/**
 * Produce the default banner based on package.json info.
 *
 * @param {Object} packageJson the parsed package.json.
 * @returns {String} the default banner.
 */
const getDefaultBanner = packageJson =>
	`/*!
 * ${
		packageJson.name ? packageJson.name.charAt(0).toUpperCase() + packageJson.name.slice(1) : 'unknown'
 } v${packageJson.version || '0.0.0'}${
		packageJson.homepage || packageJson.name
			? `${EOL} * ${packageJson.homepage || `https://npm.com/${packageJson.name}`}`
			: ''
	}
 *
 * Copyright (c) ${new Date().getFullYear()}${
		packageJson.author && packageJson.author.name ? ` ${packageJson.author.name}` : ''
	}
 *${packageJson.license ? ` Licensed under the ${packageJson.license} license${EOL} *` : ''}/${EOL}`;
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
	dbanner: args => `Concat default banner for ${chalk.cyan(args[0])}`,
};
const {argv} = yargs
	.usage(
		`${chalk.bold.green('Usage:')}
  ncat [<FILES ...>] [OPTIONS] [-o|--output <OUTPUT_FILE>]`
	)
	.option('o', {
		alias: 'output',
		desc: 'Output file',
		type: 'string',
	})
	.option('m', {
		alias: 'map',
		desc: 'Create an external sourcemap (including the sourcemaps of existing files)',
		type: 'boolean',
	})
	.option('e', {
		alias: 'map-embed',
		desc: 'Embed the code in the sourcemap (only apply to code without an existing sourcemap)',
		type: 'boolean',
	})
	.option('b', {
		alias: 'banner',
		desc: `Add a banner built with the package.json file. Optionally pass the path
      to a .js file containing custom banner that can be called with 'require()'`,
		type: 'string',
	})
	.option('f', {
		alias: 'footer',
		desc: "The path to .js file containing custom footer that can be called with 'require()'",
		type: 'string',
	})
	.epilog(
		chalk.yellow(
			`If a file is a single dash ('-'), it reads from stdin.
If -o is not passed, the sourcemap is disabled and it writes to stdout.`
		)
	)
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
/**
 * Concat object to wich will be added banner, footer and files and their sourcemaps.
 * Will produce the final output.
 *
 * @type {Concat}
 */
const concat = new Concat(
	argv.output !== undefined && argv.output !== null && argv.map,
	argv.output ? path.basename(argv.output) : '',
	EOL
);
/**
 * Cache the content of stdin the first it's retrieve.
 * Allow to concatenate the content of stdin multiple times.
 *
 * @type {String}
 */
const stdinCache = getStdin.buffer();

/**
 * Main function of the CLI. Concat banner, then files, then footer and finnaly output concatenated file.
 *
 * @method main
 * @return {Promise} Promise that resolve when the output file is written.
 */
module.exports = async () => {
	await concatBanner();
	await concatFiles();
	concatFooter();
	await output();
};

/**
 * Concatenate a default or custom banner.
 *
 * @return {Promise<Any>} Promise that resolve once the banner has been generated and concatenated.
 */
async function concatBanner() {
	if (typeof argv.banner !== 'undefined') {
		if (argv.banner) {
			concat.add(null, require(path.join(process.cwd(), argv.banner)));
			return log('banner', argv.banner);
		}

		const pkg = await readPkg();
		concat.add(null, getDefaultBanner(pkg.packageJson));
		return log('dbanner', pkg.path);
	}
}

/**
 * Concatenate a custom banner.
 *
 * @return {Promise<Any>} Promise that resolve once the footer has been generated and concatenated.
 */
function concatFooter() {
	if (argv.footer) {
		concat.add(null, require(path.join(process.cwd(), argv.footer)));
		return log('footer', `Concat footer from ${argv.footer}`);
	}
}

/**
 * Concatenate the files in order.
 * Exit process with error if there is less than two files, banner or footer to concatenate.
 *
 * @return {Promise<Any>} Promise that resolve once the files have been read/created and concatenated.
 */
async function concatFiles() {
	const globs = await Promise.all(argv._.map(handleGlob));
	const files = globs.reduce((acc, cur) => acc.concat(cur), []);

	if (
		(files.length < 2 && typeof argv.banner === 'undefined' && !argv.footer) ||
		(files.length === 0 && (typeof argv.banner === 'undefined' || !argv.footer))
	) {
		throw new Error(
			chalk.bold.red(`Require at least 2 file, banner or footer to concatenate. ("ncat --help" for help)${EOL}`)
		);
	}

	return files.forEach(file => {
		concat.add(file.file, file.content, file.map);
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
async function handleGlob(glob) {
	if (glob === '-') {
		return [{content: await stdinCache}];
	}

	const files = await globby(glob.split(' '), {nodir: true});
	return Promise.all(files.map(handleFile));
}

/**
 * Update all the sources path to be relative to the file that will be written (parameter --output).
 *
 * @param {String} file path of the file being processed.
 * @param {Object} map existing sourcemap associated with the file.
 */
function prepareMap(file, map) {
	map.map.sources.forEach((source, i) => {
		map.map.sources[i] = unixify(path.relative(path.dirname(argv.output), path.join(path.dirname(file), source)));
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
async function handleFile(file) {
	if (argv.map && argv.output) {
		const content = await fs.readFile(file);
		try {
			const map = await pify(sourceMapResolve.resolveSourceMap)(content.toString(), file, fs.readFile);
			if (map) {
				prepareMap(file, map);
				log('add', file);
				if (map.url) {
					log('map', map.url);
				} else {
					log('mapInline', file);
				}

				return {
					file: path.relative(path.dirname(argv.output), file),
					content: removeMapURL(content),
					map: map.map,
				};
			}
		} catch (error) {
			console.log(
				chalk.bold.yellow(`The sourcemap ${error.path} referenced in ${file} cannot be read and will be ignored`)
			);
		}

		log('add', file);
		return {
			file: path.relative(path.dirname(argv.output), file),
			content: removeMapURL(content),
			map: argv['map-embed'] ? {sourcesContent: [removeMapURL(content)]} : undefined,
		};
	}

	const content = await fs.readFile(file);
	log('add', file);
	return {
		file,
		content: removeMapURL(content),
	};
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
		return Promise.all([
			(async () => {
				await fs.outputFile(
					argv.output,
					argv.map ? Buffer.concat([concat.content, Buffer.from(getSourceMappingURL())]) : concat.content
				);
				log('write', argv.output);
			})(),
			(async () => {
				if (argv.map) {
					await fs.outputFile(`${argv.output}.map`, concat.sourceMap);
					log('write', `${argv.output}.map`);
				}
			})(),
		]);
	}

	process.stdout.write(concat.content);
}

/**
 * Return a source mapping URL comment based on the output file extension.
 *
 * @return {String} the sourceMappingURL comment.
 */
function getSourceMappingURL() {
	if (path.extname(argv.output) === '.css') {
		return `${EOL}/*# sourceMappingURL=${path.basename(argv.output)}.map */`;
	}

	return `${EOL}//# sourceMappingURL=${path.basename(argv.output)}.map`;
}

/**
 * Removes the sourceMappingURL comment in code and eventual double new line character.
 *
 * @param {Buffer} code the code to modify.
 * @return {String} the modified code.
 */
function removeMapURL(code) {
	return sourceMappingURL.removeFrom(code.toString()).replace(new RegExp(`${EOL}${EOL}$`), EOL);
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
