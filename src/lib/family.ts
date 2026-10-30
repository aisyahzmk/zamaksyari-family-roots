import ayah from "@/assets/family/ayah.jpg.asset.json";
import ibu from "@/assets/family/ibu.jpg.asset.json";
import abang from "@/assets/family/abang.jpg.asset.json";
import kakak from "@/assets/family/kakak.jpg.asset.json";
import saya from "@/assets/family/saya.jpg.asset.json";
import adikPerempuan from "@/assets/family/adik_perempuan.jpg.asset.json";
import adikLelaki from "@/assets/family/adik_lelaki.jpg.asset.json";
import bongsu from "@/assets/family/bongsu.jpg.asset.json";

export type Gender = "male" | "female";
export type SpouseLink = { id: string; status: "married" | "divorced" | "widowed" | string };

export type RawPerson = {
  id: string;
  nickname: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string;
  dateOfDeath: string;
  profession: string;
  photo: string;
  fatherId: string | null;
  motherId: string | null;
  spouses: SpouseLink[];
  bio: string;
};

export type Person = RawPerson & {
  fullName: string;
  birthYear: string;
  deathYear: string | null;
  isAlive: boolean;
};

export const RAW_PEOPLE: RawPerson[] = [
  { id: "p1", nickname: "Ayah", firstName: "Zamaksyari", lastName: "Abd Ghani", gender: "male", dob: "1974-01-02", dateOfDeath: "", profession: "Teacher", photo: ayah.url, fatherId: null, motherId: null, spouses: [{ id: "p2", status: "married" }], bio: "Patriarch of the Zamaksyari family. Dedicated educator and loving father of six children." },
  { id: "p2", nickname: "Ibu", firstName: "Zalina", lastName: "Long", gender: "female", dob: "1974-03-17", dateOfDeath: "", profession: "JHEAINS Officer", photo: ibu.url, fatherId: null, motherId: null, spouses: [{ id: "p1", status: "married" }], bio: "Matriarch of the family and JHEAINS officer. The heart of the family, raising and nurturing six wonderful children." },
  { id: "p3", nickname: "Abang", firstName: "Muhammad Firdaus", lastName: "Zamaksyari", gender: "male", dob: "2001-07-13", dateOfDeath: "", profession: "Chief Minister's Office Officer", photo: abang.url, fatherId: "p1", motherId: "p2", spouses: [], bio: "The eldest son. Works at the Chief Minister's Office (Pejabat Menteri Besar). A responsible elder brother." },
  { id: "p4", nickname: "Angah", firstName: "Siti Zulaikha", lastName: "Zamaksyari", gender: "female", dob: "2002-12-12", dateOfDeath: "", profession: "Assistant Secretarial Executive", photo: kakak.url, fatherId: "p1", motherId: "p2", spouses: [], bio: "The eldest daughter. Works as an Assistant Secretarial Executive. Caring, reliable, and supportive sister." },
  { id: "p5", nickname: "Ateh", firstName: "Siti Aisyah", lastName: "Zamaksyari", gender: "female", dob: "2005-03-14", dateOfDeath: "", profession: "University Student (IT)", photo: saya.url, fatherId: "p1", motherId: "p2", spouses: [], bio: "The third child. Information Technology student passionate about web application development, coding, and technology." },
  { id: "p6", nickname: "Kakcik", firstName: "Siti Khadijah Nur", lastName: "Zamaksyari", gender: "female", dob: "2007-06-19", dateOfDeath: "", profession: "Form 6 Student", photo: adikPerempuan.url, fatherId: "p1", motherId: "p2", spouses: [], bio: "Younger sister. Currently a dedicated Form 6 student, cheerful and supportive." },
  { id: "p7", nickname: "Iwan", firstName: "Muhammad Ridhwan", lastName: "Zamaksyari", gender: "male", dob: "2009-06-11", dateOfDeath: "", profession: "Form 5 Student", photo: adikLelaki.url, fatherId: "p1", motherId: "p2", spouses: [], bio: "Younger brother. Currently sitting for secondary education as a Form 5 student. Energetic and sports-minded." },
  { id: "p8", nickname: "Adik", firstName: "Siti Fatimah Nur", lastName: "Zamaksyari", gender: "female", dob: "2017-12-28", dateOfDeath: "", profession: "Standard 3 Student", photo: bongsu.url, fatherId: "p1", motherId: "p2", spouses: [], bio: "The youngest child (si bongsu). Currently studying in Standard 3 primary school. Cheerful darling of the family." },
];

/** The site owner ("Saya") */
export const ME_ID = "p5";

export const normalise = (r: RawPerson): Person => ({
  ...r,
  fullName: `${r.firstName} ${r.lastName}`.trim(),
  birthYear: r.dob ? (r.dob.split("-")[0] ?? "?") : "?",
  deathYear: r.dateOfDeath ? (r.dateOfDeath.split("-")[0] ?? null) : null,
  isAlive: !r.dateOfDeath,
});

export class FamilyModel {
  people: Person[];
  constructor(raw: RawPerson[]) {
    this.people = raw.map(normalise);
    const gens = this.computeGenerations();
    this.people.forEach((p) => (p.generation = (gens.get(p.id) ?? 0) + 1));
  }
  /** Sorted list of generation numbers (1 = oldest). */
  getGenerations() {
    return [...new Set(this.people.map((p) => p.generation))].sort((a, b) => a - b);
  }
  getById(id: string | null) {
    return id ? (this.people.find((p) => p.id === id) ?? null) : null;
  }
  getFather(p: Person) {
    return this.getById(p.fatherId);
  }
  getMother(p: Person) {
    return this.getById(p.motherId);
  }
  getSpouses(p: Person) {
    return p.spouses
      .map((s) => {
        const sp = this.getById(s.id);
        return sp ? { ...sp, marriageStatus: s.status } : null;
      })
      .filter((x): x is Person & { marriageStatus: string } => !!x);
  }
  getChildren(p: Person) {
    return this.people.filter((c) => c.fatherId === p.id || c.motherId === p.id);
  }
  getSiblings(p: Person) {
    const ids = new Set([p.fatherId, p.motherId].filter(Boolean));
    return this.people.filter(
      (o) => o.id !== p.id && ((o.fatherId && ids.has(o.fatherId)) || (o.motherId && ids.has(o.motherId))),
    );
  }
  computeGenerations() {
    const gen = new Map<string, number>();
    const resolve = (p: Person, visited = new Set<string>()): number => {
      if (gen.has(p.id)) return gen.get(p.id)!;
      if (visited.has(p.id)) return 0;
      visited.add(p.id);
      const parents = [this.getFather(p), this.getMother(p)].filter((x): x is Person => !!x);
      const g = parents.length ? Math.max(...parents.map((x) => resolve(x, visited))) + 1 : 0;
      gen.set(p.id, g);
      return g;
    };
    this.people.forEach((p) => resolve(p));
    return gen;
  }
  getGenerationGroups() {
    const map = this.computeGenerations();
    const groups = new Map<number, Person[]>();
    this.people.forEach((p) => {
      const g = map.get(p.id) ?? 0;
      groups.set(g, [...(groups.get(g) ?? []), p]);
    });
    return [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([gen, people]) => ({ gen, people }));
  }
  search(query: string, gender: Gender | null, generation: number | null = null) {
    const q = query.toLowerCase().trim();
    return this.people.filter(
      (p) =>
        (!gender || p.gender === gender) &&
        (!generation || p.generation === generation) &&
        (!q ||
          p.nickname.toLowerCase().includes(q) ||
          p.fullName.toLowerCase().includes(q) ||
          p.profession.toLowerCase().includes(q)),
    );
  }
  getStats() {
    const all = this.people;
    const genMap = this.computeGenerations();
    const professions: Record<string, number> = {};
    const genCounts: Record<number, number> = {};
    all.forEach((p) => p.profession && (professions[p.profession] = (professions[p.profession] ?? 0) + 1));
    genMap.forEach((g) => (genCounts[g] = (genCounts[g] ?? 0) + 1));
    return {
      total: all.length,
      male: all.filter((p) => p.gender === "male").length,
      female: all.filter((p) => p.gender === "female").length,
      living: all.filter((p) => p.isAlive).length,
      deceased: all.filter((p) => !p.isAlive).length,
      generations: genMap.size ? Math.max(...genMap.values()) + 1 : 0,
      professions,
      genCounts,
    };
  }
}

export const initials = (p: Person) => {
  const parts = p.firstName.trim().split(" ");
  const a = parts[0]?.[0] ?? "";
  const b = parts.length >= 2 ? (parts[1]?.[0] ?? "") : "";
  return (a + b).toUpperCase() || ((p.firstName || "?")[0] ?? "?") + ((p.lastName || "?")[0] ?? "?");
};

export const formatDob = (dob: string) => {
  if (!dob) return "—";
  const [y = "", m = "1", d = "1"] = dob.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${+d} ${months[+m - 1]} ${y}`;
};
