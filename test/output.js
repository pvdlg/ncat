import test from 'ava';
import cli from './helpers/cli';
import tmp from './helpers/tmp';
import read from './helpers/read';

test('--output works', async(t) => {
  const output = tmp('output.css');
  const {
    error,
    stderr
  } = await cli([
      'test/fixtures/a.css', 'test/fixtures/b.css', '-o', output
    ]);

  t.ifError(error, stderr);
  t.is(
    await read(output),
    await read('test/fixtures/ab.css')
  );
});
