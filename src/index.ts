import AWS from "aws-sdk";
const comprehand = new AWS.Comprehend({
  apiVersion: "2017-11-27",
  region: "ca-central-1",
});

const isItPositive = async (title: string) => {
  const params = {
    LanguageCode: "en",
    TextList: [title],
  };

  comprehand.batchDetectSentiment(params, (error, data) => {
    if (error) {
      console.error("something is not happy", error);
    } else {
      console.log("All I know is", data);
      console.log(data.ResultList[0].SentimentScore);
    }
  });
};

function main() {
  const text = process.argv[2];
  isItPositive(text);
}

main();
