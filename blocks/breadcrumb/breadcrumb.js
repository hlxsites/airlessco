import { fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const locale = getMetadata('locale') || '/na/en';
  const placeholders = await fetchPlaceholders(locale);

  const regex = new RegExp(`^${locale}/(.*?)/?$`);

  const pathSegments = window.location.pathname.replace(regex, '$1').split('/');
  pathSegments.pop(); // Current Breadcrumb value comes from page title.

  const list = createTag('ol', { class: 'breadcrumb' });
  let segments = '/';

  pathSegments.forEach((page) => {
    segments += `${page}/`;
    const label = `${page}NavLabel`;
    const anchor = createTag('a', { href: `${locale}${segments}` }, placeholders[label] || label);
    const crumb = createTag('li', { class: 'crumb' }, anchor);
    list.append(crumb);
  });

  let navTitle = getMetadata('nav-title');
  if (!navTitle) {
    const header = document.querySelector('h1');
    const strong = header?.querySelector('strong');
    navTitle = (strong) ? strong.innerText : header?.innerText;
  }

  if (navTitle) {
    const crumb = createTag('li', { class: 'crumb' }, navTitle);
    list.append(crumb);
    block.innerHTML = list.outerHTML;
  }
}
