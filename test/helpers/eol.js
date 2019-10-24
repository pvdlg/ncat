import {EOL} from 'os';

export default function eol(text) {
	return text.replace(/\r\n|\r|\n/g, EOL);
}
