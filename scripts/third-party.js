//  Load Google Tag Manager
const fireGTM = (w, d, s, l, i) => {
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  const f = d.getElementsByTagName(s)[0];
  const j = d.createElement(s);
  const dl = l !== 'dataLayer' ? `&l=${l}` : '';
  j.type = 'text/partytown';
  j.async = true;
  j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
  f.parentNode.insertBefore(j, f);
};

export default function integrateMartech() {
  fireGTM(window, document, 'script', 'dataLayer', 'GTM-WZ7D96C');
}
