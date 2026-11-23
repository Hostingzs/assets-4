function CInterface(oParentContainer){
    
    var _aWhiteChips;
    var _aBlackChips;
    
    var _oButExit;
    var _oButConfig;
    var _oHelpPanel=null;
    var _oWhitePanel;    
    var _oBlackPanel;
    var _oAreYouSurePanel;
    var _oButFullscreen;
    var _oWhiteContainer;
    var _oBlackContainer;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _pStartPosExit;
    var _pStartPosConfig;
    var _pStartPosFullscreen;
    
    
    this._init = function(oParentContainer){                
        var oExitX;        
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height/2)- 20, y: (oSprite.height/2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        oExitX = CANVAS_WIDTH - (oSprite.width/2) - 125;
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
           
            var oSprite = s_oSpriteLibrary.getSprite('but_settings');
            _pStartPosConfig = {x: oExitX, y: 10+ (oSprite.height/2)}; 
            _oButConfig = new CGfxButton(_pStartPosConfig.x,_pStartPosConfig.y,oSprite,s_oStage);
            _oButConfig.addEventListener(ON_MOUSE_UP, this._onButConfigRelease, this);           
            
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:oSprite.width/4 + 10,y:_pStartPosExit.y};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oBlackPanel = new CInfoTurn(780,1645,PAWN_BLACK, s_oStage);        
        _oWhitePanel = new CInfoTurn(490,300,PAWN_WHITE, s_oStage);
        
        _oWhiteContainer = new createjs.Container();
        _oWhiteContainer.x = -282;
        _oWhiteContainer.y = 514;
        oParentContainer.addChild(_oWhiteContainer);
        
        _oBlackContainer = new createjs.Container();
        _oBlackContainer.x = 374;
        _oBlackContainer.y = -486;
        oParentContainer.addChild(_oBlackContainer);
        
        _aWhiteChips = new Array();
        for(var i=0; i<TOT_CELL; i++){
            _aWhiteChips[i] = createBitmap(s_oSpriteLibrary.getSprite('white_chip'));
            _aWhiteChips[i].regX = oSprite.width/2;
            _aWhiteChips[i].regY = oSprite.height/2;
            //_aWhiteChips[i].x = 300 + i*10.5;
            //_aWhiteChips[i].y = 422;
            _aWhiteChips[i].x = i*10.5;
            _oWhiteContainer.addChild(_aWhiteChips[i]);
        }
        
        _aBlackChips = new Array();
        for(var i=0; i<TOT_CELL; i++){
            _aBlackChips[i] = createBitmap(s_oSpriteLibrary.getSprite('black_chip'));
            _aBlackChips[i].regX = oSprite.width/2;
            _aBlackChips[i].regY = oSprite.height/2;
            //_aBlackChips[i].x = 960 - i*10.5;
            //_aBlackChips[i].y = 1422;
            _aBlackChips[i].x = - i*10.5;
            _oBlackContainer.addChild(_aBlackChips[i]);
        }
       
       this.refreshButtonPos();
    };
    
    this.unload = function(){
        _oButExit.unload();
        _oButConfig.unload();

        if(_oHelpPanel!==null){
            _oHelpPanel.unload();
        }
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        _oBlackPanel.unload();
        _oWhitePanel.unload();
        
        for(var i=0; i<TOT_CELL; i++){
            s_oStage.removeChild(_aWhiteChips[i]);
            s_oStage.removeChild(_aBlackChips[i]);
        };
        _oAreYouSurePanel = null;
        s_oInterface = null;        
    };
    
    this.refreshButtonPos = function(){
        _oButExit.setPosition(_pStartPosExit.x - s_iOffsetX,s_iOffsetY + _pStartPosExit.y);
        _oButConfig.setPosition(_pStartPosConfig.x - s_iOffsetX,s_iOffsetY + _pStartPosConfig.y);
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
        
        _oWhitePanel.setPosition(1620 - s_iOffsetX, 1870 - s_iOffsetY);
        _oBlackPanel.setPosition(294 + s_iOffsetX, 74 + s_iOffsetY);
    };

    this.refreshWhitePawnNumber = function(iNum){
        _oWhitePanel.refreshPawnNumber(iNum);
        for(var i=0; i<iNum; i++){
            _aWhiteChips[i].visible = false;
        }
        for(var i=iNum; i<TOT_CELL; i++){
            _aWhiteChips[i].visible = true;
        }
        
    };
    
    this.refreshWhiteTime = function(iTime){
        if(iTime > 50){
            _oWhitePanel.refreshTime(formatTime(iTime));
        }
        
    };
    
    this.refreshBlackPawnNumber = function(iNum){        
        _oBlackPanel.refreshPawnNumber(iNum);
        for(var i=0; i<iNum; i++){
            _aBlackChips[i].visible = false;
        }
        for(var i=iNum; i<TOT_CELL; i++){
            _aBlackChips[i].visible = true;
        }
        
    };
    
    this.refreshBlackTime = function(iTime){
        if(iTime > 50){
            _oBlackPanel.refreshTime(formatTime(iTime));
        }
        
    };
    
    this.activePlayer = function(iCurPlayer){
        if(iCurPlayer === PAWN_WHITE){
            _oBlackPanel.active(false);
            _oWhitePanel.active(true);
        } else {
            _oWhitePanel.active(false);
            _oBlackPanel.active(true);
        }
    };

    this.setInfoVisible = function(bVal){
        _oWhitePanel.setPanelVisible(bVal);
        _oBlackPanel.setPanelVisible(bVal);
    };

    this._onButConfigRelease = function(){
        new CConfigPanel();
    };
    
    this.onExitFromHelp = function(){
        _oHelpPanel.unload();
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onExit = function(){
        _oAreYouSurePanel = new CAreYouSurePanel(s_oInterface._onConfirmExit);
    };
    
    this._onConfirmExit = function(){
        $(s_oMain).trigger("end_session");
        $(s_oMain).trigger("show_interlevel_ad");
        s_oGame.onExit();  
    };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.enabled){
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
    
    this._init(oParentContainer);
    
    return this;
}

var s_oInterface = null;