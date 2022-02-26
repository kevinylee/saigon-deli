var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// netlify/functions/password.ts
__export(exports, {
  handler: () => handler
});
var handler = async (event, context) => {
  const { password } = JSON.parse(event.body);
  if (password === process.env.NETLIFY_PASSWORD) {
    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true })
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ valid: false })
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=password.js.map
