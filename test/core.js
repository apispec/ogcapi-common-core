const { init } = require("@apispec/core");
const expect = require("chai").expect;
const jsonPt = require("./jsonPt");

const { server, json, opts, save, load } = init();
console.log("CFG", opts);

const setup = async () =>
  server
    .get("/")
    .set("Accept", "application/json")
    .then((res) => {
      const mediaTypes =
        res.body && res.body.links
          ? res.body.links
              .filter((link) => link.rel === "self" || link.rel === "alternate")
              .map((link) => link.type)
          : [];

      console.log("BEFORE MEDIA TYPES", mediaTypes);
      save("mediaTypes", mediaTypes);
    })
    //ignore errors in setup, requests will be repeated in test
    //TODO: make configurable
    .catch(() => [])
    .finally(run);

const mediaTypes = await setup();

console.log("SETUP MEDIA TYPES", mediaTypes);

describe(
  {
    title: "Conformance Class Core",
    description:
      "[http://www.opengis.net/spec/ogcapi-common/1.0/conf/core](http://www.opengis.net/spec/ogcapi-common/1.0/conf/core)",
    noFile: true,
  },
  function () {
    describe(
      {
        title: "General",
        description: `
| h | h |
|---|---|
| 1 | 2 |
        `,
      },
      function () {
        xit("[/conf/core/http](http://docs.opengeospatial.org/DRAFTS/19-072.html#_http)", function (done) {});

        xit(
          {
            title:
              "[/conf/core/query-param-known](http://docs.opengeospatial.org/DRAFTS/19-072.html#_query_parameters)",
            description: `
DO FOR ALL query **parameters** advertised in the API definition<br/>
DO FOR ALL operations for which that parameter is valid

1. Execute that operation using the query parameter with values that exercise all of the advertised constraints on those values. (Example: minimum and maximum values)
2. Validate that the operation performed as expected.

DONE

DONE
                        `,
          },
          function (done) {}
        );
        xit(
          {
            title:
              "[/conf/core/query-param-unknown](http://docs.opengeospatial.org/DRAFTS/19-072.html#_query_parameters)",
            description: `
                    DO FOR ALL operations advertised in the API definition
                        1. Execute that operation using a query parameter which is not advertised through the API definition.
                        2. Validate that the operation returns a reponse with the status code 400.
                      DONE
                        `,
          },
          function (done) {}
        );
        xit(
          {
            title:
              "[/conf/core/query-param-invalid](http://docs.opengeospatial.org/DRAFTS/19-072.html#_query_parameters)",
            description: `
                    DO FOR ALL query parameters advertised in the API definition
                        DO FOR ALL operations for which that parameter is valid
                          1. Execute that operation using the query parameter
                              with values that do not comply with the advertised constraints on those values.
                              (Example: exceeding minimum or maximum values)
                          2. Validate that the operation returns a reponse with the status code 400.
                        DONE
                      DONE
                        `,
          },
          function (done) {}
        );
      }
    );
    describe(
      {
        title: "Landing Page",
        description: "Requirement 2",
        noFile: true,
      },
      function () {
        before("get media types", function (done) {
          server
            .context(this)
            .get("/")
            .set("Accept", "application/json")
            .expect((res) => {
              const mediaTypes =
                res.body && res.body.links
                  ? res.body.links
                      .filter(
                        (link) =>
                          link.rel === "self" || link.rel === "alternate"
                      )
                      .map((link) => link.type)
                  : [];

              console.log("BEFORE MEDIA TYPES", mediaTypes);
              save("mediaTypes", mediaTypes);
            })
            .then(() => done())
            //ignore errors in hooks, requests will be repeated in test
            //TODO: make configurable
            .catch(() => done());
        });

        it("can be retrieved [/conf/core/root-op]", function (done) {
          server
            .context(this)
            .get("/")
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .expect((res) => save("landingPage", res.body))
            .expect((res) => {
              //TODO: this will override request and response in context
              // the design is prepared for only one request per test
              const mediaTypes = load("mediaTypes");

              return Promise.all(
                mediaTypes.map(function (mediaType) {
                  return server
                    .context(this) //TODO: does not work
                    .get("/")
                    .set("Accept", mediaType)
                    .expect(200)
                    .expect((res) => save(mediaType, res.body, "landingPage"));
                }, this)
              );
            })
            .end(done);
        });

        //TODO: is listed after "complies with schema" in the report because it is a suite, adjust
        describe(
          { title: "can be retrieved 2 [/conf/core/root-op]" },
          function () {
            const formats = jsonPt.formats;

            formats.forEach(function (format) {
              it(format.name, function (done) {
                server
                  .context(this)
                  .get("/")
                  .set("Accept", format.mediaType)
                  .expect(200)
                  .expect("Content-Type", /json/)
                  .expect((res) => save(format.id, res.body, "landingPage"))
                  .end(done);
              });
            });
          }
        );

        //TODO: remove, only serves as example for matches
        it("complies with schema [/conf/core/root-success]", function (done) {
          console.log(
            Object.keys(json).filter(function (fname) {
              return /^(is|has)[A-Z]/.test(fname);
            })
          );
          const { isArray, isString } = json;

          json.of(load("landingPage")).matches({
            title: isString,
            links: isString,
          });
          done(); //TODO: json.end
        });

        describe(
          {
            title:
              "complies with the required structure and contents [/conf/core/root-success]",
            description: "Requirement 14",
            noFile: true,
          },
          function () {
            let mediaTypes = [];

            const schema =
              "https://raw.githubusercontent.com/opengeospatial/ogcapi-common/master/core/openapi/schemas/landingPage.json";

            before("create media type tests", function () {
              mediaTypes = load("mediaTypes");
              console.log("MTT THIS", this.currentTest.parent.addTest);
              describe("BLA", function () {
                mediaTypes.forEach(function (mediaType) {
                  it(
                    mediaType,
                    function (done) {
                      const format = jsonPt.formats.find(
                        (format) => format.mediaType === mediaType
                      );
                      const content = load(mediaType, "landingPage");

                      if (!format || !content) {
                        this.skip();
                      }

                      format.validate({ json }, content, schema, done);
                    },
                    this.currentTest.parent
                  );
                }, this);
              });
            });

            it(
              {
                title: "JSON [/conf/json/content]",
                description: "BLA",
              },
              function (done) {
                if (!mediaTypes.includes("application/json")) {
                  this.skip();
                  return;
                }

                const landingPage = load("landingPage");

                json
                  .of(landingPage)
                  .compliesToSchema(
                    "landingPage.json",
                    //'cache/schemas'
                    "https://raw.githubusercontent.com/opengeospatial/ogcapi-common/master/core/openapi/schemas/"
                    //true
                  )
                  .end(done);
              }
            );

            it(
              {
                title: "HTML [/conf/html/content]",
                description: "BLA",
              },
              function (done) {
                if (!mediaTypes.includes("text/html2")) {
                  this.skip();
                  return;
                }

                done();
              }
            );
          }
        );
      }
    );

    describe(
      {
        title: "API Definition",
      },
      function () {
        it("can be retrieved [/conf/core/api-definition-op]", function (done) {
          const landingPage = load("landingPage");

          //TODO: why not test /api directly
          const definitions = landingPage.links.filter(
            (link) => link.rel === "service-desc" || link.rel === "service-doc"
          );

          console.log("OAS", definitions);

          //TODO: test all defs
          const oas = definitions.find((def) => def.rel === "service-desc");

          //TODO: extract mediaTypes

          server
            .context(this)
            .get(/*oas.href*/ "/api")
            .query({ f: "json" })
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .expect((res) => save("oas30", res.body))
            .end(done);
        });

        it(
          {
            title:
              "complies with the required structure and contents [/conf/core/api-definition-success]",
            description: "BLA",
          },
          function (done) {
            const oas30 = load("oas30");

            //TODO: run for each mediaType like in landingPage

            //TODO: oas30.js exports test for /conf/oas30/oas-definition-1 and /conf/oas30/oas-definition-2
            // content? plugin for api definitions

            json
              .of(oas30)
              .compliesToSchema(
                "openapi.json",
                "schemas"
                //'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v3.0/',
                //true
              )
              .end(done);
          }
        );
      }
    );

    describe(
      {
        title: "Conformance",
      },
      function () {
        it("can be retrieved [/conf/core/conformance-op]", function (done) {
          const landingPage = load("landingPage");

          const definitions = landingPage.links.filter(
            (link) =>
              link.rel === "http://www.opengis.net/def/rel/ogc/1.0/conformance"
          );

          console.log("CONFORMANCE", definitions);

          server
            .context(this)
            .get("/conformance")
            .query({ f: "json" })
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .expect((res) => save("conformance", res.body))
            .end(done);
        });

        it(
          {
            title:
              "complies with the required structure and contents [/conf/core/conformance-success]",
            description: "BLA",
          },
          function (done) {
            const conformance = load("conformance");

            //TODO: run for each mediaType like in landingPage
            const formats = jsonPt.formats;

            formats.forEach(function (format) {
              format.validate(
                { json },
                conformance,
                "https://raw.githubusercontent.com/opengeospatial/ogcapi-common/master/core/openapi/schemas/confClasses.json",
                done
              );
            });

            json
              .of(conformance)
              .compliesToSchema(
                "confClasses.json",
                //'cache/schemas'
                "https://raw.githubusercontent.com/opengeospatial/ogcapi-common/master/core/openapi/schemas/",
                true
              )
              .end(done);
          }
        );

        it(
          {
            title:
              "complies with the required structure and contents [/conf/core/conformance-success]",
            description: "BLA",
          },
          function (done) {
            const conformance = load("conformance");

            //TODO: chain after compliesToSchema

            json
              .of(conformance)
              .has.property("conformsTo")
              .that.is.an("array")
              .and.includes(
                "http://www.opengis.net/spec/ogcapi-common-1/1.0/conf/core"
              );
            done();
          }
        );
      }
    );
  }
);

describe(
  {
    title: "Conformance Class OpenAPI 3.0",
    description: "http://www.opengis.net/spec/ogcapi-common/1.0/conf/oas3",
    noFile: true,
  },
  function () {
    xit(
      {
        title: "[/conf/oas30/oas-definition-1]",
        description: `TODO: check saved definitions from API Path
                Verify that an OpenAPI definition in JSON is available using the media type application/vnd.oai.openapi+json;version=3.0 and link relation service-desc

Verify that an HTML version of the API definition is available using the media type text/html and link relation service-doc.`,
      },
      function (done) {}
    );

    xit(
      {
        title: "[/conf/oas30/oas-definition-2]",
        description: `TODO: already checked in API Path?
                Verify that the JSON representation conforms to the OpenAPI Specification, version 3.0.`,
      },
      function (done) {}
    );

    it(
      {
        title: "[/conf/oas30/oas-impl]",
        description: `TODO: test generator
                TODO: execute here or as part of the * Path tests?
                Construct an operation for each OpenAPI Path object including all server URL options, HTTP operations and enumerated path parameters.

Validate that each operation performs in accordance with the API definition.`,
      },
      function (done) {
        console.log("TEST SAVE ORDER", load("JSON", "format"));
      }
    );
  }
);
