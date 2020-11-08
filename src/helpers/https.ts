import https from 'https';

export const downloadFileFromUrl = (url: string): Promise<Buffer> => {
	return new Promise<Buffer>((resolve) => {
		// Request telegram image in url
		https.get(url, (response) => {
			const data: Buffer[] = [];
			response.on('data', chunk => data.push(chunk));
			// On data end, resolve promise with all data chunks
			response.on('end', () => resolve(Buffer.concat(data)));
		});
	});
};
