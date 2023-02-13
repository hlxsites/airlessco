import { createTag } from '../../scripts/scripts.js';

async function getSizeChart(link) {
  const sizeChartURL = new URL(link.href);
  const resp = await fetch(sizeChartURL);
  const json = await resp.json();

  const table = createTag('table', { class: 'accessories' });
  table.setAttribute('id', 'accessories-table');
  table.classList.add('sortable-theme-bootstrap', 'table-striped');
  table.setAttribute('data-sortable', '');

  const THead = createTag('thead', { class: 'accessories-thead' });
  const THeadTR = createTag('tr', { class: 'accessories--thead-tr' });

  Object.keys(json.data[0]).forEach((item) => {
    const THeadTH = createTag('th', { class: 'accessories--thead-th' });
    const strong = createTag('strong');
    THeadTH.append(strong);
    strong.innerText = item;
    THeadTR.append(THeadTH);
  });

  THead.append(THeadTR);
  const TBody = createTag('tbody', { class: 'accessories-tbody' });
  table.append(THead, TBody);
  json.data.forEach((items) => {
    const TBodyTR = createTag('tr', { class: 'accessories--thead-tr' });
    Object.values(items).forEach((item) => {
      const TBodyTD = createTag('td', { class: 'accessory-data' });
      TBodyTD.append(item);
      TBodyTR.append(TBodyTD);
    });
    TBody.append(TBodyTR);
  });

  return table;
}

export default async function decorate(block) {
  if (block.parentElement.parentElement.children.length === 1) {
    const d = createTag('div', { class: 'default-content-wrapper' });
    block.parentElement.parentElement.insertBefore(d, block.parentElement.parentElement.children[0]);
  }
  const rows = block.querySelectorAll('.accessories-details > div');
  block.setAttribute('role', 'table');
  block.setAttribute('aria-label', 'Semantic Elements');
  block.setAttribute('aria-describedby', 'semantic_elements_table_desc');
  block.setAttribute('aria-rowcount', rows.length);

  const bodyRowGroup = createTag('div', { role: 'rowgroup' });

  let n = 0;
  rows.forEach((row) => {
    row.setAttribute('role', 'row');
    const cells = row.querySelectorAll('div');

    if (cells.length === 1) cells[0].classList.add('row-span');

    if (n === 0) {
      cells.forEach((cell) => {
        cell.setAttribute('role', 'columnheader');
      });
      const tableHeadings = createTag('div', { role: 'rowgroup' });
      tableHeadings.append(row);
      block.insertBefore(tableHeadings, block.firstChild);
      n += 1;
    } else {
      cells.forEach(async (cell) => {
        const links = cell.querySelectorAll('a');
        links.forEach((link) => {
          link.classList.add('resource-link');
        });

        const anchor = cell.querySelector('.button-container>a');
        if (anchor && anchor.href.includes('.json')) {
          cell.removeAttribute('class');
          if (cells.length === 1) cell.classList.add('row-span');
          cell.replaceChildren(await getSizeChart(anchor));
          cell.parentElement.classList.add('size-chart');
        }
      });

      bodyRowGroup.append(row);
    }
  });
  block.append(bodyRowGroup);
}
const accessoriesTitle = document.querySelector('h1');
accessoriesTitle.id = 'accessories-title';
