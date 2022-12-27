
/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */
const hr = (doc) => doc.createElement('hr');
let landingPage = false;

const base_branch = 'https://main--airlessco--hlxsites.hlx.page';
/*
  function to clean up the imported product name and make it useful in the data sheet
 */
function getProductName(longName) {
  let name = longName;
  name = longName.replace('AIRLESSCO ', '');
  name = name.replace(' de AIRLESSCO', ''); // spanish
  return name;
}
const setup = (main, url) => {
  if (new URL(url).pathname.endsWith('/products/accessories/')) {
    landingPage = true;
  }
};

function makeAccessoriesUrl(url) {
  const newUrl = new URL('index', url);
  return newUrl.toString();
}

function makeDetailUrl(url, page) {
  const orig_path = new URL(url).pathname + page.replace('/','');
  return base_branch + orig_path;
}

function convertUrl(url, path) {
  const new_path = new URL(url).pathname.replace(new RegExp('[^/]+/?$'),'');
  const relative = path.replace('../','');

  return base_branch + new_path + relative.replace('/', '');
}

const createPageHeader = (main, document) => {
  const header = main.querySelector('body > div.container.start > h1');
  if (landingPage) {
    header.insertAdjacentElement('afterend', hr(document));
  } else {
    const subh = main.querySelector('body > div.container.start > div.row.rowpadding');
    subh.insertAdjacentElement('afterend', hr(document));
  }
};

const createAccessoriesDetailBlock = (main, document) => {
  const accTable = WebImporter.DOMUtils.createTable([
    ['Accessory Detail'],
    ['fluids'],
  ], document);
  const hr = main.querySelector('body > div.container.start > hr');
  hr.insertAdjacentElement('afterend', accTable);
};

const createAccessoriesBlock = (main, document, url) => {
  const accData = [];
  const accdiv = main.querySelector('body > div.container.start > h2 + div');

  accData.push(['productcards']);
  accdiv.querySelectorAll('div.col-xs-6').forEach((div) => {
    const accImg = div.querySelector('div > img');
    const accAnchor = div.querySelector('a');
    accAnchor.href = convertUrl(url, accAnchor.href);
    accData.push([accImg, accAnchor]);
  });

  const accTable = WebImporter.DOMUtils.createTable(
    accData, document);
  accdiv.replaceWith(accTable);
  main.querySelectorAll('body > div.container.start > div.row').forEach((items) => {
    items.remove();
  });
  const headdiv = main.querySelector('body > div.container.start > h2');
  headdiv.insertAdjacentElement('beforebegin', hr(document));
};

const createAccessoriesLanding = (main, document, url) => {
  const lands = [];
  let accessories = [];
  lands.push(['Columns']);
  main.querySelectorAll('body > div.container.start > div.row > div').forEach((items) => {
    const accImg = items.querySelector('div > img');
    const accAnchor = items.querySelector('a');
    items.prepend(accImg);
    accAnchor.href = makeDetailUrl(url, accAnchor.href);
    accessories.push(items);
  });

  let ax = [];
  accessories.forEach((acc, idx) => {
    ax.push(acc);

    if (idx === 3 || idx === 7) {
      lands.push(ax);
      ax = [];
    }
  });

  const accTable = WebImporter.DOMUtils.createTable(
      lands, document);
  const prodDiv = main.querySelector('body > div.container.start > div.row');
  prodDiv.replaceWith(accTable);
};

const createMetadataBlock = (main, document, url) => {
  const meta = {};

  // find the <title> element
  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  // find the <meta property="og:description"> element
  const desc = document.querySelector('[name="description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  // set the locale meta property
  const urlNoHost = url.substring(url.indexOf('3001') + 4);
  const locale = urlNoHost.split('/');
  meta.Locale = `/${locale[1]}/${locale[2]}`;

  // helper to create the metadata block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  // append the block to the main element
  main.append(hr(document));
  main.append(block);

  // returning the meta object might be useful to other rules
  return meta;
};

export default {
  /**
     * Apply DOM operations to the provided document and return
     * the root element to be then transformed to Markdown.
     * @param {HTMLDocument} document The document
     * @param {string} url The url of the page imported
     * @param {string} html The raw html (the document is cleaned up during preprocessing)
     * @param {object} params Object containing some parameters given by the import process.
     * @returns {HTMLElement} The root element to be transformed
     */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    setup(document.body, url);
    createPageHeader(document.body, document);
    if (landingPage) {
      createAccessoriesLanding(document.body, document, url);
    } else {
      createAccessoriesDetailBlock(document.body, document);
      createAccessoriesBlock(document.body, document, url);
    }

    createMetadataBlock(document.body, document,url);
    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(document.body, [
      'header',
      'footer',
      'nav',
      '.breadcrumb',
      'meta',
    ]);
    return document.body;
  },

  /**
     * Return a path that describes the document being transformed (file name, nesting...).
     * The path is then used to create the corresponding Word document.
     * @param {HTMLDocument} document The document
     * @param {string} url The url of the page imported
     * @param {string} html The raw html (the document is cleaned up during preprocessing)
     * @param {object} params Object containing some parameters given by the import process.
     * @return {string} The path
     */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    if (landingPage) {
      url = makeAccessoriesUrl(url);
      landingPage = false;
    }
    return new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')
  },
};
