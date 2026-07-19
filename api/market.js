const {
  ProviderError,
  getMetalQuote,
  getSP500Quote,
} = require("../server/providers");

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.setHeader(
    "Cache-Control",
    statusCode === 200 ? "s-maxage=60, stale-while-revalidate=300" : "no-store"
  );
  response.end(JSON.stringify(body));
}

module.exports = async function marketHandler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  const assetValue = Array.isArray(request.query?.asset)
    ? request.query.asset[0]
    : request.query?.asset;
  const asset = String(assetValue || "").toLowerCase();

  try {
    if (asset === "gold") {
      return sendJson(response, 200, await getMetalQuote("XAU"));
    }
    if (asset === "silver") {
      return sendJson(response, 200, await getMetalQuote("XAG"));
    }
    if (asset === "sp500") {
      return sendJson(response, 200, await getSP500Quote());
    }

    return sendJson(response, 400, { error: "Unsupported asset" });
  } catch (error) {
    const statusCode = error instanceof ProviderError ? error.statusCode : 500;
    const message =
      error instanceof ProviderError ? error.message : "Market data request failed";
    return sendJson(response, statusCode, { error: message });
  }
};
