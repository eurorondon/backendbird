const AWS = require("aws-sdk");
const formatPhotoResponse = require("../utils/formatPhotoResponse");

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getPhotos = async (event) => {
  const results = await dynamodb
    .scan({
      TableName: process.env.PHOTOS_TABLE,
      Limit: 50,
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      results: formatPhotoResponse(results.Items),
    }),
  };
};
