const pkg = require('read-pkg-up').sync().pkg;

module.exports =
`/*!
 * ${pkg.name ? pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1) : 'unknown'} v${pkg.version || '0.0.0'}
 * ${pkg.homepage || `https://npm.com/${pkg.name}`}
 *
 * Copyright (c) ${new Date().getFullYear()} ${pkg.author.name || ''}
 * ${pkg.license ? ` Licensed under the ${pkg.license} license\n *` : ''}/\n`;
