const { init } = require("@apispec/core");

const { server, json, opts, save, load } = init();

describe(
  {
    title: "Conformance Class JSON",
    description:
      "[http://www.opengis.net/spec/ogcapi-common/1.0/conf/json](http://www.opengis.net/spec/ogcapi-common/1.0/conf/json)",
    noFile: true,
  },
  function () {
    it("can be retrieved [/conf/json/definition]", function (done) {
      server
        .context(this)
        .get("/")
        .query({ f: "json" })
        .set("Accept", "application/json")
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res) => save("landingPage", res.body))
        .end(done);
    });

    it("complies with schema [/conf/json/content]", function (done) {
      save("JSON", "BLA", "format");
      console.log("TEST SAVE ORDER", load("JSON", "format"));

      json
        .of(conformance)
        .compliesToSchema(
          "confClasses.json",
          //'cache/schemas'
          "https://raw.githubusercontent.com/opengeospatial/ogcapi-common/master/core/openapi/schemas/",
          true
        )
        .end(done);
    });
  }
);

module.exports = {
  formats: [
    {
      id: "/conf/json/content",
      name: "JSON",
      validate: function (doc, schema, done) {
        json.of(doc).compliesToSchema(schema).end(done);
      },
    },
  ],
};
