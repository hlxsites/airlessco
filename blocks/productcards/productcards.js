import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    let cardLink;
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'productcards-productcard-image';
      } else if (div.querySelector('a')) {
        const cardHref = div.querySelector('a');
        cardLink = cardHref.href;
        const caption = document.createElement('p');
        caption.innerHTML = cardHref.textContent;
        cardHref.parentNode.replaceChild(caption, cardHref);
        div.className = 'productcards-productcard-body';
      } else div.className = 'productcards-productcard-body';
    });
    li.innerHTML = `<a href ="${cardLink}"> ${li.innerHTML} </a>`;
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
