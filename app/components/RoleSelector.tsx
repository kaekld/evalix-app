"use client";

export type Role = "alumno" | "docente";

type RoleSelectorProps = {
  role: Role;
  onChange: (role: Role) => void;
};

const roles: { value: Role; label: string }[] = [
  { value: "alumno", label: "Alumno" },
  { value: "docente", label: "Docente" },
];

export default function RoleSelector({ role, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="block text-base font-medium text-zinc-700">
        Iniciar sesión como
      </span>
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-zinc-100 p-1">
        {roles.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            aria-pressed={role === item.value}
            className={`h-10 rounded-md text-base font-medium transition ${role === item.value
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
