export const isProd = process.env.NODE_ENV === 'production';

/** Returns a number betwern both arguments excluse in the right interval
 * If `max` is not set, it will return a number from 0 to `minMax` (exclusive)
 */
export const random = (minMax: number, max?: number): number => {
	if (max !== undefined) {
		return Math.random() * (max - minMax) + minMax;
	}
	return Math.random() * minMax;
};


/** Returns a integer betwern both arguments excluse in the right interval
 * If `max` is not set, it will return a integer from 0 to `minMax` (exclusive)
 */
export const randomInt = (minMax: number, max?: number): number => {
	minMax = Math.ceil(minMax);
	if (max !== undefined) {
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - minMax) + minMax);
	}
	return Math.floor(Math.random() * minMax);
};
