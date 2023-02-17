import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';

const breakpoints = [
  { media: '(min-width: 1280px)', width: '400' },
  { media: '(min-width: 768px)', width: '300' },
  { width: '250' },
];

async function fetchAccessories(locale, types) {
  const resp = await fetch('/accessory-pages.json');
  const json = await resp.json();
  const accessories = [];

  types.forEach((t) => {
    const found = json.data.find((a) => a.locale.toLowerCase() === locale && a.type === t);
    if (found) {
      accessories.push(found);
    }
  });
  return accessories;
}

export default async function decorate(block) {
  const title = block.children[0].children[1].outerHTML || '<strong>MORE ACCESSORIES</strong>';
  const locale = getMetadata('locale');
  const types = block.children[1].children[1].textContent.split('\n').map((t) => t.trim());

  const accessories = await fetchAccessories(locale, types);

  let html = title;

  html += '<ul>';
  accessories.forEach((acc) => {
    html += `
      <li class="accessory">
        <a href="${acc.path}">
          <div class="accessory-card">
            <div class="accessory-image">
              ${createOptimizedPicture(acc.image, acc['nav-title'], false, breakpoints).outerHTML}
            </div>
            <div class="accessory-body">
                <p>${acc['nav-title']}</p>
            </div>
          </div>
        </a>
     </li>
    `;
  });
  html += '</ul>';
  block.innerHTML = html;
}
