const AWS = require("aws-sdk");
const parser = require("lambda-multipart-parser");
const s3 = new AWS.S3();
const rekongnition = new AWS.Rekognition();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require("uuid");
const sendResponse = require("../utils/sendResponse");
const { BUCKET_NAME, PHOTOS_TABLE } = require("../const/paths");

async function saveFile(file) {
  const BucketName = BUCKET_NAME;

  const savedFile = await s3
    .putObject({
      Bucket: BucketName,
      Key: file.filename,
      Body: file.content,
    })
    .promise();

  const { Labels } = await rekongnition
    .detectLabels({
      Image: {
        Bytes: file.content,
      },
    })
    .promise();

  const primary_key = uuidv4();
  const labels = Labels.map((label) => label.Name);
  await dynamodb
    .put({
      TableName: PHOTOS_TABLE,
      Item: {
        primary_key,
        name: file.filename,
        labels,
      },
    })
    .promise();

  return {
    primary_key,
    savedFile: `https://${BucketName}.s3.amazonaws.com/${file.filename}`,
    labels,
  };
}

module.exports.savePhoto = async (event) => {
  const { files } = await parser.parse(event);
  const filesData = files.map(saveFile);
  const results = await Promise.all(filesData);

  return sendResponse(200, results);
};
