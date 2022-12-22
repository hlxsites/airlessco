const hr = (doc) => doc.createElement('hr');
let fullProductName = null;
let productCategory = null;
/*
  function to clean up the imported product name and make it useful in the data sheet
 */
function getProductName(longName) {
  let name = longName;
  name = longName.replace('AIRLESSCO ', '');
  name = name.replace(' de AIRLESSCO', ''); // spanish
  return name;
}
const setup = (main) => {
  const pnel = main.querySelector('div.start h1');

  if (pnel.children.length > 1) {
    fullProductName = pnel.childNodes[2].textContent; // product name + Brand in es
    productCategory = pnel.firstChild.innerHTML; // category in es
  } else {
    fullProductName = pnel.childNodes[0].textContent.trim(); // product name + Brand
    productCategory = pnel.childNodes[1].childNodes[1].textContent.trim();
  }

  // eslint-disable-next-line no-console
  console.log('product name: ' + fullProductName);
  // eslint-disable-next-line no-console
  console.log('product category: ' + productCategory);
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

  if (fullProductName) {
    meta.Product = fullProductName;
  }

  if (productCategory) {
    meta.category = productCategory;
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

const makePDPBlock = (main, document) => {
  const category = null;

  if (productCategory) {
    const subhead = document.createElement('p');
    subhead.innerHTML = productCategory;
    const pnel = main.querySelector('div.start h1');
    pnel.innerHTML = fullProductName;
    pnel.insertAdjacentElement('afterend', subhead);
  }

  main.querySelectorAll('div.start h2').forEach((access) => {
    access.remove();
  });
  main.querySelectorAll('div.container-fluid').forEach((cf) => {
    cf.remove();
  });

  const cf = main.querySelector('div.container.start > div.row');
  const pdpTable = WebImporter.DOMUtils.createTable([
    ['Product Details'],
    [getProductName(fullProductName)],
  ], document);
  cf.append(hr(document));
  cf.replaceWith(pdpTable);

  const sub = main.querySelector('div.container.start > p');
  sub.insertAdjacentElement('afterend', hr(document));
};

const makeComparisonBlock = (main, document) => {
  const mobileSpecs = main.querySelector('div.container.start > span.visible-xs');
  if (mobileSpecs) {
    mobileSpecs.remove();
  }

  const products = [];
  main.querySelectorAll('div.container.start > span.hidden-xs').forEach((compare) => {
    compare.querySelectorAll('div > div > table > thead > tr:nth-child(2) > td').forEach((tds, index) => {
      if (index > 0) {
        if (!fullProductName.includes(tds.querySelector('strong').innerHTML.toUpperCase())) {
          products.push(tds.querySelector('strong').innerHTML.toUpperCase());
        }
      }
    });

    const pUL = document.createElement('ul');
    products.forEach((item) => {
      const li = document.createElement('li');
      pUL.appendChild(li);
      li.innerHTML = item;
    });

    const compTable = WebImporter.DOMUtils.createTable([
      ['Product Comparison'],
      [getProductName(fullProductName)],
      ['items', pUL],
    ], document);
    compare.insertAdjacentElement('beforebegin', hr(document));
    compare.replaceWith(compTable);
  });
};

const makeAccessoriesBlock = (main, document) => {
  main.querySelectorAll('div.row').forEach((accessories) => {
    const accTable = WebImporter.DOMUtils.createTable([
      ['Accessories Category'],
      [getProductName(fullProductName)],
    ], document);
    accessories.insertAdjacentElement('beforebegin', hr(document));
    accessories.replaceWith(accTable);
  });
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
    setup(document.body);
    makePDPBlock(document.body, document);
    makeComparisonBlock(document.body, document);
    makeAccessoriesBlock(document.body, document, name);
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
  }) => new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
};
