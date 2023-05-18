const parser = require("lambda-multipart-parser");
const { v4: uuidv4 } = require("uuid");
const sendResponse = require("../utils/sendResponse");
const { BUCKET_NAME, PHOTOS_TABLE } = require("../const/paths");
const { rekognition, s3, dynamodb } = require("../const/providers");

async function saveFile(file) {
  const BucketName = BUCKET_NAME;

  const savedFile = await s3
    .putObject({
      Bucket: BucketName,
      Key: file.filename,
      Body: file.content,
    })
    .promise();

  const { Labels } = await rekognition
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
