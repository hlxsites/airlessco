import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';

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
    nav.classList.add('navbar', 'navbar-default');

    nav.append(buildLangMenu(tmp.children[2]));

    nav.append(buildHelpMenu(tmp.children[1]));

    nav.append(buildProductsMenu(tmp.children[0]));

    // const classes = ['brand', 'help', 'languages'];
    // classes.forEach((e, j) => {
    //   const section = nav.children[j];
    //   if (section) section.classList.add(`nav-${e}`);
    // });

    // wrapper = document.createElement('div');
    // wrapper.classList.add('nav-help');
    //
    //
    // wrapper = document.createElement('div');
    // wrapper.classList.add('nav-brand');

    // const navSections = [...nav.children][1];
    // if (navSections) {
    //   navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
    //     if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
    //     navSection.addEventListener('click', () => {
    //       const expanded = navSection.getAttribute('aria-expanded') === 'true';
    //       collapseAllNavSections(navSections);
    //       navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    //     });
    //   });
    // }
    // const langSelector = nav.querySelector('.nav-tools ul li');
    // langSelector.classList.add('nav-drop');
    // langSelector.setAttribute('aria-expanded', 'false');
    // langSelector.addEventListener('click', () => {
    //   const lsexpanded = langSelector.getAttribute('aria-expanded') === 'true';
    //   langSelector.setAttribute('aria-expanded', lsexpanded ? 'false' : 'true');
    // });
    //
    // /* language selector pathing */
    // const langs = langSelector.querySelector('ul');
    // const { pathname } = window.location;
    // const nakedPath = pathname.split('/')[3];
    // const currentRegionLang = pathname.substring(0, pathname.indexOf(nakedPath));
    // const cleanPath = pathname.substring(pathname.indexOf(nakedPath));
    // langs.querySelectorAll('li').forEach((lang) => {
    //   const anchor = lang.querySelector('a');
    //   anchor.href += cleanPath;
    //   if (anchor.href.indexOf(currentRegionLang) > 0) {
    //     lang.classList.add('active');
    //   }
    // });
    //
    // // hamburger for mobile
    // const hamburger = document.createElement('div');
    // hamburger.classList.add('nav-hamburger');
    // hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
    // hamburger.addEventListener('click', () => {
    //   const expanded = nav.getAttribute('aria-expanded') === 'true';
    //   document.body.style.overflowY = expanded ? '' : 'hidden';
    //   nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    // });
    // nav.prepend(hamburger);
    // nav.setAttribute('aria-expanded', 'false');
    decorateIcons(nav);
    block.append(nav);
  }
}
