import { createTag } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const accessoriesSheetURL = new URL(block.querySelector('a').href);
  block.innerHTML = '';
  const resp = await fetch(accessoriesSheetURL);
  const json = await resp.json();
  const accessoriesData = json.data;
  const accessoriesDiv = createTag('div', { class: 'accessoriesaDiv' });
  accessoriesData.forEach((element) => {
    const accessoryDiv = createTag('div', { class: 'accessory-div' });
    const accessoryDetailsDiv = createTag('div', { class: 'accessory-details-div' });
    const accessoryImgDiv = createTag('div', { class: 'accessory-img-div' });
    Object.keys(element).forEach((key) => {
      const keyvalueDiv = createTag('div', { class: 'key-value-div' });
      const keyDiv = createTag('div', { class: 'keydiv' });
      const valueDiv = createTag('div', { class: 'valuediv' });
      const nameDiv = createTag('div', { class: 'namediv' });
      const accessoryDesc = createTag('div', { class: 'accessory-desc' });
      if (key === 'Image') {
        if (element[key] !== 'NA') {
          const accessoryImg = createTag('img', { class: 'accessory-img' });
          accessoryImg.setAttribute('src', element[key].trim());
          accessoryImgDiv.append(accessoryImg);
        }
        accessoryDiv.append(accessoryImgDiv);
      } else if (element[key] !== 'NA') {
        if (key === 'NAME') {
          nameDiv.innerHTML = element[key];
          accessoryDetailsDiv.insertBefore(nameDiv, accessoryDetailsDiv.firstChild);
        } else if (key === 'Description') {
          accessoryDesc.innerHTML = element[key];
          accessoryDetailsDiv.append(accessoryDesc);
        } else {
          keyDiv.innerHTML = key.concat(':');
          if (key === 'Resources') {
            valueDiv.innerHTML = `<a href = ${element[key].split('-')[1].trim()}>${element[key].split('-')[0]}</a>`;
          } else if (element[key].includes('\n')) {
            valueDiv.innerHTML = element[key].replace('\n', '<br>');
          } else {
            valueDiv.innerHTML = element[key];
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
