// const http = require('@apispec/http');

module.exports = {
    title: 'OGC API - Common - Part 1: Core',
    description: '[See](http://docs.opengeospatial.org/DRAFTS/19-072.html)',
    plugins: ['@apispec/http', '@apispec/json'],
    protocol: 'http',
    contentTypes: ['json'],
    //overriden by APISPEC_ENDPOINT
    endpoint: 'https://demo.ldproxy.net/vineyards',
    verbose: false,
};
