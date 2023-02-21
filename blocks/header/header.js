import { fetchPlaceholders, decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';

function buildLangMenu(langWrapper, locale) {
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
    e.stopPropagation();
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
  const currPath = window.location.pathname;
  if (!locale.endsWith('/')) {
    // eslint-disable-next-line no-param-reassign
    locale += '/';
  }

  // Change URL to fully qualified language specific location.
  Object.values(links).forEach((a) => {
    let href = a.getAttribute('href');
    if (currPath.startsWith(href)) {
      a.closest('li').classList.add('active');
    }
    if (!href.endsWith('/')) {
      href += '/';
    }
    a.setAttribute('href', currPath.replace(locale, href));
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

async function buildMobileButton(locale) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('navbar-mobile-toggle-wrapper');

  const button = document.createElement('button');
  button.classList.add('navbar-mobile-toggle');
  wrapper.appendChild(button);

  button.setAttribute('data-toggle', 'navbar');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'navbar');
  button.setAttribute('aria-label', 'nav-mobile');

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
    e.stopPropagation();
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
  const navPath = getMetadata('locale') || '/na/en';
  const resp = await fetch(`${navPath}/nav.plain.html`);
  if (resp.ok) {
    const html = await resp.text();

    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    // decorate nav DOM
    const nav = document.createElement('nav');
    const navbar = document.createElement('div');
    navbar.setAttribute('id', 'navbar');
    navbar.classList.add('navbar');
    nav.append(navbar);

    const locale = getMetadata('locale') || '/na/en';
    navbar.append(await buildMobileButton(locale));
    navbar.append(buildLangMenu(tmp.children[2], locale));
    navbar.append(buildHelpMenu(tmp.children[1]));
    navbar.append(buildProductsMenu(tmp.children[0]));

    // const mobileMenu = buildMobileMenu();
    // appendMobileItems(mobileMenu, defaultNav);
    // nav.append(mobileMenu);

    decorateIcons(nav);
    block.append(nav);

    document.querySelector('body').addEventListener('click', () => {
      document.querySelectorAll('header .open').forEach((open) => {
        open.classList.remove('open');
      });
      document.querySelectorAll('header [aria-expanded=true]').forEach((expanded) => {
        expanded.setAttribute('aria-expanded', 'false');
      });
    });
  }
}
