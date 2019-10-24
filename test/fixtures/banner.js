const {packageJson} = require('read-pkg-up').sync();

module.exports =
`/*!
 * ${packageJson.name ? packageJson.name.charAt(0).toUpperCase() + packageJson.name.slice(1) : 'unknown'} v${
  packageJson.version || '0.0.0'}${packageJson.homepage || packageJson.name ? `\n * ${
  packageJson.homepage || `https://npm.com/${packageJson.name}`}` : ''}
 *
 * Copyright (c) ${new Date().getFullYear()}${packageJson.author && packageJson.author.name ? ` ${packageJson.author.name}` : ''}
 *${packageJson.license ? ` Licensed under the ${packageJson.license} license\n *` : ''}/\n`;
