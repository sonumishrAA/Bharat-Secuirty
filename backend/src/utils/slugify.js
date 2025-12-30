/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to convert to slug
 * @returns {string} - URL-friendly slug
 */
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

/**
 * Generate a unique slug by appending a number if needed
 * @param {string} text - The text to convert to slug
 * @param {Function} checkExists - Async function that checks if slug exists
 * @returns {Promise<string>} - Unique URL-friendly slug
 */
const generateUniqueSlug = async (text, checkExists) => {
    const baseSlug = slugify(text);
    let slug = baseSlug;
    let counter = 1;

    while (await checkExists(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
};

module.exports = { slugify, generateUniqueSlug };
