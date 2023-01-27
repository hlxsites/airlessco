import { lookupProductData } from '../../scripts/scripts.js';
import { fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';

const imagesHtml = (placeholders, images) => {
  const image = images[0];
  const figure = `
    <figure class="zoom" style="background-image : url(${image})">
      <img src="${image}" alt="${placeholders.productImageAltLabel}">
    </figure>
  `;

  const thumbnails = document.createElement('div');
  thumbnails.classList.add('thumbnail-wrapper');

  let thumbnailHtml = '';
  for (let i = 0; i < images.length; i += 1) {
    let clazz = 'product-thumbnail';
    if (i === 0) {
      clazz += ' active';
    }
    thumbnailHtml += `<a href="${images[i]}" class="${clazz}"><img alt="${placeholders.productImageAltLabel}" src="${images[i]}"></a>`;
  }

  thumbnails.innerHTML = thumbnailHtml;
  return `<div class="images-wrapper">${figure}${thumbnails.outerHTML}</div>`;
};

const detailsHtml = (placeholders, productInfo) => {
  const details = document.createElement('div');
  details.classList.add('details-wrapper');

  ['Description', 'Applications', 'Spray', 'Usage'].forEach((field) => {
    if (!productInfo[field]) {
      return;
    }
    const label = placeholders[field.toLowerCase()] ? placeholders[field.toLowerCase()] : field;
    const fieldDiv = document.createElement('div');
    fieldDiv.classList.add('details-item');
    fieldDiv.innerHTML = `
      <div class="label"><strong>${label}:</strong></div>
      <div class="data">${productInfo[field]}</div>
    `;
    details.appendChild(fieldDiv);
  });

  ['Features', 'Includes', 'Availability'].forEach((field) => {
    if (!productInfo[field]) {
      return;
    }
    const label = placeholders[field.toLowerCase()] ? placeholders[field.toLowerCase()] : field;
    const fieldDiv = document.createElement('div');
    fieldDiv.classList.add('details-item');
    const ul = document.createElement('ul');

    productInfo[field].split(/[\n,]/g).forEach((line) => {
      const li = document.createElement('li');
      li.append(line);
      ul.appendChild(li);
    });

    fieldDiv.innerHTML = `
      <div class="label"><strong>${label}:</strong></div>
      <div class="data">${ul.outerHTML}</div>
    `;
    details.appendChild(fieldDiv);
  });

  /* Skip Resources until bug fixed
  if (productInfo.Resources) {
    const field = 'Resources';
    const label = placeholders[field.toLowerCase()] ? placeholders[field.toLowerCase()] : field;
    const fieldDiv = document.createElement('div');
    fieldDiv.classList.add('details-item');

    fieldDiv.innerHTML = `
      <div class="label"><strong>${label}:</strong></div>
      <div class="data">${productInfo[field]}</div>
    `;

    const links = fieldDiv.querySelectorAll('a');

    details.appendChild(fieldDiv);
  }
   */

  return details.outerHTML;
};

const modalHtml = (placeholders, images) => {
  let html = '';
  for (let i = 0; i < images.length; i += 1) {
    let clazz = '';
    if (i === 0) {
      clazz = ' active';
    }
    html += `<img class="${clazz}" alt="${placeholders.productImageAltLabel}" src="${images[i]}">`;
  }

  return `
    <div class="modal-wrapper">
      <div class="modal-carousel">
        <a href="#" class="previous">${placeholders.previous}</a>
          ${html}
        <a href="#" class="next">${placeholders.next}</a>
      </div>
    </div>
  `;
};

const html = (placeholders, productInfo) => {
  const images = productInfo.Images.split('\n');

  return `
    ${imagesHtml(placeholders, images)}
    ${detailsHtml(placeholders, productInfo)}
    ${modalHtml(placeholders, images)}
  `;
};

const fixModalNav = (modal) => {
  const image = modal.querySelector('img.active');
  if (image.previousElementSibling.tagName.toLowerCase() === 'a') {
    modal.querySelector('.previous').classList.add('disabled');
  } else if (image.nextElementSibling.tagName.toLowerCase() === 'a') {
    modal.querySelector('.next').classList.add('disabled');
  } else {
    const disabled = modal.querySelector('.disabled');
    if (disabled) {
      disabled.classList.remove('disabled');
    }
  }
};

export default async function decorate(block) {
  const prefix = getMetadata('locale');
  const placeholders = await fetchPlaceholders(prefix);
  const productFamilyData = new URL(block.querySelector('a').href);
  const productName = [...block.children][1].innerText.trim();

  // Make a call to the  product datasheet  and get the json for all fields for the product
  const productInfo = await lookupProductData(productFamilyData, productName);

  block.innerHTML = html(placeholders, productInfo);

  const zoom = block.querySelector('.zoom');

  zoom.addEventListener('mousemove', (event) => {
    const { currentTarget, offsetX, offsetY } = event;
    const x = (offsetX / currentTarget.offsetWidth) * 100;
    const y = (offsetY / currentTarget.offsetHeight) * 100;
    currentTarget.style.backgroundPosition = `${x}% ${y}%`;
  });

  // Hide modal if escape pressed.
  window.addEventListener('keyup', (event) => {
    const openModal = block.querySelector('.modal-wrapper.open');
    if (openModal && event.code === 'Escape') {
      event.preventDefault();
      openModal.classList.remove('open');
    }
  });

  const modal = block.querySelector('.modal-wrapper');

  block.querySelector('.images-wrapper img').addEventListener('click', (event) => {
    event.preventDefault();
    fixModalNav(modal);
    modal.classList.add('open');
  });

  const thumbnails = block.querySelectorAll('.thumbnail-wrapper a');
  thumbnails.forEach((a) => {
    a.addEventListener('click', (event) => {
      event.preventDefault();
      block.querySelector('.thumbnail-wrapper a.active').classList.remove('active');
      event.currentTarget.classList.add('active');
      const href = a.getAttribute('href');
      zoom.querySelector('img').setAttribute('src', href);
      zoom.style.backgroundImajge = `url(${href})`;
    });
  });

  modal.addEventListener('click', (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('open');
  });

  const prev = modal.querySelector('.previous');
  prev.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (prev.classList.contains('disabled')) {
      return;
    }
    const active = modal.querySelector('img.active');
    active.previousElementSibling.classList.add('active');
    active.classList.remove('active');
    fixModalNav(modal);
  });

  const next = modal.querySelector('.next');
  next.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (next.classList.contains('disabled')) {
      return;
    }
    const active = modal.querySelector('img.active');
    active.nextElementSibling.classList.add('active');
    active.classList.remove('active');
    fixModalNav(modal);
  });
}
