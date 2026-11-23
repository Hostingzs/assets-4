function CMain(oData){
    var _bUpdate;
    var _bBonus;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;
    
    var _oPreloader;
    var _oMenu;
    var _oHelp;
    var _oGame;

    this.initContainer = function(){
        s_oCanvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(s_oCanvas);
        createjs.Touch.enable(s_oStage, true);
		
	s_bMobile = isMobile();
        if(s_bMobile === false){
            s_oStage.enableMouseOver(20);  
            $('body').on('contextmenu', '#canvas', function(e){ return false; });
        }
		
        s_iPrevTime = new Date().getTime();

	createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.framerate = FPS;
        
        if(navigator.userAgent.match(/Windows Phone/i)){
                DISABLE_SOUND_MOBILE = true;
        }
        
        s_oSpriteLibrary  = new CSpriteLibrary();

        PokiSDK.init().then(
            () => {
                // successfully initialized
                // console.log("PokiSDK initialized");
                // continue to game
                
                //ADD PRELOADER
                _oPreloader = new CPreloader();
            }   
        ).catch(
            () => {
                // initialized but the user has an adblock
                // console.log("Adblock enabled");
                // feel free to kindly ask the user to disable AdBlock, like forcing weird usernames or showing a sad face; be creative!
                // continue to the game
        
                //ADD PRELOADER
                _oPreloader = new CPreloader();
            }   
        );
        //PokiSDK.setDebug(true);
    };
    
    this.preloaderReady = function(){
        PokiSDK.gameLoadingStart();
        
        this._loadImages();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            this._initSounds();
        }
        
        
        _bUpdate = true;
    };
    
    this.soundLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        _oPreloader.refreshLoader(iPerc);

        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});
    };
    
    this._initSounds = function(){
        Howler.mute(!s_bAudioActive);
        
        s_aSoundsInfo = new Array();
        s_aSoundsInfo.push({path: './sounds/',filename:'hammer',loop:false,volume:1, ingamename: 'hammer'});
        s_aSoundsInfo.push({path: './sounds/',filename:'click',loop:false,volume:1, ingamename: 'click'});
        s_aSoundsInfo.push({path: './sounds/',filename:'hit_cow_1',loop:false,volume:1, ingamename: 'hit_cow_1'});
        s_aSoundsInfo.push({path: './sounds/',filename:'game_over',loop:false,volume:1, ingamename: 'game_over'});
        s_aSoundsInfo.push({path: './sounds/',filename:'hit_cow_2',loop:false,volume:1, ingamename: 'hit_cow_2'});
        s_aSoundsInfo.push({path: './sounds/',filename:'hit_dog',loop:false,volume:1, ingamename: 'hit_dog'});
        s_aSoundsInfo.push({path: './sounds/',filename:'hit_horse',loop:false,volume:1, ingamename: 'hit_horse'});
        s_aSoundsInfo.push({path: './sounds/',filename:'explosion',loop:false,volume:1, ingamename: 'explosion'});
        s_aSoundsInfo.push({path: './sounds/',filename:'present',loop:false,volume:1, ingamename: 'present'});
        s_aSoundsInfo.push({path: './sounds/',filename:'bite',loop:false,volume:1, ingamename: 'bite'});
        s_aSoundsInfo.push({path: './sounds/',filename:'win',loop:false,volume:1, ingamename: 'win'});
        s_aSoundsInfo.push({path: './sounds/',filename:'goal',loop:false,volume:1, ingamename: 'goal'});
        s_aSoundsInfo.push({path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'});
        
        RESOURCE_TO_LOAD += s_aSoundsInfo.length;

        s_aSounds = new Array();
        for(var i=0; i<s_aSoundsInfo.length; i++){
            this.tryToLoadSound(s_aSoundsInfo[i], false);
        }
    };  
    
    this.tryToLoadSound = function(oSoundInfo, bDelay){
        setTimeout(function(){        
            s_aSounds[oSoundInfo.ingamename] = new Howl({ 
                                                            src: [oSoundInfo.path+oSoundInfo.filename+'.mp3'],
                                                            autoplay: false,
                                                            preload: true,
                                                            loop: oSoundInfo.loop, 
                                                            volume: oSoundInfo.volume,
                                                            onload: s_oMain.soundLoaded,
                                                            onloaderror: function(szId,szMsg){
                                                                                for(var i=0; i < s_aSoundsInfo.length; i++){
                                                                                     if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                                                         s_oMain.tryToLoadSound(s_aSoundsInfo[i], true);
                                                                                         break;
                                                                                     }
                                                                                }
                                                                        },
                                                            onplayerror: function(szId) {
                                                                for(var i=0; i < s_aSoundsInfo.length; i++){
                                                                                     if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                                                          s_aSounds[s_aSoundsInfo[i].ingamename].once('unlock', function() {
                                                                                            s_aSounds[s_aSoundsInfo[i].ingamename].play();
                                                                                            if(s_aSoundsInfo[i].ingamename === "soundtrack" && s_oGame !== null){
                                                                                                setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME);
                                                                                            }

                                                                                          });
                                                                                         break;
                                                                                     }
                                                                                 }
                                                                       
                                                            } 
                                                        });

            
        }, (bDelay ? 200 : 0) );
    };
    
    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );

        s_oSpriteLibrary.addSprite("but_play","./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("msg_box","./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("bg_menu","./sprites/bg_menu.jpg");
        s_oSpriteLibrary.addSprite("bg_help","./sprites/bg_help.jpg");
        s_oSpriteLibrary.addSprite("bg_game","./sprites/bg_game.jpg");
        s_oSpriteLibrary.addSprite("but_exit","./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("audio_icon","./sprites/audio_icon.png");    
        s_oSpriteLibrary.addSprite("bg_timebar","./sprites/bg_timebar.png");  
        s_oSpriteLibrary.addSprite("fill_timebar","./sprites/fill_timebar.png");  
        s_oSpriteLibrary.addSprite("target","./sprites/target.png");
        s_oSpriteLibrary.addSprite("hammer_icon","./sprites/hammer_icon.png");
        s_oSpriteLibrary.addSprite("hole_sprites","./sprites/hole_sprites.png");
        s_oSpriteLibrary.addSprite("hammer_sprites","./sprites/hammer_sprites.png");
        s_oSpriteLibrary.addSprite("but_credits","./sprites/but_credits.png");
        s_oSpriteLibrary.addSprite("but_fullscreen","./sprites/but_fullscreen.png");
        s_oSpriteLibrary.addSprite("ctl_logo","./sprites/ctl_logo.png");

        for(var i=0;i<8;i++){
                s_oSpriteLibrary.addSprite("cow"+i,"./sprites/cow"+i+".png");
        }
        
        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };
    
    this._onImagesLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        //console.log("PERC: "+iPerc);
        
        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});
        
        _oPreloader.refreshLoader(iPerc);
    };
    
    this._onRemovePreloader = function(){
        PokiSDK.gameLoadingFinished();
        
        _oPreloader.unload();

        s_oSoundTrack = playSound("soundtrack",1,true);

        s_oMain.gotoMenu();

    };
    
    this.pokiShowCommercial = function(oCb){
        s_oMain.stopUpdate();
        PokiSDK.commercialBreak().then(
            () => {
                //console.log("Commercial Break finished");
                s_oMain.startUpdate();
                if(oCb){
                    oCb();
                }
            }
        );
    };
    
    this._onAllImagesLoaded = function(){
        
    };

    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    }; 
    
    this.gotoGame = function(){
        _oGame = new CGame(_oData);   						
        _iState = STATE_GAME;
    };
    
    this.gotoHelp = function(){
        _oHelp = new CHelp();
        _iState = STATE_HELP;
    };
	
    this.stopUpdate = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
        $("#block_game").css("display","block");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            Howler.mute(true);
        }
        
    };

    this.startUpdate = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false;
        $("#block_game").css("display","none");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            if(s_bAudioActive){
                Howler.mute(false);
            }
        }
        
    };
    
    this._update = function(event){
        if(_bUpdate === false){
                return;
        }
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;

        if ( s_iCntTime >= 1000 ){
            s_iCurFps = s_iCntFps;
            s_iCntTime-=1000;
            s_iCntFps = 0;
        }

        if(_iState === STATE_GAME){
            _oGame.update();
        }

        s_oStage.update(event);
       
    };
    
    s_oMain = this;
    
    _oData = oData;
    ENABLE_FULLSCREEN = oData.fullscreen;
    ENABLE_CHECK_ORIENTATION = oData.check_orientation;
    
    s_bAudioActive = oData.audio_enable_on_startup;
    
    this.initContainer();
}
var s_bMobile;
var s_bAudioActive = false;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;
var s_szImage;
var s_iDeleted = 0;
var s_iLevel = 0;
var s_bHammerUsable = true;
var s_bGoalReached = false;

var s_oDrawLayer;
var s_oStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oSoundTrack = null;
var s_oCanvas;
var s_oLevelSettings;
var s_bFullscreen = false;
var s_aSounds;
var s_aSoundsInfo;
var s_bPokiFirstTimePlay = true;