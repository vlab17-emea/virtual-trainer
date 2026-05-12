/**
 * IMS Auth Block
 *
 * Renders a sign-in gate when the user is not authenticated.
 * Once signed in, collapses itself and dispatches 'ims:ready' with the token.
 *
 * DA authoring — add as a table above the virtual-trainer block:
 * | ims-auth |                                      |
 * | env      | stg1                                 |
 * | client   | virtual-trainer-yukon-portal-web     |
 * | scope    | AdobeID,openid,read_organizations    |
 *
 * Other blocks listen for:
 *   document.addEventListener('ims:ready', (e) => { e.detail.token })
 *   document.addEventListener('ims:signedout', () => { ... })
 */

const IMS_LIB = {
  stg1: 'https://auth-stg1.services.adobe.com/imslib/imslib.min.js',
  prod: 'https://auth.services.adobe.com/imslib/imslib.min.js',
};

const DEFAULT_SCOPE = 'AdobeID,openid,read_organizations,additional_info.ownerOrg';

/* ── SVG Adobe wordmark ── */
function svgAdobeA() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '32');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 26 20');
  svg.setAttribute('fill', 'none');
  const p1 = document.createElementNS(ns, 'path');
  p1.setAttribute('d', 'M15.6 0H26L10.4 20H0L15.6 0Z');
  p1.setAttribute('fill', '#fa0f00');
  const p2 = document.createElementNS(ns, 'path');
  p2.setAttribute('d', 'M10.4 0H0V20L10.4 0Z');
  p2.setAttribute('fill', '#ff6251');
  svg.appendChild(p1);
  svg.appendChild(p2);
  return svg;
}

/* ── Loading screen ── */
function showLoading(container, message) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'ims-loading';
  const spinner = document.createElement('div');
  spinner.className = 'ims-spinner';
  const p = document.createElement('p');
  p.textContent = message || 'Loading…';
  wrap.appendChild(spinner);
  wrap.appendChild(p);
  container.appendChild(wrap);
}

/* ── Sign-in gate ── */
function showGate(container) {
  container.innerHTML = '';
  const gate = document.createElement('div');
  gate.className = 'ims-gate';

  const card = document.createElement('div');
  card.className = 'ims-gate-card';

  const logo = document.createElement('div');
  logo.className = 'ims-gate-logo';
  logo.appendChild(svgAdobeA());
  const logoText = document.createElement('span');
  logoText.textContent = 'Virtual Trainer';
  logo.appendChild(logoText);

  const divider = document.createElement('div');
  divider.className = 'ims-gate-divider';

  const text = document.createElement('div');
  text.className = 'ims-gate-text';
  const h2 = document.createElement('h2');
  h2.textContent = 'Sign in to continue';
  const p = document.createElement('p');
  p.textContent = 'Use your Adobe ID to access your training session.';
  text.appendChild(h2);
  text.appendChild(p);

  const btn = document.createElement('button');
  btn.className = 'ims-sign-in-btn';
  btn.textContent = 'Sign in with Adobe ID';
  btn.addEventListener('click', () => {
    showLoading(container, 'Redirecting to Adobe sign in…');
    window.adobeIMS.signIn();
  });

  const footer = document.createElement('p');
  footer.className = 'ims-gate-footer';
  footer.textContent = 'Your Adobe ID is required to access this training portal.';

  card.appendChild(logo);
  card.appendChild(divider);
  card.appendChild(text);
  card.appendChild(btn);
  card.appendChild(footer);
  gate.appendChild(card);
  container.appendChild(gate);
}

/* ── Block entry point ── */
export default function decorate(block) {
  /* Read config from block table */
  const config = {};
  [...block.children].forEach((row) => {
    const [keyEl, valueEl] = [...row.children];
    if (keyEl && valueEl) {
      config[keyEl.textContent.trim().toLowerCase()] = valueEl.textContent.trim();
    }
  });

  const env = config.env || 'stg1';
  const clientId = config.client || '';
  const scope = config.scope || DEFAULT_SCOPE;
  const libUrl = IMS_LIB[env] || IMS_LIB.stg1;

  /* Clear raw table, show loading */
  block.innerHTML = '';
  showLoading(block, 'Checking sign-in status…');

  /* Configure IMS before loading the library */
  window.adobeid = {
    client_id: clientId,
    scope,
    locale: 'en_US',
    environment: env,
    autoValidateToken: false,
    onAccessToken(tokenInfo) {
      /* Fires with { token, expire, sid } when user is signed in */
      const token = typeof tokenInfo === 'string' ? tokenInfo : (tokenInfo?.token || null);
      if (token) {
        block.classList.add('signed-in');
        block.innerHTML = '';
        document.dispatchEvent(new CustomEvent('ims:ready', {
          detail: { token },
        }));
        /* Fetch profile async */
        window.adobeIMS.getProfile().then((profile) => {
          document.dispatchEvent(new CustomEvent('ims:profile', {
            detail: { token, profile },
          }));
        }).catch(() => {});
      }
    },
    onReady() {
      /* onAccessToken already fired if signed in.
         If we reach onReady and block is not yet signed-in, show gate. */
      if (!block.classList.contains('signed-in')) {
        showGate(block);
      }
    },
    onError(error) {
      block.innerHTML = '';
      const msg = document.createElement('p');
      msg.style.cssText = 'text-align:center;padding:40px;color:#888;font-size:14px;';
      msg.textContent = `Sign-in error: ${error?.message || 'Unknown error'}. Please refresh and try again.`;
      block.appendChild(msg);
    },
    onSignOut() {
      document.dispatchEvent(new CustomEvent('ims:signedout'));
      block.classList.remove('signed-in');
      showGate(block);
    },
  };

  /* Load imslib */
  const script = document.createElement('script');
  script.src = libUrl;
  script.async = true;
  script.onerror = () => {
    block.innerHTML = '';
    const msg = document.createElement('p');
    msg.style.cssText = 'text-align:center;padding:40px;color:#888;font-size:14px;';
    msg.textContent = 'Unable to load sign-in library. Please check your connection and refresh.';
    block.appendChild(msg);
  };
  document.head.appendChild(script);
}
