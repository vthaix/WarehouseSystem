module.exports = (pool) => ({
  notifications:
    new (require("../../modules/notifications/NotificationService"))(pool),
});
