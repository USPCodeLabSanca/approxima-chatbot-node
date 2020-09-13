
/** Removes an element from the `array` and returns true if the elements exists */
export const removeByIndex = (array: any[], index: number) => {
  if (index >= 0) {
    array.splice(index, 1);
  }
};

/** Removes an element from the `array` and returns true if the elements exists */
export const removeByValue = <T extends any>(array: T[], value: T): boolean => {
  const indexToRemove = array.indexOf(value);
  if (indexToRemove < 0) {
    return false;
  }
  array.splice(indexToRemove, 1);
  return true;
};

/** Removes an element from the `array` that was found using `findIndex`
 * Returns true if the element was found
*/
export const removeByFindIndex = <T extends any>(
  array: T[],
  findIndex: (value: T) => boolean
): boolean => {
  const indexToRemove = array.findIndex(findIndex);
  if (indexToRemove < 0) {
    return false;
  }
  array.splice(indexToRemove, 1);
  return true;
};
