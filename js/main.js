


$(function() {
	let audio = document.getElementById('contiOnAudio');
	let audio2 = document.getElementById('contiReadyAudio');
//	audio.volume = 0.5;
//	audio2.volume = 0.5;
	let cv = window.cv;
	let overthat;
	const screenVideo = document.getElementById('screen');
	const canvas = document.getElementById('canvas');
	const canvas2 = document.getElementById('canvas2');
	let contiImg = document.getElementById('contiImg');
	let contiAlram = document.getElementById('contiAlram');
	const ctx = canvas.getContext('2d');
	ctx.willReadFrequently = true;
	let ctx2;
	let imageData;
	let count = 0;
	let lastCk = true;
	let startCk = true;
	let num = 11;
	let captureNow;
	let captureEnd;
	let captureRange;
	
	$("#capBtn").on("click", function() {
		netCap();
	});

	function captureImage() {
		captureNow = performance.now();
		const video = screenVideo;

		// 비디오 화면을 캔버스에 그립니다.
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		if (ctx.canvas.width == 0) {
			return;
		}

		// 캔버스에서 이미지 데이터를 가져옵니다.
		imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		overCk();
		
		screenVideo.requestVideoFrameCallback(captureImage);

		captureEnd = performance.now();
		captureRange = captureEnd - captureNow;
		num = num - captureRange/1000;
	}

	let netCap = () => {
		// 화면 공유 요청
		navigator.mediaDevices.getDisplayMedia({ video: true })
			.then(stream => {
				screenVideo.srcObject = stream;
			})
			.catch(error => {
				console.error('화면 공유를 시작할 수 없습니다: ' + error);
			});

		screenVideo.requestVideoFrameCallback(captureImage);		
	}
	
	let overCk = () => {

		const targetImage = cv.imread(canvas);
		const templetImage = cv.imread(contiImg);
		const resultMat = new cv.Mat();
		const matchMethod = cv.TM_CCOEFF_NORMED;

		cv.matchTemplate(targetImage, templetImage, resultMat, matchMethod);

		// 매칭 결과를 조사하여 일치하는 패턴 위치 확인
		const matchLoc = new cv.Mat();
		let resultTime = cv.minMaxLoc(resultMat, matchLoc);

		if (resultTime.maxVal < 0.60) {
			startCk = false;
			contiAlram.src = "img/contiOff.png";
			$("#contiText").text("컨티 발동 가능");
			$("#contiText").css("fontSize","50px");
			if(lastCk){
				audio2.play()
			}
			lastCk = false;
		} else if (resultTime.maxVal > 0.95) {
			startCk = true;
			num = 11;
			
			$("#contiText").text("컨티 발동됨 [ 재사용 대기시간 12초 ]");
			$("#contiText").css("fontSize","35px");
			audio.play();
			
			
		} else {
			startCk = false;
			let timeView;
			if( (Math.round(num * 10) / 10) < 0){
				timeView = 0;
			}else{
				timeView = (Math.round(num * 10) / 10);	
			}
			lastCk = true;
			$("#contiText").text("컨티 발동됨 [ 재사용 대기시간 " + timeView + "초 ]");
			$("#contiText").css("fontSize","35px");
			contiAlram.src = "img/contiSoon.png";
		}

		resultMat.delete(); templetImage.delete(); targetImage.delete();

	}

});

