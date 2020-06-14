const util = require("util");
const request = require("request");
const requestAsPromise = util.promisify(request);

async function verifyValidUrl(req, url) {
  if (req.query.skip_url_check === "true" || req.query.skip_url_check === "") {
    // ?skip_url_check
    // ?skip_url_check=true
    return true;
  } else {
    // ?skip_url_check=false
    // ?<no param>
    try {
      const resp = await requestAsPromise({ url, strictSSL: false });
      if (resp.statusCode < 200 || resp.statusCode >= 400) {
        throw Error(resp.statusCode);
      }
      return true;
    } catch (err) {
      throw Error(
        `The following url in the request body is not reachable: ${url}`
      );
    }
  }
}

exports.verifyValidUrl = verifyValidUrl;

exports.findUrlsToValidateInScopes = function (scopes) {
  const toValidateUrls = [];
  Object.keys(scopes).map((scope) => {
    const scopeOverrides = Object.entries(scopes[scope]);
    scopeOverrides.map(([specifier, address]) => {
      // we cannot validate relative urls
      if (scope.includes("http")) {
        toValidateUrls.push(new URL(address, scope).toString());
      }
    });
  });

  return toValidateUrls;
};
