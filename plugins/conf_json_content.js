import { init } from "@apispec/core";

const { json } = await init();

export default {
  id: "/conf/json/content",
  name: "JSON",
  mediaType: "application/json",
  responseTypePattern: /json/, //TODO: application/.*json
  default: true,
  validate: function (doc, schema, done) {
    //TODO: test for valid json first
    return json.of(doc).compliesToSchema(schema).end(done);
  },
};
