const AWS = require("aws-sdk");
const parser = require("lambda-multipart-parser")
const s3 = new AWS.S3();
const rekongnition = new AWS.Rekognition();

async function saveFile(file){
  console.log({file})
  const BucketName = process.env.BUCKET_NAME;
  console.log({BucketName})

  const savedFile = await s3.putObject({
    Bucket: BucketName,
    Key: file.filename,
    Body: file.content,
  }).promise();

  const labels = await  rekongnition.detectLabels({
    Image : {
      Bytes: file.content,
    }
  }).promise();
  return {savedFile, labels};
}

module.exports.savePhoto = async (event) => {
  const {files} = await parser.parse(event);
  const filesData = files.map(saveFile);
  const results = await Promise.all(filesData)
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      results
    })
  };
};
