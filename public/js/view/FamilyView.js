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
    const dim   = size === 'lg' ? '90px' : size === 'md' ? '52px' : '36px';
    const fsize = size === 'lg' ? '2.2rem' : size === 'md' ? '1.2rem' : '1rem';
    const cls   = this._avatarCls(p);
    const dead  = !p.isAlive ? 'avatar-deceased' : '';

    if (p.photo) {
      return `<img src="${p.photo}" alt="${p.fullName}"
        style="width:${dim};height:${dim};border-radius:50%;object-fit:cover;object-position:center top;
               border:2px solid var(--clr-border);flex-shrink:0;${!p.isAlive ? 'opacity:.6;filter:grayscale(50%)' : ''}"
        onerror="this.outerHTML=\`<div class='member-avatar ${cls} ${dead}' style='width:${dim};height:${dim};font-size:${fsize}'>${this._initials(p)}</div>\`"
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
          <div class="empty-icon">🔍</div><p>Tiada ahli dijumpai</p>
        </div>`;
      return;
    }
    this.memberList.innerHTML = people.map(p => `
      <div class="member-list-item ${p.id === selectedId ? 'selected' : ''}" data-id="${p.id}">
        ${this._avatarHTML(p, 'sm')}
        <div class="member-info-small">
          <div class="name">
            <strong>${p.nickname}</strong>
            ${p.nickname === 'Ateh' || p.id === 'p5' ? '<span style="font-size:.68rem;background:#fef3c7;color:#b45309;padding:1px 5px;border-radius:99px;font-weight:700;margin-left:4px">Saya</span>' : ''}
          </div>
          <div class="meta">${p.profession || 'Ahli Keluarga'}</div>
        </div>
        ${!p.isAlive ? '<span title="Deceased" style="color:var(--clr-deceased)">✝</span>' : ''}
      </div>`).join('');
  }

  // ── Tree View (Hierarchical Tree Map) ──────────────────────────

  renderTree(generationGroups, selectedId = null) {
    const el = this.views.tree;
    el.innerHTML = `
      <div class="tree-title">
        🌳 Pokok Silsilah Keluarga Zamaksyari
        <span style="font-size:.82rem;font-weight:400;color:var(--clr-muted);margin-left:auto">
          💡 Klik mana-mana kad untuk mengetahui nama sebenar & profil penuh
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
            <div class="marriage-pill">💍 Berkahwin</div>
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

      // ── Children Level (Abang, Angah, Ateh, Kakcik, Iwan, Adik) ──
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
    const dec  = !p.isAlive ? 'deceased' : '';
    const isMe = p.nickname === 'Ateh' || p.id === 'p5';

    return `
      <div class="person-card ${sel} ${dec}" data-id="${p.id}" title="Tekan untuk ketahui profil penuh & nama sebenar">
        ${isMe ? '<span class="card-badge-me">✨ Saya</span>' : ''}
        ${!p.isAlive ? '<span class="deceased-stamp">✝</span>' : ''}
        <div class="card-avatar ${this._avatarCls(p)}" style="overflow:hidden;padding:0">
          ${p.photo
            ? `<img src="${p.photo}" style="width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:50%"
                onerror="this.style.display='none';this.parentElement.textContent='${this._initials(p)}'">`
            : this._initials(p)}
        </div>
        <div class="card-nickname">${p.nickname}</div>
        <div class="card-role">${p.profession || '—'}</div>
        <div class="card-hint">Lihat Profil ➔</div>
      </div>`;
  }

  // ── Profile View ──────────────────────────────────────────────

  renderProfile(person, father, mother, spouses, children, siblings) {
    const isFemale = person.gender === 'female';

    const relChips = (list, icon) => {
      if (!list.length)
        return `<em style="font-size:.8rem;color:var(--clr-muted)">Tiada rekod</em>`;
      return list.map(p => `
        <button class="relation-chip" data-id="${p.id}">
          ${icon} <strong>${p.nickname}</strong> <span style="font-size:.78rem;color:var(--clr-muted)">(${p.fullName})</span>
          ${p.marriageStatus
            ? `<span class="spouse-status ${p.marriageStatus}">${this._statusBadge(p.marriageStatus).icon} ${p.marriageStatus}</span>`
            : ''}
        </button>`).join('');
    };

    const parents = [father, mother].filter(Boolean);

    this.views.profile.innerHTML = `
      <div class="profile-card">
        <div class="profile-banner ${isFemale ? 'female' : ''}"></div>
        <div class="profile-body">
          <div class="profile-avatar-lg ${this._avatarCls(person)}" style="overflow:hidden;padding:0">
            ${person.photo
              ? `<img src="${person.photo}" style="width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:50%"
                  onerror="this.style.display='none';this.parentElement.textContent='${this._initials(person)}'">`
              : this._initials(person)}
          </div>
          <div class="profile-header-info">
            <span class="profile-nickname-badge">Nama Panggilan: <strong>${person.nickname}</strong></span>
            <h2>${person.fullName}</h2>
            <p class="subtitle">
              ${person.profession || 'Pekerjaan tidak dinyatakan'}
              ${!person.isAlive
                ? ' &nbsp;·&nbsp; <strong style="color:var(--clr-deceased)">Meninggal Dunia</strong>'
                : ' &nbsp;·&nbsp; <span style="color:var(--clr-accent2)">● Hidup</span>'}
            </p>
          </div>

          <div class="profile-grid">
            <!-- Maklumat Peribadi -->
            <div class="info-section">
              <h4>Maklumat Peribadi</h4>
              <div class="info-row">
                <span class="label">Nama Penuh</span>
                <span class="value" style="font-weight:700;color:var(--clr-primary)">${person.fullName}</span>
              </div>
              <div class="info-row">
                <span class="label">Nama Panggilan</span>
                <span class="value">${person.nickname}</span>
              </div>
              <div class="info-row">
                <span class="label">Tarikh Lahir</span>
                <span class="value">${this._formatDob(person.dob)}</span>
              </div>
              ${!person.isAlive ? `
              <div class="info-row">
                <span class="label">Tarikh Kematian</span>
                <span class="value">${this._formatDob(person.dateOfDeath)}</span>
              </div>` : ''}
              <div class="info-row">
                <span class="label">Jantina</span>
                <span class="value">${person.gender === 'female' ? '♀ Perempuan' : '♂ Lelaki'}</span>
              </div>
              <div class="info-row">
                <span class="label">Pekerjaan</span>
                <span class="value">${person.profession || '—'}</span>
              </div>
            </div>

            <!-- Hubungan Keluarga -->
            <div class="info-section">
              <h4>Hubungan Keluarga</h4>

              <div class="rel-group">
                <div class="rel-label">👴 Bapa</div>
                <div class="relation-chips">
                  ${father
                    ? `<button class="relation-chip" data-id="${father.id}">👤 <strong>${father.nickname}</strong> <span style="font-size:.78rem;color:var(--clr-muted)">(${father.fullName})</span></button>`
                    : '<em style="font-size:.8rem;color:var(--clr-muted)">Tiada rekod</em>'}
                </div>
              </div>

              <div class="rel-group">
                <div class="rel-label">👩 Ibu</div>
                <div class="relation-chips">
                  ${mother
                    ? `<button class="relation-chip" data-id="${mother.id}">👤 <strong>${mother.nickname}</strong> <span style="font-size:.78rem;color:var(--clr-muted)">(${mother.fullName})</span></button>`
                    : '<em style="font-size:.8rem;color:var(--clr-muted)">Tiada rekod</em>'}
                </div>
              </div>

              <div class="rel-group">
                <div class="rel-label">💍 Pasangan</div>
                <div class="relation-chips">${relChips(spouses, '💑')}</div>
              </div>

              <div class="rel-group">
                <div class="rel-label">👶 Anak-anak</div>
                <div class="relation-chips">${relChips(children, '🧒')}</div>
              </div>

              <div class="rel-group">
                <div class="rel-label">👫 Adik-beradik</div>
                <div class="relation-chips">${relChips(siblings, '🤝')}</div>
              </div>
            </div>
          </div>

          ${person.bio ? `<div class="bio-section">"${person.bio}"</div>` : ''}

          <div class="profile-nav-btns">
            <button class="btn btn-outline" id="btn-back-tree">← Kembali ke Pokok Silsilah</button>
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

    const bar = (label, count, max, color = '') => `
      <div class="bar-row">
        <div class="bar-label">${label}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${Math.round(count / max * 100)}%;${color}"></div>
        </div>
        <div class="bar-count">${count}</div>
      </div>`;

    this.views.stats.innerHTML = `
      <div class="stats-title">📊 Statistik Keluarga Zamaksyari</div>

      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">👥</div>
          <div class="stat-value">${stats.total}</div><div class="stat-label">Jumlah Ahli</div></div>
        <div class="stat-card"><div class="stat-icon">♂</div>
          <div class="stat-value">${stats.male}</div><div class="stat-label">Lelaki</div></div>
        <div class="stat-card"><div class="stat-icon">♀</div>
          <div class="stat-value">${stats.female}</div><div class="stat-label">Perempuan</div></div>
        <div class="stat-card"><div class="stat-icon">💚</div>
          <div class="stat-value">${stats.living}</div><div class="stat-label">Hidup</div></div>
        <div class="stat-card"><div class="stat-icon">🕊️</div>
          <div class="stat-value">${stats.deceased}</div><div class="stat-label">Meninggal</div></div>
        <div class="stat-card"><div class="stat-icon">🌱</div>
          <div class="stat-value">${stats.generations}</div><div class="stat-label">Generasi</div></div>
      </div>

      <div class="chart-section">
        <h4>Peranan / Pekerjaan</h4>
        <div class="bar-chart">
          ${topProf.map(([p, c]) => bar(p, c, maxProf)).join('')}
        </div>
      </div>

      <div class="chart-section">
        <h4>Bilangan Ahli Mengikut Generasi</h4>
        <div class="bar-chart">
          ${genEntries.map(([g, c]) =>
            bar(`Generasi ${+g + 1} (${+g === 0 ? 'Ibu Bapa' : 'Anak-anak'})`, c, maxGen, 'background:linear-gradient(90deg,var(--clr-accent2),var(--clr-accent))')).join('')}
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
