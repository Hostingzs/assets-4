function CCell(iX, iY, iType, iRow, iCol, oParentContainer){
    
    var _iType;
    var _iRow;
    var _iCol;
    var _iNumFlips = 0;
    var _iWeight;
    
    var _oPawnContainer;
    var _oPawn;
    var _oClickArea;
    var _oShowFlip;
    var _oNumFlip;
    var _oListener;
    
    this._init = function(iX, iY, iType, iRow, iCol, oParentContainer){
        
        _iType = iType;
        _iRow = iRow;
        _iCol = iCol;
        
        _oPawnContainer = new createjs.Container();
        _oPawnContainer.x = iX;
        _oPawnContainer.y = iY;
        oParentContainer.addChild(_oPawnContainer);
        
        var oSprite = s_oSpriteLibrary.getSprite('pawn');
        var oData = {   // image to use
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: PAWN_SIZE, height: PAWN_SIZE, regX:PAWN_SIZE/2,regY:PAWN_SIZE/2}, 
                        animations: {  black: [0],white:[1]}
                        
        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);        
        _oPawn = createSprite(oSpriteSheet,iType,PAWN_SIZE/2,PAWN_SIZE/2,PAWN_SIZE,PAWN_SIZE);
        _oPawn.stop();
        _oPawnContainer.addChild(_oPawn);
       
        _oShowFlip = new createjs.Shape();
        _oShowFlip.graphics.setStrokeStyle(8);
        _oShowFlip.graphics.beginStroke("rgba(255,255,255,1)").drawCircle(0, 0, 35);
        _oShowFlip.visible = false;
        _oPawnContainer.addChild(_oShowFlip);
        
        _oNumFlip = new createjs.Text(_iNumFlips,"50px "+PRIMARY_FONT, "#ffffff");
        _oNumFlip.textAlign = "center";
        _oNumFlip.textBaseline = "middle";
        _oNumFlip.visible = false;
        _oPawnContainer.addChild(_oNumFlip);
        
        _oClickArea = new createjs.Shape();
        _oClickArea.graphics.beginFill("rgba(158,0,0,0.01)").drawRect(-CELL_LENGTH/2, -CELL_LENGTH/2, CELL_LENGTH, CELL_LENGTH);
        _oListener = _oClickArea.on("mousedown", this._onCellClick);
        _oClickArea.visible = false;
        _oPawnContainer.addChild(_oClickArea);
        
    };
    
    this.unload = function(){
        oParentContainer.removeChild(_oPawnContainer);
        _oClickArea.off("mousedown", _oListener);
    };  
    
    this.setClickableArea = function(bVal, bNumFlips, iCurPlayer){        
        _oClickArea.visible = bVal;
        _oNumFlip.text = _iNumFlips;
        
        if(iCurPlayer === PAWN_WHITE){
            _oNumFlip.color = "white";
            _oShowFlip.graphics.beginStroke("rgba(255,255,255,1)").drawCircle(0, 0, 35);
            
        } else {
            _oNumFlip.color = "black";
            _oShowFlip.graphics.beginStroke("rgba(0,0,0,1)").drawCircle(0, 0, 35);
        }
        
        if(bNumFlips){
            _oShowFlip.visible = bVal;
            _oNumFlip.visible = bVal;
            _oPawnContainer.cursor = "pointer";
        } else {
            _oShowFlip.visible = false;
            _oNumFlip.visible = false;
            _oPawnContainer.cursor = null;
        }
    };  
    
    this.setColor = function(iColor){
        
        if(_iType === PAWN_NULL){
            _oPawn.gotoAndStop(iColor);
            _iType = iColor;
        }
        
    };
    
    this.reversi = function(){
        if(_iType === PAWN_WHITE){
            _iType = PAWN_BLACK;
            createjs.Tween.get(_oPawnContainer).to({scaleX:0.1}, 200).call(function(){_oPawn.gotoAndStop(PAWN_BLACK);}).to({scaleX:1}, 200)
                    .call(function(){s_oGame.onFlipsEnd();});
        } else {
            _iType = PAWN_WHITE;
            createjs.Tween.get(_oPawnContainer).to({scaleX:0.1}, 200).call(function(){_oPawn.gotoAndStop(PAWN_WHITE);}).to({scaleX:1}, 200)
                    .call(function(){s_oGame.onFlipsEnd();});
        }
        
    };
    
    this._onCellClick = function(){
        s_oGame.cellClicked(_iRow, _iCol, _iNumFlips);
    };
    
    this.getType = function(){
        return _iType;
    };
    
    this.setNumFlips = function(iNum){
        _iNumFlips = iNum;
    };
    
    this.getNumFlips = function(){
        return _iNumFlips;
    };
    
    this.setWeight = function(iWeight){
        _iWeight = iWeight;
    };
    
    this.getWeight = function(){
        return _iWeight;
    };
    
    this._init(iX, iY, iType, iRow, iCol, oParentContainer);
}