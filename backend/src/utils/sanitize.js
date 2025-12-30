const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeHtml = (html) => {
    if (!html) return html;
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'br', 'img', 'blockquote', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class']
    });
};

module.exports = { sanitizeHtml };
