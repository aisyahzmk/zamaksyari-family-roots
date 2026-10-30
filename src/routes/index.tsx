import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/family/Avatar";
import { FamilyModel, RAW_PEOPLE, ME_ID, formatDob, type Gender, type Person } from "@/lib/family";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zamaksyari Family Tree" },
      { name: "description", content: "Family tree, profiles and statistics of the Zamaksyari family." },
      { property: "og:title", content: "Zamaksyari Family Tree" },
      { property: "og:description", content: "Family tree, profiles and statistics of the Zamaksyari family." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FamilyApp,
});

type View = "tree" | "profile" | "stats";
const model = new FamilyModel(RAW_PEOPLE);

function FamilyApp() {
  const [view, setView] = useState<View>("tree");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);

  const list = useMemo(() => model.search(query, gender), [query, gender]);
  const selected = model.getById(selectedId);

  const select = (id: string) => {
    const p = model.getById(id);
    if (!p) return;
    setSelectedId(id);
    setView("profile");
    toast(`👤 ${p.nickname}: ${p.fullName}`);
  };

  const navs: { key: View; icon: string; label: string }[] = [
    { key: "tree", icon: "🌳", label: "Family Tree" },
    { key: "stats", icon: "📊", label: "Statistics" },
  ];

  return (
    <div className="flex h-screen flex-col">
      <header className="bg-header sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between px-4 text-primary-foreground shadow-lift md:px-8">
        <div className="flex items-center gap-3 font-display text-xl font-bold">
          <span className="text-2xl">🌳</span>
          <span className="hidden sm:inline">Zamaksyari Family</span>
        </div>
        <nav className="flex gap-2">
          {navs.map((n) => (
            <button
              key={n.key}
              onClick={() => setView(n.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1.5 text-sm font-medium transition hover:bg-primary-foreground/25",
                view === n.key && "border-primary-foreground/50 bg-primary-foreground/25",
              )}
            >
              <span>{n.icon}</span>
              <span className="hidden md:inline">{n.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card md:flex">
          <div className="border-b border-border px-5 pb-3 pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Family Members
            </h3>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 Search name, job…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="mt-2 flex gap-1.5">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(gender === g ? null : g)}
                  className={cn(
                    "flex-1 rounded-full border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-background",
                    gender === g && "border-primary bg-primary text-primary-foreground hover:bg-primary",
                  )}
                >
                  {g === "male" ? "♂ Male" : "♀ Female"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {list.length === 0 ? (
              <Empty icon="🔍" text="No members found" />
            ) : (
              list.map((p) => (
                <button
                  key={p.id}
                  onClick={() => select(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left transition hover:bg-background",
                    p.id === selectedId && "border-accent bg-secondary",
                  )}
                >
                  <Avatar person={p} className="h-9 w-9 text-sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">
                      {p.nickname}
                      {p.id === ME_ID && <MeTag />}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{p.profession || "Family Member"}</div>
                  </div>
                  {!p.isAlive && <span className="text-deceased">✝</span>}
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="min-w-0 flex-1 overflow-auto">
          {view === "tree" && <TreeView selectedId={selectedId} onSelect={select} />}
          {view === "profile" &&
            (selected ? (
              <ProfileView person={selected} onSelect={select} onBack={() => setView("tree")} />
            ) : (
              <Empty icon="👤" text="Click a person to see their profile" />
            ))}
          {view === "stats" && <StatsView />}
        </section>
      </main>
    </div>
  );
}

function MeTag() {
  return <span className="ml-1.5 rounded-full bg-me/20 px-1.5 py-px text-[0.68rem] font-bold text-primary">Me</span>;
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
      <div className="text-4xl">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2 border-b-2 border-border pb-3 font-display text-2xl font-bold text-primary">
      {children}
      {aside && <span className="ml-auto font-sans text-sm font-normal text-muted-foreground">{aside}</span>}
    </div>
  );
}

function PersonCard({ p, selected, onSelect }: { p: Person; selected: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(p.id)}
      title="Click to see the full profile & real name"
      className={cn(
        "relative flex w-[150px] flex-col items-center gap-2 rounded-xl border-2 border-border bg-card px-3 pb-3 pt-4 text-center shadow-soft transition hover:-translate-y-1 hover:border-primary-light hover:shadow-lift",
        selected && "border-primary ring-4 ring-primary/25",
      )}
    >
      {p.id === ME_ID && (
        <span className="bg-me absolute -right-1.5 -top-2.5 rounded-full px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-me-foreground shadow-soft">
          ✨ Me
        </span>
      )}
      <Avatar person={p} className="h-16 w-16 text-xl" />
      <div className="font-display text-lg font-extrabold leading-tight text-primary">{p.nickname}</div>
      <div className="flex min-h-[2.4em] items-center text-[0.7rem] leading-tight text-muted-foreground">
        {p.profession || "—"}
      </div>
      <div className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[0.65rem] font-semibold text-primary-light">
        View Profile ➔
      </div>
    </button>
  );
}

function TreeView({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const groups = model.getGenerationGroups();
  const parents = groups.find((g) => g.gen === 0)?.people ?? [];
  const children = groups.find((g) => g.gen === 1)?.people ?? [];
  const father = parents.find((p) => p.gender === "male");
  const mother = parents.find((p) => p.gender === "female");

  return (
    <div className="p-4 md:p-8">
      <SectionTitle aside="💡 Click any card to see the real name & full profile">
        🌳 Zamaksyari Family Tree
      </SectionTitle>
      <div className="mx-auto flex w-max flex-col items-center px-4 pb-12 pt-4 max-xl:[zoom:0.8] max-sm:[zoom:0.5]">
        <div className="flex items-center gap-12">
          {father && <PersonCard p={father} selected={father.id === selectedId} onSelect={onSelect} />}
          <div className="relative flex items-center">
            <div className="tree-line absolute -left-12 -right-12 top-1/2 h-[3px]" />
            <div className="relative rounded-full border-2 border-primary-light bg-card px-3 py-1 text-xs font-bold text-primary shadow-soft">
              💍 Married
            </div>
          </div>
          {mother && <PersonCard p={mother} selected={mother.id === selectedId} onSelect={onSelect} />}
        </div>
        <div className="tree-line h-10 w-[3px]" />
        <div className="relative flex items-start justify-center pt-6 [--zig:13rem]">
          {children.length > 1 && (
            <div className="tree-line absolute left-[75px] right-[75px] top-0 h-[3px]" />
          )}
          {children.map((c, i) => {
            const low = i % 2 === 1;
            return (
              <div
                key={c.id}
                className={cn("relative flex flex-col items-center", i > 0 && "-ml-[45px]", low ? "z-0" : "z-10")}
                style={{ paddingTop: low ? "var(--zig)" : 0 }}
              >
                <div
                  className="tree-line absolute -top-6 w-[3px]"
                  style={{ height: low ? "calc(1.5rem + var(--zig))" : "1.5rem" }}
                />
                <PersonCard p={c} selected={c.id === selectedId} onSelect={onSelect} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RelChips({
  list,
  icon,
  onSelect,
}: {
  list: (Person & { marriageStatus?: string })[];
  icon: string;
  onSelect: (id: string) => void;
}) {
  if (!list.length) return <em className="text-xs text-muted-foreground">No record</em>;
  const status: Record<string, string> = { married: "💍", divorced: "💔", widowed: "🕊️" };
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className="rounded-full border border-border bg-background px-3 py-1 text-sm transition hover:border-primary hover:bg-secondary"
        >
          {icon} <strong>{p.nickname}</strong> <span className="text-xs text-muted-foreground">({p.fullName})</span>
          {p.marriageStatus && (
            <span className="ml-1 text-xs text-living">
              {status[p.marriageStatus] ?? "❤️"} {p.marriageStatus}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-dashed border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

function ProfileView({ person, onSelect, onBack }: { person: Person; onSelect: (id: string) => void; onBack: () => void }) {
  const father = model.getFather(person);
  const mother = model.getMother(person);
  const groups: [string, React.ReactNode][] = [
    ["Father", <RelChips key="f" list={father ? [father] : []} icon="👤" onSelect={onSelect} />],
    ["Mother", <RelChips key="m" list={mother ? [mother] : []} icon="👤" onSelect={onSelect} />],
    ["Spouse", <RelChips key="s" list={model.getSpouses(person)} icon="💑" onSelect={onSelect} />],
    ["Children", <RelChips key="c" list={model.getChildren(person)} icon="🧒" onSelect={onSelect} />],
    ["Siblings", <RelChips key="b" list={model.getSiblings(person)} icon="🤝" onSelect={onSelect} />],
  ];

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
        <div className="bg-header h-24" />
        <div className="px-6 pb-8 md:px-10">
          <Avatar person={person} className="-mt-12 h-24 w-24 border-4 border-card text-3xl shadow-lift" />
          <div className="mt-4">
            <span className="inline-block rounded-full border border-accent bg-secondary px-3 py-0.5 text-sm font-bold text-primary">
              Nama Panggilan: <strong>{person.nickname}</strong>
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold">{person.fullName}</h2>
            <p className="mt-1 text-muted-foreground">
              {person.profession || "Job not stated"} ·{" "}
              {person.isAlive ? (
                <span className="text-living">● Living</span>
              ) : (
                <strong className="text-deceased">Passed Away</strong>
              )}
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary-light">Personal Info</h4>
              <InfoRow label="Full Name"><span className="font-bold text-primary">{person.fullName}</span></InfoRow>
              <InfoRow label="Nama Panggilan">{person.nickname}</InfoRow>
              <InfoRow label="Date of Birth">{formatDob(person.dob)}</InfoRow>
              {!person.isAlive && <InfoRow label="Date of Death">{formatDob(person.dateOfDeath)}</InfoRow>}
              <InfoRow label="Gender">{person.gender === "female" ? "♀ Female" : "♂ Male"}</InfoRow>
              <InfoRow label="Job">{person.profession || "—"}</InfoRow>
            </div>
            <div className="rounded-xl border border-border bg-background p-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary-light">Family Connections</h4>
              <div className="space-y-3">
                {groups.map(([label, node]) => (
                  <div key={label}>
                    <div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>
                    {node}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {person.bio && (
            <blockquote className="mt-6 rounded-r-xl border-l-4 border-primary-light bg-secondary p-5 font-display italic text-foreground">
              “{person.bio}”
            </blockquote>
          )}

          <button
            onClick={onBack}
            className="mt-6 rounded-lg border-2 border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            ← Back to Family Tree
          </button>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, count, max, alt }: { label: string; count: number; max: number; alt?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-56 shrink-0 truncate text-muted-foreground">{label}</div>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", alt ? "bg-bar-alt" : "bg-bar")} style={{ width: `${Math.round((count / max) * 100)}%` }} />
      </div>
      <div className="w-6 text-right font-bold text-primary">{count}</div>
    </div>
  );
}

function StatsView() {
  const s = model.getStats();
  const prof = Object.entries(s.professions).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxProf = Math.max(...prof.map((o) => o[1]), 1);
  const gens = Object.entries(s.genCounts).sort((a, b) => +a[0] - +b[0]);
  const maxGen = Math.max(...gens.map((e) => e[1]), 1);
  const cards = [
    ["👥", s.total, "Total Members"],
    ["♂", s.male, "Male"],
    ["♀", s.female, "Female"],
    ["💚", s.living, "Living"],
    ["🕊️", s.deceased, "Passed Away"],
    ["🌱", s.generations, "Generations"],
  ] as const;

  return (
    <div className="p-4 md:p-8">
      <SectionTitle>📊 Zamaksyari Family Statistics</SectionTitle>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map(([icon, v, l]) => (
          <div key={l} className="rounded-xl border border-border bg-card p-5 text-center shadow-soft">
            <div className="text-2xl">{icon}</div>
            <div className="mt-1 font-display text-3xl font-bold text-primary">{v}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-soft">
        <h4 className="mb-4 font-display text-lg font-bold text-primary">Jobs / Roles</h4>
        <div className="space-y-3">
          {prof.map(([p, c]) => <Bar key={p} label={p} count={c} max={maxProf} />)}
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-soft">
        <h4 className="mb-4 font-display text-lg font-bold text-primary">Members by Generation</h4>
        <div className="space-y-3">
          {gens.map(([g, c]) => (
            <Bar key={g} alt label={`Generation ${+g + 1} (${+g === 0 ? "Parents" : "Children"})`} count={c} max={maxGen} />
          ))}
        </div>
      </div>
    </div>
  );
}
