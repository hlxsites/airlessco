import { createTag } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const accessoriesSheetURL = new URL(block.querySelector('a').href);
  block.innerHTML = '';
  const resp = await fetch(accessoriesSheetURL);
  const json = await resp.json();
  const accessoriesJsonData = json.data;
  const accessoriesDiv = createTag('div', { class: 'accessories-div' });
  accessoriesJsonData.forEach((accessory) => {
    const accessoryDiv = createTag('div', { class: 'accessory-div' });
    const accessoryDetailsDiv = createTag('div', { class: 'accessory-details-div' });
    const accessoryImgDiv = createTag('div', { class: 'accessory-img-div' });
    Object.keys(accessory).forEach((key) => {
      const keyvalueDiv = createTag('div', { class: 'key-value-div' });
      const keyDiv = createTag('div', { class: 'keydiv' });
      const valueDiv = createTag('div', { class: 'valuediv' });
      const accessoryNameDiv = createTag('div', { class: 'accessory-name-div' });
      const accessoryDesc = createTag('div', { class: 'accessory-desc' });
      if (key === 'Image') {
        if (accessory[key] !== 'NA') {
          const accessoryImg = createTag('img', { class: 'accessory-img' });
          accessoryImg.setAttribute('src', accessory[key].trim());
          accessoryImgDiv.append(accessoryImg);
        }
        accessoryDiv.append(accessoryImgDiv);
      } else if (accessory[key] !== 'NA') {
        if (key === 'NAME') {
          accessoryNameDiv.innerHTML = accessory[key];
          accessoryDetailsDiv.insertBefore(accessoryNameDiv, accessoryDetailsDiv.firstChild);
        } else if (key === 'Description') {
          accessoryDesc.innerHTML = accessory[key];
          accessoryDetailsDiv.append(accessoryDesc);
        } else {
          keyDiv.innerHTML = key.concat(':');
          if (key === 'Resources') {
            valueDiv.innerHTML = `<a href = ${accessory[key].split('-')[1].trim()}>${accessory[key].split('-')[0]}</a>`;
          } else if (accessory[key].includes('\n')) {
            valueDiv.innerHTML = accessory[key].replace('\n', '<br>');
          } else {
            valueDiv.innerHTML = accessory[key];
          }
          keyvalueDiv.append(keyDiv);
          keyvalueDiv.append(valueDiv);
          accessoryDetailsDiv.append(keyvalueDiv);
        }
      }
    });
    accessoryDiv.append(accessoryDetailsDiv);
    accessoriesDiv.append(accessoryDiv);
    block.append(accessoriesDiv);
  });
}
