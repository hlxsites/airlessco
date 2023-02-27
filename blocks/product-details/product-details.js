import { createOptimizedPicture, fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import { lookupProductData } from '../../scripts/scripts.js';

let pictures;

/**
 * @returns {Promise<NodeList>}
 */
const fetchImages = async (url) => {
  if (!pictures) {
    const resp = await fetch(`${url}.plain.html`);
    if (resp.ok) {
      const tmp = document.createElement('div');
      tmp.innerHTML = await resp.text();
      pictures = tmp.querySelectorAll('picture');
    }
  }
  return pictures;
};

const imagesHtml = async (imageUrl) => {
  const images = await fetchImages(imageUrl);
  const wrapper = document.createElement('div');
  wrapper.classList.add('images-wrapper');

  const figures = document.createElement('div');
  figures.classList.add('figures');
  wrapper.append(figures);

  const thumbnails = document.createElement('div');
  thumbnails.classList.add('thumbnails');

  let i = 0;
  Object.values(images).forEach((picture) => {
    const img = picture.querySelector('img');

    const fig = document.createElement('figure');
    fig.classList.add('zoom');
    if (i === 0) {
      fig.classList.add('active');
      img.setAttribute('loading', 'eager');
    } else {
      img.setAttribute('loading', 'lazy');
    }
    fig.setAttribute('data-figure', `figure-${i}`);
    fig.append(picture);
    figures.append(fig);

    const thumb = document.createElement('a');
    thumb.setAttribute('href', '#');
    thumb.setAttribute('data-figure', `figure-${i}`);
    thumb.classList.add('product-thumbnail');
    if (i === 0) {
      thumb.classList.add('active');
    }
    thumb.append(createOptimizedPicture(img.getAttribute('src'), img.getAttribute('alt'), false, [{ width: 200 }]));
    thumbnails.append(thumb);
    i += 1;
  });

  if (images.length > 1) {
    wrapper.append(thumbnails);
  }

  return wrapper.outerHTML;
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

    productInfo[field].split(/\r?\n|\r|\n/g).forEach((line) => {
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

  if (productInfo.Resources) {
    const field = 'Resources';
    const label = placeholders[field.toLowerCase()] ? placeholders[field.toLowerCase()] : field;
    const fieldDiv = document.createElement('div');
    fieldDiv.classList.add('details-item', 'resources');

    fieldDiv.innerHTML = `
      <div class="label"><strong>${label}:</strong></div>
      <div class="data">${productInfo[field]}</div>
    `;
    const links = fieldDiv.querySelectorAll('a');
    Object.values(links).forEach((a) => {
      a.setAttribute('target', 'new');
    });
    details.appendChild(fieldDiv);
  }

  return details.outerHTML;
};

const modalHtml = async (placeholders, imageUrl) => {
  const images = await fetchImages(imageUrl);

  const wrapper = document.createElement('div');
  wrapper.classList.add('modal-wrapper');

  const carousel = document.createElement('div');
  carousel.classList.add('modal-carousel');
  wrapper.append(carousel);

  let a = document.createElement('a');
  a.setAttribute('href', '#');
  a.classList.add('previous');
  a.textContent = placeholders.previous;
  carousel.append(a);

  let i = 0;
  Object.values(images).forEach((picture) => {
    if (i === 0) {
      picture.classList.add('active');
    }
    picture.setAttribute('data-figure', `figure-${i}`);
    carousel.append(picture);
    i += 1;
  });

  a = document.createElement('a');
  a.setAttribute('href', '#');
  a.classList.add('next');
  a.textContent = placeholders.next;
  carousel.append(a);

  return wrapper.outerHTML;
};

const html = async (placeholders, productInfo, imageUrl) => `
    ${await imagesHtml(imageUrl)}
    ${detailsHtml(placeholders, productInfo)}
    ${await modalHtml(placeholders, imageUrl)}
  `;

const fixModalNav = (modal) => {
  const image = modal.querySelector('picture.active');
  if (image.previousElementSibling.tagName.toLowerCase() === 'a') {
    modal.querySelector('.previous').classList.add('disabled');
  } else if (modal.querySelector('.previous.disabled')) {
    modal.querySelector('.previous.disabled').classList.remove('disabled');
  }
  if (image.nextElementSibling.tagName.toLowerCase() === 'a') {
    modal.querySelector('.next').classList.add('disabled');
  } else if (modal.querySelector('.next.disabled')) {
    modal.querySelector('.next.disabled').classList.remove('disabled');
  }
};

export default async function decorate(block) {
  const prefix = getMetadata('locale');
  const placeholders = await fetchPlaceholders(prefix);
  const productFamilyData = new URL(block.querySelector('a').href);
  const productName = block.children[0].children[0].textContent.trim();
  const imageUrl = block.children[1].children[1].querySelector('a').getAttribute('href');

  // Make a call to the  product datasheet  and get the json for all fields for the product
  const productInfo = await lookupProductData(productFamilyData, productName);

  block.innerHTML = await html(placeholders, productInfo, imageUrl);

  const zooms = block.querySelectorAll('.zoom');

  zooms.forEach((z) => {
    z.addEventListener('mousemove', (event) => {
      const { currentTarget, offsetX, offsetY } = event;
      const x = (offsetX / currentTarget.offsetWidth) * 100;
      const y = (offsetY / currentTarget.offsetHeight) * 100;
      currentTarget.style.backgroundPosition = `${x}% ${y}%`;
    });
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

  block.querySelectorAll('.images-wrapper .figures img').forEach((img) => {
    img.addEventListener('click', (event) => {
      event.preventDefault();
      fixModalNav(modal);
      modal.classList.add('open');
    });
    img.addEventListener('load', () => {
      img.closest('figure').style.backgroundImage = `url(${img.currentSrc})`;
    });
  });

  const thumbnails = block.querySelectorAll('.thumbnails a');
  thumbnails.forEach((a) => {
    a.addEventListener('click', (event) => {
      event.preventDefault();
      if (event.currentTarget.classList.contains('active')) {
        return;
      }

      block.querySelector('.images-wrapper figure.active').classList.remove('active');
      block.querySelector('.thumbnails a.active').classList.remove('active');
      block.querySelector('.modal-wrapper picture.active').classList.remove('active');

      const figure = event.currentTarget.getAttribute('data-figure');
      event.currentTarget.classList.add('active');
      block.querySelector(`.images-wrapper figure[data-figure=${figure}]`).classList.add('active');
      block.querySelector(`.modal-wrapper picture[data-figure=${figure}]`).classList.add('active');

      fixModalNav(block.querySelector('.modal-wrapper'));
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
    const active = modal.querySelector('picture.active');
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
    const active = modal.querySelector('picture.active');
    active.nextElementSibling.classList.add('active');
    active.classList.remove('active');
    fixModalNav(modal);
  });
}
