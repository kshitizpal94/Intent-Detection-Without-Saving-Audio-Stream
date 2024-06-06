const express = require("express");
const rawBody = require("raw-body");
const fs = require("fs");
const dialogflow = require("@google-cloud/dialogflow");

const serviceAccountKey = ""

const CREDENTIALS = JSON.parse(
  fs.readFileSync(serviceAccountKey)
);
// Configuration for the client
const CONFIGURATION = {
  credentials: {
    private_key: CREDENTIALS["private_key"],
    client_email: CREDENTIALS["client_email"],
  },
};

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);
let projectId = CREDENTIALS.project_id;
let sessionId = "123892759";
const languageCode = "en";

const app = express();
const port = 3000;


app.use(express.static("public"));

app.post("/upload", async (req, res) => {
  try {
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );

    const buffer = await rawBody(req);

    const request = {
      session: sessionPath,
      queryInput: {
        audioConfig: {
          audioEncoding: "FLAC",
          sampleRateHertz: 48000,
          languageCode: languageCode,
        },
      },
      inputAudio: buffer.toString("base64"),
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    console.log(result);
    res.json({
      queryText: result.queryText,
      intent: result.intent.displayName,
      confidence: result.intentDetectionConfidence,
      fulfillmentText: result.fulfillmentText,
    });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send("Error processing audio");
  }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
