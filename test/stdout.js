import test from 'ava';
import read from './helpers/read';
import cli from './helpers/cli';

test('writes to stdout', async t => {
	const {error, stderr, stdout} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css']);

	t.ifError(error, stderr);
	t.is(stdout, await read('test/fixtures/expected/ab.css'));
});
