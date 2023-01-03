import { lookupProductData, createTag } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const productFamilyData = new URL(block.querySelector('a').href).pathname;
  const productName = [...block.children][1].innerText.trim('');
  const productFields = ['Series', 'Applications', 'Spray', 'Usage', 'Features', 'Includes', 'Availability', 'Resources', 'Images'];

  // Make a call to the  product datasheet  and get the json for all fields for the product
  const productInfo = await lookupProductData(productFamilyData, productName);

  const productData = [];

  productInfo.forEach((product) => {
    productFields.forEach((productField) => {
      productData.push(product[productField]);
    });
  });

  const productDetailsDiv = createTag('div', { class: 'product-details-div' });
  const productImageDiv = createTag('div', { class: 'product-images' });
  const productDetails = createTag('div', { class: 'product-details' });

  productData.forEach((item, index) => {
    const row = createTag('div', { class: 'row' });
    const label = createTag('div', { class: 'product-label' });
    if (productFields[index] === 'Images') {
      const productImages = item.split('\n');
      const productImage = createTag('img', { class: 'product-image' });
      productImage.setAttribute('src', productImages[0]);
      productImage.setAttribute('alt', 'product-image');
      productImage.setAttribute('src', productImages[0]);
      productImage.setAttribute('alt', 'product-image');
      productImageDiv.append(productImage);

      if (productImages.length > 1) {
        const productImageThumbnailWrapper = createTag('div', { class: 'product-image-thumbnail-wrapper' });
        productImages.forEach((img) => {
          const productImageThumbs = createTag('img', { class: 'product-image-thumbnails' });
          productImageThumbs.setAttribute('src', img);
          productImageThumbs.setAttribute('alt', 'product-image-thumbnail');
          productImageThumbnailWrapper.append(productImageThumbs);
          console.log(img);
        });
        productImageDiv.append(productImageThumbnailWrapper);
      }
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
