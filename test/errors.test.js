import test from 'ava';
import tempy from 'tempy';
import cli from './helpers/cli';

test('one file and no banner', async t => {
	const {stderr, exitCode} = await t.throwsAsync(cli(['test/fixtures/a.css']));

	t.is(exitCode, 1, 'expected non-zero error code');
	t.regex(stderr.toString(), /Require at least 2 file, banner or footer to concatenate/);
});

test('no file and a banner', async t => {
	const {stderr, exitCode} = await t.throwsAsync(cli(['-b']));

	t.is(exitCode, 1, 'expected non-zero error code');
	t.regex(stderr.toString(), /Require at least 2 file, banner or footer to concatenate/);
});

test('non-existing files', async t => {
	const {stderr, exitCode} = await t.throwsAsync(cli(['test/fixtures/non-existing.css', 'test/fixtures/a.css']));

	t.is(exitCode, 1, 'expected non-zero error code');
	t.regex(stderr.toString(), /Require at least 2 file, banner or footer to concatenate/);
});

test('Output as a directory', async t => {
	const output = tempy.directory();
	const {stderr, exitCode} = await t.throwsAsync(cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-o', output]));

	t.is(exitCode, 1, 'expected non-zero error code');
	t.regex(stderr.toString(), /illegal operation on a directory/);
});
