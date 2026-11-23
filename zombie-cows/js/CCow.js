function CCow(iRow,iCol,iX,iY,oParentContainer, szState){
    var _iRow;
    var _iCol;
    var _iX;
    var _iY;
    var _szValue;
    var _iMaskWidth;
    var _iMaskHeight;
    
    var _oParent = this;
    var _oCell;
    var _oMask;
    
    var _bCellOccupied;
    
    var _aPosToStayX = new Array();
    var _aPosToStayY = new Array();
    var _aScoreNum = new Array();
    var _aScoreNumShadow = new Array();
    var _aCow = new Array();
    var aCowSprite = new Array(COW_NUM);
    
    this._init = function(iRow,iCol,iX,iY,oParentContainer,state){
        _iRow = iRow;
        _iCol = iCol;
        _iX = iX;
        _iY = iY;
        var oData = {   
                        images: [s_oSpriteLibrary.getSprite('hole_sprites')], 
                        // width, height & registration point of each sprite
                        frames: {width: HOLE_WIDTH, height: HOLE_HEIGHT, regX: HOLE_WIDTH/2, regY: HOLE_HEIGHT}, 
                        animations: {hole0:[0], hole1:[1], hole2:[2], hole3:[3], hole4:[4], hole5:[5], hole6:[6], hole7:[7]}
                    };
        
            aCowSprite[0] = {   
                        images: [s_oSpriteLibrary.getSprite('cow0')], 
                        framerate: 6,
                        // width, height & registration point of each sprite
                        frames: {width: COW_WIDTH[0], height: COW_HEIGHT[0], regX: COW_WIDTH[0]/2, regY: COW_HEIGHT[0]}, 
                        animations: {start:[0], idle:[0, 3, "idle"], hit:[4]}
                    };
            aCowSprite[1] = {   
                        images: [s_oSpriteLibrary.getSprite('cow1')], 
                        framerate: 6,
                        // width, height & registration point of each sprite
                        frames: {width: COW_WIDTH[1], height: COW_HEIGHT[1], regX: COW_WIDTH[1]/2, regY: COW_HEIGHT[1]}, 
                        animations: {start:[0], idle:[0, 3, "idle"], hit:[4]}
                    };
            aCowSprite[2] = {   
                        images: [s_oSpriteLibrary.getSprite('cow2')], 
                        framerate: 6,
                        // width, height & registration point of each sprite
                        frames: {width: COW_WIDTH[2], height: COW_HEIGHT[2], regX: COW_WIDTH[2]/2, regY: COW_HEIGHT[2]}, 
                        animations: {start:[0], idle:[0, 3, "idle"], hit:[4]}
                    };
            aCowSprite[3] = {   
                        images: [s_oSpriteLibrary.getSprite('cow3')], 
                        framerate: 6,
                        // width, height & registration point of each sprite
                        frames: {width: COW_WIDTH[3], height: COW_HEIGHT[3], regX: COW_WIDTH[3]/2, regY: COW_HEIGHT[3]}, 
                        animations: {start:[0], idle:[0, 3, "idle"], hit:[4]}
                    };
            aCowSprite[4] = {   
                        images: [s_oSpriteLibrary.getSprite('cow4')], 
                        framerate: 6,
                        // width, height & registration point of each sprite
                        frames: {width: COW_WIDTH[4], height: COW_HEIGHT[4], regX: COW_WIDTH[4]/2, regY: COW_HEIGHT[4]}, 
                        animations: {start:[0], idle:[0, 3, "idle"], hit:[4]}
                    };
            aCowSprite[5] = {   
                        images: [s_oSpriteLibrary.getSprite('cow5')], 
                        framerate: 5,
                        // width, height & registration point of each sprite
                        frames: {width: COW_WIDTH[5], height: COW_HEIGHT[5], regX: COW_WIDTH[5]/2, regY: COW_HEIGHT[5]}, 
                        animations: {start:[0], idle:[0, 4, "idle"], hitOpen:[5, 7, "hit"], hitClose:[8]}
                    };
            aCowSprite[6] = {   
                        images: [s_oSpriteLibrary.getSprite('cow6')], 
                        framerate: 6,
                        // width, height & registration point of each sprite
                        frames: {width: COW_WIDTH[6], height: COW_HEIGHT[6], regX: COW_WIDTH[6]/2, regY: COW_HEIGHT[6]}, 
                        animations: {start:[0], idle:[0, 3, "idle"], hit:[4]}
                    };
            aCowSprite[7] = {   
                        images: [s_oSpriteLibrary.getSprite('cow7')], 
                        framerate: 5,
                        // width, height & registration point of each sprite
                        frames: {width: COW_WIDTH[7], height: COW_HEIGHT[7], regX: COW_WIDTH[7]/2, regY: COW_HEIGHT[7]}, 
                        animations: {start:[0], idle:[0, 1, "idle"], hit:[1, 4, "start"]}
                    };
        var oSpriteSheetHole = new createjs.SpriteSheet(oData);
        var iHoleNum = Math.floor(Math.random() * (7)); 
        
        _oCell = createSprite(oSpriteSheetHole, szState+iHoleNum, 0, 0, HOLE_WIDTH, HOLE_HEIGHT);
        _oCell.x = iX;
        _oCell.y = iY;
        _oCell.rotation = 0;
        _szValue = state;
        oParentContainer.addChild(_oCell);
        _bCellOccupied = false;
        
        _iMaskWidth = HOLE_WIDTH;
        _iMaskHeight = BIGGER_HEIGHT;
        
        
        _oMask = new createjs.Shape();
        _oMask.graphics.beginFill("rgba(255,255,255,0.01)").drawRect(iX-(HOLE_WIDTH/2), iY-HOLE_HEIGHT-177, _iMaskWidth, _iMaskHeight);
        oParentContainer.addChild(_oMask);
            
        for(var i = 0; i<COW_NUM; i++){
            var oSpriteSheetCow = new createjs.SpriteSheet(aCowSprite[i]);
            _aCow.push (createSprite(oSpriteSheetCow, "start", 0, 0, COW_WIDTH[i], COW_HEIGHT[i]));
            _aCow[i].x = iX;
            _aPosToStayX.push(iX);
            _aCow[i].y = iY+HOLE_HEIGHT+50;
            _aPosToStayY.push(iY+HOLE_HEIGHT+50);
            _aCow[i].rotation = 0;
            _aCow[i].stop;
            oParentContainer.addChild(_aCow[i]);
            _aCow[i].mask = _oMask;
            
            var iWidth = 200;
            var iHeight = 150;
            var iTextX = iX;
            var iTextY = iY - 300;
            _aScoreNum[i] = new CTLText(s_oStage, 
                        iTextX-iWidth/2, iTextY-iHeight/2, iWidth, iHeight, 
                        60, "center", "#ffcc00", FONT, 1,
                        2, 2,
                        COW_MESSAGE[i],
                        true, true, false,
                        false );
            _aScoreNum[i].setVisible(false);
            _aScoreNum[i].setShadow("#000",2,2,4);
            
        }
        
        _aScoreNum[8] = new CTLText(s_oStage, 
                        iTextX-iWidth/2, iTextY-iHeight/2, iWidth, iHeight, 
                        60, "center", "#ffcc00", FONT, 1,
                        2, 2,
                        COW_MESSAGE[i],
                        true, true, false,
                        false );
        _aScoreNum[8].setVisible(false);
        _aScoreNum[8].setShadow("#000",2,2,4);        
        
    };
    
    this.spawnCow = function(iCow, time){
        _aCow[iCow].gotoAndPlay("idle");
        createjs.Tween.get(_aCow[iCow] ).to({y:_aCow[iCow].y-HOLE_HEIGHT-100 }, (500), createjs.Ease.cubicOut).wait(time).call(function() {_oParent.deleteCow(iCow);});
        _bCellOccupied = true;
    };
    
    this.deleteCow = function(iCow){
        _aCow[iCow].gotoAndStop("start");
        createjs.Tween.get(_aCow[iCow] ).to({y:_aPosToStayY[iCow] }, 300, createjs.Ease.cubicIn).call(function() {s_iDeleted--;});
        _bCellOccupied = false;
    };
    
    this._hitCell = function(iCow){
        if(_bCellOccupied){
            
            if(iCow > 5){
                s_oGame._timerModifier(iCow);
            }else if(iCow < 5){
                s_oGame._scoreModifier(iCow);
            }
            if(iCow === 5){
                if(_aCow[iCow].currentFrame === 0 || _aCow[iCow].currentFrame === 1){
                    s_oGame._scoreModifier(iCow);
                    _aCow[iCow].gotoAndStop("hitClose");
                    
                    createjs.Tween.get(_aCow[iCow], {override:true} ).wait(500).to({y:_aPosToStayY[iCow] }, 500, createjs.Ease.cubicIn).call(function() {s_iDeleted--;});
                    iCow+=3;
                    
                }else{
                    s_bHammerUsable = false;
                    _aCow[iCow].gotoAndPlay("hitOpen");
                    createjs.Tween.get(_aCow[iCow], {override:true} ).wait(2000).to({y:_aPosToStayY[iCow] }, 500, createjs.Ease.cubicIn).call(function() {s_iDeleted--;
                                                                                                                                                     s_bHammerUsable = true;});
                }
                
            }else if(iCow === 7){
                _aCow[iCow].gotoAndPlay("hit");
                createjs.Tween.get(_aCow[iCow], {override:true} ).wait(600).to({y:_aPosToStayY[iCow] }, 500, createjs.Ease.cubicIn).call(function() {s_iDeleted--;});
            }else{
                _aCow[iCow].gotoAndStop("hit");
                createjs.Tween.get(_aCow[iCow], {override:true} ).to({x:_aCow[iCow].x+5 }, 500, createjs.Ease.bounceInOut).call(function() {_aCow[iCow].x=_aPosToStayX[iCow];
                                                                                                                                             createjs.Tween.get(_aCow[iCow], {override:true} ).to({y:_aPosToStayY[iCow] }, 500, createjs.Ease.cubicIn).call(function() {s_iDeleted--;});
                                                                                                                                            });
            }
            
            if(iCow === 0 || iCow === 1 ){
                playSound("hit_cow_1",1,false);  
            }else if(iCow === 8 || iCow === 4){
                playSound("hit_cow_2",1,false);
            }else if( iCow === 2){
                playSound("hit_dog",1,false);
            }else if( iCow === 3){
                playSound("hit_horse",1,false);
            }else if( iCow === 6){
                playSound("explosion",1,false);
            }else if( iCow === 7){
                playSound("present",1,false);
            }else if( iCow === 5){
                playSound("bite",1,false);
            }
            
            var oScore = _aScoreNum[iCow].getText();

            oScore.visible = true;
            createjs.Tween.get( oScore ).to({y:oScore.y-50}, 1500);
            createjs.Tween.get( oScore ).to({alpha:0}, 2000).call(function() {oScore.visible = false;
                                                                                                               oScore.y+=50;
                                                                                                               oScore.alpha = 1;
                                                                                                              });
                                                                                                              
                                                                                                                          
            _bCellOccupied = false;  
        }
    };
    
    this.getValue = function(){
        return _bCellOccupied;
    };
    
    this.unload = function(i){
        for(var i = 0; i<COW_NUM; i++){
            _aCow.pop();
            _aScoreNum.pop();
        }
        _aScoreNum.pop();
    }
    
    this._init(iRow,iCol,iX,iY,oParentContainer,szState);
    
}