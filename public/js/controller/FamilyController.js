/**
 * CONTROLLER — FamilyController
 * ---------------------------------------------------------
 * Orchestrates Model ↔ View.
 * Handles all user interactions and application state.
 * ---------------------------------------------------------
 */
class FamilyController {
  constructor(model, view) {
    this.model = model;
    this.view  = view;

    this._selectedId   = null;
    this._searchQuery  = '';
    this._filterGender = null;   // null | 'male' | 'female'
    this._currentView  = 'tree';
  }

  // ── Bootstrap ─────────────────────────────────────────────────

  async init() {
    try {
      await this.model.load('./data/people.json');
      this._bindEvents();
      this._renderAll();
      this.view.showToast('✅ Family data loaded successfully!');
    } catch (err) {
      console.error(err);
      this.view.showToast('❌ Failed to load family data.');
    }
  }

  // ── Event Binding ─────────────────────────────────────────────

  _bindEvents() {
    // Search input
    this.view.searchInput.addEventListener('input', e => {
      this._searchQuery = e.target.value;
      this._renderSidebar();
    });

    // Gender filter chips
    this.view.filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.gender || null;
        // Toggle off if same filter clicked again
        this._filterGender = (this._filterGender === val) ? null : val;

        this.view.filterChips.forEach(c => c.classList.remove('active'));
        if (this._filterGender) {
          document.querySelector(`.filter-chip[data-gender="${this._filterGender}"]`)
            ?.classList.add('active');
        }
        this._renderSidebar();
      });
    });

    // Top navigation buttons
    this.view.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this._currentView = btn.dataset.view;
        this.view.showView(this._currentView);

        if (this._currentView === 'tree')    this._renderTree();
        if (this._currentView === 'stats')   this._renderStats();
        if (this._currentView === 'profile' && this._selectedId) {
          this._renderProfile(this.model.getById(this._selectedId));
        }
      });
    });

    // Sidebar member list (event delegation)
    this.view.memberList.addEventListener('click', e => {
      const item = e.target.closest('[data-id]');
      if (item) this._selectPerson(item.dataset.id, true);
    });

    // Tree card clicks (event delegation)
    this.view.views.tree.addEventListener('click', e => {
      const card = e.target.closest('[data-id]');
      if (card) this._selectPerson(card.dataset.id, true);
    });

    // Profile relation chip clicks + back button (event delegation)
    this.view.views.profile.addEventListener('click', e => {
      const chip = e.target.closest('.relation-chip[data-id]');
      if (chip) { this._selectPerson(chip.dataset.id, true); return; }

      if (e.target.closest('#btn-back-tree')) {
        this._currentView = 'tree';
        this.view.showView('tree');
        this._renderTree();
      }
    });

    // Modal close
    this.view.modalClose.addEventListener('click', () => this.view.closeModal());
    this.view.modalOverlay.addEventListener('click', e => {
      if (e.target === this.view.modalOverlay) this.view.closeModal();
    });
  }

  // ── Person Selection ──────────────────────────────────────────

  _selectPerson(id, navigateToProfile = false) {
    this._selectedId = id;
    const person = this.model.getById(id);
    if (!person) return;

    this.view.showToast(`👤 ${person.nickname}: ${person.fullName}`);
    this._renderSidebar();

    if (navigateToProfile) {
      this._renderProfile(person);
      this._currentView = 'profile';
      this.view.showView('profile');
    } else {
      // Just highlight in tree without navigating away
      if (this._currentView === 'tree') this._renderTree();
    }
  }

  // ── Render Helpers ────────────────────────────────────────────

  _getFilteredPeople() {
    let people = this.model.getAll();
    if (this._searchQuery)  people = this.model.search(this._searchQuery);
    if (this._filterGender) people = people.filter(p => p.gender === this._filterGender);
    return people;
  }

  _renderAll() {
    this._renderSidebar();
    this._renderTree();
    this.view.showView('tree');
  }

  _renderSidebar() {
    this.view.renderMemberList(this._getFilteredPeople(), this._selectedId);
  }

  _renderTree() {
    const groups = this.model.getGenerationGroups();
    this.view.renderTree(groups, this._selectedId);
  }

  _renderProfile(person) {
    if (!person) return;
    const father   = this.model.getFather(person);
    const mother   = this.model.getMother(person);
    const spouses  = this.model.getSpouses(person);
    const children = this.model.getChildren(person);
    const siblings = this.model.getSiblings(person);
    this.view.renderProfile(person, father, mother, spouses, children, siblings);
  }

  _renderStats() {
    this.view.renderStats(this.model.getStats());
  }
}
