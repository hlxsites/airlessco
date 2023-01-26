const hr = (doc) => doc.createElement('hr');
export function createMetadataBlock(main, document, url) {
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
  // eslint-disable-next-line no-undef
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  // append the block to the main element
  // main.append(hr(document));
  main.append(block);

  // returning the meta object might be useful to other rules
  return meta;
}

export {
  hr,
};
