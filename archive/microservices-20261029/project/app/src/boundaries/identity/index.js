module.exports = (pool) => {
  const users = new (require("../../services/identity-service/modules/auth/UserRepository"))(pool);
  return {
    users,
    accounts:new(require('../../services/identity-service/modules/auth/AccountService'))(pool),
    auth: new (require("../../services/identity-service/modules/auth/AuthService"))(users, pool),
    store: new (require("../../shared/MySqlSessionStore"))(pool),
  };
};
