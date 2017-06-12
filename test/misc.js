import test from 'ava';
import cli from './helpers/cli';

test('--version', async(t) => {
  const {
    code,
    error,
    stderr,
    stdout
  } = await cli(
    [
      '--version'
    ]
  );

  t.ifError(error, stderr);

  t.is(code, 0, 'expected zero return code');
  t.is(stdout, `${require('./../package').version}\n`);
});
