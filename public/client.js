let mediaRecorder;
let audioChunks = [];

document.getElementById("recordButton").addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    document.getElementById("recordButton").textContent = "Start Recording";
  } else {
    startRecording();
    document.getElementById("recordButton").textContent = "Stop Recording";
  }
});

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      audioChunks = [];
      sendAudioToServer(audioBlob);
    };
  });
}

const sendAudioToServer = async (audioBlob) => {
  try {
    const buffer = await audioBlob.arrayBuffer();
    const response = await fetch("/upload", {
      method: "POST",
      headers: {
        "Content-Type": "audio/wav",
      },
      body: buffer,
    });
    const data = await response.json();
    console.log("Success", data);
  } catch (err) {
    console.log("Error\n", err);
  }
};
