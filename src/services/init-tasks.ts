import { msInADay } from '../helpers/date';
import { updateAllUsernames } from '../tasks/update-username';

setInterval(() => {
	updateAllUsernames();
}, msInADay);
