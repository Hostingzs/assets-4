function CGame(oData){
    var _bTouchActive;
    var _bStartGame;
    var _bValidMoves;
    
    var _iCurPlayer;
    var _iNumFlips;
    var _iTurnStallCount;
    var _iNumCellOccupied;
    var _iWhiteCell;
    var _iBlackCell;
    var _iBlackTime;
    var _iWhiteTime;

    var _aCellPos;
    var _aCell;
    var _aCellToFlips;

    var _oInterface;
    var _oEndPanel = null;
    var _oParent;
    var _oGridContainer;
    var _oInterfaceContainer;
    var _oThinking = null;
    
    this._init = function(){

        _bTouchActive=false;
        _bStartGame=false;
        _bValidMoves = false;
          
        _iCurPlayer = PAWN_BLACK;
        _iTurnStallCount = 0;
        _iBlackCell = 0;
        _iWhiteCell = 0;
        _iBlackTime = 0;
        _iWhiteTime = 0;
        
        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(oBg); //Draws on canvas

        _oGridContainer = new createjs.Container();
        _oGridContainer.x = CANVAS_WIDTH/2;
        _oGridContainer.y = CANVAS_HEIGHT/2;
        s_oStage.addChild(_oGridContainer);
        
        var oSprite = s_oSpriteLibrary.getSprite('board');
        var oBoard = createBitmap(oSprite);
        oBoard.regX = oSprite.width/2;
        oBoard.regY = oSprite.height/2 - 10;
        _oGridContainer.addChild(oBoard);
        
        _oInterfaceContainer = new createjs.Container();
        _oInterfaceContainer.x = CANVAS_WIDTH/2;
        _oInterfaceContainer.y = CANVAS_HEIGHT/2;
        s_oStage.addChild(_oInterfaceContainer);
        
        _oInterface = new CInterface(_oInterfaceContainer);   
        
        this._initGrid();

        this.calcFlipCounts();

        new CHelpPanel();
        
        this.refreshButtonPos();
        
    };
    
    this.refreshButtonPos = function(){
        var iBoardScale;
        if(s_bLandscape){
            iBoardScale = linearFunction(s_iOffsetY, EDGEBOARD_Y, 0, 0.71, 1.6);
        } else {
            iBoardScale = linearFunction(s_iOffsetX, EDGEBOARD_X, 0, 0.94, 2.3);
            
            if(iBoardScale > 1.42){
                iBoardScale = 1.42;
            }
        }
        _oGridContainer.scaleX = _oGridContainer.scaleY = iBoardScale;
        _oInterfaceContainer.scaleX = _oInterfaceContainer.scaleY = iBoardScale;

        s_oInterface.refreshButtonPos(iBoardScale);
    };
    
    this._initGrid = function(){
      
        var iLength = BOARD_LENGTH;
        var iNumCell = NUM_CELL;
        var iGridStart = -iLength/2;
        var iCellLength = CELL_LENGTH;
        var iCellStartPos = iGridStart + iCellLength/2;
        
        //Init Cell Position
        _aCellPos = new Array();
        for(var i=0; i<iNumCell; i++){
            _aCellPos[i] = new Array();
            for(var j=0; j<iNumCell; j++){                
                _aCellPos[i][j] = {x: iCellStartPos +j*iCellLength, y: iCellStartPos +i*iCellLength};                
            }
        }
        
        _aCell = new Array();
        for(var i=0; i<iNumCell; i++){
            _aCell[i] = new Array();
            for(var j=0; j<iNumCell; j++){
                var iType = -1;
                _aCell[i][j] = new CCell(_aCellPos[i][j].x, _aCellPos[i][j].y, iType, i,j, _oGridContainer);
                
            }
        }
            
        _aCell[3][3].setColor(PAWN_WHITE);
        _aCell[4][4].setColor(PAWN_WHITE);
        _aCell[3][4].setColor(PAWN_BLACK);
        _aCell[4][3].setColor(PAWN_BLACK);
        
        _iNumCellOccupied = 4;
        
        this.countPawn();
        _oInterface.activePlayer(PAWN_BLACK);
        
    };
    
    this.changeTurn = function(){
        
        if(_iNumCellOccupied === TOT_CELL){
            this.resetFlips();
            this.gameOver();
            return;
        }
        
        if(_iCurPlayer === PAWN_BLACK){
            _iCurPlayer = PAWN_WHITE;
        } else {
            _iCurPlayer = PAWN_BLACK;            
        }
        
        _oInterface.activePlayer(_iCurPlayer);
        this.calcFlipCounts();        
        
        if(!_bValidMoves){
            
            _iTurnStallCount++;
            if(_iTurnStallCount === 2){
                new CAlertPanel(TEXT_STALL, _iCurPlayer, ALERT_TYPE_STALL);
            } else {
                new CAlertPanel(TEXT_NOMOVES, _iCurPlayer, ALERT_TYPE_NOMOVES);
            }            
        } else {
            
            if(_iCurPlayer === PAWN_WHITE && s_iGameType === MODE_COMPUTER){
                _oThinking = new CThinking();
                var iTimeThink = MIN_AI_THINKING + Math.random()*(MAX_AI_THINKING - MIN_AI_THINKING);
                setTimeout(function(){_oThinking.unload(); _oThinking = null; _oParent.othelloAI();}, iTimeThink);
            }
            
        }
        
        
    };
    
    this.cellClicked = function(iRow, iCol, iNumFlips){     
        playSound("click_cell",1,false);

        this.resetFlips();
        
        _iNumCellOccupied++;

        _iNumFlips = iNumFlips;
        
        _aCell[iRow][iCol].setColor(_iCurPlayer);    
        
        this.cellFlips(iRow, iCol);
        this.countPawn();       
        
    };
    
    this.setShowNumFlip = function(){        
        this.calcFlipCounts();        
    };
        
    this.restartGame = function () {
        this.unload();
        this._init();
    };        
    
    this.pauseGame = function(bVal){
        _bStartGame = !bVal;
        
        if(bVal){
            PokiSDK.gameplayStop();
        } else{
            PokiSDK.gameplayStart();
        }
    };
    
    this.unload = function(){
        _bStartGame = false;
        
        _oInterface.unload();
        if(_oEndPanel !== null){
            _oEndPanel.unload();
        }
        
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren();

        s_oGame = null;
    };
 
    this.onExit = function(){
        s_oMain.pokiShowCommercial();
        
        this.unload();
        s_oMain.gotoMenu();

    };
    
    this._onExitHelp = function () {
         _bStartGame = true;
         PokiSDK.gameplayStart();
    };
    
    this.gameOver = function(){  
        if(s_iGameType === MODE_COMPUTER && _iWhiteCell > _iBlackCell){
            PokiSDK.happyTime(1);
        }
        _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box'));
        _oEndPanel.show(_iBlackCell, _iWhiteCell, _iBlackTime, _iWhiteTime);
        _oInterface.setInfoVisible(false);
    };

    
    this.update = function(){
        if(_bStartGame){
            
            if(_oThinking !== null){
                _oThinking.update();
            }
            
            if(_iCurPlayer === PAWN_WHITE){
                _iWhiteTime += s_iTimeElaps;
                _oInterface.refreshWhiteTime(_iWhiteTime);
            } else {
                _iBlackTime += s_iTimeElaps;
                _oInterface.refreshBlackTime(_iBlackTime);
            }                     
        }
    };

    this.numFlips = function (iX, iY) {
        var iDeltaX, iDeltaY, iDistance;
        var iPosX, iPosY;
        var iCount = 0;

        for(iDeltaY = -1; iDeltaY <= 1; iDeltaY++) {
            for(iDeltaX = -1; iDeltaX <= 1; iDeltaX++) {
                for(iDistance = 1;; iDistance++) {
                    iPosX = iX + (iDistance * iDeltaX);
                    iPosY = iY + (iDistance * iDeltaY);

                    if(iPosX < 0 || iPosX >= NUM_CELL || iPosY < 0 || iPosY >= NUM_CELL){
                        break;
                    }
                       
                    if(_aCell[iPosX][iPosY].getType() === PAWN_NULL){
                        break;
                    }                        

                    if(_aCell[iPosX][iPosY].getType() === _iCurPlayer) {
                        iCount += iDistance - 1;
                        break;
                    }
                }
            }
        }
        
        return(iCount);
    };

    this.cellFlips = function (iX, iY) {
        var iDeltaX, iDeltaY, iDistance;
        var iPosX, iPosY;
        var iCount = 0;
        _aCellToFlips = new Array();

        for(iDeltaY = -1; iDeltaY <= 1; iDeltaY++) {
            for(iDeltaX = -1; iDeltaX <= 1; iDeltaX++) {
                for(iDistance = 1;; iDistance++) {
                    iPosX = iX + (iDistance * iDeltaX);
                    iPosY = iY + (iDistance * iDeltaY);

                    if(iPosX < 0 || iPosX >= NUM_CELL || iPosY < 0 || iPosY >= NUM_CELL){
                        break;
                    }

                    if(_aCell[iPosX][iPosY].getType() === PAWN_NULL){
                        break;
                    }

                    if(_aCell[iPosX][iPosY].getType() === _iCurPlayer) {
                        for(iDistance--; iDistance > 0; iDistance--) {
                            iPosX = iX + (iDistance * iDeltaX);
                            iPosY = iY + (iDistance * iDeltaY);
                            _aCell[iPosX][iPosY].reversi();
                        }
                        break;
                    }
                    
                }
            }
        }    
        
        return(iCount);
    };

    this.onFlipsEnd = function(){
        _iNumFlips--;

        if(_iNumFlips === 0){
            this.changeTurn();
        }
    };

    this.calcFlipCounts = function() {
        for(var i = 0; i < NUM_CELL; i++) {
            for(var j = 0; j < NUM_CELL; j++) {
                
                _aCell[i][j].setNumFlips( 0 );

                if(_aCell[i][j].getType() !== PAWN_NULL) continue;

                _aCell[i][j].setNumFlips( this.numFlips(i, j) );
                
                if( _aCell[i][j].getNumFlips() > 0){
                    _bValidMoves = true;
                    _iTurnStallCount = 0;
                    if(_iCurPlayer === PAWN_WHITE && s_iGameType === MODE_COMPUTER){
                        _aCell[i][j].setClickableArea(false, false, _iCurPlayer);
                    } else {
                        _aCell[i][j].setClickableArea(true, s_bShowFlip, _iCurPlayer);
                    }
                    
                    
                }
            }
        }
    };

    this.resetFlips = function(){
        for(var i = 0; i < NUM_CELL; i++) {
            for(var j = 0; j < NUM_CELL; j++) {
                _aCell[i][j].setClickableArea(false);
            }
        }  
        _bValidMoves = false;
    };

    this.countPawn = function(){
        var iType;
        _iBlackCell = 0;
        _iWhiteCell = 0;
        for(var i = 0; i < NUM_CELL; i++) {
            for(var j = 0; j < NUM_CELL; j++) {
                iType = _aCell[i][j].getType();
                if(iType === 0){
                    _iBlackCell++;
                } else if(iType === 1) {
                    _iWhiteCell++;
                }
            }
        }
        _oInterface.refreshBlackPawnNumber(_iBlackCell);
        _oInterface.refreshWhitePawnNumber(_iWhiteCell);
    };
    
    this.rate = function(iX, iY) {
        var iRating;

        if(_aCell[iX][iY].getType() !== PAWN_NULL){
            return(0);
        }             
        if(iX < 0 || iX >= NUM_CELL || iY < 0 || iY >= NUM_CELL){
            return(0);
        } 
            

        iRating = _aCell[iX][iY].getNumFlips();

        if(! s_bWeightSquares){
            iRating = (iRating > 0)? 1: 0;
        }
            

        if(s_bEdgeSensitive && iRating > 0) {

            iRating += 10;

            if(iX === 0 || iX === NUM_CELL - 1){
                iRating += 4;
            }
            if(iY === 0 || iY === NUM_CELL - 1) {
                iRating += 4;
            }

            if(iX === 1 || iX === NUM_CELL - 2) {
                iRating -= 5;
            }
            if(iY === 1 || iY === NUM_CELL - 2) {
                iRating -= 5;
            }

            if(iRating < 1) iRating = 1;
        }
        return(iRating);
    };

    this.othelloAI = function() {
        var iX, iY;
        var iBest = 0, iNumBest = 0;
        var iRating;
        var iPick, iCount;

        for(iY = 0; iY < NUM_CELL; iY++) {
            for(iX = 0; iX < NUM_CELL; iX++) {
                iRating = this.rate(iX, iY);

                _aCell[iX][iY].setWeight(iRating);

                if(iRating === iBest)
                    iNumBest++;
                else if(iRating > iBest) {
                    iBest = iRating;
                    iNumBest = 1;
                }
            }
        }

        while(iNumBest > 0) {
            
            iPick = Math.floor(Math.random() * iNumBest);
            iCount = 0;
            for(iY = 0; iY < NUM_CELL; iY++) {
                for(iX = 0; iX < NUM_CELL; iX++) {
                    iRating = _aCell[iX][iY].getWeight();
                    if(iRating === iBest) {
                        if(iCount === iPick) {
                            this.cellClicked(iX, iY, _aCell[iX][iY].getNumFlips());

                            return;
                        }
                        else iCount++;
                    }
                }
            }
        }

    };

    s_oGame=this;
    
    _oParent=this;
    this._init();
}

var s_oGame;
