import { createTag, lookupProductData } from '../../scripts/scripts.js';
import { createOptimizedPicture, fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const bc = {};
  [...block.children].forEach((row) => {
    if (row.querySelector('a')) {
      bc.sheet = row.querySelector('a').href;
    } else {
      bc.product = row.textContent.trim();
    }
  });

  const prefix = getMetadata('locale');
  const placeholders = await fetchPlaceholders(prefix);

  block.innerHTML = '';

  const accList = createTag('ul');

  const accessoriesInfo = await lookupProductData(bc.sheet, bc.product);
  if (accessoriesInfo.length > 0) {
    const header = createTag('h2');
    header.innerHTML = placeholders.moreaccessorieslabel || 'MORE ACCESSORIES';
    block.append(header);

    const accessories = accessoriesInfo[0].Accessories.split('\n');
    accessories.forEach((acc) => {
      const accLink = placeholders[`${acc}Link`];
      const accImage = placeholders[`${acc}Image`];
      const accLabel = placeholders[`${acc}Label`];
      if (accLink !== undefined || accImage !== undefined || accLabel !== undefined) {
        const accItem = createTag('li');
        accItem.innerHTML = `<a href="${accLink}">
                <div class="productcards-productcard-div">  
                    <div class="productcards-productcard-image">
                        <picture>
                            <img alt="${accLabel} image" src="${accImage}">
                        </picture>
                    </div>
                    <div class="productcards-productcard-body">
                        <p>${accLabel}</p>
                    </div>
                </div> 
           </a>`;
        accList.append(accItem);
        accList.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }])));
      }
    });
    block.append(accList);
  }
}
