function newPing() {

	return {
		
		gameData : {
			
			'ball' : {
				'x' : 0,
				'y' : 0
			},
			
			'players' : {
			
				'Player A' : {
					'name' : "Player A",
					'points' : 0,
					'active' : true
				},
			
				'Player B' : {
					'name' : "Player B",
					'points' : 0,
					'active' : false
				}
				
			}			
		},
		
		handleNewData: function(data){
			
			var cc = this;
			// console.log('Handling new data!', data, cc.gameData);		
			cc.gameData = data;
			cc.updateScoreboard();
			
		},
		
		hit : function(){
			
			var cc = this;
			
			var min = -300;
			var max = 300;
			
			function randomPosition(){
				return Math.floor(Math.random() * (max - min + 1)) + min;				
			}

			console.log("x:", cc.gameData.ball.x, "y:", cc.gameData.ball.y);
			
			function checkNotNegative(no){
				if (no < 0){
					return 10;
				} else if (no > 960) {
					return 950;
				} else {
					return no;
				}
			}
			
			var x = checkNotNegative(cc.gameData.ball.x + randomPosition());
			var y = checkNotNegative(cc.gameData.ball.y + randomPosition());			
			
			cc.gameData.ball.x = x;
			cc.gameData.ball.y = y;
						
			updateGameData('/message', ping.gameData);
			
			cc.ballPosition();
			
		},
		
		ballPosition : function(){
			
			var cc = this;
			
			$("#ball").css({'top': cc.gameData.ball.y, 'left': cc.gameData.ball.y});
			
		},
		
		shot : function(){
			
			var count = 3;
			
			function counter(){

				if (count > 0) {	
					console.log(count);			
					count--;
					setTimeout(counter, 1000);
				} else {
					console.log('done');
					// captureBackground();
					// status('Okay, background captured, move back');
				}
			}
			
			setTimeout(counter, 1000);

		},
		
		addPoint : function(player) {
			
			var cc = this;
		
			player.points++;
			console.log('Player ', player, ' updated!');
			
			if (player.points > 3){
				cc.gameEnd(player);
			}

			updateGameData('/message', ping.gameData);
			
			cc.updateScoreboard();
			
		},
		
		updateScoreboard : function(){
					
			var cc = this; 
		
			cc.playerA = ping.gameData.players['Player A'];
			cc.playerB = ping.gameData.players['Player B'];
		
			console.log('Updating scoreboard!', cc.playerA.points, cc.playerB.points);
			
			$(cc.playerAScoreItem).find('span').text(cc.playerA.points);
			$(cc.playerBScoreItem).find('span').text(cc.playerB.points);	
			
					
			
		},
		
		setupScoreboard : function (){
		
			var cc = this;
			
			$(cc.playerAScoreItem).find('b').text(cc.playerA.name);
			$(cc.playerBScoreItem).find('b').text(cc.playerB.name);			
			
		},
		
		gameEnd : function(player) {

			var cc = this;
		
			alert('Game End. ' + player.name + " wins!");
			
			cc.playerA.points = 0;
			cc.playerB.points = 0;			
			
			cc.updateScoreboard();
			
		},
		
		updateBall : function() {
	
			// var canvas,ctx,flag=false,prevX=0,currX=0,prevY=0,currY=0,dot_flag=false, balW=100, balH=100, w, h;
			// 		var y=20;
			// 
			// 		var img = new Image();
			// 		img.src = 'ball.png';
			// 		ballContext.drawImage(img,prevX,prevY, balW, balH);	
			
		},
		
		moCap : function(){
			
			console.log('moCap');
			var cc = this;
		
			var idata = myContext.getImageData(0,0,cc.moCapSize,cc.moCapSize);
			
			
			// theirContext.putImageData(idata, 0,0);
			
			var data = idata.data;
			var width = idata.width;
			var limit = data.length;
			
			console.log('width: ' + width + ' limit: ' + limit);
			
			var minError = 1000;
			var error = 1000;
			var candidateIndex = -1;
			var tmpX = 0;
			var tmpY = 0;
			for(var i = 0; i < limit; i+=4) {
				
				error = Math.abs(cc.keyColor.r-data[i]) + Math.abs(cc.keyColor.g-data[i+1]) + Math.abs(cc.keyColor.b-data[i+2]);
				if(error < minError) {
					minError = error;
					candidateIndex = i;
				}
			}
			if(minError > 100){
				cc.failCounter = cc.failCounter + 1;
				if(cc.failCounter > 10) {
					cc.batX = -1;
					cc.batY = -1;
					cc.lastX = -1;
					cc.lastY = -1;
					cc.failCounter = 0;
				}
			} else {
				cc.failCounter = 0;
				var pixelPosition = candidateIndex/4;
				tmpY = Math.floor(pixelPosition/width);
				tmpX = pixelPosition - idata.height*tmpY;
				var distance = Math.abs(tmpY - lastY) + Math.abs(tmpX - lastX);
				cc.lastY = cc.batY;
				cc.lastX = cc.batX;
				if(distance > 10) {
					cc.batY = Math.round((cc.batY + tmpY)/2);
					cc.batX = Math.round((cc.batX + tmpX)/2);
				} else {
					cc.batY = tmpY;
					cc.batX = tmpX;
				}


			}
			
			console.log(cc.batX, cc.batY);
		},
		
		processVideo : function() {
			
			var cc = this;
			
			theirContext = cc.theirCanvas.getContext("2d");
			theirContext.scale(-1, 1);	
			theirContext.translate(-cc.theirCanvas.width, 0);

			myContext = cc.myCanvas.getContext("2d");
			myContext.scale(-1, 1);	
			myContext.translate(-cc.myCanvas.width, 0);


			function videoToCanvas() {		
				theirContext.drawImage(remoteVideo, 0, 0);	
				// myContext.drawImage(localVideo, 0, 0, cc.moCapSize, cc.moCapSize);		
				// cc.moCap();
			}

			window.requestAnimFrame = (function(){
				return  window.requestAnimationFrame       || 
						window.webkitRequestAnimationFrame || 
						window.mozRequestAnimationFrame    || 
						window.oRequestAnimationFrame      || 
						window.msRequestAnimationFrame     || 
						function( callback ){
							window.setTimeout(callback, 1000 / 24);
						};
			})();
  
			(function animloop(){
				requestAnimFrame(animloop);
				videoToCanvas();
			})();
			
		},
		
		init : function(){
			
			var cc = this;
			
			// Global Variables
			cc.ballCanvas = document.getElementById('ballCanvas');	
			cc.myCanvas = document.getElementById('myCanvas');
			cc.theirCanvas = document.getElementById('theirCanvas');

			cc.remoteVideo = document.getElementById('remoteVideo');
			cc.localVideo = document.getElementById('localVideo');
			
			// Shorten vars
			cc.playerA = ping.gameData.players['Player A'];
			cc.playerB = ping.gameData.players['Player B'];
			
			// Scoreboard
			cc.scoreBoard = $("#scoreboard");
			cc.playerAScoreItem = $(cc.scoreBoard).find('li')[0];
			cc.playerBScoreItem = $(cc.scoreBoard).find('li')[1];
			console.log(cc.playerAScoreItem, cc.playerBScoreItem);
			
			//
			
			
			cc.keyColor = new Object();
			cc.keyColor.r = 209;
			cc.keyColor.g = 92;
			cc.keyColor.b = 134;
			
			cc.lastX
			cc.lastY;
			cc.batX = 0;
			cc.batY = 0;
			cc.failCounter = 0;
			
			
			
			cc.moCapSize=64;
			
			
					
			// Add names to scoreboard
			cc.setupScoreboard();
			
			cc.processVideo();
			
		}
		
	};
}

var ping = newPing();

$(document).ready(function(){
	ping.init();
});

function controls(input){
	$('#controls').html(input);
}
function status(input){
	$('#trace').text(input);
	console.log(input);
}

function doKeyDown(e){
	if(e.keyCode==81){
		ctx.clearRect(0,0,w,h);
		balW = balW+10;
		balH = balH+10;
		draw();
		}
	if(e.keyCode==65){
		ctx.clearRect(0,0,w,h);	
		balW = balW-10;
		balH = balH-10;
		draw();
		}
}
