const AWS = require("aws-sdk");
const formatPhotoResponse = require("../utils/formatPhotoResponse");
const sendResponse = require("../utils/sendResponse");
const { PHOTOS_TABLE } = require("../const/paths");

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getPhotos = async (event) => {
  const results = await dynamodb
    .scan({
      TableName: PHOTOS_TABLE,
      Limit: 50,
    })
    .promise();

  return sendResponse(200, formatPhotoResponse(results.Items));
};
