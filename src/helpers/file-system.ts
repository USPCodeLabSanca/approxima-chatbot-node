import path from 'path';
import fs from 'fs';

export const writeFileSyncRecursive = (filename: string, content: string, charset?: any) => {
	const paths = filename.split('/');
	paths.slice(0, paths.length - 1).forEach((dir, index, splits) => {
		if (dir === '.') {
			return;
		}
		const curParent = splits.slice(0, index).join('/');
		const dirPath = path.resolve(curParent, dir);
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath);
		}
	});

	fs.writeFileSync(filename, content, charset);
};

export const readJsonFile = (jsonPath: string) => {
	if (!jsonPath.endsWith('.json')) {
		jsonPath += '.json';
	}
	return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
};
