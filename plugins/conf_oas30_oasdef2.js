import { init } from "@apispec/core";

const { json } = await init();
const schema = "schemas/openapi.json";

export default {
  id: "/conf/oas30/oas-definition-2",
  name: "OpenAPI 3.0",
  mediaType: "application/vnd.oai.openapi+json;version=3.0",
  responseTypePattern: "application/vnd.oai.openapi+json;version=3.0",
  validate: function (doc, done) {
    return json.of(doc).compliesToSchema(schema).end(done);
  },
};
