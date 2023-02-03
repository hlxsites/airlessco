import { fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const locale = getMetadata('locale');
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

  const header = document.querySelector('h1');
  const strong = header.querySelector('strong');

  const label = (strong) ? strong.innerText : header.innerText;
  const crumb = createTag('li', { class: 'crumb' }, label);
  list.append(crumb);
  block.innerHTML = list.outerHTML;
}
