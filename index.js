const AWS = require("aws-sdk");
const parser = require("lambda-multipart-parser")
const s3 = new AWS.S3();

async function saveFile(file){
  console.log({file})
  const BucketName = process.env.BUCKET_NAME;
  console.log({BucketName})

  const savedFile = await s3.putObject({
    Bucket: BucketName,
    Key: file.filename,
    Body: file.content,
  }).promise();
  return savedFile;
}

module.exports.savePhoto = async (event) => {
  const {files} = await parser.parse(event);
  files.forEach(saveFile)
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v3.0! Your function executed successfully!",
        input: await  parser.parse(event),
      },
      null,
      2
    ),
  };
};
