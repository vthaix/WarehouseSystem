module.exports = (pool) => ({
  notifications:
    new (require("../../services/notification-service/modules/notifications/NotificationService"))(pool),
});
