module.exports = (pool) => {
  const users = new (require("../../services/identity-service/modules/auth/UserRepository"))(pool);
  return {
    users,
    auth: new (require("../../services/identity-service/modules/auth/AuthService"))(users, pool),
    store: new (require("../../shared/MySqlSessionStore"))(pool),
  };
};
