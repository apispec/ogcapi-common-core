import { init } from "@apispec/core";
import content_generic from "../plugins/content_generic.js";
import content_apidef from "../plugins/content_apidef.js";

const { server, json, opts, save, load } = await init();
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
        //TODO: composite tests are listed after all tests because they are suites, adjust in report
        describe(
          { title: "can be retrieved [/conf/core/root-op]" },
          function () {
            let mediaTypes = load("mediaTypes");

            mediaTypes.forEach(function (mediaType) {
              const format = content_generic[mediaType];

              it(
                format ? `${format.name} [${format.id}]` : mediaType, //TODO: wrong id
                function (done) {
                  if (!format) {
                    this.skip();
                  }

                  server
                    .context(this)
                    .get("/")
                    .set("Accept", format.mediaType)
                    .expect(200)
                    .expect("Content-Type", format.responseTypePattern)
                    .expect((res) => {
                      if (format.default) save("landingPage", res.body);
                      save(format.mediaType, res.body, "landingPage");
                    })
                    .end(done);
                }
              );
            });
          }
        );

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

            mediaTypes.forEach(function (mediaType) {
              const format = content_generic[mediaType];
              it(
                format ? `${format.name} [${format.id}]` : mediaType,
                function (done) {
                  const content = load(mediaType, "landingPage");

                  if (!format || !content) {
                    this.skip();
                  }

                  format.validate(content, schema, done);
                }
              );
            });
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
          const apiDefMediaTypes = load("mediaTypes", "apiDefinition");

          Promise.all(
            apiDefMediaTypes.map(function (mediaType) {
              return server
                .context(this) //TODO: does not work
                .get("/api")
                .set("Accept", mediaType)
                .expect(200)
                .expect((res) => save(mediaType, res.body, "apiDefinition"));
            }, this)
          )
            .then(() => done())
            .catch(done);
        });

        describe(
          {
            title:
              "complies with the required structure and contents [/conf/core/api-definition-success]",
            description: "BLA",
          },
          function () {
            const oas30 = load("oas30");
            let apiDefMediaTypes = load("mediaTypes", "apiDefinition");

            const schema = "schemas/openapi.json";

            apiDefMediaTypes.forEach(function (mediaType) {
              const format = content_apidef[mediaType];
              it(
                format ? `${format.name} [${format.id}]` : mediaType,
                function (done) {
                  const content = load(mediaType, "apiDefinition");

                  if (!format || !content) {
                    this.skip();
                  }

                  format.validate(content, done);
                }
              );
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

            Object.values(content_generic).forEach(function (format) {
              format.validate(
                conformance,
                "https://raw.githubusercontent.com/opengeospatial/ogcapi-common/master/core/openapi/schemas/confClasses.json",
                done
              );
            });
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
