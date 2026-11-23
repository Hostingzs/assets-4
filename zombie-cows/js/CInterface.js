function CInterface(){
    
    var _iMaskWidth;
    var _iMaskHeight;
    var _oAudioToggle;
    var _oButTimer;
    var _oButExit;
    var _oScoreNum;
    var _oScoreNumShadow;
    var _oTimeNum;
    var _oTimeText;
    var _oTimerBg;
    var _oTimerFill;
    var _oMask;
    var _oContainerTimer;
    var _oGoalNum;
    var _oGoalNumShadow;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _oHelpPanel=null;

    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    
    this._init = function(){                
        var oExitX;        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height/2)-10, y: (oSprite.height/2)+10 };
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        oExitX = CANVAS_WIDTH - (oSprite.width/2)-120;
        _pStartPosAudio = {x: oExitX, y: (oSprite.height/2)+10};
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);          
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:oSprite.width/4 + 10,y:oSprite.height/2 +10};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oContainerTimer =  new createjs.Container();
        _oContainerTimer.x = TIME_X;
        _oContainerTimer.y = TIME_Y;
        s_oStage.addChild(_oContainerTimer);
        
        
        var oSpriteTimeBarBg = s_oSpriteLibrary.getSprite('bg_timebar');
        
        _oTimerBg = createBitmap(oSpriteTimeBarBg);
        _oContainerTimer.addChild(_oTimerBg);
        
        var oSpriteTimeBarBg = s_oSpriteLibrary.getSprite('fill_timebar');
        
        _oTimerFill = createBitmap(oSpriteTimeBarBg);
        _oContainerTimer.addChild(_oTimerFill);
        
        _oTimeNum = new createjs.Text("00:00","20px "+FONT, "#ffffff");

        _oTimeNum.y = 50;
        _oTimeNum.textAlign = "left";
        _oTimeNum.textBaseline = "alphabetic";
        _oTimeNum.lineWidth = 200;
        _oContainerTimer.addChild(_oTimeNum);
        
        var iWidth = 100;
        var iHeight = 30;
        var iX = 290;
        var iY = 44;
        _oTimeText = new CTLText(_oContainerTimer, 
                    iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                    20, "center", "#ffffff", FONT, 1,
                    2, 2,
                    TEXT_TIME,
                    true, true, true,
                    false );

        _iMaskWidth = TIME_BAR_WIDTH;
        _iMaskHeight = TIME_BAR_HEIGHT;
        
        _oMask = new createjs.Shape();
        _oMask.graphics.beginFill("rgba(255,255,255,0.01)").drawRect(0, 0, _iMaskWidth, _iMaskHeight);
        _oContainerTimer.addChild(_oMask);
        
        _oTimerFill.mask = _oMask;
        
        _oScoreNumShadow = new createjs.Text("0","60px "+FONT, "#633f01");
        _oScoreNumShadow.x = 360;
        _oScoreNumShadow.y = 670;
        _oScoreNumShadow.textAlign = "left";
        _oScoreNumShadow.textBaseline = "alphabetic";
        _oScoreNumShadow.lineWidth = 200;
	_oScoreNumShadow.outline = 5;
        s_oStage.addChild(_oScoreNumShadow);
        
        _oScoreNum = new createjs.Text("0","60px "+FONT, "#fff");
        _oScoreNum.x = 360;
        _oScoreNum.y = 670;
        _oScoreNum.textAlign = "left";
        _oScoreNum.textBaseline = "alphabetic";
        _oScoreNum.lineWidth = 200;
        s_oStage.addChild(_oScoreNum);
        
        _oGoalNumShadow = new createjs.Text("0","60px "+FONT, "#633f01");
        _oGoalNumShadow.x = 360;
        _oGoalNumShadow.y = 750;
        _oGoalNumShadow.textAlign = "left";
        _oGoalNumShadow.textBaseline = "alphabetic";
        _oGoalNumShadow.lineWidth = 200;
	_oGoalNumShadow.outline = 5;
        s_oStage.addChild(_oGoalNumShadow);
        
        _oGoalNum = new createjs.Text("0","60px "+FONT, "#ffcc00");
        _oGoalNum.x = 360;
        _oGoalNum.y = 750;
        _oGoalNum.textAlign = "left";
        _oGoalNum.textBaseline = "alphabetic";
        _oGoalNum.lineWidth = 200;
        s_oStage.addChild(_oGoalNum);
		
        var oHammer = createBitmap(s_oSpriteLibrary.getSprite('hammer_icon'));
        oHammer.x = 280;
        oHammer.y = 622;
        s_oStage.addChild(oHammer);


        var oTarget = createBitmap(s_oSpriteLibrary.getSprite('target'));
        oTarget.x = 280;
        oTarget.y = 698;
        s_oStage.addChild(oTarget);
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.unload = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }
        
        _oButExit.unload();
        if(_oHelpPanel!==null){
            _oHelpPanel.unload();
        }
        s_oInterface = null;
    };
        
    this.refreshButtonPos = function(iNewX,iNewY){
        _oButExit.setPosition(_pStartPosExit.x - iNewX,iNewY + _pStartPosExit.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }      
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
    };
    
    this.setButVisible = function(bVal){
        _oButTimer.setVisible(bVal);
    };
    
    this.refreshTime = function(iValue){
	_oMask.scaleX = iValue;
    };
    
    this.refreshTimeText = function(iValue){
        _oTimeNum.text = iValue;
    };
    
    this.refreshScore = function(iValue, iGoal){
        _oScoreNumShadow.text = iValue;
        _oScoreNum.text = iValue;
        if (iValue >= iGoal && s_bGoalReached === false){
            createjs.Tween.get(_oScoreNumShadow ).to({scaleX: 2 , scaleY: 2 }, 500, createjs.Ease.bounceOut).call(function() {createjs.Tween.get(_oScoreNumShadow ).to({scaleX: 1 , scaleY: 1 }, 500, createjs.Ease.bounceOut)});
            createjs.Tween.get(_oScoreNum ).to({scaleX: 2 , scaleY: 2 }, 500, createjs.Ease.bounceOut).call(function() {createjs.Tween.get(_oScoreNum ).to({scaleX: 1 , scaleY: 1 }, 500, createjs.Ease.bounceOut);});
            s_bGoalReached = true;
            
            playSound("goal",1,false);
        }
    };
    
    this.refreshGoal = function(iValue){
        _oGoalNumShadow.text = iValue;
        _oGoalNum.text = iValue;
    };
    
    this._onRestart = function(){
        s_oGame.restartGame();
    };
    
    this._onButHelpRelease = function(){
        _oHelpPanel = new CHelpPanel();
    };
    
    this._onButRestartRelease = function(){
        s_oGame.restartGame();
    };
    
    this.onExitFromHelp = function(){
        _oHelpPanel.unload();
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onExit = function(){
        s_oGame.onExit();  
        $(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("end_session");
    };
    
    this.resetFullscreenBut = function(){
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setActive(s_bFullscreen);
        }
        
    };
    
    this._onFullscreenRelease = function(){
        if(s_bFullscreen) { 
            _fCancelFullScreen.call(window.document);
        }else{
            _fRequestFullScreen.call(window.document.documentElement);
        }
        sizeHandler();
    };
    
    s_oInterface = this;
    
    this._init();
    
    return this;
}

var s_oInterface = null;