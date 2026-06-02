/**
 * Instructor Dashboard Block
 *
 * Static dashboard for demo purposes.
 * DA authoring — add as a single-cell table:
 * | instructor-dashboard |
 */

export default function decorate(block) {
  block.innerHTML = `
    <div class="id-topbar">
      <a class="id-logo" href="/">
        <svg width="34" height="26" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.6 0H26L10.4 20H0L15.6 0Z" fill="#eb1000"/>
          <path d="M10.4 0H0V20L10.4 0Z" fill="#ff6251"/>
        </svg>
      </a>
      <div class="id-topbar-divider"></div>
      <div class="id-topbar-title">Instructor Dashboard</div>
      <nav class="id-topbar-nav">
        <a class="id-nav-link" href="/">Cohort Companion — Student View</a>
        <a class="id-nav-link" href="https://experienceleague.adobe.com" target="_blank" rel="noreferrer">Experience League</a>
        <a class="id-nav-link" href="https://learning.adobe.com" target="_blank" rel="noreferrer">Cohort Home</a>
      </nav>
    </div>

    <div class="id-page">

      <div class="id-page-header">
        <div>
          <div class="id-page-title">Configure and Manage Adobe Experience Platform</div>
          <div class="id-page-sub">EMEA Cohort · Tuesday 2 June 2026 · 24 students enrolled</div>
        </div>
        <div class="id-next-session">📅 Next session: Thu 4 June, 15:00 CEST</div>
      </div>

      <!-- Stats -->
      <div class="id-stats">
        <div class="id-stat">
          <div class="id-stat-value" style="color:#212529">24</div>
          <div class="id-stat-label">Students Enrolled</div>
          <div class="id-stat-delta id-delta-neutral">5 teams</div>
        </div>
        <div class="id-stat">
          <div class="id-stat-value" style="color:#12805c">18</div>
          <div class="id-stat-label">Mon Session Attended</div>
          <div class="id-stat-delta id-delta-down">↓ 75% · 6 absent</div>
        </div>
        <div class="id-stat">
          <div class="id-stat-value" style="color:#1473e6">142</div>
          <div class="id-stat-label">Companion Queries</div>
          <div class="id-stat-delta id-delta-up">↑ 38% vs Week 1</div>
        </div>
        <div class="id-stat">
          <div class="id-stat-value" style="color:#e68619">3</div>
          <div class="id-stat-label">At-Risk Students</div>
          <div class="id-stat-delta id-delta-down">Action recommended</div>
        </div>
        <div class="id-stat">
          <div class="id-stat-value" style="color:#eb1000">7</div>
          <div class="id-stat-label">Escalations to Instructor</div>
          <div class="id-stat-delta id-delta-neutral">Unanswered by AI</div>
        </div>
      </div>

      <!-- Engagement + Highlights -->
      <div class="id-grid-3">

        <div class="id-card">
          <div class="id-card-header">
            <div class="id-card-title">Student Engagement</div>
            <span class="id-tag id-tag-blue">Week 2 · Mon 1 Jun</span>
          </div>
          <div class="id-card-body id-no-pad">
            <table class="id-table">
              <thead>
                <tr>
                  <th class="id-th-first">Student</th>
                  <th>Sessions W1</th>
                  <th>Sessions W2</th>
                  <th>Companion</th>
                  <th class="id-th-last">Risk</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="id-td-first"><div class="id-sname">Sarah Chen</div><div class="id-steam">Team 2</div></td>
                  <td><div class="id-dots"><span class="id-dot id-dot-p">✓</span><span class="id-dot id-dot-p">✓</span></div></td>
                  <td><div class="id-dots"><span class="id-dot id-dot-p">✓</span><span class="id-dot id-dot-f">·</span></div></td>
                  <td><span class="id-mono">14 queries</span></td>
                  <td class="id-td-last"><span class="id-risk id-risk-low">● Low</span></td>
                </tr>
                <tr>
                  <td class="id-td-first"><div class="id-sname">James Okafor</div><div class="id-steam">Team 1</div></td>
                  <td><div class="id-dots"><span class="id-dot id-dot-p">✓</span><span class="id-dot id-dot-a">✗</span></div></td>
                  <td><div class="id-dots"><span class="id-dot id-dot-p">✓</span><span class="id-dot id-dot-f">·</span></div></td>
                  <td><span class="id-mono">8 queries</span></td>
                  <td class="id-td-last"><span class="id-risk id-risk-med">● Medium</span></td>
                </tr>
                <tr>
                  <td class="id-td-first"><div class="id-sname">Miguel Santos</div><div class="id-steam">Team 5</div></td>
                  <td><div class="id-dots"><span class="id-dot id-dot-p">✓</span><span class="id-dot id-dot-p">✓</span></div></td>
                  <td><div class="id-dots"><span class="id-dot id-dot-p">✓</span><span class="id-dot id-dot-f">·</span></div></td>
                  <td><span class="id-mono">22 queries</span></td>
                  <td class="id-td-last"><span class="id-risk id-risk-low">● Low</span></td>
                </tr>
                <tr>
                  <td class="id-td-first"><div class="id-sname">Priya Sharma</div><div class="id-steam">Team 1</div></td>
                  <td><div class="id-dots"><span class="id-dot id-dot-a">✗</span><span class="id-dot id-dot-a">✗</span></div></td>
                  <td><div class="id-dots"><span class="id-dot id-dot-a">✗</span><span class="id-dot id-dot-f">·</span></div></td>
                  <td><span class="id-mono">2 queries</span></td>
                  <td class="id-td-last"><span class="id-risk id-risk-high">● High</span></td>
                </tr>
                <tr>
                  <td class="id-td-first"><div class="id-sname">Anna Kowalski</div><div class="id-steam">Team 3</div></td>
                  <td><div class="id-dots"><span class="id-dot id-dot-p">✓</span><span class="id-dot id-dot-p">✓</span></div></td>
                  <td><div class="id-dots"><span class="id-dot id-dot-a">✗</span><span class="id-dot id-dot-f">·</span></div></td>
                  <td><span class="id-mono">6 queries</span></td>
                  <td class="id-td-last"><span class="id-risk id-risk-med">● Medium</span></td>
                </tr>
                <tr>
                  <td class="id-td-first id-more" colspan="5">+ 19 more students</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="id-card">
          <div class="id-card-header">
            <div class="id-card-title">Highlights for Instructor</div>
            <span class="id-tag id-tag-red">4 actions</span>
          </div>
          <div class="id-card-body">
            <div class="id-highlight-list">
              <div class="id-highlight id-hl-urgent">
                <div class="id-hl-icon">🚨</div>
                <div>
                  <div class="id-hl-title">Priya Sharma — 3 sessions missed</div>
                  <div class="id-hl-desc">No attendance since enrolment. Only 2 companion interactions. At risk of not completing.</div>
                  <div class="id-hl-action">Send check-in email →</div>
                </div>
              </div>
              <div class="id-highlight id-hl-warning">
                <div class="id-hl-icon">⚠️</div>
                <div>
                  <div class="id-hl-title">XDM Schema confusion — 9 students</div>
                  <div class="id-hl-desc">The difference between attribute and event schemas is generating the most questions this week.</div>
                  <div class="id-hl-action">Review Thursday session plan →</div>
                </div>
              </div>
              <div class="id-highlight id-hl-warning">
                <div class="id-hl-icon">🐌</div>
                <div>
                  <div class="id-hl-title">AEP performance issue reported</div>
                  <div class="id-hl-desc">3 students reported system slowness. EMEA infrastructure degradation confirmed.</div>
                  <div class="id-hl-action">Post update to cohort feed →</div>
                </div>
              </div>
              <div class="id-highlight id-hl-positive">
                <div class="id-hl-icon">🎉</div>
                <div>
                  <div class="id-hl-title">High engagement — companion up 38%</div>
                  <div class="id-hl-desc">Week 2 queries significantly up vs Week 1. Students are actively using the tool.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Questions + Errors/Sentiment -->
      <div class="id-grid-2">

        <div class="id-card">
          <div class="id-card-header">
            <div class="id-card-title">Top Questions This Week</div>
            <span class="id-tag id-tag-blue">142 total queries</span>
          </div>
          <div class="id-card-body">
            <div class="id-topic-list">
              <div class="id-topic"><span class="id-rank">01</span><div class="id-topic-bar-wrap"><div class="id-topic-label">XDM schema design — attribute vs event<span class="id-count">34</span></div><div class="id-bar"><div class="id-fill id-fill-red" style="width:100%"></div></div></div></div>
              <div class="id-topic"><span class="id-rank">02</span><div class="id-topic-bar-wrap"><div class="id-topic-label">Sandbox creation and permissions<span class="id-count">28</span></div><div class="id-bar"><div class="id-fill id-fill-amber" style="width:82%"></div></div></div></div>
              <div class="id-topic"><span class="id-rank">03</span><div class="id-topic-bar-wrap"><div class="id-topic-label">What happened in Monday's session?<span class="id-count">21</span></div><div class="id-bar"><div class="id-fill" style="width:62%"></div></div></div></div>
              <div class="id-topic"><span class="id-rank">04</span><div class="id-topic-bar-wrap"><div class="id-topic-label">Data governance and labelling<span class="id-count">18</span></div><div class="id-bar"><div class="id-fill id-fill-green" style="width:53%"></div></div></div></div>
              <div class="id-topic"><span class="id-rank">05</span><div class="id-topic-bar-wrap"><div class="id-topic-label">Dataset linking to schema<span class="id-count">16</span></div><div class="id-bar"><div class="id-fill" style="width:47%"></div></div></div></div>
              <div class="id-topic"><span class="id-rank">06</span><div class="id-topic-bar-wrap"><div class="id-topic-label">AEP performance / system slowness<span class="id-count">11</span></div><div class="id-bar"><div class="id-fill id-fill-amber" style="width:32%"></div></div></div></div>
              <div class="id-topic"><span class="id-rank">07</span><div class="id-topic-bar-wrap"><div class="id-topic-label">Capstone project requirements<span class="id-count">9</span></div><div class="id-bar"><div class="id-fill" style="width:26%"></div></div></div></div>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:20px">

          <div class="id-card">
            <div class="id-card-header">
              <div class="id-card-title">Errors &amp; Issues Reported</div>
              <span class="id-tag id-tag-amber">5 open</span>
            </div>
            <div class="id-card-body">
              <div class="id-error-list">
                <div class="id-error"><div class="id-edot id-edot-red"></div><div><div class="id-etext">AEP UI unresponsive during schema editor exercise (Ex 2)</div><div class="id-emeta">3 students · Mon 1 Jun 10:32–11:45 · EMEA infra issue</div></div></div>
                <div class="id-error"><div class="id-edot id-edot-amber"></div><div><div class="id-etext">Sandbox package import fails with permission error</div><div class="id-emeta">2 students · Team 3 &amp; Team 4 · Ex 1 Step 4</div></div></div>
                <div class="id-error"><div class="id-edot id-edot-amber"></div><div><div class="id-etext">Missing dropdown options in Exercise 3 menu</div><div class="id-emeta">4 students · Teams 1, 2, 5 · Reported Mon AM</div></div></div>
                <div class="id-error"><div class="id-edot id-edot-amber"></div><div><div class="id-etext">Dataset not appearing after schema link (Ex 4)</div><div class="id-emeta">6 students · Cache refresh resolves · Known issue</div></div></div>
              </div>
            </div>
          </div>

          <div class="id-card">
            <div class="id-card-header">
              <div class="id-card-title">Question Sentiment</div>
              <span class="id-tag id-tag-green">Mostly confident</span>
            </div>
            <div class="id-card-body">
              <div class="id-sentiment-row"><span class="id-slabel">Confident</span><div class="id-sbar"><div class="id-sfill" style="width:52%;background:#12805c"></div></div><span class="id-spct">52%</span></div>
              <div class="id-sentiment-row"><span class="id-slabel">Uncertain</span><div class="id-sbar"><div class="id-sfill" style="width:31%;background:#e68619"></div></div><span class="id-spct">31%</span></div>
              <div class="id-sentiment-row"><span class="id-slabel">Frustrated</span><div class="id-sbar"><div class="id-sfill" style="width:17%;background:#eb1000"></div></div><span class="id-spct">17%</span></div>
              <div class="id-snote">Frustrated queries largely correlate with the EMEA performance incident Mon AM</div>
            </div>
          </div>

        </div>
      </div>

      <!-- Session Prep + Escalations -->
      <div class="id-grid-2">

        <div class="id-card">
          <div class="id-card-header">
            <div class="id-card-title">Thursday Session Preparation</div>
            <span class="id-tag id-tag-red">Based on this week's questions</span>
          </div>
          <div class="id-card-body">
            <div class="id-prep-note">Recommended focus areas based on companion question patterns:</div>
            <div class="id-prep-list">
              <div class="id-prep"><div class="id-pbullet"></div><div>Spend extra time on <strong>XDM schema class selection</strong> — the distinction between XDM Individual Profile and XDM ExperienceEvent is generating the most confusion (34 queries)</div></div>
              <div class="id-prep"><div class="id-pbullet"></div><div>Address the <strong>dataset schema linking step</strong> (Exercise 4, Step 3) — 6 students have the dataset created but not linked</div></div>
              <div class="id-prep"><div class="id-pbullet"></div><div>Acknowledge the <strong>Monday performance issues</strong> — some students may have incomplete exercises due to the EMEA incident</div></div>
              <div class="id-prep"><div class="id-pbullet"></div><div>21 students asked <strong>"what happened in Monday's session"</strong> — consider starting Thursday with a brief recap</div></div>
              <div class="id-prep"><div class="id-pbullet"></div><div>9 early questions about the <strong>capstone project</strong> — worth a brief preview to reduce anxiety</div></div>
            </div>
          </div>
        </div>

        <div class="id-card">
          <div class="id-card-header">
            <div class="id-card-title">Companion Escalations</div>
            <span class="id-tag id-tag-amber">7 unanswered</span>
          </div>
          <div class="id-card-body">
            <div class="id-prep-note">Questions the companion flagged as beyond its knowledge:</div>
            <div class="id-esc-list">
              <div class="id-esc"><div class="id-escq">Will the sandbox environments be available after the cohort ends?</div><div class="id-escm">Anna Kowalski · Team 3 · Mon 09:22</div></div>
              <div class="id-esc"><div class="id-escq">Can I use my company's AEP instance instead of the training sandbox?</div><div class="id-escm">James Okafor · Team 1 · Mon 10:15</div></div>
              <div class="id-esc"><div class="id-escq">Is there a recording of last week's Thursday session available?</div><div class="id-escm">3 students · Mon–Tue</div></div>
              <div class="id-esc"><div class="id-escq">What certification exam should I take after this cohort?</div><div class="id-escm">Miguel Santos · Team 5 · Tue 08:44</div></div>
              <div class="id-esc"><div class="id-escq">How do we form capstone teams — same as exercise teams?</div><div class="id-escm">Sarah Chen · Team 2 · Tue 09:11</div></div>
            </div>
          </div>
        </div>

      </div>

      <div class="id-footer">
        Cohort Companion Instructor Dashboard · Refreshed Tuesday 2 June 2026, 09:30 CEST · Adobe Confidential
      </div>

    </div>
  `;
}
