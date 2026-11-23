function CLevelSettings(iLevel){
    var _aLevelScore;
    var _aLevelCows = new Array();
    
    this._init = function(iLevel){
        _aLevelCows[0]=new Array(0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2);
        _aLevelCows[1]=new Array(0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6,7);
        _aLevelCows[2]=new Array(0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3 ,6, 6, 6, 6, 6, 7);
        _aLevelCows[3]=new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 6, 7);
        _aLevelCows[4]=new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 6, 6, 6, 6, 6, 7);
        _aLevelCows[5]=new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7);
        _aLevelCows[6]=new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7);
        
        _aLevelScore = new Array();
        for(var i=0;i<SCORE_GOAL.length;i++){
            _aLevelScore[i] = SCORE_GOAL[i];
        }
        LEVEL_MAX = _aLevelCows.length;
    };
    
    
    this.getLevel = function(iLevel, i){
        return(_aLevelCows[iLevel][i]);
    };
    
    this.getElementsNum = function(iLevel){
        return(_aLevelCows[iLevel].length);
    };
    
     this.getLevelMax = function(){
        return(_aLevelCows.lenght-1);
    };
    
    this.getGoalInLevel = function(iLevel){
        var oValue; 
        oValue = _aLevelScore[iLevel];
        return oValue;
    };
    
    this.unload = function(){
        for(var i=0; i<7; i++){
            _aLevelCows.pop();
            _aLevelScore.pop();
        }
    };
    
    this._init(iLevel);
}

var s_oLevelSettings;