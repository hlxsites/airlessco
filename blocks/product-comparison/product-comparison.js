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

function buildItemsArray(itemsArray, productName) {
  const productData = [];
  let count = 0;
  itemsArray.split('\n').forEach((element) => {
    if (element.trim('') !== 'items' && element.trim('') !== '') {
      if (element.trim('').toLowerCase() !== productName.toLowerCase()) {
        productData[count] = element.trim('');
        count += 1;
      }
    }
  });
  productData.push(productName);
  return productData.sort();
}

function convertLocale() {
  const locale = getMetadata('locale');
  let rerturnArray = [];
  if (locale === '/na/en') {
    rerturnArray = ['na_en', 'Specification', 'Series Comparision'];
  } else if (locale === '/emea/en') {
    rerturnArray = ['emea_en', 'Specification', 'Series Comparision'];
  } else if (locale === '/emea/cz') {
    rerturnArray = ['emea_cz', 'SPECIFIKACE'];
  } else if (locale === '/emea/de') {
    rerturnArray = ['emea_de', 'SPEZIFIKATIONEN', 'POROVNÁNÍ ŘADY'];
  } else if (locale === '/emea/es') {
    rerturnArray = ['emea_es', 'ESPECIFICACIONES', 'COMPARACIÓN DE LA GAMA'];
  } else if (locale === '/emea/fr') {
    rerturnArray = ['emea_fr', 'SPÉCIFICATIONS', 'COMPARAISON SÉRIE'];
  } else if (locale === '/emea/it') {
    rerturnArray = ['emea_it', 'SPECIFICHE', 'CONFRONTO SERIE', 'VERGLEICH'];
  } else if (locale === '/emea/nl') {
    rerturnArray = ['emea_nl', 'SPECIFICATIES', 'VERGELIJKING'];
  } else if (locale === '/emea/pl') {
    rerturnArray = ['emea_pl', 'DANE TECHNICZNE', 'PORÓWNANIE SERII'];
  }
  return rerturnArray;
}

export default async function decorate(block) {
  const productSheetURL = new URL(block.querySelector('a').href);
  const productName = [...block.children][1].innerText.trim('');
  const p2compare = buildItemsArray([...block.children][2].innerText.trim(''), productName);
  const locale = convertLocale();
  const relatedProducts = await lookupProductComparisionData(productSheetURL, p2compare);
  const Specification = 'Specification';
  const Name = 'Name';
  const Images = 'Images';
  const headingdiv = createTag('div', { class: 'heading' });
  const productSeries = productName.replace(/\d+/g, '');
  if (locale[0] === 'na_en' || locale[0] === 'emea_en') {
    headingdiv.innerHTML = `<strong>${productSeries} ${locale[2]}</strong>`;
  } else {
    headingdiv.innerHTML = `<strong>${locale[2]} ${productSeries}</strong>`;
  }
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
    productImage.setAttribute('src', element[0][Images].trim());
    td.append(productImage);
    tr.append(td);
  });
  thead.append(tr);
  tr = createTag('tr');
  td = createTag('td', { class: 'specheading' });
  td.innerHTML = `<strong>${locale[1]}</strong>`;
  tr.append(td);
  relatedProducts.forEach((element) => {
    if (element[0][Name].toLowerCase() === productName.toLowerCase()) {
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
    relatedProducts.forEach((element) => {
      if (element[0][Name].toLowerCase() === productName.toLowerCase()) {
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
  block.append(headingdiv);
  block.append(table);
}
