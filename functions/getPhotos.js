const formatPhotoResponse = require("../utils/formatPhotoResponse");
const sendResponse = require("../utils/sendResponse");
const { PHOTOS_TABLE } = require("../const/paths");
const { dynamodb } = require("../const/providers");

module.exports.getPhotos = async (event) => {
  const { limit, startkey } = event.queryStringParameters || {};

  const ExclusiveStartKey = {
    primary_key: startkey,
  };
  const results = await dynamodb
    .scan({
      TableName: PHOTOS_TABLE,
      Limit: limit || 10,
      ...(startkey ? { ExclusiveStartKey } : {}),
    })
    .promise();

  return sendResponse(200, {
    items: formatPhotoResponse(results.Items),
    lastKey: results?.LastEvaluatedKey?.primary_key,
  });
};
