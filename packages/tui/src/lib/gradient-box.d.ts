export default gradientBox;
/**
 * Creates a box with a gradient border in the terminal
 * @param {string} boxText - The text to be displayed in the box
 * @param {Object} boxOptions - The configuration options for the box as per the boxen package
 * @param {string|string[]} gradientOptions - The gradient to be used for the box. Can be a string or an array of valid color codes
 * @returns {string} - The boxen text with the gradient border
 * @example
 * console.log(
 *  gradientBox('Hello World',
 *    {
 *      padding: 2,
 *      margin: 1,
 *      borderStyle: 'round',
 *    },
 *    'instagram',
 *  })
 * );
 */
declare function gradientBox(
	boxText: string,
	boxOptions?: any,
	gradientOptions?: string | string[]
): string;
