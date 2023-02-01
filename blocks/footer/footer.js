import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';

function createMobileMenu(footer) {
  const mf = document.createElement('div');
  mf.classList.add('air-footer-compressed');
  const menuItems = footer.querySelectorAll('h3');
  menuItems.forEach((menu, idx, arr) => {
    mf.append(menu.cloneNode(true).firstChild);
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
  const [built2performDiv, logoDiv, productsDiv, supportDiv, contactDiv, flagDiv] = document.querySelectorAll('div.air-footer>div');
  built2performDiv.classList.add('built2perform');
  logoDiv.classList.add('logo');
  productsDiv.classList.add('products');
  supportDiv.classList.add('support');
  contactDiv.classList.add('contact');
  flagDiv.classList.add('flag');

  const el = document.querySelector('div.logo');
  const parent = el.parentNode;
  const sibling = el.previousSibling;
  const frag = document.createDocumentFragment();
  for (const child of document.querySelectorAll('div.logo,div.products,div.support,div.contact,div.flag,div.air-footer-compressed,div.copyright')) {
    frag.appendChild(child);
  }
  const wrapper = document.createElement("div");
  wrapper.className = 'footer-elements-wrapper';
  wrapper.appendChild(frag);
  parent.insertBefore(wrapper, sibling);
}
