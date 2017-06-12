#!/usr/bin/env node

const yargonaut = require('yargonaut');
const yargs = require('yargs');

const chalk = yargonaut.chalk();

/* eslint-disable  */
const argv = yargs.usage(
    `${chalk.bold.green('Usage:')}
  ncat [<FILES>] [OPTIONS]`
  ).version()
  .argv;
