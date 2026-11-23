function CAlertPanel(szText, iCurPlayer, iType){
    
    var _oFade;
    var _oBg;
    var _oButExit;
    var _oText;
    var _oPawn;
    
    this._init = function(szText, iCurPlayer){
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0.7;
        _oFade.on("mousedown",function(){});
        s_oStage.addChild(_oFade);
        
        s_oGame.pauseGame(true);
        
        
        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');
        _oBg = createBitmap(oSpriteBg);
        _oBg.regX = oSpriteBg.width/2;
        _oBg.regY = oSpriteBg.height/2;
        _oBg.x = CANVAS_WIDTH/2;
        _oBg.y = CANVAS_HEIGHT/2;
        s_oStage.addChild(_oBg);
        
        
        
        if(iType === ALERT_TYPE_NOMOVES){
            var oSprite = s_oSpriteLibrary.getSprite('pawn');
            var oData = {   // image to use
                            images: [oSprite], 
                            // width, height & registration point of each sprite
                            frames: {width: PAWN_SIZE, height: PAWN_SIZE, regX:PAWN_SIZE/2,regY:PAWN_SIZE/2}, 
                            animations: {  black: [0],white:[1]}

            };

            var oSpriteSheet = new createjs.SpriteSheet(oData);        
            _oPawn = createSprite(oSpriteSheet,iCurPlayer,PAWN_SIZE/2,PAWN_SIZE/2,PAWN_SIZE,PAWN_SIZE);
            _oPawn.stop();
            _oPawn.x = CANVAS_WIDTH/2;
            _oPawn.y = 800;
            s_oStage.addChild(_oPawn);
        }
        
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _oButExit = new CGfxButton(CANVAS_WIDTH/2 +340, 650, oSprite,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        _oText =  new createjs.Text(szText,"80px "+PRIMARY_FONT, "#ffffff");
        _oText.x = CANVAS_WIDTH/2;
        _oText.y = CANVAS_HEIGHT/2;
        _oText.textAlign = "center";
        _oText.textBaseline = "midlle";
        _oText.lineWidth = 600;
        s_oStage.addChild(_oText);
        
    };
    
    this.unload = function(){
        _oFade.removeAllEventListeners();
        
        _oButExit.unload();
        s_oStage.removeChild(_oBg);
        s_oStage.removeChild(_oText);
        s_oStage.removeChild(_oPawn);
        s_oStage.removeChild(_oFade);
        
        s_oGame.pauseGame(false);
    };
    
    this._onExit = function(){
        this.unload();
        if(iType === ALERT_TYPE_NOMOVES){
            s_oGame.changeTurn();
        } else {
            s_oGame.gameOver();
        }
        
    };
    
    this._init(szText, iCurPlayer);
    
};