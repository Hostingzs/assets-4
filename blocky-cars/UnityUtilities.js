function IsRunningOnMobile() 
{
	let isMobile = UnityLoader.SystemInfo.mobile;
	let resultAsNumber;
	if (isMobile == true) 
	{
		resultAsNumber = 1;
	}
	else
	{
		resultAsNumber = 0;
	}

	window.unityGame.SendMessage ('WebGLSocialHandler', 'AdoptToMobile', resultAsNumber);
}

function HasInternetConnection()
{
	let online = window.navigator.onLine;
	let resultAsNumber;
	if (online)
	{
		resultAsNumber = 1;
	}
	else
	{
		resultAsNumber = 0;
	}

	window.unityGame.SendMessage ('WebGLSocialHandler', 'GetInternetStatus', resultAsNumber);
}

function resize_canvas()
{
	var canvas=document.getElementById('#canvas');
	var container=document.getElementById('gameContainer');
	
	if (canvas==null ||container==null)
	{
		return;
	}
	
	var width=container.offsetWidth;
	var height=container.offsetHeight;
		  
	canvas.width = width;
	canvas.height = height;
}

function OpenFullscreen() 
{
	document.getElementById('gameContainer').requestFullscreen();
	console.log("OpenFullscreen");
}

function CloseFullscreen() 
{
	document.exitFullscreen();
	console.log("CloseFullscreen");
}

function SelectInputProxy(text)
{
	let inputProxy = document.getElementById("fixInput");
	inputProxy.focus({preventScroll:true});
	inputProxy.value = text;
}

function DeselectInputProxy() 
{
	document.getElementById("fixInput").blur();
}

function Input(text)
{
	window.unityGame.SendMessage ('WebGLSocialHandler', 'SetInput', text);
}
