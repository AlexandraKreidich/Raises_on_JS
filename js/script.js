var Raises = {

    field: null,

    tmpField: null,

    Queue: [],

    PAUSE: false,
    TIMER_ID: 0,
    LENGTH_OF_FIELD: null,
    WIDTH_OF_FIELD: null,
    PASSABLE_SPACE: [0, 2, 3, 4], // пустое поле-0, остальное бонусы
    IMPASSABLE_SPACE: 1, // непроходимое поле
    // значение, которое в ходе проверки присваивается полю со значением 0, бонусам присвоится обратное значение
    CHECKED_SPACE: 5,
    PLAYER_SPACE: 6, // положение игрока отмечается этой цифрой
    BONUS_LIVE: 2, // значение клетки, которому соответствует бонус жизнь
    BONUS_COINS: 3, // значение клетки, которому соответствует бонус монеты
    BONUS_TIME: 4, // значение клетки, которому соответсвтует бонус замедления времени
    PLAYER_START_LIVES: 3, // изначальное количество жизней игрока
    START_INTERVAL_TIME: 550, // начальный интервал
    INTERVAL_INCREASE_TIME: 5, // значение, на которое уменьшается интервал отрисовки поля
    MIN_INTERVAL: 250, // минимальный интервал, до которого может уменьшаться начальный

    showRate: function() {
        if (localStorage.getItem('players') == null)
            localStorage.setItem('players', "[]");
        var players = JSON.parse(localStorage.getItem('players'));
        players.push(Raises.playerArea.player);
        players.sort(function(a, b) {
            return b.coins - a.coins;
        });
        localStorage.setItem('players', JSON.stringify(players));
        console.log(players);
        return players;
    },

    startApp: {

        play: function() {
            if (Raises.START_INTERVAL_TIME > Raises.MIN_INTERVAL)
                Raises.START_INTERVAL_TIME -= Raises.INTERVAL_INCREASE_TIME;
            Raises.playerArea.player.coins += 5;
            Raises.playArea.generateField();
            Raises.playerArea.showInfo();
            if (Raises.playerArea.player.lives <= 0) {
                Raises.playerArea.showUserDead();
                return;
            }
            Raises.TIMER_ID = setTimeout(Raises.startApp.play, Raises.START_INTERVAL_TIME);
        },

        initApp: function() {
            //localStorage.clear();
            Raises.field = Raises.playArea.createStartArray();
            Raises.tmpField = Raises.playArea.createTmpArray(Raises.field);
            Raises.playArea.drawField(Raises.field);
            document.body.addEventListener("keydown", Raises.playerArea.playerMove);
            Raises.LENGTH_OF_FIELD = Raises.field.length;
            Raises.WIDTH_OF_FIELD = Raises.field[0].length;
            Raises.playerArea.initPerson();
            Raises.startApp.play();
        }
    },

    playerArea: {

        player: {
            name: "player",
            coins: 0,
            lives: 0
        },

        findPlayer: function(arr) {
            var i = arr.length - 1;
            for (var j = 0; j < Raises.WIDTH_OF_FIELD; j++) {
                if (arr[i][j] == Raises.PLAYER_SPACE) return {
                    x: i,
                    y: j
                }
            }
            return "player not found"; //обработка ошибок нужна!
        },

        initPerson: function() {
            Raises.playerArea.player.name = prompt("Hello! Enter your name, please", "");
            Raises.playerArea.player.lives = Raises.PLAYER_START_LIVES;
        },

        showInfo: function() {
            var container = document.getElementById('info');
            var str = '<h1>' + Raises.playerArea.player.name + '</h1><p>Your score: ' + Raises.playerArea.player.coins + '</p><p>Your lives: ' + Raises.playerArea.player.lives + '</p>';
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
            modal.addEventListener('click', Raises.playerArea.onModal);
            var info = document.getElementById('userInfo');
            var str = '<h1>Ooops! ' + Raises.playerArea.player.name + ', you died! </h1><p>Your score: ' + Raises.playerArea.player.coins + '</p>';
            info.innerHTML = str;
            var players = Raises.showRate();
            var str = '<ul class="list-group">';
            for (var elem of players) {
                str += '<li class="list-group-item">' + elem.name + '<span class="badge">' + elem.coins + '</span></li>';
            };
            str += '</ul>';
            var div = document.getElementById('rate');
            div.innerHTML = str;
        },

        playerMove: function(e) {

            var player = Raises.playerArea.findPlayer(Raises.field);

            if ((e.keyCode == 39 || e.keyCode == 68) && player.y != 2) {
                Raises.field[player.x][player.y] = 0;
                Raises.field[player.x][++player.y] = Raises.PLAYER_SPACE;

            }
            if ((e.keyCode == 37 || e.keyCode == 65) &&
                player.y != 0) {
                Raises.field[player.x][player.y] = 0;
                Raises.field[player.x][--player.y] = Raises.PLAYER_SPACE;
            }

            /*if (e.keyCode == 27 && !Raises.PAUSE) {
                Raises.PAUSE = true;
                clearTimeout(Raises.TIMER_ID);
            } else {
                Raises.PAUSE = false;
                Raises.startApp.play();
            }*/
            Raises.playArea.drawField(Raises.field);
        },

        checkLive: function(lastLine) {
            var player = Raises.playerArea.findPlayer(Raises.field);
            switch (lastLine[player.y]) {
                case Raises.IMPASSABLE_SPACE:
                    Raises.playerArea.player.lives = (Raises.playerArea.player.lives -3 > 0) ? Raises.playerArea.player.lives - 3 : 0;
                    break;
                case Raises.BONUS_LIVE:
                    Raises.playerArea.player.lives += 1;
                    console.log("+1 live!");
                    break;
                case Raises.BONUS_TIME:
                    Raises.START_INTERVAL_TIME += 5;
                    console.log("time bonus!");
                    break;
                case Raises.BONUS_COINS:
                    Raises.playerArea.player.coins += 10;
                    console.log("+10 coins!");
                    break;
                default:
            }
        }
    },

    playArea: {

        BFS: function(from, to) {

            var neighbours = [];

            if (Raises.PASSABLE_SPACE.includes(Raises.tmpField[from.x][from.y + 1])) {
                neighbours.push({
                    x: from.x,
                    y: from.y + 1
                });
                if (Raises.tmpField[from.x][from.y + 1] == 0)
                    Raises.tmpField[from.x][from.y + 1] = Raises.CHECKED_SPACE;
                else
                    Raises.tmpField[from.x][from.y + 1] = -Raises.tmpField[from.x][from.y + 1];

            }
            if (Raises.PASSABLE_SPACE.includes(Raises.tmpField[from.x][from.y - 1])) {
                neighbours.push({
                    x: from.x,
                    y: from.y - 1
                });
                if (Raises.tmpField[from.x][from.y - 1] == 0)
                    Raises.tmpField[from.x][from.y - 1] = Raises.CHECKED_SPACE;
                else
                    Raises.tmpField[from.x][from.y - 1] = -Raises.tmpField[from.x][from.y - 1];
            }
            if (from.x != 0) {
                if (Raises.PASSABLE_SPACE.includes(Raises.tmpField[from.x - 1][from.y])) {
                    neighbours.push({
                        x: from.x - 1,
                        y: from.y
                    });
                    if (Raises.tmpField[from.x - 1][from.y] == 0)
                        Raises.tmpField[from.x - 1][from.y] = Raises.CHECKED_SPACE;
                    else
                        Raises.tmpField[from.x - 1][from.y] = -Raises.tmpField[from.x - 1][from.y];
                }
            }
            if (from.x != Raises.LENGTH_OF_FIELD) {
                if (Raises.PASSABLE_SPACE.includes(Raises.tmpField[from.x + 1][from.y])) {
                    neighbours.push({
                        x: from.x + 1,
                        y: from.y
                    });
                    if (Raises.tmpField[from.x + 1][from.y] == 0)
                        Raises.tmpField[from.x + 1][from.y] = Raises.CHECKED_SPACE;
                    else
                        Raises.tmpField[from.x + 1][from.y] = -Raises.tmpField[from.x + 1][from.y];
                }
            }
            for (var i in neighbours) {
                Raises.Queue.push(neighbours[i]);
                if (neighbours[i].x == to.x && neighbours[i].y == to.y) return true;
            }

            if (Raises.Queue.length == 0) {
                return false;
            };
            //console.log("in BFS tmpField: " + Raises.tmpField);
            return Raises.playArea.BFS(Raises.Queue.shift(), to);
        },

        createStartArray: function() {
            var arr = [
                [1, 0, 0],
                [1, 0, 0],
                [1, 0, 0],
                [1, 0, 1],
                [0, 0, 1],
                [0, 6, 0]
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
                    tmpField[i][j] = arr[i][j];
                }
            }

            return tmpField;
        },


        generateTmpLine: function() {

            var tmp = new Array(Raises.WIDTH_OF_FIELD);
            var flag = true;

            for (var i = 0; i < Raises.WIDTH_OF_FIELD; i++) {
                if (!flag) {
                    number = Math.floor(Math.random() * 2);
                    tmp[i] = number;
                } else {
                    var number = Math.floor(Math.random() * 5); // числа от 0 до 4
                    tmp[i] = number;
                    if (number > 1)
                        flag = false;
                }
            }

            //console.log("сгенерировали строку: " + tmp);
            return tmp;
        },

        /* мы присваиваем при проверке 0 -> 5
                                       1 -> 1
                                       2 -> -2
                                       3 -> -3
                                       4 -> -4
        */
        convertTmpLine: function(tmpLine) {

            for (var i = 0; i < Raises.WIDTH_OF_FIELD; i++) {
                if (tmpLine[i] == Raises.CHECKED_SPACE)
                    tmpLine[i] = 0;
                else {
                    if (tmpLine[i] == 1 || tmpLine[i] == 0) {} else {
                        tmpLine[i] = -tmpLine[i];
                    }
                }
            }
            //console.log(tmpLine);
            return tmpLine;
        },

        // после того, как мы прошли алгоритмом, и не подошла сгенерированная строка,
        // мы должны обратно вернуть все значения полей, которые помечали при проходе
        checkTmpField: function(tmpField) {
            for (var i = 0; i <= Raises.LENGTH_OF_FIELD; i++) {
                for (var j = 0; j < Raises.WIDTH_OF_FIELD; j++) {
                    if (tmpField[i][j] == Raises.CHECKED_SPACE) tmpField[i][j] = 0;
                    else {
                        if (Raises.PASSABLE_SPACE.includes(-tmpField[i][j])) tmpField[i][j] = -tmpField[i][j];
                    }
                }
            }
            return tmpField;
        },

        validateNewField: function(tmpLine) {

            Raises.tmpField = Raises.playArea.createTmpArray(Raises.field);
            Raises.tmpField.unshift(tmpLine);
            var from = Raises.playerArea.findPlayer(Raises.tmpField);
            /*
            console.log("from: ");
            console.log(from);
            console.log(" ");
            */
            var flag = false;
            for (var i = 0; i < Raises.WIDTH_OF_FIELD; i++) {
                Raises.tmpField = Raises.playArea.checkTmpField(Raises.tmpField);
                /*
                console.log("tmpField: " + Raises.tmpField);
                console.log(" ");
                */
                if (Raises.playArea.BFS(from, {
                        x: 0,
                        y: i
                    })) {
                    Raises.Queue = [];
                    //console.log("true!");
                    return true;
                }
            }
            Raises.tmpField.shift();
            Raises.Queue = [];
            return false;
        },

        generateField: function() {
            var flag = true;
            var tmpLine;

            while (flag) {
                tmpLine = Raises.playArea.generateTmpLine();
                if (Raises.playArea.validateNewField(tmpLine)) {
                    tmpLine = Raises.playArea.convertTmpLine(tmpLine);
                    flag = false;
                }
            }

            Raises.field.unshift(tmpLine);
            var lastLine = Raises.field[Raises.LENGTH_OF_FIELD - 1];
            Raises.playerArea.checkLive(lastLine);
            Raises.field[Raises.LENGTH_OF_FIELD - 1] = Raises.field[Raises.LENGTH_OF_FIELD];
            Raises.field.length = Raises.LENGTH_OF_FIELD;

            Raises.playArea.drawField(Raises.field);
        },

        drawField: function(arr) {
            /*
            console.log(" ");
            console.log("array to draw: " + arr);
            console.log(" ");
            */
            var td = document.getElementsByTagName('td');
            [].forEach.call(td, function(elem) {
                elem.classList.add('way');
            })
            for (var i = 0; i < arr.length; i++) {
                var table = document.getElementById('table').children[i];
                for (var j = 0; j < Raises.WIDTH_OF_FIELD; j++) {
                    table.children[j].innerHTML = "";
                    if (Raises.PASSABLE_SPACE.includes(arr[i][j])) {
                        switch (arr[i][j]) {
                            case 0:
                                table.children[j].innerHTML = "";
                                break;
                            case Raises.BONUS_TIME:
                                var str = '<i class="fa fa-clock-o fa-4x" aria-hidden="true"></i>';
                                table.children[j].innerHTML = str;
                                break;
                            case Raises.BONUS_LIVE:
                                var str = '<i class="fa fa-heart fa-4x" aria-hidden="true"></i>';
                                table.children[j].innerHTML = str;
                                break;
                            case Raises.BONUS_COINS:
                                var str = '<i class="fa fa-usd fa-4x" aria-hidden="true"></i>';
                                table.children[j].innerHTML = str;
                                break;
                            default:
                        }
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
        }

    }
}

Raises.startApp.initApp();
