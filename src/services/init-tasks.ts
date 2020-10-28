import { msInADay } from '../helpers/date';
import { updateUsernames } from '../tasks/update-username';

setInterval(() => {
  updateUsernames();
}, msInADay);

updateUsernames(); // TOREMOVE:
