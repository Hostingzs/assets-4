function CHelp(){
    
    var _oStart;
    var _oModePos;
    var _oModePos1;
    var _oStart1;
    
    var _oBg;
    var _oAudioToggle;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    var _pStartPosAudio;
    var _pStartPosFullscreen;
    
    this._init = function(){
        
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_help'));
        s_oStage.addChild(_oBg);
        
        _oModePos = {x: CANVAS_WIDTH-400, y: 875};
        
        var oSpriteStart = s_oSpriteLibrary.getSprite('but_play');
        _oStart = new CTextButton(_oModePos.x,_oModePos.y,oSpriteStart,"START!",FONT,"#ffcc00",60,s_oStage);
        _oStart.addEventListener(ON_MOUSE_UP, this._onStart, this, 0);
        
        _oModePos1 = {x: 400, y: 875};
        
        var oSpriteStart1 = s_oSpriteLibrary.getSprite('but_play');
        _oStart1 = new CTextButton(_oModePos1.x,_oModePos1.y,oSpriteStart1,"MENU",FONT,"#ffcc00",60,s_oStage);
        _oStart1.addEventListener(ON_MOUSE_UP, this._onMenu, this, 0);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.width/4) -10, y: (oSprite.height/2) + 10};
            
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
        
        var aPos = [
            {x:790, y: 390},
            {x:850, y: 150},
            {x:1450, y: 270},
            {x:1270, y: 140},
            {x:820, y: 650},
            {x:1350, y: 610},
            {x:1200, y: 415},
            {x:420, y: 560},
            ]
        
        var aColor = ["#ffcb00", "#fffe09", "#9dff08", "#00cbfd", "#91d400", "#cc989a", "#fd38cd", "#f7bae3"];
        
        for(var i=0; i<COW_MESSAGE_HELP.length; i++){
            var iWidth = 200;
            var iHeight = 110;
            var iX = aPos[i].x;
            var iY = aPos[i].y;
            var oScoreNum = new CTLText(s_oStage, 
                        iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                        100, "center", aColor[i], FONT, 1,
                        2, 2,
                        COW_MESSAGE_HELP[i].num,
                        true, true, false,
                        false );
            oScoreNum.setShadow("#000",2,2,4);

            

            var iHeight = 50;
            iY += 60;
            if(i===5){
                iHeight = 100; 
                iY += 20;
            }
            
            var oScoreType = new CTLText(s_oStage, 
                        iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                        40, "center", "#ffffff", FONT, 1,
                        2, 2,
                        COW_MESSAGE_HELP[i].type,
                        true, true, true,
                        false );
            oScoreType.setShadow("#000",2,2,4);
        }

        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
        
    };  
    
    this.unload = function(){
        _oStart.unload();  
        _oStart1.unload();
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }
        
        s_oHelp = null;
        s_oStage.removeAllChildren();        
    };
    
    this._onStart = function(){
        s_oHelp.unload();
        s_oMain.gotoGame();
    };
    
    this._onMenu = function(){
        s_oHelp.unload();
        s_oMain.gotoMenu();
        
        $(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("end_session");
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }       
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
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
              
    s_oHelp = this;        
    this._init();
    
    
};

var s_oHelp = null;