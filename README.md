# GUS API

**G** eoJSON   
**U** r  
**S** preadsheet   
:smile:

API for converting a Google Spreadsheet into a GeoJSON object. Inspired by the [GUS map project](https://github.com/mapsam/gus), but made to be a more generic tool to enable any type of map rendering library. Have a look at the [example spreadsheet](https://docs.google.com/spreadsheets/d/1ctA2wUBHGjrBRhQlma_x2Q5oRsC5L85XALfhkezsQMY/edit#gid=0) and an [example request](https://e53r0f186h.execute-api.us-west-2.amazonaws.com/production/1ctA2wUBHGjrBRhQlma_x2Q5oRsC5L85XALfhkezsQMY) to the API.

# Prepare your spreadsheet

The main endpoint is `GET /{spreadsheet id}` which gets your Google Spreadsheet and converts it into a GeoJSON response.

### Spreadsheet structure

The format of your spreadsheet requires the first row to be headers and two columns representing longitude and latitude. Each of these columns must be in WGS84 coordinates and can only represent points. The name of these columns MUST match the following formats:

* `longitude, latitude` or `LONGITUDE, LATITUDE`
* `long, lat` or `LONG, LAT`
* `lng, lat` or `LNG, LAT`
* `lon, lat` or `LON, LAT`
* `x, y` or `X, Y`

### Publish your spreadsheet

In order to make the spreadsheet available to the API, you must "publish to the web" by selecting `File` > `Publish to the web...` > Press `Publish`. This will make your spreadsheet publicly available. Once this is complete, grab the ID of the spreadsheet in the URL. It will look similar to this `1ctA2wUBHGjrBRhQlma_x2Q5oRsC5L85XALfhkezsQMY`. Use this ID to pass into the following endpoint

# Usage

The conversion can happen in three ways:

### API

Use the following URL to make a request (replace `{id}` with your spreadsheet ID)

```
https://e53r0f186h.execute-api.us-west-2.amazonaws.com/production/{id}
```

You'll see four possible responses:

* 200 - successful request with a GeoJSON object
* 400 - missing ID parameter
* 404 - could not find the spreadsheet, either it hasn't been published or the ID is incorrect
* 5xx - an unexpected failure with the application

### Node.js module

Install the module
```
npm install gus-api
```

Require it
```javascript
const toGeojson = require('gus-api').toGeojson;
const spreadsheetID = 'my-id';

toGeojson(id, (err, geojson) => {
  // ...
});
```

### Copy and paste

Or just copy and paste the `toGeojson` function directly from index.js!

# Develop

GUS API is deployed with AWS [API Gateway and a Lambda Proxy](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html). If you have the proper development keys, make your changes and commit, and deploy the code by running `npm run deploy` which will install node modules using the `--production` flag and zip up the directory to save on AWS s3 for the lambda to use.

## Test

```
npm test
```
