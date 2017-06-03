var Raises = {

    field: null,

    tmpField: null,

    Queue: [],

    LENGTH_OF_FIELD: null,
    WIDTH_OF_FIELD: null,
    PASSABLE_SPACE: 0,
    IMPASSABLE_SPACE: 1,
    IMPASABLE_CHECKED_SPACE: -1,
    CHECKED_SPACE: 3,
    PLAYER_SPACE: 2,
    PLAYER_START_LIVES: 5,
    TIMER_ID: 0,

    person: {
        name: null,
        coins: 0,
        lives: 0
    },

    initPerson: function() {
        Raises.person.name = prompt("Hello! Enter your name, please", "");
        Raises.person.lives = Raises.PLAYER_START_LIVES;
    },

    showInfo: function() {
        var container = document.getElementById('info');
        var str = '<h1>' + Raises.person.name + '</h1><p>Your score:' + Raises.person.coins + '</p><p>Your lives:' + Raises.person.lives + '</p>';
        container.innerHTML = str;
    },

    onModal: function(e) {
        if ((this == e.target) || (e.target.value == "close")) {
            var modal = document.getElementById('modal');
            modal.classList.toggle('open');
        }
    },

    showUserDead: function() {
        var modal = document.getElementById('modal');
        modal.classList.add('open');
        modal.addEventListener('click', Raises.onModal);
        var info = document.getElementById('userInfo');
        var str = '<h1>Ooops! ' + Raises.person.name + ', you died! </h1><p>Your score:' + Raises.person.coins + '</p>';
        info.innerHTML = str;
    },

    play: function() {
        Raises.person.coins += 5;
        Raises.generateField();
        Raises.showInfo();
        if (Raises.person.lives == 0) {
            Raises.showUserDead();
            return;
        }
        setTimeout(Raises.play, 500);
    },

    initApp: function() {
        Raises.field = Raises.createStartArray();
        Raises.tmpField = Raises.createTmpArray(Raises.field);
        Raises.drawField(Raises.field);
        document.body.addEventListener("keydown", Raises.playerMove);
        Raises.LENGTH_OF_FIELD = Raises.field.length;
        Raises.WIDTH_OF_FIELD = Raises.field[0].length;
        Raises.initPerson();
        Raises.play();
    },

    createStartArray: function() {
        var arr = [
            [1, 0, 0],
            [1, 0, 0],
            [1, 0, 0],
            [1, 0, 1],
            [0, 0, 1],
            [0, 2, 0]
        ];
        return arr;
    },

    createTmpArray: function(arr) {

        var tmpField = new Array(Raises.LENGTH_OF_FIELD);

        for (var i = 0; i < Raises.LENGTH_OF_FIELD; i++) {
            tmpField[i] = new Array(Raises.WIDTH_OF_FIELD);
        }

        for (var i = 0; i < Raises.LENGTH_OF_FIELD; i++) {
            for (var j = 0; j < Raises.WIDTH_OF_FIELD; j++) {
                if (arr[i][j] == Raises.IMPASSABLE_SPACE) tmpField[i][j] = Raises.IMPASABLE_CHECKED_SPACE;
                if (arr[i][j] == Raises.PASSABLE_SPACE) tmpField[i][j] = Raises.PASSABLE_SPACE;
                if (arr[i][j] == Raises.PLAYER_SPACE) tmpField[i][j] = Raises.PLAYER_SPACE;
            }
        }
        return tmpField;
    },

    findPlayer: function(arr) {

        for (var i = 0; i <= Raises.LENGTH_OF_FIELD; i++) {
            for (var j = 0; j < Raises.WIDTH_OF_FIELD; j++) {
                if (arr[i][j] == Raises.PLAYER_SPACE) return {
                    x: i,
                    y: j
                }
            }
        }

        return "player not found";
    },

    BFS: function(from, to) {

        var neighbours = [];

        if (Raises.tmpField[from.x][from.y + 1] == Raises.PASSABLE_SPACE) {
            neighbours.push({
                x: from.x,
                y: from.y + 1
            });
            Raises.tmpField[from.x][from.y + 1] = Raises.CHECKED_SPACE;
        }
        if (Raises.tmpField[from.x][from.y - 1] == Raises.PASSABLE_SPACE) {
            neighbours.push({
                x: from.x,
                y: from.y - 1
            });
            Raises.tmpField[from.x][from.y - 1] = Raises.CHECKED_SPACE;
        }
        if (from.x != 0) {
            if (Raises.tmpField[from.x - 1][from.y] == Raises.PASSABLE_SPACE) {
                neighbours.push({
                    x: from.x - 1,
                    y: from.y
                });
                Raises.tmpField[from.x - 1][from.y] = Raises.CHECKED_SPACE;
            }
        }
        if (from.x != Raises.LENGTH_OF_FIELD) {
            if (Raises.tmpField[from.x + 1][from.y] == Raises.PASSABLE_SPACE) {
                neighbours.push({
                    x: from.x + 1,
                    y: from.y
                });
                Raises.tmpField[from.x + 1][from.y] = Raises.CHECKED_SPACE;
            }
        }
        for (var i in neighbours) {
            Raises.Queue.push(neighbours[i]);
            if (neighbours[i].x == to.x && neighbours[i].y == to.y) return true;
        }

        if (Raises.Queue.length == 0) {
            return false;
        };
        return Raises.BFS(Raises.Queue.shift(), to);
    },

    generateTmpLine: function() {
        var tmp = [];

        for (var i = 0; i < Raises.WIDTH_OF_FIELD; i++) {
            tmp.push(Math.floor(Math.random() * 2) - 1);
        }

        return tmp;
    },

    convertTmpLine: function(tmpLine) {
        for (var i = 0; i < Raises.WIDTH_OF_FIELD; i++) {
            if (tmpLine[i] == -1) tmpLine[i] = 1;
            else tmpLine[i] = 0;
        }
        return tmpLine;
    },

    checkTmpField: function(tmpField) {
        for (var i = 0; i < Raises.LENGTH_OF_FIELD; i++) {
            for (var j = 0; j < Raises.WIDTH_OF_FIELD; j++) {
                if (tmpField[i][j] == Raises.CHECKED_SPACE) tmpField[i][j] = 0;
            }
        }
        return tmpField;
    },

    validateNewField: function(tmpLine) {
        Raises.tmpField = Raises.createTmpArray(Raises.field);
        Raises.tmpField.unshift(tmpLine);
        var from = Raises.findPlayer(Raises.tmpField);
        var flag = false;
        for (var i = 0; i < Raises.WIDTH_OF_FIELD; i++) {
            Raises.tmpField = Raises.checkTmpField(Raises.tmpField);
            if (Raises.BFS(from, {
                    x: 0,
                    y: i
                })) {
                Raises.Queue = [];
                return true;
            }
        }
        Raises.tmpField.shift();
        Raises.Queue = [];
        return false;
    },

    drawField: function(arr) {
        var td = document.getElementsByTagName('td');
        [].forEach.call(td, function(elem) {
            elem.classList.add('way');
        })
        for (var i = 0; i < arr.length; i++) {
            var table = document.getElementById('table').children[i];
            for (var j = 0; j < Raises.WIDTH_OF_FIELD; j++) {
                if (arr[i][j] == Raises.PASSABLE_SPACE) {
                    table.children[j].innerHTML = "";
                }
                if (arr[i][j] == Raises.IMPASSABLE_SPACE) {
                    var str = '<i class="fa fa-bug fa-5x" aria-hidden="true"></i>';
                    table.children[j].innerHTML = str;
                }
                if (arr[i][j] == Raises.PLAYER_SPACE) {
                    var str = '<i class="fa fa-car fa-4x">';
                    table.children[j].innerHTML = str;
                }
            }
        }
    },

    checkLive: function(lastLine) {
        var player = Raises.findPlayer(Raises.field);
        if (lastLine[player.y] == Raises.IMPASSABLE_SPACE) {
            console.log("oops!");
            Raises.person.lives -= 1;
            if (Raises.person.lives == 0) {
                console.log("DEAD " + Raises.TIMER_ID);
                clearTimeout(Raises.TIMER_ID);
            }
        }
    },

    generateField: function() {
        var flag = true;
        var tmpLine;

        while (flag) {
            tmpLine = Raises.generateTmpLine();
            if (Raises.validateNewField(tmpLine)) {
                tmpLine = Raises.convertTmpLine(tmpLine);
                flag = false;
            }
        }
        Raises.field.unshift(tmpLine);
        var lastLine = Raises.field[Raises.LENGTH_OF_FIELD - 1];
        Raises.checkLive(lastLine);
        Raises.field[Raises.LENGTH_OF_FIELD - 1] = Raises.field[Raises.LENGTH_OF_FIELD];
        Raises.field.length = Raises.LENGTH_OF_FIELD;

        Raises.drawField(Raises.field);
    },

    playerMove: function(e) {

        var player = Raises.findPlayer(Raises.field);

        if ((e.keyCode == 39 || e.keyCode == 68) && player.y != 2) {
            Raises.field[player.x][player.y] = 0;
            Raises.field[player.x][++player.y] = 2;

        }
        if ((e.keyCode == 37 || e.keyCode == 65) &&
            player.y != 0) {
            Raises.field[player.x][player.y] = 0;
            Raises.field[player.x][--player.y] = 2;
        }
        Raises.drawField(Raises.field);
    }
}

Raises.initApp();
