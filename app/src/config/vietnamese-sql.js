const identifiers = require("../../database/adminer/identifiers.json");

const names = { ...identifiers.tables, ...identifiers.columns };
const reverseColumns = Object.fromEntries(
  Object.entries(identifiers.columns).map(([oldName, newName]) => [
    newName,
    oldName,
  ]),
);

function translateSql(sql) {
  if (typeof sql !== "string") return sql;
  let result = "";
  for (let i = 0; i < sql.length; ) {
    const char = sql[i];
    if (char === "'" || char === '"') {
      const quote = char;
      result += char;
      i++;
      while (i < sql.length) {
        result += sql[i];
        if (sql[i] === "\\" && i + 1 < sql.length) {
          result += sql[++i];
        } else if (sql[i] === quote) {
          if (sql[i + 1] === quote) result += sql[++i];
          else {
            i++;
            break;
          }
        }
        i++;
      }
      continue;
    }
    if (char === "`" && sql.indexOf("`", i + 1) !== -1) {
      const end = sql.indexOf("`", i + 1);
      const oldName = sql.slice(i + 1, end);
      result += "`" + (names[oldName] || oldName) + "`";
      i = end + 1;
      continue;
    }
    if (/[a-z_]/.test(char)) {
      let end = i + 1;
      while (end < sql.length && /[a-z_0-9]/.test(sql[end])) end++;
      const oldName = sql.slice(i, end);
      result += names[oldName] || oldName;
      i = end;
      continue;
    }
    result += char;
    i++;
  }
  return result;
}

function translateRows(rows) {
  if (!Array.isArray(rows)) return rows;
  return rows.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return row;
    return Object.fromEntries(
      Object.entries(row).map(([name, value]) => [
        reverseColumns[name] || name,
        value,
      ]),
    );
  });
}

function wrapSql(target) {
  return new Proxy(target, {
    get(object, property) {
      if (property === "query" || property === "execute")
        return async (sql, ...args) => {
          const [rows, fields] = await object[property](
            translateSql(sql),
            ...args,
          );
          return [translateRows(rows), fields];
        };
      if (property === "getConnection")
        return async () => wrapSql(await object.getConnection());
      const value = object[property];
      return typeof value === "function" ? value.bind(object) : value;
    },
  });
}

module.exports = { translateSql, translateRows, wrapSql };
