/**
 * Created by shaienn on 02.09.15.
 */

(function (App) {
    'use strict';
    var sqlite3 = require('sqlite3').verbose();
    var Q = require('q');
    App.Database = {
        db: {},
        user_db: {},
        global_db: {},
        user_db_check: function () {

            /* Check user.db, create tables if not exists */

            App.Database.user_db = new sqlite3.Database(App.Config.runDir + Settings.user_db);
            App.Database.user_db.serialize(function () {

                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [Authors] ([author_id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,[name] TEXT NOT NULL,[global_author_id] INTEGER)");
                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [Settings] ([key] TEXT NOT NULL PRIMARY KEY, [value] TEXT NOT NULL)");
                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [Songs] ([song_id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,[author_id] INTEGER NOT NULL, [name] TEXT NOT NULL, [global_author_id] INTEGER, [global_song_id] INTEGER, [text] TEXT)");
                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [BackDirs] ([bd_id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, [bd_path] TEXT NOT NULL)");
                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [LogoDirs] ([bd_id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, [bd_path] TEXT NOT NULL)");
                App.Database.user_db.run("CREATE TABLE IF NOT EXISTS [ForApprove] ([id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, [gaid] INTEGER, [uaid] INTEGER, [gsid] INTEGER, [usid] INTEGER, [singer_name] VARCHAR(255), [song_name] VARCHAR(255), [song_text] TEXT)");

                /* If we have no settings inside database files, just add its defaults */

                var stmt = App.Database.user_db.prepare("INSERT OR IGNORE INTO Settings (key, value) VALUES (?, ?)");
                for (var key in Settings) {
                    stmt.run(key, Settings[key]);
                }
                stmt.finalize();
            });
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
                    throw new Error(err);

                App.Database.db = new sqlite3.Database(':memory:', function (err) {

                    if (err)
                        throw new Error(err);

                    App.Database.user_db_check();
                    App.Database.getVersion().then(function () {
                        App.Database.db.serialize(function () {

                            App.Database.db.run("CREATE TABLE IF NOT EXISTS [Authors] ([memid] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,[author_id] INTEGER NOT NULL,[global_author_id] INTEGER,[name] TEXT NOT NULL,[db] TEXT NOT NULL)");
                            App.Database.db.run("CREATE TABLE IF NOT EXISTS [Songs] ([memid] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,[song_id] INTEGER NOT NULL,[author_id] INTEGER NOT NULL,[global_song_id] INTEGER,[global_author_id] INTEGER,[name] TEXT,[db] TEXT NOT NULL, [text] TEXT)");
                            App.Database.db.run("CREATE TABLE IF NOT EXISTS [Books] ([id] INTEGER NOT NULL PRIMARY KEY, [full_name] TEXT NOT NULL, [short_name] TEXT NOT NULL)");
                            App.Database.db.run("CREATE TABLE IF NOT EXISTS [Chapters] ([verses] NUMERIC, [bid] INTEGER, [cid] INTEGER, [content] TEXT)");


                            /* Global db */

                            App.Database.db.exec("ATTACH'" + App.Config.runDir + Settings.global_db + "'AS webdb", function (err) {
                                if (err != null) {
                                    win.error("Attach global database failed. Got error: " + err);
                                    throw error(err);
                                }
                            });

                            App.Database.db.run("INSERT INTO main.Authors (author_id, name, db, global_author_id) SELECT '0', name, '1', author_id FROM webdb.Authors");
                            App.Database.db.run("INSERT INTO main.Songs (song_id, author_id, name, db, global_song_id, global_author_id, text) SELECT '0', '0', name, '1', song_id, author_id, text FROM webdb.Songs");
                            App.Database.db.exec("DETACH webdb");

                            /* User db */

                            App.Database.db.exec("ATTACH'" + App.Config.runDir + Settings.user_db + "'AS userdb", function (err) {
                                if (err != null) {
                                    win.error("Attach local database failed. Got error: " + err);
                                    throw new Error(err);
                                }
                            });

                            App.Database.db.run("INSERT INTO main.Authors (author_id, name, db, global_author_id) SELECT author_id, name, '2', global_author_id FROM userdb.Authors WHERE global_author_id LIKE 0");

                            App.Database.db.run("DELETE FROM main.Songs WHERE global_song_id IN (SELECT m.global_song_id FROM main.Songs m LEFT JOIN userdb.Songs u WHERE m.global_song_id = u.global_song_id)");
                            App.Database.db.run("INSERT INTO main.Songs (song_id, author_id, name, db, global_song_id, global_author_id, text) SELECT song_id, author_id, name, '2', global_song_id, global_author_id, text FROM userdb.Songs");
                            App.Database.db.exec("DETACH userdb");

                            App.Database.db.exec("CREATE VIRTUAL TABLE Songslist USING fts4(global_song_id, song_id, name, db, text)");
                            App.Database.db.all("SELECT * FROM Songs", function (err, rows) {
                                if (err != null) {
                                    win.error("Attach local database failed. Got error: " + err);
                                    throw new Error(err);
                                }



                                var stmt = App.Database.db.prepare("INSERT INTO Songslist (global_song_id, song_id, name, db, text) VALUES (?, ?, ?, ?, ?)");
                                for (var i = 0; i < rows.length; i++) {

                                    var row = rows[i];

                                    if (row.text == null)
                                        continue;

                                    stmt.run(
                                            row.global_song_id,
                                            row.song_id,
                                            row.name.toLowerCase(),
                                            row.db,
                                            row.text.toLowerCase(),
                                            function (err) {
                                                if (err)
                                                    throw new Error(err);

                                            });
                                }

                                stmt.finalize();
                                d.resolve(true);
                                console.log("database init");
                            });

//                            App.Database.db.run("INSERT INTO Songslist (global_song_id, song_id, name, db, text) SELECT global_song_id, song_id,  LOWER(name), db, LOWER(text) FROM Songs", function () {
//                                d.resolve(true);
//                                console.log("database init");
//                            });
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
                if (err != null)
                    throw new Error("Load settings failed. Got error: " + err);

                rows.forEach(function (item, i, arr) {
                    win.info("Set: " + item.key + " - " + item.value);
                    Settings[item.key] = item.value;
                });
                d.resolve(true);
            });
            return d.promise;
        },
        search: function (search_string) {
            win.log("Search songs: " + search_string);
            search_string = search_string.toLowerCase();
            var d = Q.defer();
            var stmt = App.Database.db.prepare("SELECT s.* FROM Songs s, Songslist sl WHERE sl.name MATCH ? AND s.song_id = sl.song_id AND s.global_song_id = sl.global_song_id UNION SELECT s.* FROM Songs s, Songslist sl WHERE sl.text MATCH ? AND s.song_id = sl.song_id AND s.global_song_id = sl.global_song_id");
            stmt.all(search_string, search_string, function (err, rows) {
                if (err != null)
                    throw new Error("Search songs failed. Got error: " + err);

                var loadedSongs = [];
                rows.forEach(function (item, i, arr) {

                    loadedSongs.push({
                        name: item.name,
                        db: item.db,
                        aid: item.author_id,
                        gaid: item.global_author_id,
                        sid: item.song_id,
                        gsid: item.global_song_id,
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
                    throw new Error(err);

                d.resolve();
            });
            stmt.finalize();
            return d.promise;
        },
        loadSongs: function (author) {
            var d = Q.defer();

            if (typeof author.get('aid') == 'undefined' || isNaN(author.get('aid')))
                throw new Error();

            if (typeof author.get('gaid') == 'undefined' || isNaN(author.get('gaid')))
                throw new Error();

            var stmt = App.Database.db.prepare("SELECT Songs.* FROM Songs WHERE Songs.author_id LIKE ? AND Songs.global_author_id LIKE ? ORDER BY Songs.name");
            stmt.all(author.get('aid'), author.get('gaid'), function (err, rows) {
                if (err != null)
                    throw new Error("Load songs failed. Got error: " + err);

                var loadedSongs = [];
                rows.forEach(function (item, i, arr) {
                    loadedSongs.push({
                        name: item.name,
                        db: item.db,
                        aid: item.author_id,
                        gaid: item.global_author_id,
                        sid: item.song_id,
                        gsid: item.global_song_id,
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

            if (typeof song.get('sid') == 'undefined' || isNaN(song.get('sid')))
                throw error("Sid is wrong");

            if (song.get('db') == '2') {

                /* We only delete local authors */

                var stmt = App.Database.user_db.prepare("DELETE FROM Songs WHERE song_id = ?");
                stmt.run(song.get('sid'), function (err) {
                    if (err)
                        throw error(err);

                    d.resolve();
                });
                stmt.finalize();
            } else {
                d.resolve();
            }
            return d.promise;
        },
        saveSong: function (song) {

            var d = Q.defer();

            if (!(song instanceof App.Model.Song))
                throw error("Object is not song type: " + song);

            var that = this;
            switch (song.get('db')) {

                case ('1'):

                    /* It is a global song, so create a new song in local db */

                    var stmt = App.Database.user_db.prepare("INSERT INTO Songs (author_id, name, global_author_id, global_song_id, text) VALUES (?,?,?,?,?)");
                    stmt.run(song.get('aid'), song.get('name'), song.get('gaid'), song.get('gsid'), song.get('text'), function (err) {

                        if (err)
                            throw error(err);

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
                                                d.resolve();
                                            }
                                    );
                                });
                    });

                    break;
                case ('2'):

                    /* It is a local song, update  */

                    var stmt = App.Database.user_db.prepare("UPDATE Songs SET author_id = ?, name = ?, global_author_id = ?, global_song_id = ?, text = ? WHERE song_id = ?");
                    stmt.run(song.get('aid'), song.get('name'), song.get('gaid'), song.get('gsid'), song.get('text'), song.get('sid'), function (err) {

                        if (err)
                            throw error(err);

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
                                        d.resolve();
                                    }
                            );
                        });
                    });

                    break;
                case ('0'):

                    /* New song, create */

                    var stmt = App.Database.user_db.prepare("INSERT INTO Songs (author_id, name, global_author_id, global_song_id, text) VALUES (?,?,?,?,?)");
                    stmt.run(song.get('aid'), song.get('name'), song.get('gaid'), "0", song.get('text'), function (err) {

                        if (err)
                            throw error(err);

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
                                                d.resolve();
                                            }
                                    );
                                });
                    });
                    break;
                default:
                    throw error('Unknown song`s DB');

            }

            return d.promise;

        },
        addSongForApprove: function (gaid, uaid, gsid, usid, singer_name, song_name, song_text) {

            var d = Q.defer();

            console.log("addSongForApprove");

            if (typeof gaid == 'undefined' || isNaN(gaid))
                throw error("Gaid is wrong: " + typeof gaid + " " + isNaN(gaid));

            if (typeof uaid == 'undefined' || isNaN(uaid))
                throw error("Uaid is wrong: " + typeof uaid + " " + isNaN(uaid));

            if (typeof gsid == 'undefined' || isNaN(gsid))
                throw error("Gsid is wrong: " + typeof gsid + " " + isNaN(gsid));

            if (typeof usid == 'undefined' || isNaN(usid))
                throw error("Usid is wrong: " + typeof usid + " " + isNaN(usid));

            /* Check is it already exist record with corresponding gaid, uaid, gsid and guid values */

            var stmt = App.Database.user_db.prepare("SELECT id FROM ForApprove WHERE gaid=? AND uaid=? AND gsid=? AND usid=?");
            stmt.get(gaid, uaid, gsid, usid, function (err, row) {

                if (err)
                    throw error(err);

                if (typeof row == "undefined") {

                    /* There is no record with that values, will create one */

                    var insert_stmt = App.Database.user_db.prepare("INSERT INTO ForApprove (gaid, uaid, gsid, usid, singer_name, song_name, song_text) VALUES (?,?,?,?,?,?,?)");
                    insert_stmt.run(gaid, uaid, gsid, usid, singer_name, song_name, song_text, function (err) {

                        if (err)
                            throw error(err);
                        console.log("insert");
                        d.resolve();
                    });
                    insert_stmt.finalize();

                } else if (!isNaN(row.id)) {

                    /* There is a record, will update this one */

                    var update_stmt = App.Database.user_db.prepare("UPDATE ForApprove SET singer_name=?, song_name=?, song_text=? WHERE id=?");
                    update_stmt.run(singer_name, song_name, song_text, row.id, function (err) {

                        if (err)
                            throw error(err);
                        console.log("update");
                        d.resolve();
                    });
                    update_stmt.finalize();

                } else {
                    throw error("Wrong row.id value: " + row.id);
                }
            });
            stmt.finalize();
            return d.promise;
        },
        getSongsForApprove: function () {

            var d = Q.defer();

            App.Database.user_db.all("SELECT * FROM ForApprove", function (err, rows) {

                if (err)
                    throw error("Load author failed. Got error: " + err);

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
            var stmt = App.Database.user_db.prepare("DELETE FROM ForApprove WHERE id=?");
            stmt.run(id);
            stmt.finalize();
        },
        getSinger: function (gaid, uaid) {
            var d = Q.defer();

            if (typeof gaid == 'undefined' || isNaN(gaid))
                throw error("gaid " + gaid);

            if (typeof uaid == 'undefined' || isNaN(uaid))
                throw error("uaid " + uaid);

            console.log("get_singer: " + gaid + " " + uaid);

            var stmt = App.Database.db.prepare("SELECT * FROM Authors WHERE global_author_id = ? AND author_id = ?");
            stmt.get(gaid, uaid, function (err, row) {

                if (err)
                    throw error(err);

                console.log(row.name);
                d.resolve(row.name);
            });
            stmt.finalize();

            return d.promise;
        },
        loadAuthors: function () {

            var d = Q.defer();

            App.Database.db.all("SELECT * FROM Authors", function (err, rows) {

                if (err != null)
                    throw error("Load authors failed. Got error: " + err);

                var loadedAuthors = [];

                rows.forEach(function (item, i, arr) {
                    loadedAuthors.push({
                        name: item.name,
                        db: item.db,
                        aid: item.author_id,
                        gaid: item.global_author_id,
                    });

                });

                d.resolve(loadedAuthors);

            });

            return d.promise;
        },
        deleteAuthor: function (author) {

            if (!(author instanceof App.Model.Author)) {
                win.error("Object is not author type: " + author);
                return;
            }

            if (typeof author.get('aid') == 'undefined' || isNaN(author.get('aid'))) {
                return;
            }

            if (author.get('db') == '2') {

                /* We only delete local authors */

                var stmt = App.Database.user_db.prepare("DELETE FROM Authors WHERE author_id = ?");
                stmt.run(author.get('aid'));
                stmt.finalize();
            }

        },
        saveAuthor: function (author) {

            if (!(author instanceof App.Model.Author)) {
                win.error("Object is not author type: " + author);
                return;
            }

            if (typeof author.get('aid') == 'undefined' || isNaN(author.get('aid'))) {
                return;
            }

            if (typeof author.get('gaid') == 'undefined' || isNaN(author.get('gaid'))) {
                return;
            }

            switch (author.get('db')) {

                case ('1'):

                    /* It is a global author, so create a new author in local db */

                    var stmt = App.Database.user_db.prepare("INSERT INTO Authors (name, global_author_id) VALUES (?,?)");
                    stmt.run(author.get('name'), author.get('gaid'));
                    stmt.finalize();

                    break;
                case ('2'):

                    /* It is a local author, update  */

                    var stmt = App.Database.user_db.prepare("UPDATE Authors SET name = ? WHERE author_id = ?");
                    stmt.run(author.get('name'), author.get('aid'));
                    stmt.finalize();

                    break;
                case ('0'):

                    /* New author, create */

                    var stmt = App.Database.user_db.prepare("INSERT INTO Authors (name, global_author_id) VALUES (?,?)");
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
