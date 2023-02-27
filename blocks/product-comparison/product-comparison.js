import { createOptimizedPicture, fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import { lookupProductData } from '../../scripts/scripts.js';

const buildSpecData = (specifications) => {
  const map = new Map();
  specifications.split(/\r?\n|\r|\n/g).forEach((line) => {
    const key = line.substring(0, line.indexOf(':')).trim();
    const value = line.substring(line.indexOf(':') + 1).trim();
    const fixed = value.includes('|') ? value.replaceAll('|', '<br/>') : value;
    map.set(key.trim(), fixed);
  });
  return map;
};

const buildSpecTable = (placeholders, productName, specData) => {
  const tableHeader = `
    <tr>
      <td><strong>${placeholders.specifications}</strong></td>
      <td><strong>${productName}</strong></td>
    </tr>
  `;
  let tableBody = '';
  specData.forEach((v, k) => {
    tableBody += `
    <tr>
      <td><strong>${k}</strong></td>
      <td>${v}</td>
    </tr>`;
  });
  return `
    <div class="product-specifications">
      <h2><strong>${productName} ${placeholders.specifications}</strong></h2>
      <table class="striped">  
        <thead>
          ${tableHeader}
        </thead>
        <tbody>
          ${tableBody}
        </tbody>
      </table>
    </div>
  `;
};

const buildComparisonTable = (image, placeholders, title, productInfo, specData, compareTo) => {
  const compareSpecs = new Map();

  // Build the header row.
  let productImages = `
    <tr>
      <td>&nbsp;</td>
      <td>${createOptimizedPicture(image, productInfo.Name, false, [{ width: 400 }]).outerHTML}</td>
  `;

  let productNames = `
    <tr>
      <td><strong>${placeholders.specifications}</strong></td>
      <td class="current"><strong>${productInfo.Name}</strong></td>
  `;

  compareTo.forEach((product) => {
    compareSpecs.set(product.Name, buildSpecData(product.Specification));
    productImages += `<td>${createOptimizedPicture(image.replace(/(.*)\/\w+.jpeg/, `$1/${product.id}.jpeg`), product.Name, false, [{ width: 400 }]).outerHTML}</td>`;
    productNames += `<td><strong>${product.Name}</strong></td>`;
  });
  productImages += '</tr>';
  productNames += '</tr>';

  // Build the Body.
  let tableBody = '';
  specData.forEach((specValue, specName) => {
    tableBody += `
      <tr>
        <td><strong>${specName}</strong></td>
        <td class="current">${specValue}</td>
    `;
    compareSpecs.forEach((compareValue) => {
      let value = compareValue.get(specName);

      // Motor/Engine spec has special handling.
      if (specName === 'Engine' && !value) {
        value = compareValue.get('Motor');
      } else if (specName === 'Motor' && !value) {
        value = compareValue.get('Engine');
      }
      tableBody += `<td>${value || '-'}</td>`;
    });
    tableBody += '</tr>';
  });

  return `
    <div class="product-comparison-details">
      <h2><strong>${title}</strong></h2>
      <table class="striped columns-${compareTo.length + 2}">
        <thead>
          ${productImages}
          ${productNames}
        </thead>
        <tbody>
          ${tableBody}
        </tbody>
      </table>
    </table>
  `;
};

export default async function decorate(block) {
  const prefix = getMetadata('locale');
  const placeholders = await fetchPlaceholders(prefix);

  const productName = block.children[0].children[0].textContent.trim();
  const productFamilyData = new URL(block.querySelector('a').href);

  const productInfo = await lookupProductData(productFamilyData, productName);
  const specData = buildSpecData(productInfo.Specification);

  const comparisonTitle = block.children[1].children[1].textContent.trim();
  const compareTo = block.children[2].children[1].textContent.split(/\r?\n|\r|\n/g);

  const promises = [];
  compareTo.forEach((name) => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      promises.push(lookupProductData(productFamilyData, trimmed));
    }
  });

  const comparisonData = [];

  await Promise.all(promises.values()).then((results) => {
    results.forEach((data) => {
      comparisonData.push(data);
    });
  });

  block.innerHTML = `
    ${buildSpecTable(placeholders, productName, specData)}
    ${buildComparisonTable(getMetadata('og:image'), placeholders, comparisonTitle, productInfo, specData, comparisonData)}
  `;
}
