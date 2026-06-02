/**
 * Virtual Trainer Block
 * EDS block — full-bleed AI-powered course assistant backed by Yukon RAG.
 *
 * DA authoring — add as a table on your page AFTER the ims-auth block:
 * | virtual-trainer |                                          |
 * | collection      | 0d3151f2-74ec-423e-9685-c1f79a6e7f5b   |
 * | collection2     | 153b1fb9-1d5d-4b77-b0ea-1fecaa376d95   |
 * | collection3     | <status-collection-id>                 |
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
async function callYukon(messages, collectionIds, yukonHost, imsToken) {
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
  const collections = Array.isArray(collectionIds) ? collectionIds : [collectionIds];

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${imsToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_id: crypto.randomUUID(),
      collections,
      inputs: question,
      response_format: {
        format: 'AUTO',
        style: 'CONCISE',
        tone: 'EMPATHETIC',
        reasoning: 'DISABLED',
        custom_instructions: `You are the Cohort Companion for the Adobe Experience Platform 6-week learning cohort: "Configure and Manage Adobe Experience Platform".

CURRENT CONTEXT:
- It is Week 2 of 6. Week 1 is complete.
- The Monday 1 June session has been completed. The next session is Thursday 4 June at 15:00 CEST.
- Week 2 topics: sandbox management, XDM schema design (attributes and events), data governance, connecting schemas to datasets.

BEHAVIOUR:
- Be warm, encouraging and practical. Speak like a knowledgeable peer, not a helpdesk or product manual.
- Keep answers focused and digestible. Students are busy — give a clear, direct answer first, then offer to go deeper if needed. Do not write long responses unprompted.
- When a student mentions they missed a session, acknowledge it supportively and help them catch up rather than just listing content.
- Use document metadata (week number, session type, document type) to provide contextually relevant answers.
- The capstone project is required for completion credit — mention it proactively when relevant.
- The cohort is global and EMEA-based. Use clear language and avoid idioms that do not translate well.
- Do not include citation superscripts such as [^1] or [^2] in your responses. Do not reference document sources inline.
- If the answer is not clearly supported by the course materials, say so honestly. Do not guess. Suggest the student ask their instructor or check Experience League directly at experienceleague.adobe.com.`,
      },
      source_options: ['COLLECTION'],
      inference_mode: 'STANDARD',
      file_generation: 'DISABLED',
      time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      enable_figures: false,
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
  const answer = data?.generated_text
    || data?.answer?.text
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
    id: 'w1',
    title: 'Week 1: Platform Orientation',
    sections: [
      'ALM Platform Navigation',
      'Cohort Orientation & Expectations',
      'Get Started with Experience Platform',
      'Verify Existing Data Structure',
      'Dataflow Architecture Overview',
    ],
  },
  {
    id: 'w2',
    title: 'Week 2: Data Modeling',
    sections: [
      'Manage Sandbox Packages',
      'Create Attribute XDM Schemas',
      'Create Event XDM Schemas',
      'Manage Data Governance',
      'Connect Schema to Dataset',
    ],
  },
  {
    id: 'w3',
    title: 'Week 3: Data Ingestion',
    sections: [
      'Ingest via Source Connector',
      'Ingest via API',
      'Ingest via Streaming',
      'Monitor Dataflow',
      'Manage Data Hygiene',
    ],
  },
  {
    id: 'w4',
    title: 'Week 4: Data Collection',
    sections: [
      'Introduction to Data Collection',
      'Create Tag Properties',
      'Stream Website Data to AEP',
      'Real-Time Customer Profile',
    ],
  },
  {
    id: 'w5',
    title: 'Week 5: Audiences & Activation',
    sections: [
      'Create Audiences',
      'Configure Destinations',
      'Activate Audiences to Destinations',
      'Query Data from Data Lake',
    ],
  },
  {
    id: 'w6',
    title: 'Week 6: Capstone & Wrap-Up',
    sections: [
      'Capstone Project Preparation',
      'Peer Review Sessions',
      'Capstone Presentations',
      'Certification Exam Preparation',
      'Course Wrap-Up & Reflections',
    ],
  },
];

const RESOURCES = [
  { icon: '🌐', label: 'AEP Documentation', url: 'https://experienceleague.adobe.com/docs/experience-platform.html' },
  { icon: '📚', label: 'Experience League', url: 'https://experienceleague.adobe.com' },
  { icon: '🎓', label: 'My Cohorts', url: 'https://learning.adobe.com' },
  { icon: '💬', label: 'Community Forums', url: 'https://experienceleaguecommunities.adobe.com' },
];

/* ── Markdown renderer ───────────────────────────────────────────────────── */
function renderMarkdown(raw) {
  const BASE = 'https://main--virtual-trainer--vlab17-emea.aem.live/activity-guide-images/week2';
  const el = document.createElement('span');
  /* Split on both standard markdown images and {{img:...}} tokens */
  const parts = raw.split(/(!\[[^\]]*\]\([^)]+\)|\{\{img:[^}]+\}\})/g);
  parts.forEach((part) => {
    const imgMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    const tokenMatch = part.match(/^\{\{img:([^}]+)\}\}$/);
    if (imgMatch) {
      const image = document.createElement('img');
      const [, alt, src] = imgMatch;
      image.src = src;
      image.alt = alt;
      image.className = 'vt-activity-img';
      image.onerror = () => { image.style.display = 'none'; };
      el.appendChild(image);
    } else if (tokenMatch) {
      const [, imgName] = tokenMatch;
      const image = document.createElement('img');
      image.src = `${BASE}/${imgName}.png`;
      image.alt = imgName;
      image.className = 'vt-activity-img';
      image.loading = 'lazy';
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
  const div = document.createElement('div');
  const s = '<svg width="34" height="26" viewBox="0 0 26 20" fill="none"'
    + ' xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M15.6 0H26L10.4 20H0L15.6 0Z" fill="#eb1000"/>'
    + '<path d="M10.4 0H0V20L10.4 0Z" fill="#ff6251"/></svg>';
  div.innerHTML = s;
  return div.firstChild;
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
    width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
  });
  svg.appendChild(svgEl('path', {
    d: 'M12 19V5M5 12l7-7 7 7',
    stroke: color,
    'stroke-width': '2.5',
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

  const courseName = config.course || 'Configure and Manage Adobe Experience Platform';
  const collectionId = config.collection || '';
  const collectionId2 = config.collection2 || '';
  const collectionId3 = config.collection3 || '';
  const collectionIds = [collectionId, collectionId2, collectionId3].filter(Boolean);
  const yukonHost = config.yukon || 'https://yukon-stage.adobe.io';

  /* ── State ── */
  const state = {
    messages: [{
      role: 'assistant',
      content: 'Hi! I\'m your **Cohort Companion** for *Configure and Manage Adobe Experience Platform*.\n\nI can help you catch up on sessions you missed, answer AEP questions, and guide you through this week\'s activities.\n\nWhat do you need help with today?',
    }],
    loading: false,
    imsToken: null,
    openModules: { w2: true },
  };

  /* ── DOM refs ── */
  let messagesEl;
  let chipsEl;
  let textarea;
  let sendBtn;
  let activeSectionEl;
  let userAvatarEl;

  const BASE_IMG = 'https://main--virtual-trainer--vlab17-emea.aem.live/activity-guide-images/week2';

  const ACTIVITY_IMAGES = {
    2.2: { slug: 'activity-2-2-roles-permissions', count: 9 },
    2.3: { slug: 'activity-2-3-import-package', count: 11 },
    2.4: { slug: 'activity-2-4-attribute-schema', count: 23 },
    2.5: { slug: 'activity-2-5-event-schema', count: 10 },
    2.6: { slug: 'activity-2-6-data-usage-policy', count: 7 },
    2.7: { slug: 'activity-2-7-governance-labels', count: 6 },
    2.8: { slug: 'activity-2-8-schema-relationships', count: 20 },
    '2.10': { slug: 'activity-2-10-schema-api', count: 20 },
  };

  function detectActivity(text) {
    const m = text.match(/Activity\s+(2\.(?:10|\d))/i);
    return m ? m[1] : null;
  }

  function showActivityImages(activityId, responseText) {
    const def = ACTIVITY_IMAGES[activityId];
    if (!def) return;

    /* Find the last assistant message bubble and rebuild it with images interleaved */
    const bubbles = messagesEl.querySelectorAll('.vt-bubble.assistant');
    const lastBubble = bubbles[bubbles.length - 1];
    if (!lastBubble) return;

    /* Split response into numbered steps */
    const steps = responseText.split(/(?=\n?\d+\.\s)/);

    /* Rebuild bubble with images after each numbered step */
    lastBubble.innerHTML = '';
    let imgIndex = 0;

    steps.forEach((step) => {
      if (!step.trim()) return;

      /* Render the step text */
      const stepEl = renderMarkdown(step);
      lastBubble.appendChild(stepEl);

      /* Insert next screenshot if available */
      if (imgIndex < def.count) {
        imgIndex += 1;
        const num = String(imgIndex).padStart(2, '0');
        const url = `${BASE_IMG}/${def.slug}-${num}.png`;
        const img = document.createElement('img');
        img.src = url;
        img.alt = `Activity ${activityId} step ${imgIndex}`;
        img.className = 'vt-activity-img';
        img.loading = 'lazy';
        lastBubble.appendChild(img);
      }
    });
  }

  /* ── Helper functions ── */
  /* ── Lightbox ── */
  const lightbox = document.createElement('div');
  lightbox.className = 'vt-lightbox';
  lightbox.hidden = true;
  const lightboxImg = document.createElement('img');
  lightboxImg.className = 'vt-lightbox-img';
  const lightboxClose = document.createElement('button');
  lightboxClose.className = 'vt-lightbox-close';
  lightboxClose.textContent = '✕';
  lightboxClose.setAttribute('aria-label', 'Close');
  lightbox.appendChild(lightboxImg);
  lightbox.appendChild(lightboxClose);
  document.body.appendChild(lightbox);

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* Delegate click on any activity image */
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('vt-activity-img')) {
      openLightbox(e.target.src);
    }
  });

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

  const ISSUE_KEYWORDS = [
    'slow', 'performance', 'degradation', 'service status',
    'known issue', 'outage', 'incident', 'not working', 'taking ages',
  ];

  const CHECK_KEYWORDS = [
    'check my', 'verify', 'did i do it right', 'sandbox correct',
    'check the sandbox', 'check my work', 'set up correctly',
    'done the exercises', 'finished the exercises', 'check my setup',
  ];

  function isKnownIssueResponse(text) {
    const lower = text.toLowerCase();
    return ISSUE_KEYWORDS.some((kw) => lower.includes(kw));
  }

  function showExerciseCheckCard() {
    if (messagesEl.querySelector('.vt-check-card')) return;

    const card = document.createElement('div');
    card.className = 'vt-check-card';

    const checking = document.createElement('div');
    checking.className = 'vt-check-status';
    checking.textContent = '🔍 Checking your AEP environment...';
    card.appendChild(checking);
    messagesEl.appendChild(card);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    setTimeout(() => {
      checking.remove();

      const title = document.createElement('div');
      title.className = 'vt-check-title';
      title.textContent = 'Week 2 Exercise Check — rob-freeman-dev';

      const results = document.createElement('div');
      results.className = 'vt-check-results';

      [
        { ok: true, text: 'Sandbox `rob-freeman-dev` active and correctly provisioned' },
        { ok: true, text: 'Profile schema created with correct class and field groups' },
        { ok: true, text: 'ExperienceEvent schema created correctly' },
        { ok: false, text: 'Dataset not yet linked to Profile schema — revisit Exercise 4, Step 3' },
        { ok: true, text: 'Data governance label C2 applied to identity fields' },
      ].forEach(({ ok, text }) => {
        const row = document.createElement('div');
        row.className = `vt-check-row ${ok ? 'pass' : 'warn'}`;
        const icon = document.createElement('span');
        icon.className = 'vt-check-icon';
        icon.textContent = ok ? '✅' : '⚠️';
        const label = document.createElement('span');
        label.textContent = text;
        row.appendChild(icon);
        row.appendChild(label);
        results.appendChild(row);
      });

      const summary = document.createElement('div');
      summary.className = 'vt-check-summary';
      summary.textContent = 'Nearly there — just the dataset link to fix. That\'s a 5-minute task and you\'ll be fully ready for Thursday.';

      card.appendChild(title);
      card.appendChild(results);
      card.appendChild(summary);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 2000);
  }

  function showNotificationCard() {
    /* Don't show more than once */
    if (messagesEl.querySelector('.vt-notify-card')) return;

    const card = document.createElement('div');
    card.className = 'vt-notify-card';

    const cardText = document.createElement('div');
    cardText.className = 'vt-notify-text';
    cardText.textContent = '2 cohort members have reported this issue. Would you like to receive email updates?';

    const btnRow = document.createElement('div');
    btnRow.className = 'vt-notify-btns';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'vt-notify-btn primary';
    yesBtn.textContent = 'Yes, notify me';

    const noBtn = document.createElement('button');
    noBtn.className = 'vt-notify-btn';
    noBtn.textContent = 'No thanks';

    btnRow.appendChild(yesBtn);
    btnRow.appendChild(noBtn);
    card.appendChild(cardText);
    card.appendChild(btnRow);
    messagesEl.appendChild(card);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    noBtn.addEventListener('click', () => {
      card.remove();
    });

    yesBtn.addEventListener('click', () => {
      /* Replace buttons with email input */
      btnRow.remove();
      cardText.textContent = 'Enter your email address and we\'ll notify you of any updates:';

      const emailRow = document.createElement('div');
      emailRow.className = 'vt-notify-email-row';

      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.className = 'vt-notify-email-input';
      emailInput.placeholder = 'your@email.com';

      const submitBtn = document.createElement('button');
      submitBtn.className = 'vt-notify-btn primary';
      submitBtn.textContent = 'Notify me';

      emailRow.appendChild(emailInput);
      emailRow.appendChild(submitBtn);
      card.appendChild(emailRow);
      emailInput.focus();
      messagesEl.scrollTop = messagesEl.scrollHeight;

      function confirmEmail() {
        const email = emailInput.value.trim();
        if (!email || !email.includes('@')) {
          emailInput.style.borderColor = 'var(--s2-accent)';
          return;
        }
        emailRow.remove();
        cardText.textContent = `✅ Thanks — we'll notify you at ${email} if there are any updates on this issue.`;
        card.classList.add('confirmed');
      }

      submitBtn.addEventListener('click', confirmEmail);
      emailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirmEmail();
      });
    });
  }

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
      const text = await callYukon(state.messages, collectionIds, yukonHost, state.imsToken);
      state.messages.push({ role: 'assistant', content: text });
      hideTyping();
      appendMessage({ role: 'assistant', content: text });
      /* Only show image strip if response has no inline tokens */
      const activityId = detectActivity(text);
      if (activityId && !text.includes('{{img:')) showActivityImages(activityId, text);
      if (isKnownIssueResponse(text)) showNotificationCard();
      const userLower = actualContent.toLowerCase();
      if (CHECK_KEYWORDS.some((kw) => userLower.includes(kw))) showExerciseCheckCard();
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
  headerTitle.textContent = 'Cohort Companion';

  /* Nav links */
  const headerNav = document.createElement('nav');
  headerNav.className = 'vt-header-nav';
  [
    { label: 'Instructor Area', href: '/instructor' },
    { label: 'Experience League', href: 'https://experienceleague.adobe.com', external: true },
    { label: 'Cohort Home', href: 'https://learning.adobe.com', external: true },
  ].forEach(({ label, href, external }) => {
    const a = document.createElement('a');
    a.className = 'vt-nav-link';
    a.href = href;
    a.textContent = label;
    if (external) { a.target = '_blank'; a.rel = 'noreferrer'; }
    headerNav.appendChild(a);
  });
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
  header.appendChild(headerNav);
  header.appendChild(headerMeta);

  /* Body */
  const body = document.createElement('div');
  body.className = 'vt-body';

  /* Left panel */
  const left = document.createElement('div');
  left.className = 'vt-left';

  const courseInfo = document.createElement('div');
  courseInfo.className = 'vt-course-info';
  const courseWeek = document.createElement('div');
  courseWeek.className = 'vt-course-week';
  courseWeek.textContent = 'Week 2 of 6';
  const courseMeeting = document.createElement('div');
  courseMeeting.className = 'vt-course-meeting';
  courseMeeting.innerHTML = '📅 Next meeting: <strong>Thu 4 June, 15:00 CEST</strong>';
  courseInfo.appendChild(courseWeek);
  courseInfo.appendChild(courseMeeting);

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

  /* Cohort feed */
  const FEED_POSTS = [
    {
      text: 'Missing menu items in wk 2 ex 3?', author: 'James', team: 'Team 1', time: 'Mon 09:14',
    },
    {
      text: 'System slow today?', author: 'Sarah', team: 'Team 2', time: 'Mon 10:32',
    },
    {
      text: 'Great session yesterday! Keep it up 🙌', author: 'Miguel', team: 'Team 5', time: 'Mon 11:05',
    },
    {
      text: 'Cohort team list and meeting planning', author: 'Priya', team: 'Team 1', time: 'Mon 14:22',
    },
  ];

  const feedSection = document.createElement('div');
  feedSection.className = 'vt-feed-section';

  const feedHeader = document.createElement('div');
  feedHeader.className = 'vt-feed-header';
  const feedLabel = document.createElement('div');
  feedLabel.className = 'vt-feed-label';
  feedLabel.textContent = 'Cohort Feed';
  const feedChevron = svgChevron();
  feedChevron.classList.add('open');
  feedHeader.appendChild(feedLabel);
  feedHeader.appendChild(feedChevron);

  const feedList = document.createElement('div');
  feedList.className = 'vt-feed-list open';

  FEED_POSTS.forEach((post) => {
    const item = document.createElement('div');
    item.className = 'vt-feed-item';
    const postText = document.createElement('div');
    postText.className = 'vt-feed-text';
    postText.textContent = post.text;
    const postMeta = document.createElement('div');
    postMeta.className = 'vt-feed-meta';
    postMeta.textContent = `${post.author}, ${post.team} · ${post.time}`;
    item.appendChild(postText);
    item.appendChild(postMeta);
    feedList.appendChild(item);
  });

  feedHeader.addEventListener('click', () => {
    feedList.classList.toggle('open');
    feedChevron.classList.toggle('open');
  });

  feedSection.appendChild(feedHeader);
  feedSection.appendChild(feedList);

  left.appendChild(courseInfo);
  left.appendChild(moduleList);
  left.appendChild(feedSection);
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
  trainerName.textContent = 'Cohort Companion';
  trainerInfo.appendChild(trainerName);

  activeSectionEl = document.createElement('div');
  activeSectionEl.className = 'vt-active-section';
  chatHeader.appendChild(trainerAv);
  chatHeader.appendChild(trainerInfo);
  chatHeader.appendChild(activeSectionEl);

  messagesEl = document.createElement('div');
  messagesEl.className = 'vt-messages';

  chipsEl = document.createElement('div');
  chipsEl.className = 'vt-chips';
  ['What ingestion methods did we cover?', "I missed Monday's session — what happened?", 'Help me with the capstone project'].forEach((label) => {
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
  hint.textContent = 'Cohort Companion is AI and can make mistakes. If in doubt check with your instructor!';

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
