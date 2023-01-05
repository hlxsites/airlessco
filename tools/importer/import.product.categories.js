/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import { createMetadataBlock, hr } from './common.js';

/* global WebImporter */
const baseBranch = 'https://main--airlessco--hlxsites.hlx.page';
/*
  function to clean up the imported product name and make it useful in the data sheet
 */

function makeAccessoriesUrl(url) {
  const newUrl = new URL('index', url);
  return newUrl.toString();
}

const createHeroBlock = (main, document) => {
  const herodiv = document.querySelector('body > div.container.start > div:nth-child(1)');
  if (herodiv) {
    const heroimg = document.querySelector('body > div.container.start > div:nth-child(1) > div  > img');
    const heroTable = WebImporter.DOMUtils.createTable([
      ['Hero'],
      [heroimg],
    ], document);
    herodiv.replaceWith(heroTable);
  }
};

const cleanDivs = (main, document) => {
  const divRows = document.querySelectorAll('body > div.container.start > div.row');
  divRows.forEach((rm) => {
    rm.remove();
  });
};

const formatHeadingMetadata = (heading, document) => {
  const shm = document.createElement('div');
  shm.append(heading.textContent);
  return shm;
};

function formatArray(inArr, blocktype, url) {
  const host = new URL(url.replace('http://localhost:3001', baseBranch));
  const newArr = [];
  newArr.push([blocktype]);
  let isCat = false;
  if (new URL(url).pathname.endsWith('/products/')) {
    isCat = true;
  }
  inArr.forEach((row) => {
    if (isCat) {
      row[1].href = baseBranch + host.pathname + row[1].href.replace('/', '');
    } else {
      // subcat pages have an odd url pattern
      const path = baseBranch + host.pathname.replace(/\/products\/(.*)$/, '');
      row[1].href = path + row[1].href.replaceAll('/', '').replace('..', '/products/');
    }

    newArr.push([row[2], row[1]]);
  });
  return newArr;
}

const createProductCards = (main, document, url) => {
  const cats = document.querySelectorAll('body > div.container.start > div.row');
  const heads = document.querySelectorAll('body > div.container.start > h2.blue');
  const newcat = document.createElement('div');
  let headCount = 0;
  let headBool = true;

  cats.forEach((cat) => {
    if (headBool && heads.length > 0) {
      // this is the main category area
      newcat.append(document.createElement('h2').textContent = heads[headCount]);
      newcat.append(hr(document));
      headBool = false;
    }
    const sectionH = cat.querySelectorAll('div > h3');
    sectionH.forEach((h3) => {
      const pDiv = h3.nextElementSibling;
      const mpDiv = pDiv.querySelectorAll('div');
      const prodarray = [];
      mpDiv.forEach((pdo) => {
        const anchor = pdo.querySelector('a');
        const prodimg = pdo.querySelector('a > div > img');
        const prodnm = pdo.querySelector('a > div > div.caption');
        if (anchor && prodimg && prodnm) {
          prodarray.push([prodnm.textContent, anchor, prodimg]);
        }
      });
      const pTable = WebImporter.DOMUtils.createTable(formatArray(prodarray, 'productcards', url), document);
      newcat.append(formatHeadingMetadata(h3, document));
      newcat.append(pTable);
      newcat.append(WebImporter.DOMUtils.createTable([['Section Metadata'], ['Style', 'card-heading']], document));
      newcat.append(hr(document));
    });
    // eslint-disable-next-line no-plusplus
    headCount++;
    headBool = true;
    // createCardHeading('', document);
  });
  document.querySelector('body > div.container.start > div.row').replaceWith(newcat);
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
    createHeroBlock(document.body, document);
    createProductCards(document.body, document, url);
    cleanDivs(document.body, document);
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
    // eslint-disable-next-line no-param-reassign
    url = makeAccessoriesUrl(url);
    return new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '');
  },
};
