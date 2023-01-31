import { createOptimizedPicture, fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import { lookupProductData } from '../../scripts/scripts.js';

const breakpoints = [
  { media: '(min-width: 1280px)', width: '400' },
  { media: '(min-width: 768px)', width: '300' },
  { media: '(min-width: 400px)', width: '250' },
];

export default async function decorate(block) {
  const product = block.children[0].children[0].textContent.trim();
  const sheet = block.querySelector('a').href;

  const placeholders = await fetchPlaceholders(getMetadata('locale'));
  const accessoriesInfo = await lookupProductData(sheet, product);
  if (accessoriesInfo) {
    let html = `<h2><strong>${block.children[1].children[1].textContent.trim() || '<strong>MORE ACCESSORIES</strong>'}</strong></h2>`;

    html += '<ul>';
    const accessories = accessoriesInfo.Accessories.split('\n');
    accessories.forEach((acc) => {
      const link = placeholders[`${acc}Link`];
      const image = placeholders[`${acc}Image`];
      const label = placeholders[`${acc}Label`];
      if (link && image && label) {
        html += `
            <li class="accessory">
              <a href="${link}">
                <div class="accessory-card">
                  <div class="accessory-image">
                    ${createOptimizedPicture(image, label, false, breakpoints).outerHTML}
                  </div>
                  <div class="accessory-body">
                      <p>${label}</p>
                  </div>
                </div>
              </a>
           </li>
        `;
      }
    });
    html += '</ul>';
    // const div = document.createElement('div');
    // div.innerHTML = html;
    // div.querySelectorAll('img').forEach((img) => {
    //   img.setAttribute('height', '400');
    //   img.setAttribute('width', '400');
    // });
    // block.innerHTML = //div.innerHTML;
    block.innerHTML = html;
  }
}
