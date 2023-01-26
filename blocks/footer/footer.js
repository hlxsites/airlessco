import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';

function createMobileMenu(footer) {
  const mf = document.createElement('div');
  mf.classList.add('air-footer-compressed');
  const menuItems = footer.querySelectorAll('h3');
  menuItems.forEach((menu, idx, arr) => {
    mf.append(menu.firstChild);
    if (idx !== (arr.length - 1)) {
      mf.append(' | ');
    }
  });
  // loop through and find the last div and inject our mobile footer
  const footerdivs = footer.querySelectorAll('div');
  footerdivs.forEach((fd, idx, arr) => {
    if (idx === (arr.length - 1)) {
      fd.insertAdjacentHTML('beforebegin', mf.outerHTML);
      fd.classList.add('copyright');
    }
  });
}

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
    createMobileMenu(footer);
    block.append(footer);
  }
}
