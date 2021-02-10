import { init } from "@apispec/core";

const { server, json, opts, save, load } = init();

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
