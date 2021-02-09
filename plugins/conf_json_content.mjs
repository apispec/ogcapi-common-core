export const json = {
  id: "/conf/json/content",
  name: "JSON",
  mediaType: "application/json",
  validate: function ({ json }, doc, schema, done) {
    //TODO: test for valid json first
    json.of(doc).compliesToSchema(schema).end(done);
  },
};
