import { lookupProductData, createTag } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const productFamily = [...block.children][0].innerText.trim('');
  const productName = [...block.children][1].innerText.trim('');
  const productFields = ['Series', 'Applications', 'Spray', 'Usage', 'Features', 'Includes', 'Availability', 'Resources', 'Images'];

  // Make a call to the  product datasheet  and get the json for all fields for the product
  const productData = await lookupProductData(productFamily, productName, productFields);

  const productDetailsDiv = createTag('div', { class: 'product-details-div' });
  const productImageDiv = createTag('div', { class: 'product-images' });
  const productDetails = createTag('div', { class: 'product-details' });

  productData.forEach((item, index) => {
    const row = createTag('div', { class: 'row' });
    const label = createTag('div', { class: 'product-label' });
    if (productFields[index] === 'Images') {
      const productImage = createTag('img', { class: 'product-image' });
      productImage.setAttribute('src', item);
      productImage.setAttribute('alt', 'product-image');
      productImageDiv.append(productImage);
      return;
    }

    if (productFields[index] === 'Resources') {
      label.innerText = productFields[index];
      const itemText = createTag('div', { class: 'product-field' });
      itemText.innerHTML = item;
      row.append(label, itemText);
      productDetails.append(row);
      return;
    }

    label.innerText = productFields[index];
    const itemText = createTag('div', { class: 'product-field' });
    itemText.innerText = item;
    row.append(label, itemText);
    productDetails.append(row);
  });

  block.innerHTML = '';
  productDetailsDiv.append(productImageDiv, productDetails);
  block.append(productDetailsDiv);
}
