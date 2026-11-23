function CNextLevel(oSpriteBg, iLevel, iScore){
    
    var _oBg;
    var _oGroup;

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
        var iHeight = 130;
        var iX = CANVAS_WIDTH/2;
        var iY = (CANVAS_HEIGHT/2)-100;
        _oMsgText = new CTLText(_oGroup, 
                    iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                    120, "center", "#a74085", FONT, 1,
                    2, 2,
                    "",
                    true, true, false,
                    false );
        _oMsgText.setShadow("#000",2,2,4);

        
        var iHeight = 140;
        var iY = (CANVAS_HEIGHT/2)+50;
        _oScoreText = new CTLText(_oGroup, 
                    iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                    70, "center", "#633f01", FONT, 1,
                    2, 2,
                    "",
                    true, true, true,
                    false );
        _oScoreText.setShadow("#000",2,2,4);
        
        this.show(iLevel);
    };
    
    this._initListener = function(){
        _oGroup.on("mousedown",this._onExit);
    };
    
    this.show = function(iLevel){
        if(iLevel >0){
            playSound("win",1,false);
        }
        _oMsgText.refreshText( sprintf(TEXT_CUR_LEVEL, iLevel+1) );
        _oScoreText.refreshText( sprintf(TEXT_SCORE_TO_BEAT, iScore) );
        _oGroup.visible = true;
        
        var oParent = this;
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500).call(function() {oParent._initListener();});
    };
    
    this._onExit = function(){
        _oGroup.removeAllEventListeners();
        s_oStage.removeChild(_oGroup);
        
        s_oGame.onNextLevelExit();
    };
    
    this._init(oSpriteBg);
    
    return this;
}
