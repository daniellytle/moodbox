window.AudioContext = window.AudioContext ||
	                      window.webkitAudioContext;
navigator.getUserMedia =
	  navigator.getUserMedia ||
	  navigator.webkitGetUserMedia ||
	  navigator.mozGetUserMedia ||
	  navigator.msGetUserMedia;

var context = new AudioContext();
var meydaAnalyzer = null;
var recognizer = null;
var recognizing = false;
var extractionInterval;
var finalTranscript = "";
window.source = context.createBufferSource()
source.connect(context.destination);
mfcc = []

if (('webkitSpeechRecognition' in window)){
	recognizer = new webkitSpeechRecognition();
	recognizer.continuous = true;
  	recognizer.interimResults = true;

  	recognizer.onresult = function(event){
  		var interimTranscript = "";
  		for (var i = event.resultIndex; i < event.results.length; ++i) {
	        if (event.results[i].isFinal) {
	          finalTranscript += event.results[i][0].transcript;
	        } else {
	          interimTranscript += event.results[i][0].transcript;
	        }
	    }
	    console.log(interimTranscript);
  	};

  	recognizer.onstart = function(){
  		recognizing = true;
  	};
  	recognizer.onend = function(){
  		recognizing = false;
  	};
} else {
	console.log("ERROR: speech recognition not supported");
}

function swapButton() {
	// Swap button
	$("#record-btn").text('Finish');
	document.getElementById("record-btn").onclick = doneRecording;
}

function startRecording(){
	swapButton();
	navigator.getUserMedia({video: false, audio: true}, function(mediaStream) {
		window.source = context.createMediaStreamSource(mediaStream);
		var options = {
          "audioContext": context, // required
          "source": window.source, // required
          "bufferSize": 512, // required
          "featureExtractors": ["mfcc"],
        };
        meydaAnalyzer = Meyda.createMeydaAnalyzer(options);
		startExtraction();

		if(recognizing){
			recognizer.stop();
		}
		if(recognizer) {
			finalTranscript = "";
			recognizer.start();
		}
	},
	function(err) {
		alert("There has been an error accessing the microphone.");
	});
};

function startExtraction(){
	console.log("start recording");
	window.source.connect(context.destination);
	window.extractionInterval = setInterval(function(){
		var featureArray = meydaAnalyzer.get(["mfcc"]);
		mfcc.push(featureArray);
	}, 40)
};

function doneRecording(){
	window.source.disconnect();
	clearInterval(extractionInterval);
	console.log("DONE RECORDING:");
	// console.log(mfcc);
	if(finalTranscript){
		console.log(finalTranscript);
	} else {
		console.log("NO FINAL TRANSCRIPT RECORDED");
	}
	finalTranscript = "";
	recognizer.stop();
	$.ajax({
		type: 'GET',
		url: "/mood",
		dataType: "json",
		contentType: "application/json",
		data: {
			features: mfcc
		},
		success: function(){
			mfcc = [];
		}
	});
};

function getPlaylist(id){
	$.ajax({
		type: 'GET',
		url: "/results",
		dataType: "json",
		contentType: "application/json",
		data: {
			id: id
		},
	});
};




