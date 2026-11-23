var CANVAS_WIDTH = 1920;
var CANVAS_HEIGHT = 1080;

var EDGEBOARD_X = 200;
var EDGEBOARD_Y = 70;

var FONT = "jackinputregular";

var FPS      = 30;
var DISABLE_SOUND_MOBILE = false;

var SOUNDTRACK_VOLUME_IN_GAME = 0.5;

var STATE_LOADING = 0;
var STATE_MENU    = 1;
var STATE_HELP    = 1;
var STATE_GAME    = 3;

var NUM_ROWS = 3;
var NUM_COLS = 3;
var COW_NUM = 8;
var LEVEL_MAX;
var BIGGER_HEIGHT = 367;
var START_X_GRID = 950;
var START_Y_GRID = 425;

var TIME_BAR_WIDTH = 338;
var TIME_BAR_HEIGHT = 22;
var TIME_X = 225;
var TIME_Y = 460;
var HOLE_WIDTH = 297;
var HOLE_HEIGHT = 253;
var HAMMER_WIDTH = 202;
var HAMMER_HEIGHT = 272;
var TIME_LEVEL;
var SCORE_GOAL;

var COW_WIDTH = new Array();
    COW_WIDTH[0] = 212;
    COW_WIDTH[1] = 194;
    COW_WIDTH[2] = 335;
    COW_WIDTH[3] = 222;
    COW_WIDTH[4] = 275;
    COW_WIDTH[5] = 298;
    COW_WIDTH[6] = 212;
    COW_WIDTH[7] = 213;
    
var COW_HEIGHT = new Array();
    COW_HEIGHT[0] = 283;    
    COW_HEIGHT[1] = 320;
    COW_HEIGHT[2] = 316;
    COW_HEIGHT[3] = 367;
    COW_HEIGHT[4] = 303;
    COW_HEIGHT[5] = 287;
    COW_HEIGHT[6] = 317;
    COW_HEIGHT[7] = 332;

var ON_MOUSE_DOWN  = 0;
var ON_MOUSE_UP    = 1;
var ON_MOUSE_OVER  = 2;
var ON_MOUSE_OUT   = 3;
var ON_DRAG_START  = 4;
var ON_DRAG_END    = 5;

var ENABLE_FULLSCREEN;
var ENABLE_CHECK_ORIENTATION;