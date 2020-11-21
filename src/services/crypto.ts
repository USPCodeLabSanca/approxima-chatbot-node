import crypto from 'crypto';

// Uses the PBKDF2 algorithm to stretch the string 's' to an arbitrary size,
// in a way that is completely deterministic yet impossible to guess without
// knowing the original string
function stretchString(s: string, salt: string, outputLength: number) {
	return crypto.pbkdf2Sync(
		s, salt, +process.env.HASH_ITERATIONS!, outputLength, process.env.HASH_DIGEST!
	);
}

// Stretches the password in order to generate a key (for encrypting)
// and a large salt (for hashing)
function keyFromPassword(password: string) {
	// We need 24 bytes for the key, and another 48 bytes for the salt
	const keyPlusHashingSalt = stretchString(password, 'salt', 24 + 48);
	return {
		cipherKey: keyPlusHashingSalt.slice(0, 24),
		hashingSalt: keyPlusHashingSalt.slice(24)
	};
}

const key = keyFromPassword(process.env.ENCRYPTION_KEY!);

// Encrypts data using the key generated using the 'keyFromPassword' function
export function encrypt(sourceData: string) {
	const iv = Buffer.alloc(16, 0); // Initialization vector
	const cipher = crypto.createCipheriv(process.env.HASH_METHOD!, key.cipherKey, iv);
	let encrypted = cipher.update(sourceData, 'utf8', 'base64');
	encrypted += cipher.final('base64');
	return encrypted;
}

// Decrypts data using the key generated using the 'keyFromPassword' function
export function decrypt(encryptedData: string) {
	try {
		const iv = Buffer.alloc(16, 0); // Initialization vector
		const decipher = crypto.createDecipheriv(process.env.HASH_METHOD!, key.cipherKey, iv);
		let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
		decrypted += decipher.final('utf-8');
		return decrypted;
	}
	catch {
		console.log('Error on decrypt(). Still on encryptedData:', encryptedData);
		return encryptedData;
	}
}
