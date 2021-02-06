module.exports = {
  formats: [
    {
      id: "/conf/json/content",
      name: "JSON",
      mediaType: "application/json",
      validate: function ({ json }, doc, schema, done) {
        json.of(doc).compliesToSchema(schema).end(done);
      },
    },
  ],
};
