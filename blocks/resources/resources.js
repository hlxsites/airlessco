import { lookupFiles, createTag } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const fileSource = new URL(block.querySelector('a').href);
  const category = [...block.children][1].innerText.trim('');
  const locale = getMetadata('locale');
  let resources = null;
  let resourcesTableHeaderValues = null;

  const resourcesWrapper = createTag('div', { class: 'resources-wrapper' });
  const resourcesWrapper1 = createTag('div', { class: 'resources-wrapper-1' });
  resourcesWrapper.append(resourcesWrapper1);
  const resourcesSectionTitle = createTag('div', { class: 'resources-section-title' });
  resourcesSectionTitle.innerText = category;

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

  if (block.classList.contains('manuals')) {
    // Make a call to the  product datasheet  and get the json for all fields for the product
    resources = await lookupFiles(fileSource, category, locale);
    resourcesTableHeaderValues = ['Title', 'Manual Number', 'Size'];
    const downloadURL = 'http://www.graco.com/bin.findManual?source=airlessco&manual=';
    resources.forEach((obj) => {
      const resource = createTag('tr', { class: 'resource' });
      const manualNumber = obj.Manual_Number;
      Object.entries(obj).forEach(([key, value]) => {
        if (key === ('Title') || key === ('Manual_Number')) {
          const resourceData = createTag('td', { class: 'resource-data' });
          const resourceLink = createTag('a', { class: 'resource-link' });
          resourceLink.setAttribute('href', `${downloadURL}${manualNumber}`);
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
    resources = await lookupFiles(fileSource, category, locale);
    resourcesTableHeaderValues = ['Title', 'File Format', 'Size'];
    resources.forEach((obj) => {
      const resource = createTag('tr', { class: 'resource' });
      const downloadURL = obj.Link;
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

  resourcesTableHeaderValues.forEach((item) => {
    const resourcesTHeadTH = createTag('th', { class: 'resources--thead-th' });
    resourcesTHeadTH.innerText = item;
    resourcesTHeadTR.append(resourcesTHeadTH);
  });

  resourcesWrapper1.append(resourcesSectionTitle);
  resourcesTableContainer.append(resourcesDiv);
  resourcesWrapper1.append(resourcesTableContainer);

  block.innerHTML = '';
  block.append(resourcesWrapper);
}
