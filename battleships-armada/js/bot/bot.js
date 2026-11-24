var Bot = (function () {
    function Bot() {
    }
    Bot.getBotBoard = function () {
        var board = [];
        for (var row = 0; row < 11; row++) {
            board[row] = [];
        }
        // poner agua en todo el tablero
        for (var row = 0; row < 10; row++) {
            for (var col = 0; col < 10; col++) {
                board[row][col] = Bot.WATER_ADVERSARY;
            }
        }
        for (var i = 0; i < Bot.SHIPS.length; i++) {
            Bot.setShip(Bot.SHIPS[i], board);
        }
        return board;
    };
    Bot.getShotPosition = function (shipsLenghts, playerBoardAI, skill) {
        Bot.skillBot = skill - 1;
        Bot.shipLengths = shipsLenghts;
        Bot.playerBoardAI = playerBoardAI;
        var p;
        p = Bot.getProbabilitiesShotPosition();
        return { row: p.row, col: p.col, probabilities: Bot.probabilities };
    };
    // RANDOM
    Bot.getRandomShotPosition = function () {
        if (Bot.VERBOSE) {
            console.log("RAND");
        }
        var minLength = Bot.shipLengths[0];
        if (!minLength) {
            return { row: null, col: null };
        }
        var cellContent = null;
        var availableLength = 0;
        var row;
        var col;
        while (availableLength < minLength) {
            row = Math.floor(Math.random() * 10);
            col = Math.floor(Math.random() * 10);
            cellContent = Bot.playerBoardAI[row][col];
            while (cellContent !== Bot.UNKNOWN_CELL) {
                row = Math.floor(Math.random() * 10);
                col = Math.floor(Math.random() * 10);
                cellContent = Bot.playerBoardAI[row][col];
            }
            availableLength = Bot.getAvailableLength(row, col);
        }
        return { row: row, col: col };
    };
    Bot.getAvailableLength = function (row, col) {
        var length;
        var horLength = 0;
        var verLength = 0;
        // miramos horizontalmente
        for (var i = col + 1; i < 10; i++) {
            if (Bot.playerBoardAI[row][i] === Bot.UNKNOWN_CELL) {
                horLength++;
            }
            else {
                break;
            }
        }
        for (var i = col - 1; i >= 0; i--) {
            if (Bot.playerBoardAI[row][i] === Bot.UNKNOWN_CELL) {
                horLength++;
            }
            else {
                break;
            }
        }
        horLength++;
        // miramos verticalmente
        for (var i = row + 1; i < 10; i++) {
            if (Bot.playerBoardAI[i][col] === Bot.UNKNOWN_CELL) {
                verLength++;
            }
            else {
                break;
            }
        }
        for (var i = row - 1; i >= 0; i--) {
            if (Bot.playerBoardAI[i][col] === Bot.UNKNOWN_CELL) {
                verLength++;
            }
            else {
                break;
            }
        }
        verLength++;
        length = verLength >= horLength ? verLength : horLength;
        return length;
    };
    // LINEAL
    Bot.getLinealShotPosition = function () {
        var pos;
        // miramos si hay un hit utilizamos probabilidades
        for (var i = 0; i < Bot.playerBoardAI.length; i++) {
            for (var j = 0; j < Bot.playerBoardAI.length; j++) {
                if (Bot.playerBoardAI[i][j] === Bot.HIT) {
                    return Bot.getProbabilitiesShotPosition();
                }
            }
        }
        // buscamos donde nos quedamos para seguir
        for (var i = 0; i < Bot.playerBoardAI.length; i++) {
            for (var j = 0; j < Bot.playerBoardAI.length; j++) {
                if (Bot.playerBoardAI[i][j] === Bot.WATER) {
                    var row = void 0;
                    var col = void 0;
                    var str = void 0;
                    if (Bot.typeLineal === Bot.L) {
                        row = i - 1;
                        col = j;
                    }
                    else if (Bot.typeLineal === Bot.R) {
                        row = i + 1;
                        col = j;
                    }
                    else if (Bot.typeLineal === Bot.T) {
                        row = i;
                        col = j - 1;
                    }
                    else if (Bot.typeLineal === Bot.B) {
                        row = i;
                        col = j + 1;
                    }
                    else if (Bot.typeLineal === Bot.LT) {
                        row = i - 1;
                        col = j - 1;
                    }
                    else if (Bot.typeLineal === Bot.LB) {
                        row = i - 1;
                        col = j + 1;
                    }
                    else if (Bot.typeLineal === Bot.RT) {
                        row = i + 1;
                        col = j - 1;
                    }
                    else {
                        row = i + 1;
                        col = j + 1;
                    }
                    if (row >= 0 && row < 10 && col >= 0 && col < 10 && Bot.playerBoardAI[row][col] === Bot.UNKNOWN_CELL) {
                        if (Bot.VERBOSE) {
                            console.log("LINEAL " + Bot.typeLineal);
                        }
                        return { row: row, col: col };
                    }
                }
            }
        }
        return Bot.getProbabilitiesShotPosition();
    };
    // PROBABILITIES
    Bot.getProbabilitiesShotPosition = function () {
        var pos;
        Bot.canShotRandom = false;
        Bot.recalculateProbabilities();
        if (Bot.canShotRandom) {
            var rand = Math.random() * 10;
            if (rand > Bot.skillBot) {
                pos = Bot.getRandomShotPosition();
            }
            else {
                pos = Bot.getBestUnplayedPosition();
            }
        }
        else {
            pos = Bot.getBestUnplayedPosition();
        }
        return pos;
    };
    Bot.getBestUnplayedPosition = function () {
        if (Bot.VERBOSE) {
            console.log("PROB");
        }
        var bestProb = 0;
        var bestPos = [];
        // so far there is no tie-breaker -- first position
        // with highest probability on board is returned
        for (var y = 0; y < Bot.playerBoardAI.length; y++) {
            for (var x = 0; x < Bot.playerBoardAI.length; x++) {
                if (!Bot.playerBoardAI[x][y]) {
                    if (Bot.probabilities[x][y] > bestProb) {
                        bestProb = Bot.probabilities[x][y];
                        bestPos = [];
                        bestPos.push([x, y]);
                    }
                    else if (Bot.probabilities[x][y] === bestProb) {
                        bestPos.push([x, y]);
                    }
                }
            }
        }
        var pos = Math.floor(Math.random() * bestPos.length);
        return { row: bestPos[pos][0], col: bestPos[pos][1] };
    };
    Bot.recalculateProbabilities = function () {
        Bot.probabilities = [];
        var hits = [];
        // reset probabilities
        for (var y = 0; y < Bot.playerBoardAI.length; y++) {
            Bot.probabilities[y] = [];
            for (var x = 0; x < Bot.playerBoardAI.length; x++) {
                Bot.probabilities[y][x] = 0;
                // we remember hits as we find them for skewing
                if (Bot.hitsSkewProbabilities && (Bot.playerBoardAI[x][y] === Bot.HIT)) {
                    hits.push([x, y]);
                }
            }
        }
        // calculate probabilities for each type of ship
        for (var i = 0, l = Bot.shipLengths.length; i < l; i++) {
            for (var y = 0; y < Bot.playerBoardAI.length; y++) {
                for (var x = 0; x < Bot.playerBoardAI.length; x++) {
                    // horizontal check
                    if (Bot.shipCanOccupyPosition(Bot.WATER, [x, y], Bot.shipLengths[i], false)) {
                        Bot.increaseProbability([x, y], Bot.shipLengths[i], false);
                    }
                    // vertical check
                    if (Bot.shipCanOccupyPosition(Bot.WATER, [x, y], Bot.shipLengths[i], true)) {
                        Bot.increaseProbability([x, y], Bot.shipLengths[i], true);
                    }
                }
            }
        }
        // skew probabilities for positions adjacent to hits
        if (Bot.hitsSkewProbabilities) {
            Bot.skewProbabilityAroundHits(hits);
        }
        // si no hay hits miramos la probabilidad de lanzar bien o random
        if (hits.length === 0) {
            Bot.canShotRandom = true;
        }
    };
    Bot.increaseProbability = function (pos, shipSize, vertical) {
        // "pos" is ship origin
        var x = pos[0], y = pos[1], z = (vertical ? y : x), end = z + shipSize - 1;
        for (var i = z; i <= end; i++) {
            if (vertical) {
                Bot.probabilities[x][i]++;
            }
            else {
                Bot.probabilities[i][y]++;
            }
        }
    };
    Bot.skewProbabilityAroundHits = function (toSkew) {
        var uniques = [];
        // add adjacent positions to the positions to be skewed
        for (var i = 0, l = toSkew.length; i < l; i++) {
            toSkew = toSkew.concat(Bot.getAdjacentPositions(toSkew[i]));
        }
        // store uniques to avoid skewing positions multiple times
        // TODO: do A/B testing to see if doing this with strings is efficient
        for (var i = 0, l = toSkew.length; i < l; i++) {
            var uniquesStr = uniques.join("|").toString();
            if (uniquesStr.indexOf(toSkew[i].toString()) === -1) {
                uniques.push(toSkew[i]);
                // skew probability
                var x = toSkew[i][0], y = toSkew[i][1];
                Bot.probabilities[x][y] *= Bot.skewFactor;
                if (x - 2 >= 0 && Bot.playerBoardAI[x - 2][y] === Bot.HIT) {
                    Bot.probabilities[x][y] *= Bot.skewFactor;
                }
                if (x + 2 < Bot.playerBoardAI.length && Bot.playerBoardAI[x + 2][y] === Bot.HIT) {
                    Bot.probabilities[x][y] *= Bot.skewFactor;
                }
                if (y - 2 >= 0 && Bot.playerBoardAI[x][y - 2] === Bot.HIT) {
                    Bot.probabilities[x][y] *= Bot.skewFactor;
                }
                if (y + 2 < Bot.playerBoardAI.length && Bot.playerBoardAI[x][y + 2] === Bot.HIT) {
                    Bot.probabilities[x][y] *= Bot.skewFactor;
                }
            }
        }
    };
    Bot.getAdjacentPositions = function (pos) {
        var x = pos[0], y = pos[1], adj = [];
        if (y + 1 < Bot.playerBoardAI.length) {
            adj.push([x, y + 1]);
        }
        if (y - 1 >= 0) {
            adj.push([x, y - 1]);
        }
        if (x + 1 < Bot.playerBoardAI.length) {
            adj.push([x + 1, y]);
        }
        if (x - 1 >= 0) {
            adj.push([x - 1, y]);
        }
        return adj;
    };
    Bot.shipCanOccupyPosition = function (criteriaForRejection, pos, shipSize, vertical) {
        // TODO: criteriaForRejection is an awkward concept, improve
        // "pos" is ship origin
        var x = pos[0], y = pos[1], z = (vertical ? y : x), end = z + shipSize - 1;
        // board border is too close
        if (end > Bot.playerBoardAI.length - 1) {
            return false;
        }
        // check if there's an obstacle
        for (var i = z; i <= end; i++) {
            var thisPos = (vertical ? Bot.playerBoardAI[x][i] : Bot.playerBoardAI[i][y]);
            if (thisPos === criteriaForRejection) {
                return false;
            }
        }
        return true;
    };
    Bot.setShip = function (shipType, board) {
        var shipLength = Bot.getShipLength(shipType);
        // proponer una orientacion
        var horizontal = Math.random() > .5 ? true : false;
        // proponer un punto
        var row = Math.floor(Math.random() * 10);
        var col = Math.floor(Math.random() * 10);
        while (!Bot.isShipInCorrectPosition(board, row, col, horizontal, shipLength)) {
            row = Math.floor(Math.random() * 10);
            col = Math.floor(Math.random() * 10);
        }
        if (horizontal) {
            for (var i = 0; i < shipLength; i++) {
                board[row][col + i] = shipType;
            }
        }
        else {
            for (var i = 0; i < shipLength; i++) {
                board[row + i][col] = shipType;
            }
        }
    };
    Bot.getShipLength = function (shipType) {
        var shipLength;
        switch (shipType) {
            case Bot.SHIP_DESTROYER:
                shipLength = 2;
                break;
            case Bot.SHIP_CRUISER:
            case Bot.SHIP_SUBMARINE:
                shipLength = 3;
                break;
            case Bot.SHIP_BATTLESHIP:
                shipLength = 4;
                break;
            case Bot.SHIP_CARRIER:
                shipLength = 5;
                break;
            default:
                break;
        }
        return shipLength;
    };
    Bot.isShipInCorrectPosition = function (board, row, col, horizontal, shipLength) {
        var ret = true;
        if (horizontal) {
            for (var i = 0; i < shipLength; i++) {
                if (col + i > 9) {
                    ret = false;
                    break;
                }
                else {
                    if (board[row][col + i] !== Bot.WATER_ADVERSARY) {
                        ret = false;
                        break;
                    }
                }
            }
        }
        else {
            for (var i = 0; i < shipLength; i++) {
                if (row + i > 9) {
                    ret = false;
                    break;
                }
                else {
                    if (board[row + i][col] !== Bot.WATER_ADVERSARY) {
                        ret = false;
                        break;
                    }
                }
            }
        }
        return ret;
    };
    Bot.skewFactor = 5;
    Bot.hitsSkewProbabilities = true;
    Bot.UNKNOWN_CELL = 0;
    Bot.WATER = 1;
    Bot.HIT = 2;
    Bot.SUNK_SHIP = 3;
    Bot.WATER_ADVERSARY = 0;
    Bot.SHIP_DESTROYER = 2;
    Bot.SHIP_CRUISER = 3;
    Bot.SHIP_SUBMARINE = 4;
    Bot.SHIP_BATTLESHIP = 5;
    Bot.SHIP_CARRIER = 6;
    Bot.PROBABILITIES = "probabilities";
    Bot.LINEAL = "lineal";
    Bot.L = "l";
    Bot.R = "r";
    Bot.T = "t";
    Bot.B = "b";
    Bot.LT = "lt";
    Bot.LB = "lb";
    Bot.RT = "rt";
    Bot.RB = "rb";
    Bot.SHIPS = [Bot.SHIP_CARRIER, Bot.SHIP_BATTLESHIP, Bot.SHIP_SUBMARINE, Bot.SHIP_CRUISER, Bot.SHIP_DESTROYER];
    Bot.VERBOSE = false;
    return Bot;
}());
