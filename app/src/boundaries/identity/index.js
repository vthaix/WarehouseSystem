module.exports = (pool) => {
  const users = new (require("../../modules/auth/UserRepository"))(pool);
  return {
    users,
    accounts:new(require('../../modules/auth/AccountService'))(pool),
    auth: new (require("../../modules/auth/AuthService"))(users, pool),
    store: new (require("../../shared/MySqlSessionStore"))(pool),
  };
};
