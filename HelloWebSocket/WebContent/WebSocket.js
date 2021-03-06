/**
 * 
 */

			// Session colors
			var colorVal = 0;			
			var colorArray = ['#ffffff','#fe3b1e','#a12c32','#fa2f7a','#fb9fda','#e61cf7','#992f7c','#ff0000','#051155','#4f02ec','#2d69cb','#00a6ee','#6febff','#08a29a','#2a666a','#063619','#000000','#4a4957','#8e7ba4','#b7c0ff','#d6a090','#acbe9c','#827c70','#5a3b1c','#ae6507','#f7aa30','#f4ea5c','#9b9500','#566204','#11963b','#51e113','#08fdcc'];
			
			var webSocket;
	        var updateTime = "-1000000000-01-01T00:00:00Z";

			var size = 1000; //document.getElementById("myCanvas").width;
			var grids = 75;
			var pixlSize = size/grids;

			var canvas = document.getElementById("myCanvas");
			var ctx = canvas.getContext("2d");
			ctx.imageSmoothingEnabled = false;
			
			var messages = document.getElementById("messages");
			var TopRow = document.getElementById("topButton");
	        var BotRow = document.getElementById("botButton");
//			var console = document.getElementById("console");

			// Click event listener on canvas
			canvas.addEventListener('click', function(event) { 
			    var rect = canvas.getBoundingClientRect();
			    var x = event.clientX - rect.left - 5;
			    var y = event.clientY - rect.top - 5;
			    x = Math.trunc(x/pixlSize);
			    y = grids - Math.trunc(y/pixlSize) - 1;
			    console.log("x: " + x + " y: " + y);
			    clickSend(x, y);
			}, false);

			
			// OPEN WEBSOCKET INTERFACE (needs to be called)
            function openSocket(){
                // Ensures only one connection is open at a time
                if(webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED){
                	writeResponse("WebSocket is already opened.");
                	return;
                }
                // Create a new instance of the websocket  // TODO update ws:url
                webSocket = new WebSocket("ws://58b9fd17.ngrok.io/HelloWebSocket/GridCanvasWebsocket");
                // webSocket = new WebSocket("ws://192.168.1.16:8080/HelloWebSocket/GridCanvasWebsocket");
                
                // Binds functions to the listeners for the websocket.
                webSocket.onopen = function(event){
                    if(event.data === undefined){
                        return;
                    }
                    // event.data should hava refresh update type, board;
                    writeResponse(event.data);
                    recieve(event.data);
                };
 
                webSocket.onmessage = function(event){
                    // event.data = json file recieved
                    recieve(event.data);
                    writeResponse(event.data);
                };
 
                webSocket.onclose = function(event){
                	// alert("You have Disconnected");
                    writeResponse("Connection closed what fuck");
                };
            }
            
            
            // Sends the value of the text input to the server
            function send(json){
            	// text is json place request
                webSocket.send(placeRequest);
            }
           
            function requestUpdate(){
            	if(webSocket.readyState == 3){
            		// alert("You have Disconnected");
                    webSocket.close();
            		openSocket();
            	}
                webSocket.send('{"type":"update", "msg": {"lastUpdate": "' + updateTime + '"}  }');
            }

            function closeSocket(){
                webSocket.close();
            }
 
            function writeResponse(text){
               // messages.innerHTML += "<br/>" + text;
            }

            function populateButtons(){
    	        var i;
    	        for(i=0; i<colorArray.length/2; i++){
    	        	TopRow.innerHTML += '<button type="button"  style="background-color: ' +colorArray[i]+ '" onclick="setColor('+ i +')" ></button>';
    	        }
    	        for(;i<colorArray.length; i++){
    	        	BotRow.innerHTML += '<button type="button"  style="background-color: ' +colorArray[i]+ '" onclick="setColor('+ i +')" ></button>';    	        	
    	        }
            }
            
			function drawSquare(x,y){
				ctx.fillRect(x,(grids-y-1),1,1);
			}

			function recieve(text){
				console.log("Undefined :: " + text);
				obj = JSON.parse(text);

				var type = obj.updateType;
				var content = obj.updateContent;
				updateTime = obj.updateTime;
				console.log("Undefined :: " + updateTime);
				
				if(type == "changes"){
				    for(i=0;i<content.length;i++){
				        var change = content[i];
				        setPixel(change.x, change.y, change.color);
				    }
				    // document.getElementById("demo").innerHTML = type+" "+content.length;
				}else{
				    var width = content.boardWidth;
				    var height = content.boardHeight;
				    var board = content.board;
				    for(i=0;i<board.length;i++){
				        for(j=0;j<board[i].length;j++){
				            setPixel(j,i,board[i][j]);
				        }
				    }
				   // document.getElementById("demo").innerHTML = type+" "+width + " " +height;
				}
			}


			// takes a value 0-32  // no default
			function getColor(num){
				return colorArray[num];
			}

			// takes a value 0-32  // no default // sets global colorVal
			function setColor(num){
				colorVal = num;
				return getColor(colorVal);
			}

			function clickSend(x,y){
				// ctx.fillStyle = getColor(parseInt(document.getElementById("color").value, 10));
				ctx.fillStyle = getColor(colorVal);
				drawSquare(x, y);
				var message = '{"type":"place", "msg": {"x": ' + x + ', "y":' + y + ', "color":'+ colorVal +'} }';
				//console.log(message);
				webSocket.send(message);
			}

			function setPixel(x,y,colornum){
				// console.log(colornum)
				var fs = ctx.fillStyle;
				ctx.fillStyle = getColor(colornum);
				drawSquare(x, y);
				ctx.fillStyle = fs;
				//console.log('"x": ' + x + ', "y":' + y + ', "color":'+ color);
			}
			
	        setInterval(requestUpdate, 1000);
			openSocket();
			populateButtons();
//	        console.innerHTML += "<li >::> "+ "Test Message" +"</li>" ;

