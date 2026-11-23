function CHammer(oParentContainer){
    
    var _oParent = this;
    var _oHammer;
    var _oHammerSprite;
    
    this._init = function(oParentContainer){
            _oHammerSprite = {        
                        images: [s_oSpriteLibrary.getSprite('hammer_sprites')], 
                        framerate: 20,
                        // width, height & registration point of each sprite
                        frames: {width: HAMMER_WIDTH, height: HAMMER_HEIGHT, regX: HAMMER_WIDTH/2, regY: HAMMER_HEIGHT/2}, 
                        animations: {start:[0], hit:[1, 5, "start"]}
                    };
                    
        var oSpriteSheetHammer = new createjs.SpriteSheet(_oHammerSprite);
        _oHammer = createSprite(oSpriteSheetHammer, "start", 0, 0, HAMMER_WIDTH, HAMMER_HEIGHT);
        _oHammer.x = 1800;
        _oHammer.y = 525;
        _oHammer.alpha = 0;
        oParentContainer.addChild(_oHammer);
    };
    
    this.unload = function(){
        createjs.Tween.removeAllTweens();
        oParentContainer.removeAllChildren(); 
    };
    
    this._showHammer = function(iRow, iCol){
        _oHammer.y = iRow;
        _oHammer.x = iCol;
        _oHammer.visible = true;
        _oHammer.alpha = 1
        createjs.Tween.get(_oHammer, {override:true} ).wait(300).call(function() {});
        _oHammer.gotoAndPlay("hit");
        
        createjs.Tween.get(_oHammer ).wait(500).to({alpha: 0 }, 500).call(function() {});
        
    };
    
    this._init(oParentContainer);
    
}