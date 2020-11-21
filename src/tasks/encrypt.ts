import { encrypt } from '../services/crypto';

console.log(encrypt(process.argv[2]));
