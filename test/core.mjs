import { init } from "@apispec/core";
import content_generic from "../plugins/content_generic.mjs";
import content_apidef from "../plugins/content_apidef.mjs";

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
    .catch(() => save("mediaTypes", []));

const setup2 = async () =>
  server
    .get("/")
    .set("Accept", "application/json")
    .then((res) => {
      const apiDefMediaTypes =
        res.body && res.body.links
          ? res.body.links
              .filter((link) => link.rel === "service-desc")
              .map((link) => link.type)
          : [];

      console.log("APIDEF MEDIA TYPES", apiDefMediaTypes);
      save("mediaTypes", apiDefMediaTypes, "apiDefinition");
    })
    //ignore errors in setup, requests will be repeated in test
    //TODO: make configurable
    .catch(() => save("mediaTypes", [], "apiDefinition"));

//TODO: skip for initial editor loading
await Promise.allSettled([setup(), setup2()]);

console.log("SETUP MEDIA TYPES", load("mediaTypes"));

console.log("SETUP MEDIA TYPES 2", load("mediaTypes", "apiDefinition"));

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
            Object.values(content_generic).forEach(function (format) {
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
            let mediaTypes = load("mediaTypes");

            const schema =
              "https://raw.githubusercontent.com/opengeospatial/ogcapi-common/master/core/openapi/schemas/landingPage.json";

            // plugin category/tags: CONTENT_GENERIC, CONTENT_APIDEF
            mediaTypes.forEach(function (mediaType) {
              const format = content_generic[mediaType];
              it(
                format ? `${format.name} [${format.id}]` : mediaType,
                function (done) {
                  const content = load(mediaType, "landingPage");

                  if (!format || !content) {
                    this.skip();
                  }

                  format.validate({ json }, content, schema, done);
                }
              );
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
          const oas = definitions.filter((def) => def.rel === "service-desc");

          //TODO: extract mediaTypes
          const apiDefMediaTypes = oas.map((def) => def.type);
          //save("mediaTypes", apiDefMediaTypes, "apiDefinition");

          server
            .context(this)
            .get(/*oas.href*/ "/api")
            .query({ f: "json" })
            .set("Accept", apiDefMediaTypes[0])
            .expect(200)
            .expect("Content-Type", /json/)
            .expect((res) => save("oas30", res.body, "apiDefinition"))
            .end(done);
        });

        describe(
          {
            title:
              "complies with the required structure and contents [/conf/core/api-definition-success]",
            description: "BLA",
          },
          function () {
            const oas30 = load("oas30");
            let mediaTypes = load("mediaTypes", "apiDefinition");

            const schema = "schemas/openapi.json";

            mediaTypes.forEach(function (mediaType) {
              it(mediaType, function (done) {
                const format = content_apidef[mediaType];
                const content = load(mediaType, "apiDefinition");

                if (!format || !content) {
                  this.skip();
                }

                format.validate({ json }, content, schema, done);
              });
            });

            //TODO: oas30.js exports test for /conf/oas30/oas-definition-1 and /conf/oas30/oas-definition-2
            // content? plugin for api definitions
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
            content_generic.forEach(function (format) {
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
