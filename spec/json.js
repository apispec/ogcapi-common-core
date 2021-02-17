import { init } from "@apispec/core";

const { server, json, opts, save, load } = await init();

describe(
  {
    title: "Conformance Class JSON",
    description:
      "[http://www.opengis.net/spec/ogcapi-common/1.0/conf/json](http://www.opengis.net/spec/ogcapi-common/1.0/conf/json)",
    noFile: true,
  },
  function () {
    it({
      title: "Verify support for JSON [/conf/json/definition]",
      description: "TODO: implicitely tested, show success/error count?",
    });

    //TODO: this is just the parameterized test definition to link plugin with spec in editor
    it({
      title:
        "Verify the content of a JSON document given an input document and schema. [/conf/json/content]",
      parameters: ["document", "schema"],
      plugin: "conf_json_content",
    });
  }
);
