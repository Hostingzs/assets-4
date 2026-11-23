function CConfigPanel(){

    var _oBg;
    var _oAudioToggle = null;
    var _oTextAudio;
    var _oButExit;
    var _oFade;
    
    var _oCountToggle;
    var _oTextCount;

    this._init = function(){

        s_oGame.pauseGame(true);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("rgba(0,0,0,0.7)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.on("mousedown", function(){});
        s_oStage.addChild(_oFade);

        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        _oBg = createBitmap(oSprite);
        _oBg.regX = oSprite.width/2;
        _oBg.regY = oSprite.height/2;
        _oBg.x = CANVAS_WIDTH/2;
        _oBg.y = CANVAS_HEIGHT/2;
        s_oStage.addChild(_oBg);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _oButExit = new CGfxButton(1316/*993,323*/, 640, oSprite,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon_big');
            _oAudioToggle = new CToggle(673,860,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this); 
            
            _oTextAudio = new createjs.Text(TEXT_AUDIO,"60px "+PRIMARY_FONT, "#ffffff");
            _oTextAudio.x = 783;
            _oTextAudio.y = 860;
            _oTextAudio.textAlign = "left";
            _oTextAudio.textBaseline = "middle";
            _oTextAudio.lineWidth = 600;                          
            s_oStage.addChild(_oTextAudio);
            
            var oSprite = s_oSpriteLibrary.getSprite('but_flip');
            _oCountToggle = new CToggle(673,1130,oSprite,s_bShowFlip,s_oStage);
            _oCountToggle.addEventListener(ON_MOUSE_UP, this._onShowNumFlip, this); 
            
            _oTextCount = new createjs.Text(TEXT_COUNT,"60px "+PRIMARY_FONT, "#ffffff");
            _oTextCount.x = 783;
            _oTextCount.y = 1130;
            _oTextCount.textAlign = "left";
            _oTextCount.textBaseline = "middle";
            _oTextCount.lineWidth = 600;            
            s_oStage.addChild(_oTextCount);
            
        }  else {
            
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon_big');
            _oCountToggle = new CToggle(673,860,oSprite, s_bShowFlip,s_oStage);
            _oCountToggle.addEventListener(ON_MOUSE_UP, this._onShowNumFlip, this); 
            
            _oTextCount = new createjs.Text(TEXT_COUNT,"60px "+PRIMARY_FONT, "#ffffff");
            _oTextCount.x = 783;
            _oTextCount.y = 860;
            _oTextCount.textAlign = "left";
            _oTextCount.textBaseline = "middle";
            _oTextCount.lineWidth = 600;            
            s_oStage.addChild(_oTextCount);
        }
    };
    
    this.unload = function(){
        s_oStage.removeChild(_oTextCount);
        s_oStage.removeChild(_oBg);
        _oButExit.unload();
        _oCountToggle.unload();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            s_oStage.removeChild(_oTextAudio);
            _oAudioToggle.unload();
        }
        s_oStage.removeChild(_oFade);
        _oFade.removeAllEventListeners();
        
        s_oGame.pauseGame(false);
        
    };
    
    this._onExit = function(){
        this.unload();
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onShowNumFlip = function(){
        s_bShowFlip = !s_bShowFlip;
        s_oGame.setShowNumFlip();
    };
    
    this._init();
    
};

