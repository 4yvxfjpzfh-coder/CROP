import { CATEGORIES } from "@/lib/categories";

/** Selector de sección del catálogo. Vacío = se adivina por el nombre. */
export function CategorySelect({
  defaultValue,
  className,
  labelClassName,
}: {
  defaultValue?: string | null;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div>
      <label className={labelClassName} htmlFor="category">
        Sección del catálogo
      </label>
      <select id="category" name="category" defaultValue={defaultValue ?? ""} className={className}>
        <option value="">Automática (según el nombre)</option>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
