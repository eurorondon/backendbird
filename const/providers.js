const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports = {
  s3,
  rekognition,
  dynamodb,
};
