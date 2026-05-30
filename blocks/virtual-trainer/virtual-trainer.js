/**
 * Virtual Trainer Block
 * EDS block — full-bleed AI-powered course assistant backed by Yukon RAG.
 *
 * DA authoring — add as a table on your page AFTER the ims-auth block:
 * | virtual-trainer |                                          |
 * | collection      | 0d3151f2-74ec-423e-9685-c1f79a6e7f5b   |
 * | course          | EDS Document Authoring for Authors       |
 * | yukon           | https://yukon-stage.adobe.io             |
 *
 * Auth flow:
 *   1. ims-auth block loads imslib and signs the user in
 *   2. ims-auth dispatches 'ims:ready' with { token }
 *   3. this block listens for 'ims:ready' and stores the token
 *   4. every Yukon call uses Authorization: Bearer <token>
 *   5. if 'ims:signedout' fires, block disables input until re-auth
 */

/* ── Yukon API ───────────────────────────────────────────────────────────────
   Calls the Yukon Stage Q&A inference endpoint with the user's IMS token.
   The conversation history is maintained client-side; each call sends the
   full history so Yukon has context for follow-up questions.               */
async function callYukon(messages, collectionId, yukonHost, imsToken) {
  if (!imsToken) throw new Error('No IMS token available — please sign in.');

  /* Build a single question string from the latest user message.
     Yukon Q&A is stateless per-call; we provide context in the question. */
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMsg) throw new Error('No user message found.');

  /* Include recent conversation context for follow-up awareness */
  const recentHistory = messages.slice(-6);
  const contextLines = recentHistory
    .filter((m) => m.role !== 'assistant' || recentHistory.indexOf(m) > 0)
    .map((m) => `${m.role === 'user' ? 'Student' : 'Trainer'}: ${m.content}`)
    .join('\n');

  const question = recentHistory.length > 2
    ? `Conversation so far:\n${contextLines}\n\nCurrent question: ${lastUserMsg.content}`
    : lastUserMsg.content;

  const endpoint = `${yukonHost}/api/v2/inference/question-answer`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${imsToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_id: crypto.randomUUID(),
      collections: [collectionId],
      inputs: question,
      response_format: {
        format: 'AUTO',
        style: 'CONCISE',
        tone: 'AUTO',
        reasoning: 'DISABLED',
      },
      source_options: ['COLLECTION'],
      inference_mode: 'STANDARD',
      file_generation: 'DISABLED',
      time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      enable_figures: true,
      store: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    if (res.status === 401) throw new Error('Session expired — please sign in again.');
    if (res.status === 403) throw new Error('Access denied — your account may not have access to this collection.');
    throw new Error(`Yukon error ${res.status}: ${errText}`);
  }

  const data = await res.json();

  /* Extract answer text from Yukon response shape.
     v2 Q&A returns: { answer: { text: '...' }, attributions: [...] }
     Fall back gracefully if shape differs.                              */
  const answer = data?.answer?.text
    || data?.answer
    || data?.output
    || data?.text
    || data?.response
    || JSON.stringify(data);

  return typeof answer === 'string' ? answer : JSON.stringify(answer);
}

/* ── Course structure ────────────────────────────────────────────────────── */
const MODULES = [
  {
    id: 'm1',
    title: 'Basic Authoring',
    sections: ['Access DA', 'Create a Page', 'Add Content'],
  },
  {
    id: 'm2',
    title: 'Blocks & Document Structure',
    sections: [
      'Add and Delete the Columns Block',
      'Add a Block from the Library',
      'Use the Slash Menu',
      'Create Space Between Blocks',
      'Edit Menu Block Tools',
      'Search Library and Add a Hero Block',
      'Create a Hero Auto-Block',
    ],
  },
  {
    id: 'm3',
    title: 'Preview & Publishing',
    sections: [
      'Explore Live Preview',
      'Preflight Check',
      'Preview the Page',
      'AEM Sidekick (Optional)',
      'Publish the Document',
      'Unpublish the Document',
      'Timeline and Versioning',
      'Folder Status View',
    ],
  },
  {
    id: 'm4',
    title: 'Media & Assets',
    sections: [
      'Drag-and-Drop Images',
      'Images from the assets Folder',
      'AEM Assets Images',
      'Embed Block for Video',
    ],
  },
  {
    id: 'm5',
    title: 'Pages, URLs & Metadata',
    sections: ['Add a Metadata Block'],
  },
  {
    id: 'm6',
    title: 'Reusable Content',
    sections: [
      'Create a Document from a Template',
      'Update the Article',
      'Include a Fragment',
      'Publish and Verify',
    ],
  },
];

const RESOURCES = [
  { icon: '🌐', label: 'DA Live', url: 'https://da.live' },
  { icon: '📖', label: 'EDS Documentation', url: 'https://www.aem.live/docs' },
  { icon: '🔧', label: 'AEM Sidekick', url: 'https://www.aem.live/docs/sidekick' },
  { icon: '📁', label: 'Exercise Files', url: '#' },
];

/* ── Markdown renderer ───────────────────────────────────────────────────── */
function renderMarkdown(raw) {
  const el = document.createElement('span');
  const parts = raw.split(/(!\[[^\]]*\]\([^)]+\))/g);
  parts.forEach((part) => {
    const imgMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const image = document.createElement('img');
      const [, alt, src] = imgMatch;
      image.src = src;
      image.alt = alt;
      image.onerror = () => { image.style.display = 'none'; };
      el.appendChild(image);
    } else {
      const span = document.createElement('span');
      span.innerHTML = part
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
        .replace(/`([^`\n]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
      el.appendChild(span);
    }
  });
  return el;
}

/* ── SVG helpers ─────────────────────────────────────────────────────────── */
const NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function svgAdobeA() {
  const svg = svgEl('svg', {
    width: '26', height: '20', viewBox: '0 0 26 20', fill: 'none',
  });
  svg.appendChild(svgEl('path', { d: 'M15.6 0H26L10.4 20H0L15.6 0Z', fill: 'white' }));
  svg.appendChild(svgEl('path', { d: 'M10.4 0H0V20L10.4 0Z', fill: 'rgba(255,255,255,0.5)' }));
  return svg;
}

function svgPerson(size) {
  const s = size * 0.52;
  const svg = svgEl('svg', {
    width: s, height: s, viewBox: '0 0 24 24', fill: 'none',
  });
  svg.appendChild(svgEl('circle', {
    cx: '12', cy: '8', r: '4', fill: 'white',
  }));
  svg.appendChild(svgEl('path', {
    d: 'M4 20c0-4 3.6-7 8-7s8 3 8 7',
    stroke: 'white',
    'stroke-width': '2.2',
    'stroke-linecap': 'round',
  }));
  return svg;
}

function svgChevron() {
  const svg = svgEl('svg', {
    width: '11', height: '11', viewBox: '0 0 12 12', fill: 'none',
  });
  svg.classList.add('vt-chevron');
  svg.appendChild(svgEl('path', {
    d: 'M4 2.5L7.5 6L4 9.5',
    stroke: '#aaa',
    'stroke-width': '1.5',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }));
  return svg;
}

function svgSend(active) {
  const color = active ? 'white' : '#bbb';
  const svg = svgEl('svg', {
    width: '15', height: '15', viewBox: '0 0 24 24', fill: 'none',
  });
  svg.appendChild(svgEl('path', {
    d: 'M22 2L11 13', stroke: color, 'stroke-width': '2', 'stroke-linecap': 'round',
  }));
  svg.appendChild(svgEl('path', {
    d: 'M22 2L15 22L11 13L2 9L22 2Z',
    stroke: color,
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }));
  return svg;
}

function makeTrainerAvatar(size) {
  const div = document.createElement('div');
  div.className = `vt-trainer-avatar${size === 28 ? ' small' : ''}`;
  div.appendChild(svgPerson(size));
  return div;
}

/* ── Block entry point ───────────────────────────────────────────────────── */
export default function decorate(block) {
  /* ── Read config ── */
  const config = {};
  [...block.children].forEach((row) => {
    const [keyEl, valueEl] = [...row.children];
    if (keyEl && valueEl) {
      config[keyEl.textContent.trim().toLowerCase()] = valueEl.textContent.trim();
    }
  });

  const courseName = config.course || 'Adobe Training Course';
  const collectionId = config.collection || '';
  const yukonHost = config.yukon || 'https://yukon-stage.adobe.io';

  /* ── State ── */
  const state = {
    messages: [{
      role: 'assistant',
      content: `Welcome! I'm your Adobe Virtual Trainer for **${courseName}**.\n\nI'll guide you through each exercise one step at a time.\n\nReady to start with Module 1? Or jump to any section using the panel on the left.`,
    }],
    loading: false,
    imsToken: null,
    openModules: { m1: true },
  };

  /* ── DOM refs ── */
  let messagesEl;
  let chipsEl;
  let textarea;
  let sendBtn;
  let activeSectionEl;
  let userAvatarEl;

  /* ── Helper functions ── */
  function appendMessage(msg) {
    const row = document.createElement('div');
    row.className = `vt-message ${msg.role}`;
    if (msg.role === 'assistant') row.appendChild(makeTrainerAvatar(28));
    const bubble = document.createElement('div');
    bubble.className = `vt-bubble ${msg.role}`;
    if (msg.role === 'assistant') {
      bubble.appendChild(renderMarkdown(msg.content));
    } else {
      bubble.textContent = msg.content;
    }
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'vt-typing';
    row.id = 'vt-typing';
    row.appendChild(makeTrainerAvatar(28));
    const dots = document.createElement('div');
    dots.className = 'vt-typing-dots';
    for (let i = 0; i < 3; i += 1) {
      const d = document.createElement('div');
      d.className = 'vt-dot';
      dots.appendChild(d);
    }
    row.appendChild(dots);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('vt-typing')?.remove();
  }

  function updateSendBtn() {
    const active = textarea.value.trim().length > 0 && !state.loading && !!state.imsToken;
    sendBtn.classList.toggle('active', active);
    sendBtn.innerHTML = '';
    sendBtn.appendChild(svgSend(active));
  }

  /* ── IMS token listeners — registered after helpers are defined ── */
  document.addEventListener('ims:ready', (e) => {
    state.imsToken = e.detail?.token || null;
    if (textarea) {
      textarea.disabled = false;
      textarea.placeholder = "Ask anything, or say 'done' to move to the next step…";
      updateSendBtn();
    }
  });

  document.addEventListener('ims:profile', (e) => {
    const { profile } = e.detail || {};
    if (profile && userAvatarEl) {
      const name = profile.displayName || profile.first_name || '';
      const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2)
        .toUpperCase();
      if (initials) userAvatarEl.textContent = initials;
    }
  });

  document.addEventListener('ims:signedout', () => {
    state.imsToken = null;
    if (textarea) {
      textarea.disabled = true;
      textarea.placeholder = 'Please sign in to continue…';
      updateSendBtn();
    }
  });

  async function sendChat(actualContent, displayContent) {
    if (state.loading || !state.imsToken) return;
    const display = displayContent || actualContent;
    state.messages.push({ role: 'user', content: actualContent });
    appendMessage({ role: 'user', content: display });
    chipsEl.style.display = 'none';
    state.loading = true;
    showTyping();
    updateSendBtn();
    try {
      const text = await callYukon(state.messages, collectionId, yukonHost, state.imsToken);
      state.messages.push({ role: 'assistant', content: text });
      hideTyping();
      appendMessage({ role: 'assistant', content: text });
    } catch (err) {
      hideTyping();
      appendMessage({ role: 'assistant', content: `⚠️ ${err.message || 'Something went wrong. Please try again.'}` });
    }
    state.loading = false;
    updateSendBtn();
  }

  function send() {
    const text = textarea.value.trim();
    if (!text || state.loading || !state.imsToken) return;
    textarea.value = '';
    textarea.style.height = 'auto';
    updateSendBtn();
    sendChat(text);
  }

  function navigateToSection(moduleTitle, sectionTitle, secEl) {
    document.querySelectorAll('.vt-section').forEach((s) => s.classList.remove('active'));
    secEl.classList.add('active');
    activeSectionEl.textContent = `📍 ${moduleTitle} > ${sectionTitle}`;
    activeSectionEl.classList.add('visible');
    sendChat(
      `The student has navigated to the section "${sectionTitle}" in module "${moduleTitle}". Please guide them through this section step by step, including any relevant screenshots.`,
      `Take me to: ${moduleTitle} → ${sectionTitle}`,
    );
  }

  /* ── Build DOM ── */
  block.innerHTML = '';

  /* Header */
  const header = document.createElement('div');
  header.className = 'vt-header';
  const wordmark = document.createElement('div');
  wordmark.className = 'vt-wordmark';
  wordmark.appendChild(svgAdobeA());
  const wmSpan = document.createElement('span');
  wmSpan.textContent = 'Adobe';
  wordmark.appendChild(wmSpan);
  const divider = document.createElement('div');
  divider.className = 'vt-header-divider';
  const headerTitle = document.createElement('div');
  headerTitle.className = 'vt-header-title';
  headerTitle.textContent = 'Virtual Trainer';
  const headerMeta = document.createElement('div');
  headerMeta.className = 'vt-header-meta';
  const headerCourse = document.createElement('div');
  headerCourse.className = 'vt-header-course';
  headerCourse.textContent = courseName;

  userAvatarEl = document.createElement('div');
  userAvatarEl.className = 'vt-avatar';
  userAvatarEl.textContent = '…';

  /* Sign out link */
  const signOutBtn = document.createElement('button');
  signOutBtn.className = 'vt-sign-out';
  signOutBtn.textContent = 'Sign out';
  signOutBtn.addEventListener('click', () => {
    if (window.adobeIMS) window.adobeIMS.signOut();
  });

  headerMeta.appendChild(headerCourse);
  headerMeta.appendChild(userAvatarEl);
  headerMeta.appendChild(signOutBtn);
  header.appendChild(wordmark);
  header.appendChild(divider);
  header.appendChild(headerTitle);
  header.appendChild(headerMeta);

  /* Body */
  const body = document.createElement('div');
  body.className = 'vt-body';

  /* Left panel */
  const left = document.createElement('div');
  left.className = 'vt-left';

  const courseInfo = document.createElement('div');
  courseInfo.className = 'vt-course-info';
  const courseLabel = document.createElement('div');
  courseLabel.className = 'vt-course-label';
  courseLabel.textContent = 'Activity Guide';
  const courseTitle = document.createElement('div');
  courseTitle.className = 'vt-course-title';
  courseTitle.textContent = courseName;
  const courseSub = document.createElement('div');
  courseSub.className = 'vt-course-sub';
  courseSub.textContent = `for Authors · ${MODULES.length} modules`;
  courseInfo.appendChild(courseLabel);
  courseInfo.appendChild(courseTitle);
  courseInfo.appendChild(courseSub);

  const moduleList = document.createElement('div');
  moduleList.className = 'vt-module-list';

  MODULES.forEach((mod, mi) => {
    const modEl = document.createElement('div');
    modEl.className = 'vt-module';
    const modHeader = document.createElement('div');
    modHeader.className = 'vt-module-header';
    const modLeft = document.createElement('div');
    modLeft.className = 'vt-module-header-left';
    const num = document.createElement('div');
    num.className = 'vt-module-number';
    num.textContent = mi + 1;
    const name = document.createElement('div');
    name.className = 'vt-module-name';
    name.textContent = mod.title;
    modLeft.appendChild(num);
    modLeft.appendChild(name);
    const chevron = svgChevron();
    if (state.openModules[mod.id]) chevron.classList.add('open');
    modHeader.appendChild(modLeft);
    modHeader.appendChild(chevron);
    const sections = document.createElement('div');
    sections.className = `vt-sections${state.openModules[mod.id] ? ' open' : ''}`;
    mod.sections.forEach((sec) => {
      const secEl = document.createElement('div');
      secEl.className = 'vt-section';
      secEl.textContent = sec;
      secEl.addEventListener('click', () => navigateToSection(mod.title, sec, secEl));
      sections.appendChild(secEl);
    });
    modHeader.addEventListener('click', () => {
      state.openModules[mod.id] = !state.openModules[mod.id];
      sections.classList.toggle('open', state.openModules[mod.id]);
      chevron.classList.toggle('open', state.openModules[mod.id]);
    });
    modEl.appendChild(modHeader);
    modEl.appendChild(sections);
    moduleList.appendChild(modEl);
  });

  const resources = document.createElement('div');
  resources.className = 'vt-resources';
  const resLabel = document.createElement('div');
  resLabel.className = 'vt-resources-label';
  resLabel.textContent = 'Resources';
  resources.appendChild(resLabel);
  RESOURCES.forEach((r) => {
    const a = document.createElement('a');
    a.className = 'vt-resource-link';
    a.href = r.url;
    a.target = '_blank';
    a.rel = 'noreferrer';
    const icon = document.createElement('span');
    icon.textContent = r.icon;
    const label = document.createElement('span');
    label.textContent = r.label;
    a.appendChild(icon);
    a.appendChild(label);
    resources.appendChild(a);
  });

  left.appendChild(courseInfo);
  left.appendChild(moduleList);
  left.appendChild(resources);

  /* Chat panel */
  const chat = document.createElement('div');
  chat.className = 'vt-chat';

  const chatHeader = document.createElement('div');
  chatHeader.className = 'vt-chat-header';
  const trainerAv = makeTrainerAvatar(34);
  const trainerInfo = document.createElement('div');
  const trainerName = document.createElement('div');
  trainerName.className = 'vt-trainer-name';
  trainerName.textContent = 'Adobe Virtual Trainer';
  const trainerStatus = document.createElement('div');
  trainerStatus.className = 'vt-trainer-status';
  const dot = document.createElement('div');
  dot.className = 'vt-status-dot';
  trainerStatus.appendChild(dot);
  trainerStatus.appendChild(document.createTextNode('Powered by Yukon RAG'));
  trainerInfo.appendChild(trainerName);
  trainerInfo.appendChild(trainerStatus);

  activeSectionEl = document.createElement('div');
  activeSectionEl.className = 'vt-active-section';
  chatHeader.appendChild(trainerAv);
  chatHeader.appendChild(trainerInfo);
  chatHeader.appendChild(activeSectionEl);

  messagesEl = document.createElement('div');
  messagesEl.className = 'vt-messages';

  chipsEl = document.createElement('div');
  chipsEl.className = 'vt-chips';
  ["Let's start Module 1", 'What is DA?', 'Show me the slash menu'].forEach((label) => {
    const chip = document.createElement('button');
    chip.className = 'vt-chip';
    chip.textContent = label;
    chip.addEventListener('click', () => {
      textarea.value = label;
      textarea.dispatchEvent(new Event('input'));
      textarea.focus();
    });
    chipsEl.appendChild(chip);
  });

  const inputArea = document.createElement('div');
  inputArea.className = 'vt-input-area';
  const inputWrap = document.createElement('div');
  inputWrap.className = 'vt-input-wrap';

  textarea = document.createElement('textarea');
  textarea.className = 'vt-textarea';
  textarea.rows = 1;
  textarea.disabled = true;
  textarea.placeholder = 'Signing in…';

  sendBtn = document.createElement('button');
  sendBtn.className = 'vt-send';
  sendBtn.appendChild(svgSend(false));

  const hint = document.createElement('div');
  hint.className = 'vt-input-hint';
  hint.textContent = 'Enter to send · Shift+Enter for new line';

  inputWrap.appendChild(textarea);
  inputWrap.appendChild(sendBtn);
  inputArea.appendChild(inputWrap);
  inputArea.appendChild(hint);

  chat.appendChild(chatHeader);
  chat.appendChild(messagesEl);
  chat.appendChild(chipsEl);
  chat.appendChild(inputArea);

  body.appendChild(left);
  body.appendChild(chat);
  block.appendChild(header);
  block.appendChild(body);

  /* ── Render initial message ── */
  state.messages.forEach((m) => appendMessage(m));

  /* ── Wire events ── */
  textarea.addEventListener('focus', () => inputWrap.classList.add('focused'));
  textarea.addEventListener('blur', () => inputWrap.classList.remove('focused'));
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
    updateSendBtn();
  });
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  sendBtn.addEventListener('click', send);

  /* ── Poll for token if ims:ready already fired before this block registered ── */
  const pollToken = setInterval(() => {
    if (state.imsToken) { clearInterval(pollToken); return; }
    if (!window.adobeIMS?.getAccessToken) return;
    const tokenInfo = window.adobeIMS.getAccessToken();
    const token = tokenInfo && (typeof tokenInfo === 'string' ? tokenInfo : tokenInfo.token);
    if (token) {
      clearInterval(pollToken);
      state.imsToken = token;
      textarea.disabled = false;
      textarea.placeholder = "Ask anything, or say 'done' to move to the next step…";
      updateSendBtn();
    }
  }, 200);

  /* Stop polling after 30s to avoid memory leak */
  setTimeout(() => clearInterval(pollToken), 30000);
}
