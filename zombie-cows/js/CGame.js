function CGame(oData){
    var _iScore = 0;    
    var _iLevel = s_iLevel;
    
    var _aCowValue = new Array({score: 20, time:1300}, 
                               {score: 10, time:1500},
                               {score: 10, time:1500},
                               {score: 50, time:1000},
                               {score: 40, time:1350},
                               {score: 70, time:1800},
                               {score: 10, time:2000},
                               {score: -10, time:1000});  //skelton and package have value inverted instead of what they do, because time elapse start to 0
    var _iTimer;
    var _iTimeElapsed = 0;
    var _iScoreForNextLevel;
    var _iCurIndexSpawn = 0;
    var _iNumElem;
    
    var _aGrid;
    var _aCowToSpawn = new Array();
    //0=cow0, 1=cow1, 2=cow2......
    var _aCowSelected = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        
    var _bUpdate;
    var _bOnHitArea = false;
    
    var _oHammer;
    var _oContainerGrid;
    var _oHitArea;
    var _oInterface;
    var _oEndPanel = null;
    var _oParent;
    
    var _bPokiStart;
    
    this._init = function(){
        _bPokiStart = false;
        
        $(s_oMain).trigger("start_level",_iLevel);
        
        setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME);
        
        _iTimer = TIME_LEVEL;
        _iTimeElapsed = 0;
        s_bHammerUsable = true;
        s_bGoalReached = false;
        s_iDeleted = 1;
        
        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(oBg); //Draws on canvas
        
        _oContainerGrid = new createjs.Container();
        s_oStage.addChild(_oContainerGrid);
        
        s_oLevelSettings = new CLevelSettings(_iLevel);
        _iScoreForNextLevel = s_oLevelSettings.getGoalInLevel(_iLevel);
        _iNumElem = s_oLevelSettings.getElementsNum(_iLevel);
        for(var i=0; i<_iNumElem; i++){
            _aCowToSpawn[i] = (s_oLevelSettings.getLevel(_iLevel, i));
        }
        
        _oInterface = new CInterface();
        _aCowToSpawn = shuffle(_aCowToSpawn);
        
        _oInterface.refreshGoal(_iScoreForNextLevel);
        this._createCells();   
        
        _oHammer = new CHammer(_oContainerGrid);
        
        this.onNextLevel( _iLevel );
    };
    
    this._initLevel = function(iLevel){
        $(s_oMain).trigger("start_level",_iLevel);
        _iLevel = iLevel;
        _iTimeElapsed = 0;
        s_bHammerUsable = true;
        s_bGoalReached = false;
        s_iDeleted = 1;
        
        s_oLevelSettings = new CLevelSettings(_iLevel);
        _iScoreForNextLevel = s_oLevelSettings.getGoalInLevel(_iLevel);
        _iNumElem = s_oLevelSettings.getElementsNum(_iLevel);
        for(var i=0; i<_iNumElem; i++){
            _aCowToSpawn[i] = (s_oLevelSettings.getLevel(_iLevel, i));
        }
        
        _oInterface.refreshGoal(_iScoreForNextLevel);
        
        this.onNextLevel( _iLevel );
    };
    
    this._createCells = function(){
        var iX = START_X_GRID;
        var iY = START_Y_GRID;
        
        _aGrid = new Array();
        for(var iRow=0; iRow < NUM_ROWS; iRow++){
            _aGrid[iRow] = new Array();
            for(var iCol=0; iCol < NUM_COLS; iCol++){
                _aGrid[iRow][iCol] = new CCow(iRow,iCol,iX,iY,_oContainerGrid, "hole");
                //SHAPE FOR HIT AREA
                _oHitArea = new createjs.Shape();
                _oHitArea.graphics.beginFill("rgba(255,255,255,0.01)").drawRect(iX-(HOLE_WIDTH/2), iY-HOLE_HEIGHT, HOLE_WIDTH, HOLE_HEIGHT);
                _oContainerGrid.addChild(_oHitArea);
                _oHitArea.on("mousedown", s_oGame._hammerOn, this, false, {iRow: iRow, iCol: iCol});
                iX += HOLE_WIDTH;
            }
            iY += HOLE_HEIGHT;
            iX = START_X_GRID;
        } 
    };
    
    this._selectCow = function(){
        s_iDeleted = 0;
        
        for(var i = 0; i<9; i++){
            var bSpawn = Math.floor(Math.random() * (2));
            var iX;
            var iY;
            
            if( bSpawn ){
                do{
                    iX = Math.floor(Math.random() * (NUM_COLS));
                    iY = Math.floor(Math.random() * (NUM_ROWS));
                }while(_aGrid[iX][iY].getValue() !== false);
                _iCurIndexSpawn++;
                if(_iCurIndexSpawn >= _iNumElem){
                    _aCowToSpawn = shuffle(_aCowToSpawn);
                    _iCurIndexSpawn = 0;
                }
                _aCowSelected[((iX*NUM_COLS)+iY)] = _aCowToSpawn[_iCurIndexSpawn];
                _aGrid[iX][iY].spawnCow(_aCowSelected[((iX*NUM_COLS)+iY)], _aCowValue[_aCowToSpawn[_iCurIndexSpawn]].time);
                s_iDeleted++;
            }
        }
    };
    
    this._hammerOn = function(event, iData){
        if(!_bOnHitArea) {
            _bOnHitArea = true;
            if(s_bHammerUsable){
                _aGrid[iData.iRow][iData.iCol]._hitCell(_aCowSelected[(NUM_COLS*iData.iRow)+iData.iCol]);
                _oHammer._showHammer(START_Y_GRID+(HOLE_HEIGHT*iData.iRow)-150, START_X_GRID+(HOLE_WIDTH*iData.iCol));
                playSound("hammer",1,false);
            }
            _bOnHitArea = false;
        }
    };
    
    this._hammerOff = function(){
        _oHammer.unload();
    };
    
    this._timerModifier = function(iValue){
        _bUpdate = false;
        var iTemp = _iTimeElapsed;
        iTemp = _iTimeElapsed + (_aCowValue[iValue].score*1000);
        if(iTemp <= 0){
            _iTimeElapsed = 0;
        }else{
            _iTimeElapsed += _aCowValue[iValue].score*1000;
        }
        _bUpdate = true;
    };
    
    this.onNextLevel = function( _iLevel ){
        _bUpdate = false;
        new CNextLevel( s_oSpriteLibrary.getSprite('msg_box'), _iLevel, _iScoreForNextLevel );
    };
    
    this.onNextLevelExit = function(){
        s_oGame.setPokiStart(true);
        
        _bUpdate = true;
        this._selectCow();
    };
    
    this._scoreModifier = function(iValue){
        _iScore += _aCowValue[iValue].score;
        _oInterface.refreshScore(_iScore, _iScoreForNextLevel);
    };
    
    
    this.unload = function(){
        _oInterface.unload();
        if(_oEndPanel !== null){
            _oEndPanel.unload();
        }
        
        s_oLevelSettings.unload();
        
        for(var i=0; i<NUM_ROWS; i++){
            for(var j=0; j<NUM_COLS; j++){
                _aGrid[i][j].unload();
            }
        }
        this._hammerOff();
        
        s_oGame = null;
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren(); 
    };
    
    this.onExit = function(){
        s_oGame.setPokiStart(false);
        
        s_oMain.pokiShowCommercial( ()=>{
            this.unload();
            s_oMain.gotoMenu();
        });
    };

    this.gameOver = function(){   
        s_oGame.setPokiStart(false);
        
        _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box'));
        if( LEVEL_MAX === (_iLevel+1) && _iScore >= _iScoreForNextLevel){
            _oEndPanel.win(_iScore); 
        }else  if(_iScore < _iScoreForNextLevel){
            _oEndPanel.show(_iScore, _iLevel++);
        }
    };
    
    this.setPokiStart = function(bVal){       
        if(bVal && !_bPokiStart){
            PokiSDK.gameplayStart();
            _bPokiStart = true;
        }else if(!bVal && _bPokiStart) {
            PokiSDK.gameplayStop();
            _bPokiStart = false;
        }
    };
    
    this.update = function(){
        if(_bUpdate){
            _iTimeElapsed += s_iTimeElaps;
            var iNewTime = _iTimer-_iTimeElapsed;
            
            var oTextVictoryShadow;
            var oTextVictory;
            
            if((iNewTime) <= 0 && _iScore >= _iScoreForNextLevel && (_iLevel+1) < LEVEL_MAX ){
                $(s_oMain).trigger("end_level",_iLevel);
                s_iDeleted = 0;
                s_bHammerUsable = false;
                _bUpdate=false;
                
                oTextVictoryShadow = new createjs.Text(TEXT_CONGRATS, "10px "+FONT, "#000000");
                oTextVictoryShadow.x = (CANVAS_WIDTH/2)+2;
                oTextVictoryShadow.y = (CANVAS_HEIGHT/2)+2;
                oTextVictoryShadow.textAlign = "center";
                oTextVictoryShadow.textBaseline = "alphabetic";
                oTextVictoryShadow.lineWidth = 200;
                s_oStage.addChild(oTextVictoryShadow);
                
                oTextVictory = new createjs.Text(TEXT_CONGRATS, "10px "+FONT, "#ffcc00");
                oTextVictory.x = CANVAS_WIDTH/2;
                oTextVictory.y = CANVAS_HEIGHT/2;
                oTextVictory.textAlign = "center";
                oTextVictory.textBaseline = "alphabetic";
                oTextVictory.lineWidth = 200;
                s_oStage.addChild(oTextVictory);
                
                s_oGame.setPokiStart(false);
                PokiSDK.happyTime(1);
                
                createjs.Tween.get(oTextVictoryShadow ).to({scaleX: 10 , scaleY: 10 }, 500, createjs.Ease.bounceOut).wait(2000).call(function() {});
                createjs.Tween.get(oTextVictory ).to({scaleX: 10 , scaleY: 10 }, 500, createjs.Ease.bounceOut).wait(2000).call(function() {s_oGame._initLevel(_iLevel+1);
                                                                                                                                           oTextVictoryShadow.text="";
                                                                                                                                           oTextVictory.text="";
                                                                                                                                          });
                
            }else if((_iLevel+1) === LEVEL_MAX && _iScore >= _iScoreForNextLevel && (iNewTime) <= 0){
                $(s_oMain).trigger("end_level",_iLevel);
                s_iDeleted = 0;
                s_bHammerUsable = false;
                _bUpdate=false;
                
                oTextVictoryShadow = new createjs.Text(TEXT_CONGRATS, "10px "+FONT, "#000000");
                oTextVictoryShadow.x = (CANVAS_WIDTH/2)+2;
                oTextVictoryShadow.y = (CANVAS_HEIGHT/2)+2;
                oTextVictoryShadow.textAlign = "center";
                oTextVictoryShadow.textBaseline = "alphabetic";
                oTextVictoryShadow.lineWidth = 200;
                s_oStage.addChild(oTextVictoryShadow);
                
                oTextVictory = new createjs.Text(TEXT_CONGRATS, "10px "+FONT, "#ffcc00");
                oTextVictory.x = CANVAS_WIDTH/2;
                oTextVictory.y = CANVAS_HEIGHT/2;
                oTextVictory.textAlign = "center";
                oTextVictory.textBaseline = "alphabetic";
                oTextVictory.lineWidth = 200;
                s_oStage.addChild(oTextVictory);
                
                s_oGame.setPokiStart(false);
                PokiSDK.happyTime(1);
                
                
                createjs.Tween.get(oTextVictoryShadow ).to({scaleX: 10 , scaleY: 10 }, 500, createjs.Ease.bounceOut).wait(2000).call(function() {});
                createjs.Tween.get(oTextVictory ).to({scaleX: 10 , scaleY: 10 }, 500, createjs.Ease.bounceOut).wait(2000).call(function() {s_oGame.gameOver();
                                                                                                                                           oTextVictoryShadow.text="";
                                                                                                                                           oTextVictory.text="";
                                                                                                                                          });
                
                
            }else if(iNewTime <= 0 && _iScore < _iScoreForNextLevel){
                _bUpdate=false;
                this.gameOver();
            }else{
                _oInterface.refreshTime((iNewTime/_iTimer)); 
                if (iNewTime < 0){
                    _oInterface.refreshTimeText(formatTime(0));
                }else{
                    _oInterface.refreshTimeText(formatTime(iNewTime));
                }
            }
            
            if(s_iDeleted <= 0 && _bUpdate){
                this._selectCow();
            }
             
        }
    };

    s_oGame=this;
    
    _oParent=this;
    
    TIME_LEVEL = oData.level_time;
    SCORE_GOAL = oData.level_goal;
    
    this._init();
}

var s_oGame;
