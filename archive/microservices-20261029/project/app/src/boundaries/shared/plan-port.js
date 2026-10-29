const C = require("../../services/domain/core");
module.exports = function planPort(service, type) {
  const get = async (user, id, ...args) => {
    const result = await service.get(user, id, ...args);
    C.fail(
      result.type !== type,
      "NOT_FOUND",
      "Không tìm thấy kế hoạch trong phạm vi nghiệp vụ.",
      404,
    );
    return result;
  };
  const port = {
    get,
    list: (user, query = {}) => service.list(user, { ...query, type }),
    create: (user, body, ...args) => {
      C.fail(
        body.type !== type,
        "VALIDATION_ERROR",
        "Loại kế hoạch không thuộc boundary này.",
      );
      return service.create(user, body, ...args);
    },
  };
  for (const method of ["update", "remove", "review", "cancel"])
    if (typeof service[method] === "function")
      port[method] = async (user, id, ...args) => {
        await get(user, id);
        return service[method](user, id, ...args);
      };
  return Object.freeze(port);
};
