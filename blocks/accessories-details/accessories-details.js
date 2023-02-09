import { createTag } from '../../scripts/scripts.js';
import { fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';

async function fetchPlaceholderText() {
  const locale = getMetadata('locale');
  const placeholders = await fetchPlaceholders(locale);
  return placeholders;
}

export default async function decorate(block) {
  const accessoriesSheetURL = new URL(block.querySelector('a').href);
  block.innerHTML = '';
  const resp = await fetch(accessoriesSheetURL);
  const json = await resp.json();
  const accessoriesJsonData = json.data;
  const accessories = createTag('div', { class: 'accessories' });
  const placeHolder = await fetchPlaceholderText();
  accessoriesJsonData.forEach((accessory) => {
    const accessoryDiv = createTag('div', { class: 'accessory' });
    const accessoryDetails = createTag('div', { class: 'accessory-details' });
    const accessoryImg = createTag('div', { class: 'accessory-img' });
    Object.keys(accessory).forEach((key) => {
      if (key === 'Image') {
        if (accessory[key] !== 'NA') {
          const image = createTag('img');
          image.setAttribute('src', accessory[key].trim());
          accessoryImg.append(image);
        }
        accessoryDiv.append(accessoryImg);
      } else if (accessory[key] !== 'NA') {
        if (key === 'NAME') {
          const accessoryName = createTag('div', { class: 'accessory-name' });
          accessoryName.innerHTML = accessory[key];
          accessoryDetails.insertBefore(accessoryName, accessoryDetails.firstChild);
        } else if (key === 'Subtext') {
          const subtext = `<p>${accessory[key]} </p>`;
          accessoryDetails.firstChild.innerHTML = accessoryDetails.firstChild.innerHTML.concat(subtext);
        } else if (key === 'Description') {
          const accessoryDesc = createTag('div', { class: 'accessory-desc' });
          accessoryDesc.innerHTML = accessory[key];
          accessoryDetails.append(accessoryDesc);
        } else {
          const keyvalue = createTag('div', { class: 'key-value' });
          keyvalue.innerHTML = `<strong>${placeHolder[key.toLowerCase()].concat(':')}</strong>`;
          const value = createTag('div', { class: 'value' });
          if (key === 'Resources') {
            value.innerHTML = `<a href = ${accessory[key].split('=')[1].trim()}>${accessory[key].split('=')[0]}</a>`;
          } else if (accessory[key].includes('\n')) {
            value.innerHTML = accessory[key].replaceAll('\n', '<br>');
          } else {
            value.innerHTML = accessory[key];
          }
          keyvalue.append(value);
          accessoryDetails.append(keyvalue);
        }
      }
    });
    accessoryDiv.append(accessoryDetails);
    accessories.append(accessoryDiv);
    block.append(accessories);
  });
}
const accessoriesTitle = document.querySelector('h1');
accessoriesTitle.id = 'accessories-title';
