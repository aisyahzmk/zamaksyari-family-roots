/**
 * CONTROLLER — FamilyController
 * ---------------------------------------------------------
 * Orchestrates Model ↔ View.
 * Implements interactive canvas (Drag to Pan & Scroll to Zoom),
 * Dropdown filtering, navigation, and state management.
 * ---------------------------------------------------------
 */
class FamilyController {
  constructor(model, view) {
    this.model = model;
    this.view  = view;

    this._selectedId   = null;
    this._searchQuery  = '';
    this._filterGender = 'all';  // 'all' | 'male' | 'female'
    this._filterGen    = 'all';  // 'all' | '0' | '1'
    this._currentView  = 'tree';
    this._previousView = 'tree';

    // Canvas Pan & Zoom State
    this._zoomLevel    = 1.0;
    this._panX         = 0;
    this._panY         = 0;
    this._isPanning    = false;
    this._panStartX    = 0;
    this._panStartY    = 0;
    this._hasDragged   = false;
    this._pendingCardId = null;
  }

  // ── Bootstrap ─────────────────────────────────────────────────
  async init() {
    try {
      await this.model.load('./data/people.json');
      this._bindEvents();
      this._bindCanvasPanAndZoom();
      this._renderAll();
      this.view.showToast('✅ Family heritage data loaded successfully!');
    } catch (err) {
      console.error(err);
      this.view.showToast('❌ Failed to load family data.');
    }
  }

  // ── Event Binding ─────────────────────────────────────────────
  _bindEvents() {
    // 1. Top Bar Search Input
    const topSearch = document.getElementById('top-search');
    const btnClearSearch = document.getElementById('btn-clear-search');

    if (topSearch) {
      topSearch.addEventListener('input', e => {
        this._searchQuery = e.target.value;
        this._handleFilterUpdate();
      });
    }

    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        if (topSearch) topSearch.value = '';
        this._searchQuery = '';
        this._handleFilterUpdate();
      });
    }

    // 2. Top Bar Generation Dropdown Filter
    const filterGen = document.getElementById('top-filter-gen');
    if (filterGen) {
      filterGen.addEventListener('change', e => {
        this._filterGen = e.target.value;
        this._handleFilterUpdate();
      });
    }

    // 3. Top Bar Gender Dropdown Filter
    const filterGender = document.getElementById('top-filter-gender');
    if (filterGender) {
      filterGender.addEventListener('change', e => {
        this._filterGender = e.target.value;
        this._handleFilterUpdate();
      });
    }

    // 4. Top Bar Reset Button
    const btnReset = document.getElementById('btn-top-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this._searchQuery = '';
        this._filterGender = 'all';
        this._filterGen = 'all';

        if (topSearch) topSearch.value = '';
        if (filterGen) filterGen.value = 'all';
        if (filterGender) filterGender.value = 'all';

        this._handleFilterUpdate();
      });
    }

    // 5. Navigation Tabs
    this.view.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.dataset.view;
        this._currentView = targetView;
        this.view.showView(this._currentView);

        if (this._currentView === 'tree')      this._renderTree();
        if (this._currentView === 'directory') this._renderDirectory();
        if (this._currentView === 'stats')     this._renderStats();
        if (this._currentView === 'profile' && this._selectedId) {
          this._renderProfile(this.model.getById(this._selectedId));
        }
      });
    });

    // 6. Global event delegation for directory cards, profile buttons, and relation chips
    const contentArea = document.getElementById('content-area');
    contentArea.addEventListener('click', e => {
      // Directory Card Click
      const dirCard = e.target.closest('.neo-directory-card[data-id]');
      if (dirCard) {
        this._selectPerson(dirCard.dataset.id);
        return;
      }

      // Kinship Relation Button Click in Profile
      const relBtn = e.target.closest('.neo-rel-btn[data-id]');
      if (relBtn) {
        this._selectPerson(relBtn.dataset.id);
        return;
      }

      // Back to Tree Button
      if (e.target.closest('#btn-back-tree, #btn-back-tree-bottom')) {
        this._currentView = this._previousView === 'profile' ? 'tree' : this._previousView;
        this.view.showView(this._currentView);
        if (this._currentView === 'tree')      this._renderTree();
        if (this._currentView === 'directory') this._renderDirectory();
        if (this._currentView === 'stats')     this._renderStats();
      }
    });
  }

  // ── Canvas Pan (Drag to move) & Wheel to Zoom ─────────────────
  _bindCanvasPanAndZoom() {
    const viewport = this.view.treeViewport;
    if (!viewport) return;

    // Mouse Down: Start Pan
    viewport.addEventListener('mousedown', e => {
      // Ignore clicks on floating zoom controls
      if (e.target.closest('.neo-floating-zoom')) return;

      const personCard = e.target.closest('.neo-person-card[data-id]');
      this._pendingCardId = personCard ? personCard.dataset.id : null;

      this._isPanning   = true;
      this._hasDragged  = false;
      this._panStartX   = e.clientX - this._panX;
      this._panStartY   = e.clientY - this._panY;
      viewport.classList.add('is-dragging');
    });

    // Mouse Move: Pan Canvas
    window.addEventListener('mousemove', e => {
      if (!this._isPanning) return;

      const deltaX = e.clientX - (this._panStartX + this._panX);
      const deltaY = e.clientY - (this._panStartY + this._panY);

      if (Math.hypot(deltaX, deltaY) > 4) {
        this._hasDragged = true;
      }

      this._panX = e.clientX - this._panStartX;
      this._panY = e.clientY - this._panStartY;
      this.view.updateCanvasTransform(this._panX, this._panY, this._zoomLevel);
    });

    // Mouse Up: Stop Pan & Handle Card Click if not dragged
    window.addEventListener('mouseup', () => {
      if (!this._isPanning) return;
      this._isPanning = false;
      viewport.classList.remove('is-dragging');

      // If user did not drag, it's a genuine click on a card!
      if (!this._hasDragged && this._pendingCardId) {
        this._selectPerson(this._pendingCardId);
      }
      this._pendingCardId = null;
    });

    // Scroll Wheel: Zoom In / Out centered on canvas
    viewport.addEventListener('wheel', e => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this._zoomLevel = Math.min(2.0, Math.max(0.4, Math.round(this._zoomLevel * zoomFactor * 100) / 100));
      this.view.updateCanvasTransform(this._panX, this._panY, this._zoomLevel);
    }, { passive: false });

    // Floating Zoom Buttons
    const btnZoomIn    = document.getElementById('btn-zoom-in');
    const btnZoomOut   = document.getElementById('btn-zoom-out');
    const btnZoomReset = document.getElementById('btn-zoom-reset');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', e => {
        e.stopPropagation();
        this._zoomLevel = Math.min(2.0, Math.round((this._zoomLevel + 0.1) * 10) / 10);
        this.view.updateCanvasTransform(this._panX, this._panY, this._zoomLevel);
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', e => {
        e.stopPropagation();
        this._zoomLevel = Math.max(0.4, Math.round((this._zoomLevel - 0.1) * 10) / 10);
        this.view.updateCanvasTransform(this._panX, this._panY, this._zoomLevel);
      });
    }

    if (btnZoomReset) {
      btnZoomReset.addEventListener('click', e => {
        e.stopPropagation();
        this._zoomLevel = 1.0;
        this._panX = 0;
        this._panY = 0;
        this.view.updateCanvasTransform(this._panX, this._panY, this._zoomLevel);
      });
    }
  }

  // ── State & Selection Helpers ─────────────────────────────────
  _selectPerson(id) {
    const person = this.model.getById(id);
    if (!person) return;

    if (this._currentView !== 'profile') {
      this._previousView = this._currentView;
    }
    this._selectedId = id;
    this._currentView = 'profile';

    this.view.showView('profile');
    this._renderProfile(person);
    this.view.showToast(`👤 ${person.nickname}: ${person.fullName}`);
  }

  _handleFilterUpdate() {
    if (this._currentView === 'tree') {
      this._renderTree();
    } else if (this._currentView === 'directory') {
      this._renderDirectory();
    }
  }

  // ── Render Helpers ────────────────────────────────────────────
  _renderAll() {
    this._renderTree();
    this._renderDirectory();
    this._renderStats();
  }

  _renderTree() {
    const groups = this.model.getGenerationGroups();
    const filteredList = this.model.search(this._searchQuery, this._filterGender, this._filterGen);
    const filteredIdSet = new Set(filteredList.map(p => p.id));

    this.view.renderTree(groups, this._selectedId, filteredIdSet);
    this.view.updateCanvasTransform(this._panX, this._panY, this._zoomLevel);
  }

  _renderDirectory() {
    const filteredList = this.model.search(this._searchQuery, this._filterGender, this._filterGen);
    const totalCount = this.model.getAll().length;

    this.view.renderDirectory(filteredList, totalCount, this._selectedId);
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
    const stats = this.model.getStats();
    this.view.renderStats(stats);
  }
}
