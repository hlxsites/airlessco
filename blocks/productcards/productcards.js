export default function decorate(block) {
  // Each child is a product and becomes a list item.
  Object.values(block.children).forEach((product) => {
    product.classList.add('productcard');
    const link = product.querySelector('a');

    const anchor = document.createElement('a');
    if (link) {
      anchor.setAttribute('href', link.getAttribute('href'));
      anchor.setAttribute('title', link.getAttribute('title'));
    }
    product.appendChild(anchor);

    const image = product.children[0];
    const body = product.children[1];

    anchor.appendChild(image);
    anchor.appendChild(body);

    image.classList.add('productcard-image');
    body.classList.add('productcard-body');

    const text = document.createTextNode(link.textContent);
    body.replaceChild(text, link);
  });
  let accessoriesTitle = document.querySelector("h1");
  accessoriesTitle.id = "accessories-title";
}
