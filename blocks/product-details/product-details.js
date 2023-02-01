import { createOptimizedPicture, fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import { lookupProductData } from '../../scripts/scripts.js';

const breakpoints = [
  { media: '(min-width: 1600px)', width: '2000' },
  { media: '(min-width: 1280px)', width: '1280' },
  { media: '(min-width: 1024px)', width: '1024' },
  { width: '768' },
];

const imagesHtml = (placeholders, images) => {
  let figureHtml = '';
  let thumbnailHtml = '';

  for (let i = 0; i < images.length; i += 1) {
    const image = images[i];
    let eager = false;
    if (i === 0) {
      eager = true;
    }
    figureHtml += `
    <figure class="zoom ${i === 0 ? 'active' : ''}" data-figure="figure-${i}">
      ${createOptimizedPicture(image, placeholders.productImageAltLabel, eager, breakpoints).outerHTML}
    </figure>
    `;

    const dom = createOptimizedPicture(image, placeholders.productImageAltLabel, false, [{ width: 200 }]);
    thumbnailHtml += `<a href="#" class="product-thumbnail ${i === 0 ? 'active' : ''}" data-figure="figure-${i}">${dom.outerHTML}</a>`;
  }
  return `
    <div class="images-wrapper">
      <div class="figures">
        ${figureHtml}
      </div>
      <div class="thumbnails">
        ${thumbnailHtml}
      </div>  
    </div>
  `;
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
      a.prepend(document.createElement('i'));
      a.setAttribute('target', 'new');
    });
    details.appendChild(fieldDiv);
  }

  return details.outerHTML;
};

const modalHtml = (placeholders, images) => {
  let html = '';
  for (let i = 0; i < images.length; i += 1) {
    const dom = createOptimizedPicture(images[i], placeholders.productImageAltLabel, false, breakpoints);
    if (i === 0) {
      dom.classList.add('active');
    }
    dom.setAttribute('data-figure', `figure-${i}`);
    html += dom.outerHTML;
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
  const image = modal.querySelector('picture.active');
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

const fixBackgroundImg = (block) => {
  block.querySelectorAll('figure').forEach((f) => {
    const src = f.querySelector('img').currentSrc;
    f.style.backgroundImage = `url(${src})`;
  });
};

export default async function decorate(block) {
  const prefix = getMetadata('locale');
  const placeholders = await fetchPlaceholders(prefix);
  const productFamilyData = new URL(block.querySelector('a').href);
  const productName = block.children[0].children[0].textContent.trim();

  // Make a call to the  product datasheet  and get the json for all fields for the product
  const productInfo = await lookupProductData(productFamilyData, productName);

  block.innerHTML = html(placeholders, productInfo);

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
