function CGfxButton(iXPos,iYPos,oSprite,oParentContainer){
    var _iScaleFactor;
    
    var _aCbCompleted;
    var _aCbOwner;
    var _oButton;
    var _oTween;
    var _oListenerMouseDown;
    var _oListenerMouseUp;
    
    this._init =function(iXPos,iYPos,oSprite,oParentContainer){
        _iScaleFactor = 1;
        
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _oButton = createBitmap( oSprite);
        _oButton.x = iXPos;
        _oButton.y = iYPos; 
                                   
        _oButton.regX = oSprite.width/2;
        _oButton.regY = oSprite.height/2;
        if (!s_bMobile){
            _oButton.cursor = "pointer";
		}
        oParentContainer.addChild(_oButton);
        
        
        this._initListener();
    };
    
    this.unload = function(){
        _oButton.off("mousedown", _oListenerMouseDown);
        _oButton.off("pressup", _oListenerMouseUp);
       
        oParentContainer.removeChild(_oButton);
    };
    
    this.setVisible = function(bVisible){
        _oButton.visible = bVisible;
    };
    
    this._initListener = function(){
        _oListenerMouseDown = _oButton.on("mousedown", this.buttonDown);
        _oListenerMouseUp = _oButton.on("pressup", this.buttonRelease);   
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.buttonRelease = function(){
        playSound("click", 1, 0);
        
        _oButton.scaleX = 1;
        _oButton.scaleY = 1;

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP]);
        }
    };
    
    this.buttonDown = function(){
        if(!_oTween){
            _oButton.scaleX = 0.9;
            _oButton.scaleY = 0.9;
        }
       if(_aCbCompleted[ON_MOUSE_DOWN]){
           _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN]);
       }
    };
    
    this.setPosition = function(iXPos,iYPos){
         _oButton.x = iXPos;
         _oButton.y = iYPos;
    };
    
    this.setX = function(iXPos){
         _oButton.x = iXPos;
    };
    
    this.setY = function(iYPos){
         _oButton.y = iYPos;
    };
    
    this.getButtonImage = function(){
        return _oButton;
    };
    
    
    this.getX = function(){
        return _oButton.x;
    };
    
    this.getY = function(){
        return _oButton.y;
    };

    this.pulseAnimation = function () {
        var oParent = this;
        _oTween = createjs.Tween.get(_oButton).to({scaleX: _iScaleFactor*0.9, scaleY: _iScaleFactor*0.9}, 850, createjs.Ease.quadOut).to({scaleX: _iScaleFactor, scaleY: _iScaleFactor}, 650, createjs.Ease.quadIn).call(function () {
            oParent.pulseAnimation();
        });
    };
    
    this._init(iXPos,iYPos,oSprite,oParentContainer);
    
    return this;
}