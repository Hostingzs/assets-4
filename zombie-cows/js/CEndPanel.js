function CEndPanel(oSpriteBg){
    
    var _oBg;
    var _oGroup;
    
    var _oLevelText;
    var _oMsgText;
    var _oScoreText;
    
    this._init = function(oSpriteBg){
        
        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible=false;
        s_oStage.addChild(_oGroup);
        
        _oBg = createBitmap(oSpriteBg);
        _oGroup.addChild(_oBg);

        var iWidth = 600;
        var iHeight = 110;
        var iX = CANVAS_WIDTH/2;
        var iY = (CANVAS_HEIGHT/2)-100;
        _oMsgText = new CTLText(_oGroup, 
                    iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                    100, "center", "#a74085", FONT, 1,
                    2, 2,
                    "",
                    true, true, false,
                    false );
        _oMsgText.setShadow("#000",2,2,4);

        var iHeight = 60;
        var iY = (CANVAS_HEIGHT/2)+10;
        _oLevelText = new CTLText(_oGroup, 
                    iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                    55, "center", "#633f01", FONT, 1,
                    2, 2,
                    "",
                    true, true, false,
                    false );
        _oLevelText.setShadow("#000",2,2,4);
       
        var iY = (CANVAS_HEIGHT/2)+130;
        _oScoreText = new CTLText(_oGroup, 
                    iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                    55, "center", "#a74085", FONT, 1,
                    2, 2,
                    "",
                    true, true, false,
                    false );
        _oScoreText.setShadow("#000",2,2,4);

    };
    
    this.unload = function(){
        _oGroup.removeAllEventListeners();
    };
    
    this._initListener = function(){
        _oGroup.on("mousedown",this._onExit);   
    };
    
    this.show = function(iScore, iLevel){
	playSound("game_over",1,false);
        
        
        _oMsgText.refreshText( TEXT_GAMEOVER );
        _oLevelText.refreshText( sprintf(TEXT_LEVEL, iLevel+1) );
        _oScoreText.refreshText( sprintf(TEXT_SCORE, iScore) );
        
        _oGroup.visible = true;
        
        var oParent = this;
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500).call(function() {oParent._initListener();});
        
        $(s_oMain).trigger("share_event",iScore);
        $(s_oMain).trigger("end_level",iLevel);
        $(s_oMain).trigger("save_score",[iScore]);
    };
    
    this.win = function(iScore){
	playSound("game_over",1,false);

        _oMsgText.refreshText( TEXT_WIN );
        
        _oScoreText.refreshText( sprintf(TEXT_SCORE, iScore) );
        
        _oGroup.visible = true;
        
        var oParent = this;
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500).call(function() {oParent._initListener();});

        $(s_oMain).trigger("share_event",iScore);
        $(s_oMain).trigger("save_score",[iScore]);
    };

    this._onExit = function(){
        _oGroup.removeAllEventListeners();
        s_oStage.removeChild(_oGroup);
        $(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("end_session");
        
        s_oGame.onExit();
    };
    
    
    this._init(oSpriteBg);
    
    return this;
}
