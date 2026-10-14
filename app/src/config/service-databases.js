const ownership = require("../../database/services/ownership.json");
function identifier(value) {
  if (typeof value !== "string" || !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(value))
    throw Error("Invalid SQL identifier.");
  return "`" + value + "`";
}
function layout(source) {
  identifier(source);
  return Object.fromEntries(
    Object.entries(ownership).map(([service, entry]) => {
      const database = source + "_" + entry.suffix;
      identifier(database);
      return [service, { ...entry, database }];
    }),
  );
}
function owners() {
  const result = {};
  for (const [service, entry] of Object.entries(ownership))
    for (const table of entry.objects) {
      if (result[table]) throw Error("Duplicate database owner: " + table);
      result[table] = service;
    }
  return result;
}
function tableNames(database) {
  const service = Object.values(ownership).find((entry) =>
    database.endsWith("_" + entry.suffix),
  );
  if (!service) throw Error("Service database suffix is invalid.");
  const source = database.slice(0, -service.suffix.length - 1),
    databases = layout(source),
    byTable = owners();
  const names = {};
  for (const [table, owner] of Object.entries(byTable))
    names[table] =
      identifier(databases[owner].database) + "." + identifier(table);
  for (const [alias, table] of Object.entries(
    require("../../database/adminer/identifiers.json").tables,
  )) {
    if (names[table]) names[alias] = names[table];
  }
  return names;
}
module.exports = { ownership, identifier, layout, owners, tableNames };
