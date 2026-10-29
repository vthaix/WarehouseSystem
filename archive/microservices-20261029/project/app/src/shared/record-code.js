// A readable business reference: document type, person/organisation, sequence.
function slug(value) {
  const normalized = String(value || 'KHACHHANG')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  return normalized.length > 24
    ? normalized.slice(0, 14) + normalized.slice(-10)
    : normalized || 'KHACHHANG';
}

function code(prefix, name, ordinal) {
  return `${prefix}-${slug(name)}-${String(ordinal).padStart(2, '0')}`;
}

// For documents without a customer sequence, number records sharing the same
// readable source label. Table names only come from service code, never input.
async function next(connection, table, prefix, name) {
  if (!/^[a-z_]+$/.test(table)) throw new Error('Invalid code table');
  const stem = `${prefix}-${slug(name)}-`;
  const [rows] = await connection.execute(
    `SELECT code FROM ${table} WHERE code LIKE ? FOR UPDATE`,
    [stem + '%'],
  );
  const ordinal = rows.reduce((highest, row) => {
    const suffix = String(row.code).slice(stem.length);
    return /^\d+$/.test(suffix) ? Math.max(highest, Number(suffix)) : highest;
  }, 0) + 1;
  return code(prefix, name, ordinal);
}

async function distinguishNames(connection, table, proposed, ownerId, ownerTag = 'KH') {
  if (!/^[a-z_]+$/.test(table)) throw new Error('Invalid code table');
  const [rows] = await connection.execute(`SELECT id FROM ${table} WHERE code=? FOR UPDATE`, [proposed]);
  if (!rows.length) return proposed;
  const suffix = `-${ownerTag}${ownerId}`;
  return proposed.slice(0, 40 - suffix.length) + suffix;
}

function displayCode(actual, computed) {
  return /^[A-Z]+-[A-Z0-9]+-\d{2,}(?:-\d{2,})?(?:-(?:KH|NCC)\d+)?$/.test(String(actual)) ? actual : computed;
}

module.exports = { slug, code, next, distinguishNames, displayCode };
