import { createMetadataBlock, hr } from './common.js';
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
let landingPage = false;

const baseBranch = 'https://main--airlessco--hlxsites.hlx.page';
/*
  function to clean up the imported product name and make it useful in the data sheet
 */
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
  const origPath = new URL(url).pathname + page.replace('/', '');
  return baseBranch + origPath;
}

function convertUrl(url, path) {
  const newPath = new URL(url).pathname.replace(/[^/]+\/?$/, '');
  const relative = path.replace('../', '');

  return baseBranch + newPath + relative.replace('/', '');
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

function getCateogry(url) {
  const earl = new URL(url).pathname;
  const category = earl.match(/[^/]+\/?$/)[0].replace('/', '').trim();
  return category;
}

const createAccessoriesDetailBlock = (main, document, url) => {
  const accTable = WebImporter.DOMUtils.createTable([
    ['Accessory Detail'],
    [getCateogry(url)],
  ], document);
  const ahr = main.querySelector('body > div.container.start > hr');
  ahr.insertAdjacentElement('afterend', accTable);
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

  const accTable = WebImporter.DOMUtils.createTable(accData, document);
  accdiv.replaceWith(accTable);
  main.querySelectorAll('body > div.container.start > div.row').forEach((items) => {
    items.remove();
  });
  const headdiv = main.querySelector('body > div.container.start > h2');
  headdiv.insertAdjacentElement('beforebegin', hr(document));
};

const createAccessoriesLanding = (main, document, url) => {
  const lands = [];
  const accessories = [];
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

  const accTable = WebImporter.DOMUtils.createTable(lands, document);
  const prodDiv = main.querySelector('body > div.container.start > div.row');
  prodDiv.replaceWith(accTable);
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
      createAccessoriesDetailBlock(document.body, document, url);
      createAccessoriesBlock(document.body, document, url);
    }

    createMetadataBlock(document.body, document, url);
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
      // eslint-disable-next-line no-param-reassign
      url = makeAccessoriesUrl(url);
      landingPage = false;
    }
    return new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '');
  },
};
