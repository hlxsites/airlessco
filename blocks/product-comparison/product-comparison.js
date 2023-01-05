import { lookupProductComparisionData, createTag } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

function reterieveSpecs(specification) {
  const specsArray = specification.split(/\r?\n|\r|\n/g);
  const specs = new Map();
  specsArray.forEach((element) => {
    const temp = element.split(':');
    specs.set(temp[0], temp[1]);
  });
  return specs;
}

function reterieveValue(specification, specKey) {
  const specsArray = specification.split(/\r?\n|\r|\n/g);
  let specValue;
  specsArray.forEach((element) => {
    const temp = element.split(':');
    if (temp[0] === specKey) {
      [, specValue] = temp;
    }
  });
  return specValue;
}

function buildItemsArray(itemsArray, productName, position) {
  const productData = [];
  let count = 0;
  itemsArray.split('\n').forEach((element) => {
    if (element.trim('') !== 'items' && element.trim('') !== '') {
      productData[count] = element.trim('');
      count += 1;
    }
  });
  productData.splice(position - 1, 0, productName);
  return productData;
}

function convertLocale() {
  const locale = getMetadata('locale');
  let rerturnArray = [];
  if (locale === '/na/en') {
    rerturnArray = ['na_en', 'Specification'];
  } else if (locale === '/emea/en') {
    rerturnArray = ['emea_en', 'Specification'];
  } else if (locale === '/emea/cz') {
    rerturnArray = ['emea_cz', 'SPECIFIKACE'];
  } else if (locale === '/emea/de') {
    rerturnArray = ['emea_de', 'SPEZIFIKATIONEN'];
  } else if (locale === '/emea/es') {
    rerturnArray = ['emea_es', 'ESPECIFICACIONES'];
  } else if (locale === '/emea/fr') {
    rerturnArray = ['emea_fr', 'SPÉCIFICATIONS'];
  } else if (locale === '/emea/it') {
    rerturnArray = ['emea_it', 'SPECIFICHE'];
  } else if (locale === '/emea/nl') {
    rerturnArray = ['emea_nl', 'SPECIFICATIES'];
  } else if (locale === '/emea/pl') {
    rerturnArray = ['emea_pl', 'DANE TECHNICZNE'];
  }
  return rerturnArray;
}

export default async function decorate(block) {
  const productFamily = [...block.children][0].innerText.trim('');
  const productName = [...block.children][1].innerText.trim('');
  const position = (([...block.children][2].innerText.trim('') === '') ? [...block.children][2].innerText.trim('') : 1);
  const p2compare = buildItemsArray([...block.children][3].innerText.trim(''), productName, position);
  const locale = convertLocale();
  const relatedProducts = await lookupProductComparisionData(productFamily, p2compare, locale[0]);
  const Specification = 'Specification';
  const Name = 'Name';
  const Images = 'Images';
  const specs = reterieveSpecs(relatedProducts[1][0][Specification]);
  const table = createTag('table', { class: 'table' });
  const thead = createTag('thead', { class: 'thead' });
  let tr = createTag('tr');
  let td = createTag('td');
  td.innerHTML = '<strong>&nbsp;</strong>';
  tr.append(td);
  relatedProducts.forEach((element) => {
    td = createTag('td');
    const productImage = createTag('img', { class: 'product-cimage' });
    productImage.setAttribute('src', element[0][Images]);
    td.append(productImage);
    tr.append(td);
  });
  thead.append(tr);
  tr = createTag('tr');
  td = createTag('td', { class: 'specheading' });
  td.innerHTML = `<strong>${locale[1]}</strong>`;
  tr.append(td);
  relatedProducts.forEach((element, index) => {
    if (index === position - 1) {
      td = createTag('td', { class: 'highlightspecdata' });
    } else {
      td = createTag('td');
    }
    td.innerHTML = `<strong>${element[0][Name]}</strong>`;
    tr.append(td);
  });
  thead.append(tr);
  table.append(thead);
  specs.forEach((value, key) => {
    tr = createTag('tr');
    td = createTag('td', { class: 'specname' });
    td.innerHTML = `<strong>${key}</strong>`;
    tr.append(td);
    relatedProducts.forEach((element, index) => {
      if (index === position - 1) {
        td = createTag('td', { class: 'highlightspecdata' });
      } else {
        td = createTag('td', { class: 'specdata' });
      }
      td.innerHTML = reterieveValue(element[0][Specification], key);
      tr.append(td);
    });
    table.append(tr);
  });
  block.innerHTML = '';
  block.append(table);
}