import { fetchPlaceholders, decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';

function buildLangMenu(langWrapper) {
  langWrapper.classList.add('nav-languages');
  const langSelect = langWrapper.querySelector(':scope > ul > li');

  langSelect.classList.add('language-select');

  const textLabel = langSelect.childNodes[0];
  const linkLabel = document.createElement('a');
  linkLabel.classList.add('language-select-toggle');
  linkLabel.setAttribute('href', '#');
  linkLabel.setAttribute('data-toggle', 'language-select');
  linkLabel.setAttribute('aria-expanded', 'false');
  linkLabel.appendChild(document.createTextNode(textLabel.textContent.trim()));

  linkLabel.addEventListener('click', (e) => {
    e.preventDefault();
    const el = e.currentTarget;
    if (el.getAttribute('aria-expanded') === 'false') {
      el.setAttribute('aria-expanded', 'true');
      el.closest(`.${el.getAttribute('data-toggle')}`).classList.add('open');
    } else {
      el.setAttribute('aria-expanded', 'false');
      el.closest(`.${el.getAttribute('data-toggle')}`).classList.remove('open');
    }
  });

  const caret = document.createElement('b');
  caret.classList.add('caret');
  linkLabel.appendChild(caret);

  const languages = langSelect.querySelector(':scope > ul');
  languages.classList.add('language-menu');

  const links = languages.querySelectorAll(':scope > li > a');
  Object.values(links).every((a) => {
    if (window.location.pathname.startsWith(a.getAttribute('href'))) {
      a.closest('li').classList.add('active');
      return false;
    }
    return true;
  });

  langSelect.replaceChild(linkLabel, textLabel);

  return langWrapper;
}

function buildHelpMenu(helpWrapper) {
  helpWrapper.classList.add('nav-help');
  return helpWrapper;
}

function buildProductsMenu(productsWrapper) {
  productsWrapper.classList.add('nav-products');
  return productsWrapper;
}

async function buildMobileButton() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('navbar-mobile-toggle-wrapper');

  const button = document.createElement('div');
  button.classList.add('navbar-mobile-toggle');
  wrapper.appendChild(button);

  button.setAttribute('data-toggle', 'navbar');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'navbar');

  const locale = getMetadata('locale');
  const placeholders = await fetchPlaceholders(locale);

  let span = document.createElement('span');
  span.classList.add('sr-only');
  span.appendChild(document.createTextNode(placeholders.navToggleLabel));
  button.appendChild(span);
  for (let i = 0; i < 3; i += 1) {
    span = document.createElement('span');
    span.classList.add('icon-bar');
    button.append(span);
  }

  button.addEventListener('click', (e) => {
    e.preventDefault();
    const el = e.currentTarget;
    if (el.getAttribute('aria-expanded') === 'false') {
      el.setAttribute('aria-expanded', 'true');
      el.closest(`.${el.getAttribute('data-toggle')}`).classList.add('open');
    } else {
      el.setAttribute('aria-expanded', 'false');
      el.closest(`.${el.getAttribute('data-toggle')}`).classList.remove('open');
    }
  });

  return wrapper;
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  block.textContent = '';

  // fetch nav content
  const navPath = getMetadata('locale') || '/drafts/stopp';
  const resp = await fetch(`${navPath}/nav.plain.html`);
  if (resp.ok) {
    const html = await resp.text();

    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    // decorate nav DOM
    const nav = document.createElement('nav');

    const navbar = document.createElement('div');
    navbar.classList.add('navbar');
    nav.append(navbar);

    navbar.append(await buildMobileButton());
    navbar.append(buildLangMenu(tmp.children[2]));
    navbar.append(buildHelpMenu(tmp.children[1]));
    navbar.append(buildProductsMenu(tmp.children[0]));

    // const mobileMenu = buildMobileMenu();
    // appendMobileItems(mobileMenu, defaultNav);
    // nav.append(mobileMenu);

    decorateIcons(nav);
    block.append(nav);
  }
}
