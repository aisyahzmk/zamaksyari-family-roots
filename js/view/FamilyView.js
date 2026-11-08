/**
 * VIEW — FamilyView
 * ---------------------------------------------------------
 * Pure DOM layer. Receives plain data objects from the
 * Controller and renders HTML. Contains zero business logic.
 * Earthy Minimal Neobrutalism design style with English UI.
 * ---------------------------------------------------------
 */
class FamilyView {
  constructor() {
    this.navBtns        = document.querySelectorAll('.nav-btn');
    this.toast          = document.getElementById('toast');
    this.treeViewport   = document.getElementById('tree-canvas-viewport');
    this.treeCanvas     = document.getElementById('tree-canvas');
    this.directoryEl    = document.getElementById('directory-content');
    this.profileEl      = document.getElementById('profile-content');
    this.statsEl        = document.getElementById('stats-content');
    this.zoomIndicator  = document.getElementById('zoom-level-text');

    this.views = {
      tree:      document.getElementById('view-tree'),
      directory: document.getElementById('view-directory'),
      profile:   document.getElementById('view-profile'),
      stats:     document.getElementById('view-stats'),
    };

    this._toastTimer = null;
  }

  // ── Avatar helper — photo if available, else initials ────────
  _avatarHTML(p, size = 'sm') {
    const dim   = size === 'lg' ? '92px' : size === 'md' ? '58px' : '40px';
    const fsize = size === 'lg' ? '2.1rem' : size === 'md' ? '1.3rem' : '0.95rem';
    const cls   = this._avatarCls(p);
    const dead  = !p.isAlive ? 'avatar-deceased' : '';

    if (p.photo) {
      return `<img src="${p.photo}" alt="${p.fullName}"
        class="neo-avatar-img ${dead}"
        style="width:${dim};height:${dim};border-radius:50%;object-fit:cover;object-position:center top;border:2.5px solid var(--clr-border);flex-shrink:0"
        onerror="this.outerHTML=\`<div class='neo-avatar ${cls} ${dead}' style='width:${dim};height:${dim};font-size:${fsize}'>${this._initials(p)}</div>\`"
      />`;
    }
    return `<div class="neo-avatar ${cls} ${dead}"
      style="width:${dim};height:${dim};font-size:${fsize};border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;border:2.5px solid var(--clr-border);flex-shrink:0">
      ${this._initials(p)}
    </div>`;
  }

  _initials(p) {
    const parts = (p.fullName || p.firstName || '').trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : ((p.nickname || '?')[0] || '?').toUpperCase();
  }

  _formatDob(dob) {
    if (!dob) return '—';
    const [y, m, d] = dob.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${+d} ${months[+m - 1]} ${y}`;
  }

  _avatarCls(p) {
    return p.gender === 'female' ? 'avatar-female' : 'avatar-male';
  }

  // ── View Switcher ─────────────────────────────────────────────
  showView(name) {
    Object.entries(this.views).forEach(([k, el]) => {
      if (el) el.classList.toggle('active', k === name);
    });
    this.navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === name);
    });
  }

  // ── Pan & Zoom Canvas Transform ───────────────────────────────
  updateCanvasTransform(panX, panY, scale) {
    if (this.treeCanvas) {
      this.treeCanvas.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
      this.treeCanvas.style.transformOrigin = 'center center';
    }
    if (this.zoomIndicator) {
      this.zoomIndicator.textContent = `${Math.round(scale * 100)}%`;
    }
  }

  // ── Tree View (One Single Horizontal Row For Children) ─────────
  renderTree(generationGroups, selectedId = null, filteredIds = null) {
    if (!this.treeCanvas) return;

    if (!generationGroups.length) {
      this.treeCanvas.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⏳</div>
          <p>No family data available.</p>
        </div>
      `;
      return;
    }

    const parentsGroup  = generationGroups.find(g => g.gen === 0);
    const childrenGroup = generationGroups.find(g => g.gen === 1);

    const father = parentsGroup?.people.find(p => p.gender === 'male');
    const mother = parentsGroup?.people.find(p => p.gender === 'female');
    const children = childrenGroup?.people || [];

    this.treeCanvas.innerHTML = `
      <div class="tree-root-layout">
        <!-- Generation 1: Parents -->
        <div class="tree-gen-tag">Generation 1 · Parents</div>
        <div class="tree-parents-row">
          ${father ? this._personCardHTML(father, selectedId, filteredIds) : ''}
          <div class="tree-marriage-connector">
            <div class="marriage-h-line"></div>
            <div class="neo-marriage-pill">💍 Married</div>
          </div>
          ${mother ? this._personCardHTML(mother, selectedId, filteredIds) : ''}
        </div>

        <!-- Vertical Trunk Connector -->
        <div class="tree-vertical-trunk"></div>

        <!-- Generation 2: All 6 Children Aligned in ONE Single Horizontal Row -->
        <div class="tree-gen-tag" style="margin-top:0.25rem">Generation 2 · Children (6 Siblings)</div>
        <div class="tree-children-wrapper">
          <!-- Horizontal Branch Line connecting across all children -->
          <div class="tree-branch-bar"></div>

          <div class="tree-children-single-row">
            ${children.map(child => `
              <div class="child-node-item">
                <div class="child-drop-line"></div>
                ${this._personCardHTML(child, selectedId, filteredIds)}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  _personCardHTML(p, selectedId, filteredIds) {
    const isSelected = p.id === selectedId ? 'selected' : '';
    const isDeceased = !p.isAlive ? 'deceased' : '';
    const isMe       = p.nickname === 'Ateh' || p.id === 'p5';
    const isDimmed   = filteredIds && !filteredIds.has(p.id) ? 'card-dimmed' : '';
    const isHighlight = filteredIds && filteredIds.has(p.id) && filteredIds.size < 8 ? 'card-highlighted' : '';

    return `
      <div class="neo-person-card ${isSelected} ${isDeceased} ${isDimmed} ${isHighlight}"
           data-id="${p.id}"
           title="Click to view full personal profile">
        ${isMe ? '<span class="neo-me-badge">✨ Me</span>' : ''}
        ${!p.isAlive ? '<span class="neo-deceased-badge">Passed Away</span>' : ''}
        
        <div class="card-avatar-wrap">
          ${this._avatarHTML(p, 'md')}
        </div>

        <div class="card-nickname-text">${p.nickname}</div>
        <div class="card-fullname-text">${p.fullName}</div>
        <div class="card-profession-text">${p.profession || 'Family Member'}</div>
        <div class="card-action-btn">View Profile ➔</div>
      </div>
    `;
  }

  // ── Directory View (Responsive Grid) ──────────────────────────
  renderDirectory(people, totalCount = 8, selectedId = null) {
    if (!this.directoryEl) return;

    if (!people.length) {
      this.directoryEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>No family members matched your active search & filters.</p>
        </div>
      `;
      return;
    }

    this.directoryEl.innerHTML = `
      <div class="neo-directory-grid">
        ${people.map(p => `
          <div class="neo-directory-card ${p.id === selectedId ? 'selected' : ''}" data-id="${p.id}">
            <div class="dir-header-flex">
              ${this._avatarHTML(p, 'md')}
              <div class="dir-header-info">
                <div class="dir-nickname-row">
                  <strong class="dir-nickname-text">${p.nickname}</strong>
                  ${p.id === 'p5' || p.nickname === 'Ateh' ? '<span class="neo-me-badge-sm">Me</span>' : ''}
                </div>
                <div class="dir-fullname-text">${p.fullName}</div>
                <div class="dir-job-text">${p.profession || 'Family Member'}</div>
              </div>
            </div>

            <div class="dir-pills-row">
              <span class="neo-meta-pill">${p.gender === 'female' ? '♀ Female' : '♂ Male'}</span>
              ${p.dob ? `<span class="neo-meta-pill">🎂 ${this._formatDob(p.dob)}</span>` : ''}
              <span class="neo-meta-pill status-pill">● Living</span>
            </div>

            ${p.bio ? `<p class="dir-bio-quote">“${p.bio}”</p>` : ''}

            <div class="dir-footer-action">
              <span>Explore Kinship Profile</span>
              <span class="neo-arrow">➔</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ── Profile View (Fixed Sizing & Clean Layout — No Collisions) ──
  renderProfile(person, father, mother, spouses, children, siblings) {
    if (!this.profileEl) return;

    const relButtons = (list, icon) => {
      if (!list.length) return `<span class="rel-none-text">None recorded</span>`;
      return list.map(p => `
        <button class="neo-rel-btn" data-id="${p.id}">
          <span>${icon}</span>
          <strong class="rel-nickname">${p.nickname}</strong>
          <span class="rel-fullname">(${p.fullName})</span>
          ${p.marriageStatus ? `<span class="rel-status">[${p.marriageStatus}]</span>` : ''}
        </button>
      `).join('');
    };

    this.profileEl.innerHTML = `
      <div class="profile-layout-container">
        <div class="neo-profile-box">
          <!-- Top Clean Banner -->
          <div class="neo-profile-banner">
            <button id="btn-back-tree" class="neo-btn-back">← Back to Family Tree</button>
            <span class="banner-right-status">● Living</span>
          </div>

          <div class="profile-body-content">
            <!-- Header Row with Avatar & Name Details side by side -->
            <div class="profile-header-card">
              <div class="profile-avatar-wrapper">
                ${this._avatarHTML(person, 'lg')}
              </div>

              <div class="profile-identity-details">
                <div class="profile-nickname-badge">
                  Nickname: <strong>${person.nickname}</strong>
                </div>
                <h2 class="profile-hero-name">${person.fullName}</h2>
                <div class="profile-hero-meta">
                  <span class="meta-item-job">${person.profession || 'Family Member'}</span>
                  <span>·</span>
                  <span class="meta-item-gender">${person.gender === 'female' ? '♀ Female' : '♂ Male'}</span>
                  ${person.dob ? `<span>·</span> <span class="meta-item-dob">Born ${this._formatDob(person.dob)}</span>` : ''}
                </div>
              </div>
            </div>

            <!-- Two-column info grid -->
            <div class="profile-columns-grid">
              <!-- Left: Personal Information -->
              <div class="neo-column-card">
                <h3 class="column-card-title">Personal Details</h3>
                <div class="detail-row"><span>Full Name</span><strong>${person.fullName}</strong></div>
                <div class="detail-row"><span>Nickname</span><span>${person.nickname}</span></div>
                <div class="detail-row"><span>Date of Birth</span><span>${this._formatDob(person.dob)}</span></div>
                <div class="detail-row"><span>Gender</span><span>${person.gender === 'female' ? '♀ Female' : '♂ Male'}</span></div>
                <div class="detail-row"><span>Profession</span><span>${person.profession || '—'}</span></div>
                <div class="detail-row"><span>Status</span><span class="living-badge">● Living</span></div>
              </div>

              <!-- Right: Family Kinship Connections -->
              <div class="neo-column-card">
                <h3 class="column-card-title">Family Relationships</h3>
                <div class="kinship-group">
                  <label>Father</label>
                  <div class="kinship-btns-wrap">${relButtons(father ? [father] : [], '👨')}</div>
                </div>
                <div class="kinship-group">
                  <label>Mother</label>
                  <div class="kinship-btns-wrap">${relButtons(mother ? [mother] : [], '👩')}</div>
                </div>
                <div class="kinship-group">
                  <label>Spouse</label>
                  <div class="kinship-btns-wrap">${relButtons(spouses, '💍')}</div>
                </div>
                <div class="kinship-group">
                  <label>Children</label>
                  <div class="kinship-btns-wrap">${relButtons(children, '🧒')}</div>
                </div>
                <div class="kinship-group">
                  <label>Siblings</label>
                  <div class="kinship-btns-wrap">${relButtons(siblings, '🤝')}</div>
                </div>
              </div>
            </div>

            ${person.bio ? `
              <div class="neo-bio-callout">
                <h3 class="bio-callout-title">Biography & Personal Notes</h3>
                <p class="bio-callout-text">“${person.bio}”</p>
              </div>
            ` : ''}

            <div class="profile-bottom-nav">
              <button id="btn-back-tree-bottom" class="neo-btn-back-main">← Back to Family Tree</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── Statistics View ───────────────────────────────────────────
  renderStats(stats) {
    if (!this.statsEl) return;

    const maxGen   = Math.max(...Object.values(stats.genCounts), 1);
    const profList = Object.entries(stats.professions || {}).sort((a, b) => b[1] - a[1]);
    const maxProf  = Math.max(...profList.map(o => o[1]), 1);

    const cards = [
      { icon: '👥', num: stats.total, label: 'Total Members' },
      { icon: '♂', num: stats.male, label: 'Male' },
      { icon: '♀', num: stats.female, label: 'Female' },
      { icon: '💚', num: stats.living, label: 'Living' },
      { icon: '🌱', num: stats.generations, label: 'Generations' },
      { icon: '💼', num: profList.length, label: 'Occupations' },
    ];

    this.statsEl.innerHTML = `
      <div class="stats-root-container">
        <!-- Metric Cards Grid -->
        <div class="neo-metric-grid">
          ${cards.map(c => `
            <div class="neo-metric-card">
              <div class="metric-icon">${c.icon}</div>
              <div class="metric-number">${c.num}</div>
              <div class="metric-label">${c.label}</div>
            </div>
          `).join('')}
        </div>

        <!-- Charts Grid -->
        <div class="neo-charts-grid">
          <div class="neo-chart-card">
            <h3 class="chart-header-title">Professions & Roles</h3>
            <div class="chart-bars-container">
              ${profList.map(([p, count]) => `
                <div class="neo-bar-row">
                  <span class="neo-bar-title" title="${p}">${p}</span>
                  <div class="neo-bar-track">
                    <div class="neo-bar-fill" style="width:${Math.round(count / maxProf * 100)}%"></div>
                  </div>
                  <span class="neo-bar-digit">${count}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="neo-chart-card">
            <h3 class="chart-header-title">Members by Generation</h3>
            <div class="chart-bars-container">
              ${Object.entries(stats.genCounts)
                .sort((a, b) => +a[0] - +b[0])
                .map(([g, count]) => `
                  <div class="neo-bar-row">
                    <span class="neo-bar-title">Generation ${+g + 1} (${+g === 0 ? 'Parents' : 'Children'})</span>
                    <div class="neo-bar-track">
                      <div class="neo-bar-fill fill-accent" style="width:${Math.round(count / maxGen * 100)}%"></div>
                    </div>
                    <span class="neo-bar-digit">${count}</span>
                  </div>
                `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── Toast Notification ─────────────────────────────────────────
  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add('visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toast.classList.remove('visible'), 2800);
  }
}
