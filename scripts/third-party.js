//  Load Google Tag Manager
const GTM_SCRIPT = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WZ7D96C');`;

export const GEO_REDIRECT_SCRIPT = `
(function(g,e,o,t,a,r,ge,tl,y,s){
  g.getElementsByTagName(o)[0].insertAdjacentHTML('afterbegin','<style id="georedirect1647981865762style">body{opacity:0.0 !important;}</style>');
  s=function(){g.getElementById('georedirect1647981865762style').innerHTML='body{opacity:1.0 !important;}';};
  t=g.getElementsByTagName(o)[0];y=g.createElement(e);y.async=true;
  y.src='https://geotargetly-api-1.com/gr?id=-MynMufoFUu8XwDj2n_P&refurl='+g.referrer+'&winurl='+encodeURIComponent(window.location);
  t.parentNode.insertBefore(y,t)
  y.onerror=function(){s()};
  georedirect1647981865762loaded=function(redirect){var to=0;if(redirect){to=5000};setTimeout(function(){s();},to)};
})(document,'script','head');`;

function createInlineScript(innerHTML, parent) {
  const script = document.createElement('script');
  script.type = 'text/partytown';
  script.innerHTML = innerHTML;
  parent.appendChild(script);
}

export function integrateMartech() {
  createInlineScript(GTM_SCRIPT, document.body);
}
