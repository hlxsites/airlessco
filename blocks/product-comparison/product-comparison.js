import { lookupProductData, lookupProductComparisionData, createTag } from '../../scripts/scripts.js';

function reterieveSpecs(specification) {
  let specsArray = specification.split(/\r?\n|\r|\n/g);
  let specs = new Map();
  specsArray.forEach((element, index) => {
    let temp = element.split(':');
    specs.set(temp[0], temp[1]);
  });
  return specs;
}

function reterieveValue(specification, specKey) {
  let specsArray = specification.split(/\r?\n|\r|\n/g);
  let specValue;
  specsArray.forEach((element, index) => {
    let temp = element.split(':');
    if(temp[0] == specKey){
      specValue = temp[1];     
    }
  });
  return specValue;
}

function insertProduct(productData, position, productName){
  let temp = productData.split(',');
  temp.splice(position-1, 0, productName);
  return temp;
}

export default async function decorate(block) {
  const productFamily = [...block.children][0].innerText.trim('');
  const productName = [...block.children][1].innerText.trim('');
  const position = [...block.children][2].innerText.trim('');
  const productFields = ['Comparison', 'Specification'];
  const productData = await lookupProductData(productFamily, productName, productFields);
  const relatedProducts = await lookupProductComparisionData(productFamily, insertProduct(productData[0][0],position, productName));
  const specs = reterieveSpecs(productData[1][0]);  
  const table = createTag('table', { class: 'table' });
  const thead = createTag('thead', { class: 'thead' });
  let tr = createTag('tr', { class: 'thead-row' });
  let td = createTag('td', { class: 'thead-rowdata' });
  for (let index = 0; index < 2; index++) {
    if (index == 0) {
      td.innerHTML = `<strong>&nbsp;</strong>`
      tr.append(td);
      for (const element of relatedProducts) {
        td = createTag('td', { class: 'thead-rowdata' });
        const productImage = createTag('img', { class: 'product-cimage' });
        productImage.setAttribute('src', element[0]['Images']);     
        td.append(productImage);
        tr.append(td);
      }
    } else {
      tr = createTag('tr', { class: 'thead-row' });
      td = createTag('td', { class: 'thead-rowdata' });
      td.innerHTML = `<strong>SPECIFICATIONS</strong>`;
      tr.append(td);
      for (const element of relatedProducts) {
        td = createTag('td', { class: 'thead-rowdata' });       
        td.innerHTML = `<strong>${element[0]['Name']}</strong>`;
        tr.append(td);
      }
    }
    thead.append(tr);
  }
  table.append(thead);
  specs.forEach(function (value, key) {
    tr = createTag('tr', { class: 'row' });
    td = createTag('td', { class: 'thead-rowdata' });
    td.innerHTML = `<strong>${key}</strong>`;
    tr.append(td);
    for (let i = 0, j = 0; i < relatedProducts.length; i++, j++) {
      td = createTag('td', { class: 'rowdata' });            
      td.innerHTML = reterieveValue(relatedProducts[i][0]['Specification'], key);
      tr.append(td);
    }
    table.append(tr);    
  });
  block.innerHTML = '';
  block.append(table);
}

