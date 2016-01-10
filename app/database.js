/**
 * Created by shaienn on 02.09.15.
 */

(function (App) {
    'use strict';
    var sqlite3 = require('sqlite3').verbose();
    var Q = require('q');
    var assert = require('assert');

    App.Database = {
        db: {},
        user_db: {},
        global_db: {},
        user_db_check: function () {

            var d = Q.defer();
            /* Check user.db, create tables if not exists */

            App.Database.user_db = new sqlite3.Database(App.Config.runDir + Settings.user_db);
            App.Database.user_db.serialize(function () {

                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [Authors] ([uaid] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,[name] TEXT NOT NULL,[gaid] INTEGER)");
                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [Settings] ([key] TEXT NOT NULL PRIMARY KEY, [value] TEXT NOT NULL)");
                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [Songs] ([usid] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,[uaid] INTEGER NOT NULL, [name] TEXT NOT NULL, [gaid] INTEGER, [gsid] INTEGER, [text] TEXT)");
                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [BackDirs] ([bd_id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, [bd_path] TEXT NOT NULL)");
                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [LogoDirs] ([bd_id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, [bd_path] TEXT NOT NULL)");
                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [ForApprove] ([id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, [gaid] INTEGER, [uaid] INTEGER, [gsid] INTEGER, [usid] INTEGER, [singer_name] VARCHAR(255), [song_name] VARCHAR(255), [song_text] TEXT)");

                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [LastSongs] ([gsid] INTEGER, [usid] INTEGER)");

                /* If we have no settings inside database files, just add its defaults */

                var stmt = App.Database.user_db.prepare("INSERT OR IGNORE INTO Settings (key, value) VALUES (?, ?)");
                for (var key in Settings) {
                    stmt.run(key, Settings[key]);
                }
                stmt.finalize();

                d.resolve(true);
            });

            return d.promise;
        },
        close: function () {

            var d = Q.defer();
            App.Database.db.close(function () {
                App.Database.global_db.close(function () {
                    App.Database.user_db.close(function () {
                        d.resolve();
                    });
                });
            });
            return d.promise;
        },
        init: function () {

            var d = Q.defer();
            console.log(App.Config.runDir + Settings.global_db);
            App.Database.global_db = new sqlite3.Database(App.Config.runDir + Settings.global_db, function (err) {

                if (err)
                    d.reject(new Error(err));

                App.Database.db = new sqlite3.Database(':memory:', function (err) {

                    if (err)
                        d.reject(new Error(err));

                    App.Database.user_db_check().then(function () {
                        App.Database.getVersion().then(function () {
                            App.Database.db.serialize(function () {

                                App.Database.db.run("CREATE TABLE IF NOT EXISTS [Authors] ([memid] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,[uaid] INTEGER NOT NULL,[gaid] INTEGER,[name] TEXT NOT NULL,[db] TEXT NOT NULL)");
                                App.Database.db.run("CREATE TABLE IF NOT EXISTS [Songs] ([memid] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,[usid] INTEGER NOT NULL,[uaid] INTEGER NOT NULL,[gsid] INTEGER,[gaid] INTEGER,[name] TEXT,[db] TEXT NOT NULL, [text] TEXT)");
                                App.Database.db.run("CREATE TABLE IF NOT EXISTS [Books] ([id] INTEGER NOT NULL PRIMARY KEY, [full_name] TEXT NOT NULL, [short_name] TEXT NOT NULL)");
                                App.Database.db.run("CREATE TABLE IF NOT EXISTS [Chapters] ([verses] NUMERIC, [bid] INTEGER, [cid] INTEGER, [content] TEXT)");


                                /* Global db */

                                App.Database.db.exec("ATTACH'" + App.Config.runDir + Settings.global_db + "'AS webdb", function (err) {
                                    if (err)
                                        d.reject(new Error(err));
                                });

                                App.Database.db.run("INSERT INTO main.Authors (uaid, name, db, gaid) SELECT '0', name, '1', author_id FROM webdb.Authors");
                                App.Database.db.run("INSERT INTO main.Songs (usid, uaid, name, db, gsid, gaid, text) SELECT '0', '0', name, '1', song_id, author_id, text FROM webdb.Songs");
                                App.Database.db.exec("DETACH webdb");

                                /* User db */

                                App.Database.db.exec("ATTACH'" + App.Config.runDir + Settings.user_db + "'AS userdb", function (err) {
                                    if (err)
                                        d.reject(new Error(err));
                                });

                                App.Database.db.run("INSERT INTO main.Authors (uaid, name, db, gaid) SELECT uaid, name, '2', gaid FROM userdb.Authors WHERE gaid LIKE 0");

                                App.Database.db.run("DELETE FROM main.Songs WHERE gsid IN (SELECT m.gsid FROM main.Songs m LEFT JOIN userdb.Songs u WHERE m.gsid = u.gsid)");
                                App.Database.db.run("INSERT INTO main.Songs (usid, uaid, name, db, gsid, gaid, text) SELECT usid, uaid, name, '2', gsid, gaid, text FROM userdb.Songs");
                                App.Database.db.exec("DETACH userdb");

                                App.Database.db.exec("CREATE VIRTUAL TABLE Songslist USING fts4(memid, name, text)");
                                App.Database.db.all("SELECT * FROM Songs", function (err, rows) {
                                    if (err)
                                        d.reject(new Error(err));

                                    var stmt = App.Database.db.prepare("INSERT INTO Songslist (memid, name, text) VALUES (?, ?, ?)");
                                    var rows_ts = [];

                                    rows.forEach(function (row) {

                                        if (row.text == null)
                                            return;

                                        var row_d = Q.defer();
                                        stmt.run(
                                                row.memid,
                                                row.name.toLowerCase(),
                                                row.text.toLowerCase(),
                                                function (err) {

                                                    if (err)
                                                        row_d.reject(new Error(err));

                                                    row_d.resolve(true);
                                                });

                                        rows_ts.push(row_d.promise);
                                    });

                                    stmt.finalize();
                                    Q.all(rows_ts).then(function (res) {
                                        console.log("database init");
                                        d.resolve(true);
                                    });
                                });
                            });
                        });
                    });
                });
            });
            return d.promise;
        },
//        convert: function () {
//
//           App.Database.global_db.exec("ALTER TABLE Songs ADD COLUMN text TEXT");
//           App.Database.global_db.each("SELECT * FROM Authors", function (err, row) {
//
//                if (err != null) {
//                    win.error("Load author failed. Got error: " + err);
//                }
//
//                //win.log("Author - " + row);
//
//                /* Select songs */
//
//                var stmt =App.Database.global_db.prepare("SELECT Songs.* FROM Songs WHERE Songs.author_id LIKE ? ORDER BY Songs.name");
//                stmt.each(row.author_id, function (err, row) {
//
//                    if (err != null) {
//                        win.error("Load songs failed. Got error: " + err);
//                        return;
//                    }
//
//                    win.log("Song - " + row.song_id);
//
//
//                    /* Load Texts */
//
//                    var stmt =App.Database.global_db.prepare("SELECT * FROM Texts WHERE song_id LIKE ? ORDER BY part_id");
//                    stmt.all(row.song_id, function (err, rows) {
//
//
//                        var song_id = null;
//                        var songText = "";
//
//                        rows.forEach(function (item, i, arr) {
//
//
//                            song_id = parseInt(item.song_id);
//
//                            songText += "\r\n{start_of_slide}\r\n";
//                            songText += item.text;
//                            songText += "\r\n{end_of_slide}\r\n";
//
//                        });
//
//                        win.log(JSON.stringify(song_id));
//
//                        if (typeof song_id == 'undefined') {
//                            return;
//                        }
//
//
//                        var stmt =App.Database.global_db.prepare("UPDATE Songs SET text = ? WHERE song_id = ?");
//                        stmt.run(songText, song_id);
//
//                    });
//
//                });
//
//            });
//
//
//        },
        getVersion: function () {
            var d = Q.defer();
            App.Database.global_db.each("SELECT version FROM Version WHERE version_id = 1", function (err, row) {

                if (err != null) {
                    Settings.Config.version = 0;
                } else {
                    Settings.Config.version = row.version;
                }

                d.resolve(Settings.Config.version);
            });
            return d.promise;
        },
        loadSettings: function () {

            var d = Q.defer();
            App.Database.user_db.all("SELECT key, value FROM Settings", function (err, rows) {
                if (err)
                    d.reject(new Error(err));

                rows.forEach(function (item) {
                    win.info("Set: " + item.key + " - " + item.value);
                    Settings[item.key] = item.value;
                });
                d.resolve(true);
            });
            return d.promise;
        },
        search: function (search_string) {
            search_string = search_string.toLowerCase();
            var d = Q.defer();
            var stmt = App.Database.db.prepare("SELECT s.* FROM Songs s, Songslist sl WHERE sl.name MATCH ? AND s.memid = sl.memid UNION SELECT s.* FROM Songs s, Songslist sl WHERE sl.text MATCH ? AND s.memid = sl.memid");
            stmt.all(search_string, search_string, function (err, rows) {
                if (err)
                    d.reject(new Error(err));

                var loadedSongs = [];
                rows.forEach(function (item, i, arr) {

                    loadedSongs.push({
                        name: item.name,
                        db: item.db,
                        aid: item.uaid,
                        gaid: item.gaid,
                        sid: item.usid,
                        gsid: item.gsid,
                        text: item.text,
                    });
                });
                d.resolve(loadedSongs);
            });
            stmt.finalize();
            return d.promise;
        },
        saveSetting: function (name, value) {
            var d = Q.defer();
            
            var stmt = App.Database.user_db.prepare("INSERT OR REPLACE INTO Settings VALUES (?,?)");
            stmt.run(name, value, function (err) {
                if (err)
                    d.reject(new Error(err));

                d.resolve();
            });
            stmt.finalize();
            return d.promise;
        },
        loadSongs: function (author) {
            var d = Q.defer();

            assert.ok(!isNaN(author.get('aid')));
            assert.ok(!isNaN(author.get('gaid')));

            var stmt = App.Database.db.prepare("SELECT Songs.* FROM Songs WHERE Songs.uaid LIKE ? AND Songs.gaid LIKE ? ORDER BY Songs.name");
            stmt.all(author.get('aid'), author.get('gaid'), function (err, rows) {
                if (err)
                    d.reject(new Error(err));

                var loadedSongs = [];
                rows.forEach(function (item, i, arr) {
                    loadedSongs.push({
                        name: item.name,
                        db: item.db,
                        aid: item.uaid,
                        gaid: item.gaid,
                        sid: item.usid,
                        gsid: item.gsid,
                        text: item.text,
                    });
                });
                d.resolve(loadedSongs);
            });
            stmt.finalize();
            return d.promise;
        },
        deleteSong: function (song) {
            var d = Q.defer();

            assert.ok(song instanceof App.Model.Song);
            assert.ok(!isNaN(song.get('sid')));

            if (song.get('db') == '2') {

                /* We only delete local authors */

                var stmt = App.Database.user_db.prepare("DELETE FROM Songs WHERE usid = ?");
                stmt.run(song.get('sid'), function (err) {
                    if (err)
                        d.reject(new Error(err));
                    d.resolve(true);
                });
                stmt.finalize();
            } else {
                d.resolve(false);
            }
            return d.promise;
        },
        saveSong: function (song) {

            var d = Q.defer();

            assert.ok(song instanceof App.Model.Song);

            var that = this;
            switch (song.get('db')) {

                case ('1'):

                    /* It is a global song, so create a new song in local db */

                    var stmt = App.Database.user_db.prepare("INSERT INTO Songs (uaid, name, gaid, gsid, text) VALUES (?,?,?,?,?)");
                    stmt.run(song.get('aid'), song.get('name'), song.get('gaid'), song.get('gsid'), song.get('text'), function (err) {

                        if (err)
                            d.reject(new Error(err));

                        var song_id = this.lastID;
                        that.getSinger(
                                song.get('gaid'),
                                song.get('aid')
                                ).then(
                                function (singer_name) {
                                    that.addSongForApprove(
                                            song.get('gaid'),
                                            song.get('aid'),
                                            song.get('gsid'),
                                            song_id,
                                            singer_name,
                                            song.get('name'),
                                            song.get('text')
                                            ).then(
                                            function () {
                                                d.resolve(true);
                                            }
                                    );
                                });
                    });

                    break;
                case ('2'):

                    /* It is a local song, update  */

                    var stmt = App.Database.user_db.prepare("UPDATE Songs SET uaid = ?, name = ?, gaid = ?, gsid = ?, text = ? WHERE usid = ?");
                    stmt.run(song.get('aid'), song.get('name'), song.get('gaid'), song.get('gsid'), song.get('text'), song.get('sid'), function (err) {

                        if (err)
                            d.reject(new Error(err));

                        that.getSinger(
                                song.get('gaid'),
                                song.get('aid')
                                ).then(function (singer_name) {
                            that.addSongForApprove(
                                    song.get('gaid'),
                                    song.get('aid'),
                                    song.get('gsid'),
                                    song.get('sid'),
                                    singer_name,
                                    song.get('name'),
                                    song.get('text')
                                    ).then(
                                    function () {
                                        d.resolve(true);
                                    }
                            );
                        });
                    });

                    break;
                case ('0'):

                    /* New song, create */

                    var stmt = App.Database.user_db.prepare("INSERT INTO Songs (uaid, name, gaid, gsid, text) VALUES (?,?,?,?,?)");
                    stmt.run(song.get('aid'), song.get('name'), song.get('gaid'), "0", song.get('text'), function (err) {

                        if (err)
                            d.reject(new Error(err));

                        var song_id = this.lastID;
                        that.getSinger(
                                song.get('gaid'),
                                song.get('aid')
                                ).then(
                                function (singer_name) {
                                    that.addSongForApprove(
                                            song.get('gaid'),
                                            song.get('aid'),
                                            0,
                                            song_id,
                                            singer_name,
                                            song.get('name'),
                                            song.get('text')
                                            ).then(
                                            function () {
                                                d.resolve(true);
                                            }
                                    );
                                });
                    });
                    break;
                default:
                    d.reject(new Error('Unknown song`s DB'));

            }

            return d.promise;

        },
        addSongToLastSongs: function (song) {

            var d = Q.defer();

            assert.ok(song instanceof App.Model.Song);

            var stmt = App.Database.user_db.prepare("INSERT INTO LastSongs (gsid, usid) VALUES (?,?)");
            stmt.run(song.get('gsid'), song.get('sid'), function (err) {

                if (err) {
                    d.reject(new Error(err));
                    return;
                }

                d.resolve(true);
            });
            stmt.finalize();

            return d.promise;
        },
        getLastSongs: function () {
            var d = Q.defer();

            App.Database.user_db.all("SELECT * FROM LastSongs", function (err, rows) {

                if (err) {
                    d.reject(new Error("Load author failed. Got error: " + err));
                    return;
                }

                var loadedSongs = [];
                var load_promises = [];
                var stmt = App.Database.db.prepare("SELECT Songs.* FROM Songs WHERE Songs.gsid LIKE ? AND Songs.usid LIKE ? LIMIT 1");
                rows.forEach(function (last_song_item) {
                    var load_promise = Q.defer();

                    stmt.get(last_song_item.gsid, last_song_item.usid, function (err, item) {
                        if (err) {
                            load_promise.reject(new Error(err));
                            return;
                        }

                        var song = new App.Model.Song();
                        song.set('name', item.name);
                        song.set('db', item.db);
                        song.set('aid', item.uaid);
                        song.set('gaid', item.gaid);
                        song.set('sid', item.usid);
                        song.set('gsid', item.gsid);
                        song.set('text', item.text);

                        loadedSongs.push(song);
                        load_promise.resolve(true);
                    });

                    load_promises.push(load_promise.promise);
                });
                stmt.finalize();

                Q.all(load_promises).then(function () {
                    d.resolve(loadedSongs);
                });
            });

            return d.promise;
        },
        removeSongFromLastSongs: function (song) {
            var d = Q.defer();

            assert.ok(song instanceof App.Model.Song);

            var stmt = App.Database.user_db.prepare("DELETE FROM LastSongs WHERE gsid = ? AND usid = ?");
            stmt.run(song.get('gsid'), song.get('sid'), function (err) {
                if (err)
                    d.reject(new Error(err));
                d.resolve(true);
            });
            stmt.finalize();
            return d.promise;
        },
        removeAllFromLastSongs: function () {
            var d = Q.defer();
            App.Database.user_db.run("DELETE FROM LastSongs", [], function (err) {
                if (err)
                    d.reject(new Error(err));

                d.resolve(true);
            });
            return d.promise;
        },
        addSongForApprove: function (gaid, uaid, gsid, usid, singer_name, song_name, song_text) {

            var d = Q.defer();

            assert.ok(!isNaN(gaid));
            assert.ok(!isNaN(uaid));
            assert.ok(!isNaN(gsid));
            assert.ok(!isNaN(usid));

            /* Check is it already exist record with corresponding gaid, uaid, gsid and guid values */

            var stmt = App.Database.user_db.prepare("SELECT id FROM ForApprove WHERE gaid=? AND uaid=? AND gsid=? AND usid=?");
            stmt.get(gaid, uaid, gsid, usid, function (err, row) {

                if (err)
                    d.reject(new Error(err));

                if (typeof row == "undefined") {

                    /* There is no record with that values, will create one */

                    var insert_stmt = App.Database.user_db.prepare("INSERT INTO ForApprove (gaid, uaid, gsid, usid, singer_name, song_name, song_text) VALUES (?,?,?,?,?,?,?)");
                    insert_stmt.run(gaid, uaid, gsid, usid, singer_name, song_name, song_text, function (err) {

                        if (err)
                            d.reject(new Error(err));
                        d.resolve(true);
                    });
                    insert_stmt.finalize();

                } else if (!isNaN(row.id)) {

                    /* There is a record, will update this one */

                    var update_stmt = App.Database.user_db.prepare("UPDATE ForApprove SET singer_name=?, song_name=?, song_text=? WHERE id=?");
                    update_stmt.run(singer_name, song_name, song_text, row.id, function (err) {

                        if (err)
                            d.reject(new Error(err));
                        d.resolve(true);
                    });
                    update_stmt.finalize();

                } else {
                    d.reject(new Error("Wrong row.id value: " + row.id));
                }
            });
            stmt.finalize();
            return d.promise;
        },
        getSongsForApprove: function () {

            var d = Q.defer();

            App.Database.user_db.all("SELECT * FROM ForApprove", function (err, rows) {

                if (err)
                    d.reject(new Error("Load author failed. Got error: " + err));

                var loadedSongs = [];
                rows.forEach(function (item, i, arr) {
                    loadedSongs.push({
                        id: item.id,
                        gaid: item.gaid,
                        uaid: item.uaid,
                        gsid: item.gsid,
                        usid: item.usid,
                        singer_name: item.singer_name,
                        song_name: item.song_name,
                        song_text: item.song_text
                    });
                });
                d.resolve(loadedSongs);
            });
            return d.promise;
        },
        removeSongsForApprove: function (ids_array) {
            var stmt = App.Database.user_db.prepare("DELETE FROM ForApprove WHERE id=?");
            for (var i = 0; i < ids_array.length; i++) {
                stmt.run(ids_array[i]);
            }
            stmt.finalize();
        },
        removeSongForApprove: function (id) {

            assert.ok(!isNaN(id));

            var stmt = App.Database.user_db.prepare("DELETE FROM ForApprove WHERE id=?");
            stmt.run(id);
            stmt.finalize();
        },
        getSinger: function (gaid, uaid) {
            var d = Q.defer();

            assert.ok(!isNaN(gaid));
            assert.ok(!isNaN(uaid));

            var stmt = App.Database.db.prepare("SELECT * FROM Authors WHERE gaid = ? AND uaid = ?");
            stmt.get(gaid, uaid, function (err, row) {
                if (err)
                    d.reject(new Error(err));

                d.resolve(row.name);
            });
            stmt.finalize();

            return d.promise;
        },
        loadAuthors: function () {

            var d = Q.defer();

            App.Database.db.all("SELECT * FROM Authors", function (err, rows) {

                if (err)
                    d.reject(new Error(err));

                var loadedAuthors = [];

                rows.forEach(function (item, i, arr) {
                    loadedAuthors.push({
                        name: item.name,
                        db: item.db,
                        aid: item.uaid,
                        gaid: item.gaid,
                    });

                });

                d.resolve(loadedAuthors);

            });

            return d.promise;
        },
        deleteAuthor: function (author) {

            assert.ok(author instanceof App.Model.Author);
            assert.ok(!isNaN(author.get('aid')));

            if (author.get('db') == '2') {

                /* We only delete local authors */

                var stmt = App.Database.user_db.prepare("DELETE FROM Authors WHERE uaid = ?");
                stmt.run(author.get('aid'));
                stmt.finalize();
            }

        },
        saveAuthor: function (author) {

            assert.ok(author instanceof App.Model.Author);
            assert.ok(!isNaN(author.get('aid')));
            assert.ok(!isNaN(author.get('gaid')));

            switch (author.get('db')) {

                case ('1'):

                    /* It is a global author, so create a new author in local db */

                    var stmt = App.Database.user_db.prepare("INSERT INTO Authors (name, gaid) VALUES (?,?)");
                    stmt.run(author.get('name'), author.get('gaid'));
                    stmt.finalize();

                    break;
                case ('2'):

                    /* It is a local author, update  */

                    var stmt = App.Database.user_db.prepare("UPDATE Authors SET name = ? WHERE uaid = ?");
                    stmt.run(author.get('name'), author.get('aid'));
                    stmt.finalize();

                    break;
                case ('0'):

                    /* New author, create */

                    var stmt = App.Database.user_db.prepare("INSERT INTO Authors (name, gaid) VALUES (?,?)");
                    stmt.run(author.get('name'), '0');
                    stmt.finalize();

                    break;
                default:
                    win.error('Unknown author`s DB');
                    return;
            }
        }
    };
})(window.App);
