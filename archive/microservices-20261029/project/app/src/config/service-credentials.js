// Defaults requested for the local Docker environment; override via environment.
const prefixes = {
  'identity-service': 'identity',
  'business-service': 'business',
  'warehouse-service': 'warehouse',
  'notification-service': 'notification',
  'reporting-service': 'reporting',
  'web-gateway': 'gateway',
};
function credentialsFor(service, environment = process.env) {
  const prefix = prefixes[service];
  if (!prefix) throw Error('Unknown database service.');
  const key = prefix.toUpperCase();
  const user = environment[key+'_DB_USER'] || prefix+'_db';
  const password = environment[key+'_DB_PASSWORD'] || prefix+'123';
  if (!/^[a-zA-Z][a-zA-Z0-9_]{0,31}$/.test(user) || password.length < 6 || /[\r\n\0]/.test(password))
    throw Error('Invalid service database credentials.');
  return {user,password};
}
module.exports = {credentialsFor};
