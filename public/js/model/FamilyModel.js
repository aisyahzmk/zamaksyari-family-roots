/**
 * MODEL — FamilyModel
 * ---------------------------------------------------------
 * Parses the geoseiden-compatible people.json format:
 *   { id, firstName, lastName, nickname, gender, dob, dateOfDeath,
 *     profession, photo, fatherId, motherId,
 *     spouses: [{id, status}], bio }
 *
 * All relationship lookups are computed dynamically from fatherId /
 * motherId / spouses arrays — no pre-built children arrays
 * needed in the JSON.
 * ---------------------------------------------------------
 */
class FamilyModel {
  constructor() {
    this._people = [];     // raw parsed records
    this._listeners = [];
  }

  // ── Data Loading ──────────────────────────────────────────────
  async load(url = './data/people.json') {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);
    const raw = await res.json();
    this._people = raw.map(p => this._normalise(p));
    this._notify('load', this._people);
    return this._people;
  }

  /**
   * Normalise a raw JSON record into a consistent internal shape.
   * Converts geoseiden fields → app-friendly properties.
   */
  _normalise(raw) {
    return {
      id:          raw.id,
      nickname:    raw.nickname   || raw.firstName || '',
      firstName:   raw.firstName  || '',
      lastName:    raw.lastName   || '',
      fullName:    `${raw.firstName || ''} ${raw.lastName || ''}`.trim(),
      gender:      raw.gender     || 'male',
      dob:         raw.dob        || '',           // "YYYY-MM-DD"
      dateOfDeath: raw.dateOfDeath || '',          // "" = living
      profession:  raw.profession || '',
      fatherId:    raw.fatherId   || null,
      motherId:    raw.motherId   || null,
      spouses:     Array.isArray(raw.spouses) ? raw.spouses : [],  // [{id, status}]
      photo:       raw.photo      || '',
      bio:         raw.bio        || '',
      // Derived helpers
      birthYear:   raw.dob   ? raw.dob.split('-')[0]         : '?',
      deathYear:   raw.dateOfDeath ? raw.dateOfDeath.split('-')[0] : null,
      isAlive:     !raw.dateOfDeath,
    };
  }

  // ── Observer ──────────────────────────────────────────────────
  on(event, cb) { this._listeners.push({ event, cb }); }
  _notify(event, data) {
    this._listeners.filter(l => l.event === event).forEach(l => l.cb(data));
  }

  // ── Basic Queries ──────────────────────────────────────────────
  getAll()       { return [...this._people]; }
  getById(id)    { return this._people.find(p => p.id === id) || null; }
  getByIds(ids)  { return (ids || []).map(id => this.getById(id)).filter(Boolean); }

  // ── Relationship Queries (computed from JSON fields) ──────────

  /** Returns the father Person object (if found) */
  getFather(person) {
    return person.fatherId ? this.getById(person.fatherId) : null;
  }

  /** Returns the mother Person object (if found) */
  getMother(person) {
    return person.motherId ? this.getById(person.motherId) : null;
  }

  /** Returns both parents as an array */
  getParents(person) {
    return [this.getFather(person), this.getMother(person)].filter(Boolean);
  }

  /** Returns full spouse Person objects with their status attached */
  getSpouses(person) {
    return person.spouses
      .map(s => {
        const sp = this.getById(s.id);
        return sp ? { ...sp, marriageStatus: s.status } : null;
      })
      .filter(Boolean);
  }

  /**
   * Children = everyone who lists this person as fatherId OR motherId.
   * Computed dynamically — no children[] array needed in JSON.
   */
  getChildren(person) {
    return this._people.filter(p =>
      p.fatherId === person.id || p.motherId === person.id
    );
  }

  /** Siblings = share at least one parent */
  getSiblings(person) {
    const parentIds = new Set(
      [person.fatherId, person.motherId].filter(Boolean)
    );
    return this._people.filter(p =>
      p.id !== person.id &&
      (parentIds.has(p.fatherId) || parentIds.has(p.motherId))
    );
  }

  // ── Generation Mapping ────────────────────────────────────────
  /**
   * BFS from roots (no parents) outward.
   * Returns Map<id, genNumber>. Roots = 0.
   */
  computeGenerations() {
    const genMap = new Map();

    const resolve = (person, visited = new Set()) => {
      if (genMap.has(person.id))  return genMap.get(person.id);
      if (visited.has(person.id)) return 0;
      visited.add(person.id);

      const parents = this.getParents(person);
      if (!parents.length) { genMap.set(person.id, 0); return 0; }

      const parentGens = parents.map(p => resolve(p, visited));
      const gen = Math.max(...parentGens) + 1;
      genMap.set(person.id, gen);
      return gen;
    };

    this._people.forEach(p => resolve(p));
    return genMap;
  }

  /** Groups people into [{gen, people}] sorted ascending */
  getGenerationGroups() {
    const genMap = this.computeGenerations();
    const groups = new Map();

    this._people.forEach(p => {
      const g = genMap.get(p.id) ?? 0;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(p);
    });

    return [...groups.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([gen, people]) => ({ gen, people }));
  }

  // ── Search & Filter ───────────────────────────────────────────
  /**
   * Multi-attribute search and filtering:
   * Query keyword, gender, and generation
   */
  search(query = '', gender = 'all', gen = 'all') {
    const q = (query || '').toLowerCase().trim();
    const genMap = this.computeGenerations();

    return this._people.filter(p => {
      // Gender filter
      if (gender && gender !== 'all' && p.gender !== gender) return false;

      // Generation filter
      if (gen !== 'all' && gen !== null && gen !== undefined && gen !== '') {
        const pGen = genMap.get(p.id) ?? 0;
        if (pGen !== Number(gen)) return false;
      }

      // Keyword query
      if (!q) return true;
      return (
        p.nickname.toLowerCase().includes(q) ||
        p.fullName.toLowerCase().includes(q) ||
        p.profession.toLowerCase().includes(q) ||
        (p.bio && p.bio.toLowerCase().includes(q))
      );
    });
  }

  // ── Statistics ────────────────────────────────────────────────
  getStats() {
    const all         = this.getAll();
    const genMap      = this.computeGenerations();
    const professions = {};
    const genCounts   = {};

    all.forEach(p => {
      if (p.profession) professions[p.profession] = (professions[p.profession] || 0) + 1;
    });

    genMap.forEach(gen => {
      genCounts[gen] = (genCounts[gen] || 0) + 1;
    });

    return {
      total:       all.length,
      male:        all.filter(p => p.gender === 'male').length,
      female:      all.filter(p => p.gender === 'female').length,
      living:      all.filter(p => p.isAlive).length,
      deceased:    all.filter(p => !p.isAlive).length,
      generations: genMap.size ? Math.max(...genMap.values()) + 1 : 0,
      professions,
      genCounts,
    };
  }
}
