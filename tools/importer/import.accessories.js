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

const createPageHeader = (main, document) => {
  const subh = main.querySelector('body > div.container.start > div.row.rowpadding');
  subh.insertAdjacentElement('afterend', hr(document));
};

const createAccessoriesDetailBlock = (main, document, url) => {
  const rows = document.querySelectorAll('.container.start > .row');
  let ahr = document.querySelector('body > div.container.start > hr');

  rows.forEach((row) => {
    let heading = row.querySelector('.row .row h3');
    const cells = row.querySelectorAll('.row .row.rowpadding');

    if (heading) {
      const strong = document.createElement('strong');
      strong.append(heading.textContent);
      heading = `<h3><strong>${heading.textContent}</strong></h3>`;
      const tBody = [
        ['Accessories Details'],
        [heading],
      ];
      let productId = '';
      cells.forEach((cell) => {
        if (cell.querySelector('div.col-sm-4.col-md-3') && cell.querySelector('div.col-sm-8.col-md-9')) {
          tBody.push([`<strong>${cell.querySelector('div.col-sm-4.col-md-3').textContent}</strong>`, cell.querySelector('div.col-sm-8.col-md-9').textContent]);
          if (!productId) productId = cell.querySelector('div.col-sm-8.col-md-9').textContent;
        } else if (cell.querySelector('div.col-sm-4.col-md-3') && cell.querySelector('div.col-sm-12 table')) {
          tBody.push([cell.querySelector('div.col-sm-4.col-md-3').textContent, 'table']);
        } else if (cell.querySelector('div.col-sm-4.col-md-3')) {
          tBody.push([cell.querySelector('div.col-sm-4.col-md-3').textContent]);
        } else if (cell.querySelector('div.col-xs-12 table')) {
          const meta = createMetadataBlock(main, document, url);
          const tblLink = `https://main--airlessco--hlxsites.hlx.page/product-data/accessories/${productId.toLowerCase()}.json?sheet=${meta.Locale.replace('/', '').replace('/', '_').replace('\\', '')}`;
          tBody.push([tblLink]);
        } else if (cell.querySelector('div.col-xs-12')) {
          tBody.push([cell.querySelector('div.col-xs-12').textContent]);
        }
      });

      const image = row.querySelector('.img-responsive');
      if (image) {
        ahr = ahr.insertAdjacentElement('afterend', image);
      }
      ahr = ahr.insertAdjacentElement('afterend', WebImporter.DOMUtils.createTable(tBody, document));
      ahr = ahr.insertAdjacentElement('afterend', hr(document));
      row.remove();
    }
  });
};

const createAccessoriesBlock = (main, document) => {
  const accdiv = main.querySelector('body > div.container.start > h2 + div');

  const items = `<ul><li>sprayguns</li>
  <li>hoses</li>
  <li>spraytips</li>
  <li>extensions</li>
  <li>fluids</li>
  <li>filters</li>
  <li>hvlp</li>
  <li>striping</li>
  <li>other</li></ul>`;

  const h2 = main.querySelector('body > div.container.start > h2');
  const tbl = WebImporter.DOMUtils.createTable([
    ['accessories-category'],
    ['title', `<h2><strong>${h2.textContent}</strong></h2>`],
    ['types', items],
  ], document);
  h2.replaceWith('');
  accdiv.replaceWith(tbl);
};

const fixH1 = (main, document) => {
  const h1 = main.querySelector('body > div.container.start > h1');
  const h1T = h1.textContent;
  const strong = document.createElement('strong');
  strong.textContent = h1T;
  h1.textContent = '';
  h1.append(strong);
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
    fixH1(document.body, document);
    createAccessoriesDetailBlock(document.body, document, url);
    createAccessoriesBlock(document.body, document, url);
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
