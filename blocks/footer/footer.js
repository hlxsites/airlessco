import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  block.textContent = '';

  const footerPath = getMetadata('locale');
  const resp = await fetch(`${footerPath}/footer.plain.html`);
  if (resp.ok) {
    const html = await resp.text();
    const footer = document.createElement('div');
    footer.classList.add('air-footer');
    footer.innerHTML = html;
    await decorateIcons(footer);
    block.append(footer);
  }
}
