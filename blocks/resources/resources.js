import { fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';

async function lookupFiles(fileSource, category) {
  const resp = await fetch(fileSource);
  const json = await resp.json();
  return json.data.filter((e) => e.Category.toLowerCase() === category.toLowerCase());
}

export default async function decorate(block) {
  const locale = getMetadata('locale');
  const lang = locale.replace(/^\/\w+\/(\w+)$/, '$1');
  const placeholders = await fetchPlaceholders(locale);

  const fileSource = new URL(block.querySelector('a').href);
  const title = block.children[1].children[1].textContent.trim();
  const category = block.children[2].children[1].textContent.trim('');

  const resourcesSectionTitle = createTag(
    'h3',
    { class: 'resources-section-title', id: title },
    createTag('strong', {}, title),
  );

  const resourcesTableContainer = createTag('div', { class: 'resources-table-container' });
  const resourcesDiv = createTag('table', { class: 'resources' });
  resourcesDiv.setAttribute('id', 'resources-table');
  resourcesDiv.classList.add('sortable-theme-bootstrap', 'table-striped');
  resourcesDiv.setAttribute('data-sortable', '');

  const resourcesTHead = createTag('thead', { class: 'resources-thead' });
  const resourcesTHeadTR = createTag('tr', { class: 'resources--thead-tr' });

  resourcesTHead.append(resourcesTHeadTR);

  const resourcesTBody = createTag('tbody', { class: 'resources-tbody' });
  resourcesDiv.append(resourcesTHead, resourcesTBody);

  const titles = [];

  if (block.classList.contains('manuals')) {
    // Make a call to the  product datasheet  and get the json for all fields for the product
    const resources = await lookupFiles(fileSource, category);
    titles.push('titleLabel', 'manualNumberLabel', 'sizeLabel');

    const downloadURL = 'https://www.graco.com/bin/findManual?source=airlessco&manual=';
    const langParam = '&lang=';
    resources.forEach((obj) => {
      const resource = createTag('tr', { class: 'resource' });
      const manualNumber = obj.Manual_Number;
      Object.entries(obj).forEach(([key, value]) => {
        if (key === ('Title') || key === ('Manual_Number')) {
          const resourceData = createTag('td', { class: 'resource-data' });
          const resourceLink = createTag('a', { class: 'resource-link' });
          resourceLink.setAttribute('href', `${downloadURL}${manualNumber}${langParam}${lang}`);
          resourceLink.setAttribute('target', 'new');
          resourceLink.innerText = `${value}`;
          resourceData.append(resourceLink);
          resource.append(resourceData);
        }
        if (key === ('Size')) {
          const resourceData = createTag('td', { class: 'resource-data' });
          resourceData.innerText = `${value}`;
          resource.append(resourceData);
        }
      });
      resourcesTBody.append(resource);
    });
  }

  if (block.classList.contains('distributor')) {
    // Make a call to the  product datasheet  and get the json for all fields for the product
    const resources = await lookupFiles(fileSource, category);
    titles.push('titleLabel', 'fileFormatLabel', 'sizeLabel');

    const tmp = document.createElement('div');

    resources.forEach((obj) => {
      const resource = createTag('tr', { class: 'resource' });
      tmp.innerHTML = obj.Link;
      const downloadURL = tmp.querySelector('a').getAttribute('href');
      Object.entries(obj).forEach(([key, value]) => {
        if (key === ('Title') || key === ('File_Format')) {
          const resourceData = createTag('td', { class: 'resource-data' });
          const resourceLink = createTag('a', { class: 'resource-link' });
          resourceLink.setAttribute('href', `${downloadURL}`);
          resourceLink.setAttribute('target', 'new');
          resourceLink.innerText = `${value}`;
          resourceData.append(resourceLink);
          resource.append(resourceData);
        }
        if (key === ('Size')) {
          const resourceData = createTag('td', { class: 'resource-data' });
          resourceData.innerText = `${value}`;
          resource.append(resourceData);
        }
      });
      resourcesTBody.append(resource);
    });
  }

  titles.forEach((t) => {
    const resourcesTHeadTH = createTag('th', { class: 'resources--thead-th' }, placeholders[t]);
    resourcesTHeadTR.append(resourcesTHeadTH);
  });

  resourcesTableContainer.append(resourcesDiv);

  block.innerHTML = ` 
    ${resourcesSectionTitle.outerHTML}
    ${resourcesTableContainer.outerHTML}
  `;

  document.querySelector('h1').append(
    createTag('a', { href: `#${title}` }, createTag('small', {}, title)),
  );
}
