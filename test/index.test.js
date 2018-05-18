const test = require('tape');
const sinon = require('sinon');
const request = require('request');
const api = require('..').handler;
const toGeojson = require('..').toGeojson;

test('[handler] returns status code 400 with no ID present', (assert) => {
  const event = {
    pathParameters: {}
  };

  api(event, {}, (err, response) => {
    assert.notOk(err);
    assert.equal(response.statusCode, 400, 'expected status code');
    assert.equal(response.body, '{\"message\":\"no spreadsheet ID provided\"}');
    assert.end();
  });
});

test('[handler] returns status code 404 when spreadsheet is not found', (assert) => {
  const event = {
    pathParameters: {
      id: 'invalid-id-123'
    }
  };

  sinon.stub(request, 'get').yields(null, { statusCode: 404 }, {});

  api(event, {}, (err, response) => {
    assert.notOk(err);
    assert.equal(request.get.firstCall.args[0], 'https://spreadsheets.google.com/feeds/cells/invalid-id-123/od6/public/basic?alt=json', 'expected url');
    assert.equal(response.statusCode, 404, 'expected status code');
    assert.equal(response.body, '{\"message\":\"unable to find spreadsheet with id: invalid-id-123\"}');
    request.get.restore();
    assert.end();
  });
});

test('[handler] returns expected geojson', (assert) => {
  const fixture = JSON.stringify(require('./fixtures/national-parks.json'));
  const event = {
    pathParameters: {
      id: 'test-id'
    }
  };

  const expected = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[-123.5361,47.7798]},"properties":{"longitude":"-123.5361","latitude":"47.7798","name":"Olympic National Park","description":"Rainforests, beaches, mountains, prairies"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-121.7148,46.8579]},"properties":{"longitude":"-121.7148","latitude":"46.8579","name":"Mount Rainier National Park","description":"The lonely mountain"}}]}';

  sinon.stub(request, 'get').yields(null, { statusCode: 200 }, fixture);

  api(event, {}, (err, response) => {
    assert.notOk(err);
    assert.equal(request.get.firstCall.args[0], 'https://spreadsheets.google.com/feeds/cells/test-id/od6/public/basic?alt=json', 'expected url');
    assert.equal(response.statusCode, 200, 'expected status code');
    assert.equal(response.body, expected, 'expected body');
    request.get.restore();
    assert.end();
  });
});

test('[handler] returns 400 with no lng/lat headers', (assert) => {
  const fixture = JSON.stringify(require('./fixtures/no-lng-lat-headers.json'));
  const event = {
    pathParameters: {
      id: 'test-id'
    }
  };

  sinon.stub(request, 'get').yields(null, { statusCode: 200 }, fixture);

  api(event, {}, (err, response) => {
    assert.notOk(err);
    assert.equal(response.statusCode, 400, 'expected status code');
    request.get.restore();
    assert.end();
  });
});

test('[toGeojson] fails without lng/lat headers', (assert) => {
  const fixture = JSON.stringify(require('./fixtures/no-lng-lat-headers.json'));
  const event = {
    pathParameters: {
      id: 'test-id'
    }
  };

  sinon.stub(request, 'get').yields(null, { statusCode: 200 }, fixture);

  toGeojson('fake-id', (err, gj) => {
    assert.ok(err);
    assert.equal(err.code, 'EINVALID', 'expected error code');
    assert.ok(/longitude and\/or latitude columns are missing or not properly named/.test(err.message), 'expected message');
    request.get.restore();
    assert.end();
  });
});

test('[toGeojson] inserts 0 default for missing lng/lat values in entry', (assert) => {
  const fixture = JSON.stringify(require('./fixtures/single-entry-missing-lnglat.json'));
  const event = {
    pathParameters: {
      id: 'test-id'
    }
  };

  sinon.stub(request, 'get').yields(null, { statusCode: 200 }, fixture);

  toGeojson('test-id', (err, gj) => {
    assert.notOk(err);
    assert.equal(gj.features[0].geometry.coordinates[1], 0, 'expected zero default value');
    request.get.restore();
    assert.end();
  });
});
