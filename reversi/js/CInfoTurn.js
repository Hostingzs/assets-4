function CInfoTurn(iX, iY, iType, oParentContainer){
    
    var _oPanel;
    var _oBg;
    var _oBgHighlight;
    var _oTimeIcon;
    var _oTime;
    var _oPawn;
    var _oPawnNum;
    var _oParent;
  
    this._init = function(iX, iY, iType, oParentContainer){
        
        _oPanel = new createjs.Container();
        _oPanel.x = iX;
        _oPanel.y = iY;
        oParentContainer.addChild(_oPanel);
        
        var oSprite = s_oSpriteLibrary.getSprite('bg_turn');
        var oData = {   // image to use
                        images: [oSprite],
                        framerate: 58,
                        // width, height & registration point of each sprite
                        frames: {width: oSprite.width/2, height: oSprite.height, regX:(oSprite.width/2)/2,regY:oSprite.height/2}, 
                        animations: {  off: [0,0,"on"], on:[1,1,"off"]}
                        
        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);        
        _oBg = createSprite(oSpriteSheet,0,(oSprite.width/2)/2,oSprite.height/2,oSprite.width/2,oSprite.height);
        _oBg.stop();
        _oPanel.addChild(_oBg);
        
        _oBgHighlight = createSprite(oSpriteSheet,1,(oSprite.width/2)/2,oSprite.height/2,oSprite.width/2,oSprite.height);
        _oBgHighlight.stop();
        _oBgHighlight.x = 10;
        _oBgHighlight.alpha = 0;
        _oPanel.addChild(_oBgHighlight);

        var oSprite = s_oSpriteLibrary.getSprite('pawn');
        var oData = {   // image to use
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: oSprite.width/2, height: oSprite.height, regX:(oSprite.width/2)/2,regY:oSprite.height/2}, 
                        animations: {  off: [0],on:[1]}

        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);        
        _oPawn = createSprite(oSpriteSheet,iType,(oSprite.width/2)/2,oSprite.height/2,oSprite.width/2,oSprite.height);
        _oPawn.stop();

        if(iType === PAWN_WHITE){
            _oPawn.x = 110;
            _oPawn.y = -10;
        } else {
            _oPawn.x = -220;
            _oPawn.y = -10;
        }
        _oPanel.addChild(_oPawn);
        
        _oPawnNum = new createjs.Text("x2","68px "+PRIMARY_FONT, "#ffffff");
        if(iType === PAWN_WHITE){
            _oPawnNum.x = 160;
        } else {
            _oPawnNum.x = -160;
        }       
        _oPawnNum.y = -5;
        _oPawnNum.textAlign = "left";
        _oPawnNum.textBaseline = "middle";
        _oPawnNum.lineWidth = 200;
        _oPanel.addChild(_oPawnNum);
        

        var oSprite = s_oSpriteLibrary.getSprite('time_icon');
        _oTimeIcon = createBitmap(oSprite);
        _oTimeIcon.regX = oSprite.width/2;
        _oTimeIcon.regY = oSprite.height/2;
        _oTimeIcon.scaleX = 0.8;
        _oTimeIcon.scaleY = 0.8;
        if(iType === PAWN_WHITE){
            _oTimeIcon.x = -230;
            _oTimeIcon.y = -5;
        } else {
            _oTimeIcon.x = 225;
            _oTimeIcon.y = -5;
        }
        
        _oPanel.addChild(_oTimeIcon);

        _oTime =  new createjs.Text("00:00","58px "+PRIMARY_FONT, "#ffffff");
        if(iType === PAWN_WHITE){
            _oTime.x = -180;
            _oTime.textAlign = "left";
        } else {
            _oTime.x = 175;
            _oTime.textAlign = "right";
        }        
        _oTime.textBaseline = "middle";
        _oTime.lineWidth = 200;
        _oPanel.addChild(_oTime);
        
    };
    
    this.refreshPawnNumber = function(szNum){
        _oPawnNum.text = "x"+szNum;
    };
    
    this.refreshTime = function(szTime){
        _oTime.text = szTime;
    };
    
    this.active = function(bVal){
        if(bVal){
            //_oBg.play();
            createjs.Tween.get(_oBg).to({alpha:0}, 750, createjs.Ease.cubicOut).to({alpha:1}, 750, createjs.Ease.cubicIn).call(function(){_oParent.active(bVal);});
            createjs.Tween.get(_oBgHighlight).to({alpha:1}, 750, createjs.Ease.cubicOut).to({alpha:0}, 750, createjs.Ease.cubicIn);//.call(function(){});
        } else {
            _oBg.alpha = 1;
            _oBgHighlight.alpha = 0;
            createjs.Tween.removeAllTweens();
        }        
    };
   
    
    this.unload = function(){
        oParentContainer.removeChild(_oPanel);
    };
    
    this.setBgVisible = function(bVal){
        _oBg.visible = bVal;
    };
    
    this.setPanelVisible = function(bVal){
        _oPanel.visible = bVal;
    };
    
    this.setPawn = function(iType){
        _oPawn.gotoAndStop(iType);
    };
    
    this.setPosition = function(iX, iY){
        _oPanel.x = iX;
        _oPanel.y = iY;
    };
    
    _oParent = this;
    this._init(iX, iY, iType, oParentContainer);
    
};


