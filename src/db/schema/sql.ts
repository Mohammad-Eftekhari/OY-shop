import { sql, type SQL } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export function sqlStringList(values: readonly string[]): SQL {
  return sql.raw(values.map((value) => `'${value}'`).join(", "));
}

export function timestampColumns() {
  return {
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  };
}
