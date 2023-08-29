// used to construct urls for the api calls.
/**
 * Replaces template literals in a given string with provided values.
 *
 * @param {string} template - The template string containing placeholders in the form of ":key".
 * @param {Record<string, string | number | boolean>} replacements - An object with keys matching the placeholders in the template
 *                                                                  and corresponding values to replace them.
 * @returns {string} The string with placeholders replaced by their corresponding values.
 */
function replaceTemplateString(template: string, replacements: Record<string, string | number | boolean>): string {
    const keys = Object.keys(replacements);
    let result = template;

    keys.forEach((key) => {
        const regex = new RegExp(`:${key}`, 'g');
        result = result.replace(regex, String(replacements[key]));
    });

    return result;
}


export {
    replaceTemplateString
}