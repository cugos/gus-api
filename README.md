# GUS API

API for converting a Google Spreadsheet into a GeoJSON object. Inspired by the [GUS map project](https://github.com/mapsam/gus), but made to be a more generic tool to enable any type of map rendering library. Have a look at the [example spreadsheet](https://docs.google.com/spreadsheets/d/1ctA2wUBHGjrBRhQlma_x2Q5oRsC5L85XALfhkezsQMY/edit#gid=0) and an [example request](https://e53r0f186h.execute-api.us-west-2.amazonaws.com/production/1ctA2wUBHGjrBRhQlma_x2Q5oRsC5L85XALfhkezsQMY) to the API.

## Usage (hosted)

The main endpoint is `GET /{spreadsheet id}` which gets your Google Spreadsheet and converts it into a GeoJSON response.

**1. Structure of spreadsheet**

The format of your spreadsheet requires the first row to be headers and two columns representing longitude and latitude. Each of these columns must be in WGS84 coordinates and can only represent points. The name of these columns MUST match the following formats:

* `longitude, latitude` or `LONGITUDE, LATITUDE`
* `long, lat` or `LONG, LAT`
* `lng, lat` or `LNG, LAT`
* `lon, lat` or `LON, LAT`
* `x, y` or `X, Y`

**2. Publish your spreadsheet**

In order to make the spreadsheet available to the API, you must "publish to the web" by selecting `File` > `Publish to the web...` > Press `Publish`. This will make your spreadsheet publicly available. Once this is complete, grab the ID of the spreadsheet in the URL. It will look similar to this `1ctA2wUBHGjrBRhQlma_x2Q5oRsC5L85XALfhkezsQMY`. Use this ID to pass into the following endpoint

**3. Use the ID to make a request**

Use the following URL to make a request (replace `{id}` with your spreadsheet ID)

```
https://e53r0f186h.execute-api.us-west-2.amazonaws.com/production/{id}
```

You'll see four possible responses:

* 200 - successful request with a GeoJSON object
* 400 - missing ID parameter
* 404 - could not find the spreadsheet, either it hasn't been published or the ID is incorrect
* 5xx - an unexpected failure with the application

## Usage (standalone)

It is also possible to incorporate this functionality into an existing project, without the Node or AWS dependencies.  This may be a good idea if you are building something public-facing, and don't want to risk hammering @mapsam's AWS account with requests.

**1 & 2. The spreadsheet**

Structure and publish your spreadsheet as above.

**3. Required functions**

Either include provided [standalone.js](standalone.js) or copy its entire contents into your code.

**4. Making the request**

Call the `gus_api()` function with the spreadsheet ID and a callback function that will consume the GeoJSON it creates.  Here is a worked example for the Mapbox GL JS API:

```JavaScript
gus_api("1ctA2wUBHGjrBRhQlma_x2Q5oRsC5L85XALfhkezsQMY", function(jsondata) {
  map.addSource('example-layer', {
    type: 'geojson',
    data: jsondata
  });
  map.addLayer({
    'id': 'example-layer-points',
    'type': 'symbol',
    'source': 'example-layer',
    layout: {
      'icon-image': 'example-layer-icon',
      'icon-allow-overlap': true,
    }
  });
});
```

## Develop

GUS API is deployed with AWS [API Gateway and a Lambda Proxy](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html). If you have the proper development keys, make your changes and commit, and deploy the code by running `npm run deploy` which will install node modules using the `--production` flag and zip up the directory to save on AWS s3 for the lambda to use.

## Test

```
npm test
```
