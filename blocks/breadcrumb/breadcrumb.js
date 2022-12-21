import { createTag } from '../../scripts/scripts.js';

export default function decorate(block) {
  let pathSegments = window.location.pathname.split('/');

  // remove the last element if there was a / at the end of the pathname
  pathSegments = pathSegments[pathSegments.length - 1] === '' ? pathSegments.slice(0, pathSegments.length - 1) : pathSegments;

  console.log(pathSegments);

  if (pathSegments.length < 4) {
    return;
  }

  const locale = pathSegments.slice(0, 3).join('/');
  const breadcrumbOl = createTag('ol', { class: 'breadcrumb' });

  if (pathSegments.length > 4) {
    for (let index = 3; index < (pathSegments.length); index += 1) {
      const breadcrumbLi = createTag('li', { class: 'item' });
      const breadcrumbA = createTag('a', { class: 'anchor' });
      breadcrumbA.setAttribute('href', `${locale}/${pathSegments[index]}/`);

      // Capitalise the first letter for breadcrumb
      const anchorText = pathSegments[index].charAt(0).toUpperCase() + pathSegments[index].slice(1);
      breadcrumbA.innerText = anchorText;
      breadcrumbLi.append(breadcrumbA);
      breadcrumbOl.append(breadcrumbLi);
    }

    block.innerHTML = '';
    block.append(breadcrumbOl);
  }
}
