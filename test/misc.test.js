import test from 'ava';
import cli from './helpers/cli';

const {version} = require('./../package');

test('--help', async t => {
	const {exitCode, error, stderr, stdout} = await cli(['-h']);

	t.falsy(error, stderr);
	t.is(exitCode, 0, 'expected zero return code');
	t.regex(stdout, /Usage:/);
	t.regex(stdout, /Options:/);
	t.regex(stdout, /Examples:/);
});

test('--version', async t => {
	const {exitCode, error, stderr, stdout} = await cli(['--version']);

	t.falsy(error, stderr);
	t.is(exitCode, 0, 'expected zero return code');
	t.is(stdout, `${version}\n`);
});
