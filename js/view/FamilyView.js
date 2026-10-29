/**
 * VIEW — FamilyView
 * ---------------------------------------------------------
 * Pure DOM layer. Receives plain data objects from the
 * Controller and renders HTML. Has zero business logic.
 * ---------------------------------------------------------
 */
class FamilyView {
  constructor() {
    this.memberList   = document.getElementById('member-list');
    this.searchInput  = document.getElementById('search-input');
    this.filterChips  = document.querySelectorAll('.filter-chip');
    this.navBtns      = document.querySelectorAll('.nav-btn');
    this.toast        = document.getElementById('toast');
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalClose   = document.getElementById('modal-close');

    this.views = {
      tree:    document.getElementById('view-tree'),
      profile: document.getElementById('view-profile'),
      stats:   document.getElementById('view-stats'),
    };

    this._toastTimer = null;
  }

  // ── Avatar helper — photo if available, else initials ────────
  _avatarHTML(p, size = 'sm') {
    const dim   = size === 'lg' ? '96px' : size === 'md' ? '52px' : '36px';
    const fsize = size === 'lg' ? '2.2rem' : size === 'md' ? '1.2rem' : '.9rem';
    const cls   = this._avatarCls(p);
    const dead  = !p.isAlive ? 'avatar-deceased' : '';

    if (p.photo) {
      return `<img src="${p.photo}" alt="${p.fullName}"
        style="width:${dim};height:${dim};border-radius:50%;object-fit:cover;object-position:center top;
               border:2px solid var(--border);flex-shrink:0;${!p.isAlive ? 'opacity:.6;filter:grayscale(50%)' : ''}"
        onerror="this.outerHTML=\`<div class='member-avatar ${cls} ${dead}' style='width:${dim};height:${dim};font-size:${fsize};border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;flex-shrink:0'>${this._initials(p)}</div>\`"
      />`;
    }
    return `<div class="member-avatar ${cls} ${dead}"
      style="width:${dim};height:${dim};font-size:${fsize};border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;flex-shrink:0">
      ${this._initials(p)}
    </div>`;
  }

  _initials(p) {
    const parts = (p.firstName || '').trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : ((p.firstName || '?')[0] + (p.lastName || '?')[0]).toUpperCase();
  }

  _formatDob(dob) {
    if (!dob) return '—';
    const [y, m, d] = dob.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${+d} ${months[+m - 1]} ${y}`;
  }

  _yearRange(p) {
    return p.dateOfDeath
      ? `${p.birthYear} – ${p.deathYear}`
      : `b. ${p.birthYear}`;
  }

  _avatarCls(p) {
    if (p.id === 'p5') return 'avatar-me';
    return p.gender === 'female' ? 'avatar-female' : 'avatar-male';
  }

  _genLabel(gen) {
    const labels = [
      'Generation 1 — Parents',
      'Generation 2 — Children',
      'Generation 3 — Grandchildren',
      'Generation 4 — Great-grandchildren',
    ];
    return labels[gen] || `Generation ${gen + 1}`;
  }

  _statusBadge(status) {
    const map = {
      married:  { icon: '💍', cls: 'married' },
      divorced: { icon: '💔', cls: 'divorced' },
      widowed:  { icon: '🕊️', cls: 'widowed' },
    };
    return map[status] || { icon: '❤️', cls: '' };
  }

  // ── View Switcher ─────────────────────────────────────────────

  showView(name) {
    Object.entries(this.views).forEach(([k, el]) =>
      el.classList.toggle('active', k === name)
    );
    this.navBtns.forEach(btn =>
      btn.classList.toggle('active', btn.dataset.view === name)
    );
  }

  // ── Sidebar Member List ───────────────────────────────────────

  renderMemberList(people, selectedId = null) {
    if (!people.length) {
      this.memberList.innerHTML = `
        <div class="empty-state" style="height:150px">
          <div class="empty-icon">🔍</div><p>No members found</p>
        </div>`;
      return;
    }
    this.memberList.innerHTML = people.map(p => `
      <div class="member-list-item ${p.id === selectedId ? 'selected' : ''}" data-id="${p.id}">
        ${this._avatarHTML(p, 'sm')}
        <div class="member-info-small">
          <div class="name">
            <strong>${p.nickname}</strong>
            ${p.id === 'p5' ? '<span style="font-size:.65rem;background:#fef3c7;color:#b45309;padding:1px 6px;border-radius:99px;font-weight:700;margin-left:4px">Me</span>' : ''}
          </div>
          <div class="meta">${p.profession || 'Family Member'}</div>
        </div>
        ${!p.isAlive ? '<span title="Deceased" style="color:var(--deceased)">✝</span>' : ''}
      </div>`).join('');
  }

  // ── Tree View (Hierarchical Tree Map) ──────────────────────────

  renderTree(generationGroups, selectedId = null) {
    const el = this.views.tree;
    el.innerHTML = `
      <div class="tree-title">
        🌳 Zamaksyari Family Heritage Tree
        <span style="font-size:.8rem;font-weight:400;color:var(--muted-fg);margin-left:auto">
          💡 Click any card to reveal full name &amp; profile
        </span>
      </div>`;

    if (!generationGroups.length) return;

    const parentsGroup  = generationGroups.find(g => g.gen === 0);
    const childrenGroup = generationGroups.find(g => g.gen === 1);

    if (parentsGroup && childrenGroup) {
      const treeWrapper = document.createElement('div');
      treeWrapper.className = 'tree-wrapper';

      // ── Parents Level (Ayah + Ibu) ──
      const parentsBlock = document.createElement('div');
      parentsBlock.className = 'tree-parents-block';

      const father = parentsGroup.people.find(p => p.gender === 'male') || parentsGroup.people[0];
      const mother = parentsGroup.people.find(p => p.gender === 'female') || parentsGroup.people[1];

      if (father && mother) {
        parentsBlock.innerHTML = `
          ${this._personCardHTML(father, selectedId)}
          <div class="marriage-bridge">
            <div class="marriage-line"></div>
            <div class="marriage-pill">💍 Married</div>
          </div>
          ${this._personCardHTML(mother, selectedId)}
        `;
      } else {
        parentsGroup.people.forEach(p => {
          parentsBlock.innerHTML += this._personCardHTML(p, selectedId);
        });
      }
      treeWrapper.appendChild(parentsBlock);

      // ── Tree Trunk Connector ──
      const trunk = document.createElement('div');
      trunk.className = 'tree-trunk';
      treeWrapper.appendChild(trunk);

      // ── Children Level ──
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-children-container';

      const childrenRow = document.createElement('div');
      childrenRow.className = 'children-row-branch';

      childrenGroup.people.forEach(p => {
        const childNode = document.createElement('div');
        childNode.className = 'child-tree-node';
        childNode.innerHTML = this._personCardHTML(p, selectedId);
        childrenRow.appendChild(childNode);
      });

      childrenContainer.appendChild(childrenRow);
      treeWrapper.appendChild(childrenContainer);
      el.appendChild(treeWrapper);
    } else {
      // Fallback
      generationGroups.forEach(({ gen, people }) => {
        const section = document.createElement('section');
        section.className = 'generation';
        section.innerHTML = `<div class="generation-label">${this._genLabel(gen)}</div>`;
        const row = document.createElement('div');
        row.className = 'children-row-branch';
        people.forEach(p => { row.innerHTML += this._personCardHTML(p, selectedId); });
        section.appendChild(row);
        el.appendChild(section);
      });
    }
  }

  _personCardHTML(p, selectedId) {
    const sel  = p.id === selectedId ? 'selected' : '';
    const isMe = p.id === 'p5';
    const avatarCls = isMe ? 'avatar-me' : (p.gender === 'female' ? 'avatar-female' : 'avatar-male');

    return `
      <div class="person-card ${sel}" data-id="${p.id}" title="Click to reveal full name & profile">
        ${isMe ? '<span class="card-badge-me">✨ Me</span>' : ''}
        ${!p.isAlive ? '<span style="position:absolute;top:6px;right:8px;font-size:.6rem;color:var(--deceased)">✝</span>' : ''}
        <div class="card-avatar ${avatarCls}">
          ${p.photo
            ? `<img src="${p.photo}" alt="${p.nickname}"
                style="width:100%;height:100%;object-fit:cover;object-position:center top"
                onerror="this.style.display='none';this.parentElement.textContent='${this._initials(p)}'">`
            : this._initials(p)}
        </div>
        <div class="card-nickname">${p.nickname}</div>
        <div class="card-role">${p.profession || '—'}</div>
        <div class="card-hint">View Profile ➔</div>
      </div>`;
  }

  // ── Profile View ──────────────────────────────────────────────

  renderProfile(person, father, mother, spouses, children, siblings) {
    const isFemale = person.gender === 'female';
    const isMe     = person.id === 'p5';

    const relChips = (list, icon) => {
      if (!list.length)
        return `<em style="font-size:.8rem;color:var(--muted-fg)">—</em>`;
      return list.map(p => `
        <button class="relation-chip" data-id="${p.id}">
          ${icon} <strong>${p.nickname}</strong> <span style="font-size:.78rem;color:var(--muted-fg)">(${p.fullName})</span>
          ${p.marriageStatus
            ? `<span class="spouse-status ${p.marriageStatus}">${this._statusBadge(p.marriageStatus).icon} ${p.marriageStatus}</span>`
            : ''}
        </button>`).join('');
    };

    const bannerCls = isMe ? 'me' : (isFemale ? 'female' : '');

    this.views.profile.innerHTML = `
      <div class="profile-card">
        <div class="profile-banner ${bannerCls}"></div>
        <div class="profile-body">
          <div class="profile-avatar-lg ${isMe ? 'avatar-me' : (isFemale ? 'avatar-female' : 'avatar-male')}">
            ${person.photo
              ? `<img src="${person.photo}" alt="${person.fullName}"
                  style="width:100%;height:100%;object-fit:cover;object-position:center top"
                  onerror="this.style.display='none';this.parentElement.textContent='${this._initials(person)}'">`
              : this._initials(person)}
          </div>
          <div class="profile-header-info">
            <span class="profile-nickname-badge">Nickname: <strong>${person.nickname}</strong></span>
            <h2>${person.fullName}</h2>
            <p class="subtitle">
              ${person.profession || 'Profession not stated'}
              &nbsp;·&nbsp;
              ${person.isAlive
                ? '<span class="living-dot">● Living</span>'
                : '<strong class="deceased-text">Passed Away</strong>'}
            </p>
          </div>

          <div class="profile-grid">
            <!-- Personal Info -->
            <div class="info-section">
              <h4>Personal Info</h4>
              <div class="info-row">
                <span class="label">Full Name</span>
                <span class="value" style="font-weight:700;color:var(--primary)">${person.fullName}</span>
              </div>
              <div class="info-row">
                <span class="label">Nickname</span>
                <span class="value">${person.nickname}</span>
              </div>
              <div class="info-row">
                <span class="label">Date of Birth</span>
                <span class="value">${this._formatDob(person.dob)}</span>
              </div>
              ${!person.isAlive ? `
              <div class="info-row">
                <span class="label">Date of Death</span>
                <span class="value">${this._formatDob(person.dateOfDeath)}</span>
              </div>` : ''}
              <div class="info-row">
                <span class="label">Gender</span>
                <span class="value">${person.gender === 'female' ? '♀ Female' : '♂ Male'}</span>
              </div>
              <div class="info-row">
                <span class="label">Job / Role</span>
                <span class="value">${person.profession || '—'}</span>
              </div>
            </div>

            <!-- Family Connections -->
            <div class="info-section">
              <h4>Family Connections</h4>

              <div class="rel-group">
                <div class="rel-label">👴 Father</div>
                <div class="relation-chips">
                  ${father
                    ? `<button class="relation-chip" data-id="${father.id}">👤 <strong>${father.nickname}</strong> <span style="font-size:.78rem;color:var(--muted-fg)">(${father.fullName})</span></button>`
                    : '<em style="font-size:.8rem;color:var(--muted-fg)">—</em>'}
                </div>
              </div>

              <div class="rel-group">
                <div class="rel-label">👩 Mother</div>
                <div class="relation-chips">
                  ${mother
                    ? `<button class="relation-chip" data-id="${mother.id}">👤 <strong>${mother.nickname}</strong> <span style="font-size:.78rem;color:var(--muted-fg)">(${mother.fullName})</span></button>`
                    : '<em style="font-size:.8rem;color:var(--muted-fg)">—</em>'}
                </div>
              </div>

              <div class="rel-group">
                <div class="rel-label">💍 Spouse</div>
                <div class="relation-chips">${relChips(spouses, '💑')}</div>
              </div>

              <div class="rel-group">
                <div class="rel-label">👶 Children</div>
                <div class="relation-chips">${relChips(children, '🧒')}</div>
              </div>

              <div class="rel-group">
                <div class="rel-label">👫 Siblings</div>
                <div class="relation-chips">${relChips(siblings, '🤝')}</div>
              </div>
            </div>
          </div>

          ${person.bio ? `<blockquote class="bio-section">"${person.bio}"</blockquote>` : ''}

          <div class="profile-nav-btns">
            <button class="btn btn-outline" id="btn-back-tree">← Back to Family Tree</button>
          </div>
        </div>
      </div>`;
  }

  // ── Stats View ────────────────────────────────────────────────

  renderStats(stats) {
    const topProf = Object.entries(stats.professions)
      .sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxProf = Math.max(...topProf.map(o => o[1]), 1);

    const genEntries = Object.entries(stats.genCounts).sort((a, b) => +a[0] - +b[0]);
    const maxGen = Math.max(...genEntries.map(e => e[1]), 1);

    const bar = (label, count, max, alt = false) => `
      <div class="bar-row">
        <div class="bar-label">${label}</div>
        <div class="bar-track">
          <div class="bar-fill${alt ? ' alt' : ''}" style="width:${Math.round(count / max * 100)}%"></div>
        </div>
        <div class="bar-count">${count}</div>
      </div>`;

    this.views.stats.innerHTML = `
      <div class="stats-title">📊 Zamaksyari Family Statistics</div>

      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">👥</div>
          <div class="stat-value">${stats.total}</div><div class="stat-label">Total Members</div></div>
        <div class="stat-card"><div class="stat-icon">♂</div>
          <div class="stat-value">${stats.male}</div><div class="stat-label">Male</div></div>
        <div class="stat-card"><div class="stat-icon">♀</div>
          <div class="stat-value">${stats.female}</div><div class="stat-label">Female</div></div>
        <div class="stat-card"><div class="stat-icon">💚</div>
          <div class="stat-value">${stats.living}</div><div class="stat-label">Living</div></div>
        <div class="stat-card"><div class="stat-icon">🕊️</div>
          <div class="stat-value">${stats.deceased}</div><div class="stat-label">Passed Away</div></div>
        <div class="stat-card"><div class="stat-icon">🌱</div>
          <div class="stat-value">${stats.generations}</div><div class="stat-label">Generations</div></div>
      </div>

      <div class="chart-section">
        <h4>Jobs / Roles</h4>
        <div class="bar-chart">
          ${topProf.map(([p, c]) => bar(p, c, maxProf, false)).join('')}
        </div>
      </div>

      <div class="chart-section">
        <h4>Members by Generation</h4>
        <div class="bar-chart">
          ${genEntries.map(([g, c]) =>
            bar(`Generation ${+g + 1} (${+g === 0 ? 'Parents' : 'Children'})`, c, maxGen, true)).join('')}
        </div>
      </div>`;
  }

  // ── Toast ─────────────────────────────────────────────────────

  showToast(msg, ms = 2500) {
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toast.classList.remove('show'), ms);
  }

  // ── Modal ─────────────────────────────────────────────────────

  showModal(title, bodyHTML) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    this.modalOverlay.classList.add('open');
  }

  closeModal() { this.modalOverlay.classList.remove('open'); }
}
