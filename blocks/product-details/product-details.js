/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import { lookupProductData, createTag } from '../../scripts/scripts.js';
import { fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const prefix = getMetadata('locale');
  const placeholders = await fetchPlaceholders(prefix);
  const productFamilyData = new URL(block.querySelector('a').href);
  const productName = [...block.children][1].innerText.trim('');
  const productFields = ['Description', 'Applications', 'Spray', 'Usage', 'Features', 'Includes', 'Availability', 'Resources', 'Images'];

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
    if (item) {
      const row = createTag('div', { class: 'row' });
      const label = createTag('div', { class: 'product-label' });
      if (productFields[index] === 'Images') {
        const productImages = item.split('\n');
        const productImage = createTag('img', { class: 'product-image' });
        productImage.setAttribute('src', productImages[0]);
        productImage.setAttribute('alt', 'product-image');
        productImage.setAttribute('src', productImages[0]);
        productImage.setAttribute('alt', 'product-image');

        const productImageZoom = createTag('figure', { class: 'zoom' });
        productImageZoom.setAttribute('style', `background-image : url(${productImage.src})`);

        productImageZoom.append(productImage);
        productImageDiv.append(productImageZoom);

        if (productImages.length > 1) {
          const productImageThumbnailWrapper = createTag('div', { class: 'product-image-thumbnail-wrapper' });
          productImages.forEach((img) => {
            const productImageThumbs = createTag('img', { class: 'product-image-thumbnails' });
            productImageThumbs.setAttribute('src', img);
            productImageThumbs.setAttribute('alt', 'product-image-thumbnail');
            productImageThumbnailWrapper.append(productImageThumbs);
          });
          productImageDiv.append(productImageThumbnailWrapper);
        }
        return;
      }

      if (productFields[index] === 'Resources') {
        label.innerText = placeholders[`${productFields[index]}`.toLowerCase()];
        const itemText = createTag('div', { class: 'product-field' });
        itemText.innerHTML = item;
        row.append(label, itemText);
        productDetails.append(row);
        return;
      }

      label.innerText = placeholders[`${productFields[index]}`.toLowerCase()];
      const itemText = createTag('div', { class: 'product-field' });
      itemText.innerText = item;
      row.append(label, itemText);
      productDetails.append(row);
    }
  });

  block.innerHTML = '';
  productDetailsDiv.append(productImageDiv, productDetails);
  block.append(productDetailsDiv);

  document.querySelector('.zoom')
    .addEventListener('mousemove', (event) => {
      const zoomer = event.currentTarget;
      const { offsetX } = event;
      const { offsetY } = event;
      const x = (offsetX / zoomer.offsetWidth) * 100;
      const y = (offsetY / zoomer.offsetHeight) * 100;
      zoomer.style.backgroundPosition = `${x}% ${y}%`;
    });

  const prodThumbnail = block.querySelectorAll('.product-image-thumbnails');
  const primaryImage = block.querySelector('.product-image');
  const primaryImageZoom = block.querySelector('.zoom');
  prodThumbnail.forEach((el) => {
    el.addEventListener('click', () => {
      primaryImage.setAttribute('src', el.src);
      primaryImageZoom.setAttribute('style', `background-image : url(${el.src})`);
    });
  });

  primaryImage.addEventListener('click', () => {
    const modal = createTag('div', { class: 'product-image-modal' });
    const modalContent = createTag('div', { class: 'product-image-modal-content' });
    const clonePrimary = primaryImage.cloneNode(true);
    modalContent.appendChild(clonePrimary);
    modal.append(modalContent);
    block.append(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  window.addEventListener('click', (event) => {
    const modal = block.querySelector('.product-image-modal');
    if (event.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
      modal.remove();
    }
  });
}
