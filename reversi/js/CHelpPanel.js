function CHelpPanel(){
    
    var _aPawn;
    
    var _oText1;
    var _oText2;

    var _oFade;
    var _oHelpBg;
    var _oGroup;
    var _oParent;
    var _oListener;

    this._init = function(){
        var oParent = this;
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("rgba(0,0,0,0.7)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        _oHelpBg = createBitmap(oSprite);
        _oHelpBg.regX = oSprite.width/2;
        _oHelpBg.regY = oSprite.height/2;
        _oHelpBg.x = CANVAS_WIDTH/2;
        _oHelpBg.y = CANVAS_HEIGHT/2;
  
        var oSprite = s_oSpriteLibrary.getSprite('pawn');
        var oData = {   // image to use
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: PAWN_SIZE, height: PAWN_SIZE, regX:PAWN_SIZE/2,regY:PAWN_SIZE/2}, 
                        animations: {  black: [0],white:[1]}
                        
        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _aPawn = new Array();
        for(var i=0; i<4; i++){
            _aPawn[i] = createSprite(oSpriteSheet,i%2,PAWN_SIZE/2,PAWN_SIZE/2,PAWN_SIZE,PAWN_SIZE);
            _aPawn[i].stop();
            if(i<2){
                _aPawn[i].y = 850; 
                if(i%2 === 0){
                    _aPawn[i].x = CANVAS_WIDTH/2 + 50;
                } else {
                    _aPawn[i].x = CANVAS_WIDTH/2 - 50;
                }
            } else {
                _aPawn[i].y = 950; 
                if(i%2 === 0){
                    _aPawn[i].x = CANVAS_WIDTH/2 - 50;
                } else {
                    _aPawn[i].x = CANVAS_WIDTH/2 + 50;
                }
            }       
        }
        
  
        var oText1Pos = {x: CANVAS_WIDTH/2, y: (CANVAS_HEIGHT/2)- 300};
  
        _oText1 = new createjs.Text(TEXT_HELP1," 40px "+PRIMARY_FONT, "#ffffff");
        _oText1.x = oText1Pos.x;
        _oText1.y = oText1Pos.y;
        _oText1.textAlign = "center";
        _oText1.textBaseline = "alphabetic";
        _oText1.lineWidth = 600;                
  
        var oText2Pos = {x: CANVAS_WIDTH/2, y: (CANVAS_HEIGHT/2) + 100};
  
        _oText2 = new createjs.Text(TEXT_HELP2," 40px "+PRIMARY_FONT, "#ffffff");
        _oText2.x = oText2Pos.x;
        _oText2.y = oText2Pos.y;
        _oText2.textAlign = "center";
        _oText2.textBaseline = "alphabetic";
        _oText2.lineWidth = 600;
     
        
        _oGroup = new createjs.Container();
        _oGroup.addChild(_oFade, _oHelpBg, _oText1, _oText2, _aPawn[0], _aPawn[1], _aPawn[2], _aPawn[3]);
        _oGroup.alpha=0;
        s_oStage.addChild(_oGroup);

        createjs.Tween.get(_oGroup).to({alpha:1}, 700);        
        
        _oListener = _oGroup.on("pressup",function(){oParent._onExitHelp();});
        
        
    };

    this.unload = function(){
        s_oStage.removeChild(_oGroup);

        var oParent = this;
        _oGroup.off("pressup", _oListener);
    };

    this._onExitHelp = function(){
        _oParent.unload();
        s_oGame._onExitHelp();
    };

    _oParent=this;
    this._init();

}
