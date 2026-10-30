import { useState } from "react";
import { cn } from "@/lib/utils";
import { initials, type Person } from "@/lib/family";

export function Avatar({ person, className }: { person: Person; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border font-bold text-primary-foreground",
        person.gender === "female" ? "bg-female" : "bg-male",
        !person.isAlive && "opacity-60 grayscale",
        className,
      )}
    >
      {person.photo && !failed ? (
        <img
          src={person.photo}
          alt={person.fullName}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        initials(person)
      )}
    </div>
  );
}
