'use strict'

const request = require('request');

const toGeojson = (id, callback) => {
  if (!id) throw new Error('No spreadsheet id provided');
  const url = `https://spreadsheets.google.com/feeds/cells/${id}/od6/public/basic?alt=json`;

  request.get(url, (err, res, body) => {
    if (err) return callback(err);
    if (res.statusCode !== 200) {
      const error = new Error(`unable to find spreadsheet with id: ${id}`);
      error.code = 'ENOENT';
      return callback(error);
    }

    body = JSON.parse(body);
    let headers = {};
    let entries = {};

    body.feed.entry.forEach((e) => {
      // get the row number
      const row = parseInt(e.title['$t'].match(/\d+/g)[0]);
      const column = e.title['$t'].match(/[a-zA-Z]+/g)[0];
      const content = e.content['$t'];

      if (row === 1) { // it's a header
        headers[column] = content;
      } else {
        if (!entries[row]) entries[row] = {};
        entries[row][headers[column]] = content;
      }
    });

    // check headers for lng/lat values
    let hasLng = false;
    let hasLat = false;
    for (let h in headers) {
      const val = headers[h];
      if (val === 'longitude' ||
          val === 'LONGITUDE' ||
          val === 'long' ||
          val === 'LONG' ||
          val === 'lng' ||
          val === 'LNG' ||
          val === 'lon' ||
          val === 'LON' ||
          val === 'x' ||
          val === 'X') hasLng = true;
      if (val === 'latitude' ||
          val === 'LATITUDE' ||
          val === 'lat' ||
          val === 'LAT' ||
          val === 'y' ||
          val === 'Y') hasLat = true;
    }

    if (!hasLng || !hasLat) {
      const error = new Error('longitude and/or latitude columns are missing or not properly named');
      error.code = 'EINVALID';
      return callback(error);
    }

    const gj = { type: 'FeatureCollection', features: [] };

    for (let e in entries) {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        },
        properties: entries[e]
      };

      for (let p in entries[e]) {
        switch(p) {
          case 'longitude':
          case 'LONGITUDE':
          case 'long':
          case 'LONG':
          case 'lng':
          case 'LNG':
          case 'lon':
          case 'LON':
          case 'x':
          case 'X':
            feature.geometry.coordinates[0] = parseFloat(entries[e][p] || 0);
          case 'latitude':
          case 'LATITUDE':
          case 'lat':
          case 'LAT':
          case 'y':
          case 'Y':
            feature.geometry.coordinates[1] = parseFloat(entries[e][p] || 0);
        }
      }

      gj.features.push(feature);
    }

    return callback(null, gj);
  });
};

const handler = (event, context, callback) => {
  if (!event.pathParameters.id) return callback(null, ErrorHTTP(400, 'no spreadsheet ID provided'));
  const id = event.pathParameters.id;

  toGeojson(id, (err, gj) => {
    if (err && err.code === 'ENOENT') return callback(null, ErrorHTTP(404, err.message));
    if (err && err.code === 'EINVALID') return callback(null, ErrorHTTP(400, err.message));
    if (err) return callback(null, ErrorHTTP(502, err.message));

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(gj)
    };

    return callback(null, response);
  });
};

const ErrorHTTP = (code, message) => {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ message: message })
  };
};

module.exports = { toGeojson, handler };
