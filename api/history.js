const {
  ProviderError,
  getSP500History,
} = require("../server/providers");

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.setHeader(
    "Cache-Control",
    statusCode === 200 ? "s-maxage=300, stale-while-revalidate=900" : "no-store"
  );
  response.end(JSON.stringify(body));
}

module.exports = async function historyHandler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  const assetValue = Array.isArray(request.query?.asset)
    ? request.query.asset[0]
    : request.query?.asset;
  const asset = String(assetValue || "").toLowerCase();

  try {
    if (asset !== "sp500") {
      return sendJson(response, 400, { error: "Unsupported asset" });
    }

    const history = await getSP500History(request.query?.days);
    return sendJson(response, 200, history);
  } catch (error) {
    const statusCode = error instanceof ProviderError ? error.statusCode : 500;
    const message =
      error instanceof ProviderError ? error.message : "Historical data request failed";
    return sendJson(response, statusCode, { error: message });
  }
};
