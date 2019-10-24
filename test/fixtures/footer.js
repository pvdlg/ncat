const {packageJson} = require('read-pkg-up').sync();

module.exports = `/* Custom footer for ${packageJson.name} */\n`;
