/**
 * Created by shaienn on 02.09.15.
 */

var sqlite3 = require('sqlite3').verbose();
var Q = require('q');

(function (App) {
    'use strict';

    var Database = {
        db: {},
        //db: new sqlite3.Database('test.db'),

        user_db: new sqlite3.Database(App.Config.execDir + App.Config.db_user),
        global_db: new sqlite3.Database(App.Config.execDir + App.Config.db_global),
        user_db_check: function () {

            /* Check user.db, create tables if not exists */

            Database.user_db.serialize(function () {

                Database.user_db.run("CREATE TABLE IF NOT EXISTS [Authors] ([author_id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,[name] TEXT NOT NULL,[global_author_id] INTEGER)");
                Database.user_db.run("CREATE TABLE IF NOT EXISTS [Settings] ([key] TEXT NOT NULL PRIMARY KEY, [value] TEXT NOT NULL)");
                Database.user_db.run("CREATE TABLE IF NOT EXISTS [Songs] ([song_id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,[author_id] INTEGER NOT NULL, [name] TEXT NOT NULL, [global_author_id] INTEGER, [global_song_id] INTEGER, [text] TEXT)");
                Database.user_db.run("CREATE TABLE IF NOT EXISTS [BackDirs] ([bd_id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, [bd_path] TEXT NOT NULL)");
                Database.user_db.run("CREATE TABLE IF NOT EXISTS [LogoDirs] ([bd_id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, [bd_path] TEXT NOT NULL)");

                /* If we have no settings inside database files, just add its defaults */

                var stmt = Database.user_db.prepare("INSERT OR IGNORE INTO Settings (key, value) VALUES (?, ?)");

                for (var key in Settings) {
                    stmt.run(key, Settings[key]);
                }
                stmt.finalize();

            });

        },
        close: function () {
            console.log("database closing");
            var d = Q.defer();

            Database.db.close(function () {
                console.log("database closed");
                d.resolve(true);
            });

            return d.promise;
        },
        init: function () {

            var d = Q.defer();

            this.db = new sqlite3.Database(':memory:', function (err) {

                if (err) {
                    win.error(err);
                    Database.db.close();
                }

                Database.user_db_check();
                Database.db.serialize(function () {

                    Database.db.loadExtension('sqlite/libSqliteIcu.so');

                    Database.db.run("CREATE TABLE IF NOT EXISTS [Authors] ([memid] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,[author_id] INTEGER NOT NULL,[global_author_id] INTEGER,[name] TEXT NOT NULL,[db] TEXT NOT NULL)");
                    Database.db.run("CREATE TABLE IF NOT EXISTS [Songs] ([memid] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,[song_id] INTEGER NOT NULL,[author_id] INTEGER NOT NULL,[global_song_id] INTEGER,[global_author_id] INTEGER,[name] TEXT,[db] TEXT NOT NULL, [text] TEXT)");
                    Database.db.run("CREATE TABLE IF NOT EXISTS [Books] ([id] INTEGER NOT NULL PRIMARY KEY, [full_name] TEXT NOT NULL, [short_name] TEXT NOT NULL)");
                    Database.db.run("CREATE TABLE IF NOT EXISTS [Chapters] ([verses] NUMERIC, [bid] INTEGER, [cid] INTEGER, [content] TEXT)");


                    /* Global db */

                    Database.db.exec("ATTACH'" + App.Config.execDir + App.Config.db_global + "'AS webdb", function (err) {
                        if (err != null) {
                            win.error("Attach global database failed. Got error: " + err);
                        }
                    });

                    Database.db.run("INSERT INTO main.Authors (author_id, name, db, global_author_id) SELECT author_id, name, '1', author_id FROM webdb.Authors");
                    Database.db.run("INSERT INTO main.Songs (song_id, author_id, name, db, global_song_id, global_author_id, text) SELECT song_id, author_id, name, '1', song_id, author_id, text FROM webdb.Songs");
                    Database.db.exec("DETACH webdb");

                    /* User db */

                    Database.db.exec("ATTACH'" + App.Config.execDir + App.Config.db_user + "'AS userdb", function (err) {
                        if (err != null) {
                            win.error("Attach local database failed. Got error: " + err);
                        }
                    });

                    Database.db.run("INSERT INTO main.Authors (author_id, name, db, global_author_id) SELECT author_id, name, '2', '0' FROM userdb.Authors WHERE global_author_id LIKE 0");
                    Database.db.run("INSERT INTO main.Songs (song_id, author_id, name, db, global_song_id, global_author_id, text) SELECT song_id, author_id, name, '2', '0', '0', text FROM userdb.Songs WHERE global_song_id LIKE 0 AND global_author_id LIKE 0");
                    Database.db.run("INSERT INTO main.Songs (song_id, author_id, name, db, global_song_id, global_author_id, text) SELECT song_id, author_id, name, '2', '0', global_author_id, text FROM userdb.Songs WHERE global_song_id LIKE 0 AND global_author_id IS NOT 0");
                    Database.db.run("DELETE FROM main.Songs WHERE song_id IN (SELECT m.song_id FROM main.Songs m LEFT JOIN userdb.Songs u WHERE m.song_id = u.global_song_id)");
                    Database.db.run("INSERT INTO main.Songs (song_id, author_id, name, db, global_song_id, global_author_id, text) SELECT song_id, global_author_id, name, '2', global_song_id, global_author_id, text FROM userdb.Songs WHERE global_author_id IS NOT 0 AND global_song_id IS NOT 0");
                    Database.db.exec("DETACH userdb");

                    Database.db.exec("CREATE VIRTUAL TABLE Songslist USING fts4(song_id, name, db, text)");
                    Database.db.run("INSERT INTO Songslist (song_id, name, db, text) SELECT song_id,  LOWER(name), db, LOWER(text) FROM Songs", function () {
                        d.resolve(true);
                        console.log("database init");
                    });
                });


            });

            return d.promise;
        },
        convert: function () {

            Database.global_db.exec("ALTER TABLE Songs ADD COLUMN text TEXT");
            Database.global_db.each("SELECT * FROM Authors", function (err, row) {

                if (err != null) {
                    win.error("Load author failed. Got error: " + err);
                }

                //win.log("Author - " + row);

                /* Select songs */

                var stmt = Database.global_db.prepare("SELECT Songs.* FROM Songs WHERE Songs.author_id LIKE ? ORDER BY Songs.name");
                stmt.each(row.author_id, function (err, row) {

                    if (err != null) {
                        win.error("Load songs failed. Got error: " + err);
                        return;
                    }

                    win.log("Song - " + row.song_id);


                    /* Load Texts */

                    var stmt = Database.global_db.prepare("SELECT * FROM Texts WHERE song_id LIKE ? ORDER BY part_id");
                    stmt.all(row.song_id, function (err, rows) {


                        var song_id = null;
                        var songText = "";

                        rows.forEach(function (item, i, arr) {


                            song_id = parseInt(item.song_id);

                            songText += "\r\n{start_of_slide}\r\n";
                            songText += item.text;
                            songText += "\r\n{end_of_slide}\r\n";

                        });

                        win.log(JSON.stringify(song_id));

                        if (typeof song_id == 'undefined') {
                            return;
                        }


                        var stmt = Database.global_db.prepare("UPDATE Songs SET text = ? WHERE song_id = ?");
                        stmt.run(songText, song_id);

                    });

                });

            });


        },
        loadSettings: function () {

            var d = Q.defer();
            Database.user_db.all("SELECT key, value FROM Settings", function (err, rows) {
                if (err != null) {
                    win.error("Load settings failed. Got error: " + err);
                    d.reject(err);
                }

                rows.forEach(function (item, i, arr) {
                    win.info("Set: " + item.key + " - " + item.value);
                    Settings[item.key] = item.value;
                });

                console.log("Settings ready");
                d.resolve(true);
            });

            return d.promise;
        },
        search: function (search_string) {

            win.log("Search songs: " + search_string);

            var d = Q.defer();
            var stmt = Database.db.prepare("SELECT s.* FROM Songs s, Songslist sl, Authors a WHERE sl.name MATCH LOWER(?) AND s.song_id = sl.song_id AND CASE s.global_author_id WHEN 0 THEN a.author_id = s.author_id ELSE a.author_id = s.global_author_id END AND sl.db = s.db UNION ALL SELECT s.* FROM Songs s, Songslist sl, Authors a WHERE sl.text MATCH LOWER(?) AND s.song_id = sl.song_id AND CASE s.global_author_id WHEN 0 THEN a.author_id = s.author_id ELSE a.author_id = s.global_author_id END AND sl.db = s.db ");

            stmt.all(search_string, search_string, function (err, rows) {

                if (err != null) {
                    win.error("Search songs failed. Got error: " + err);
                    d.reject(err);
                }

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

            return d.promise;

        },
        saveSetting: function (name, value) {

            var stmt = Database.user_db.prepare("INSERT OR REPLACE INTO Settings VALUES (?,?)");
            stmt.run(name, value);
            stmt.finalize();

        },
        loadSongs: function (author) {

            if (typeof author.get('aid') == 'undefined' || isNaN(author.get('aid'))) {
                return [];
            }

            if (typeof author.get('gaid') == 'undefined' || isNaN(author.get('gaid'))) {
                return [];
            }

            var d = Q.defer();
            var stmt = Database.db.prepare("SELECT Songs.* FROM Songs WHERE Songs.author_id LIKE ? AND Songs.global_author_id LIKE ? ORDER BY Songs.name");

            stmt.all(author.get('aid'), author.get('gaid'), function (err, rows) {

                if (err != null) {
                    win.error("Load songs failed. Got error: " + err);
                    d.reject(err);
                }

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

            return d.promise;

        },
        deleteSong: function (song) {

            if (typeof song.get('sid') == 'undefined' || isNaN(song.get('sid'))) {
                return;
            }

            if (song.get('db') == '2') {

                /* We only delete local authors */

                var stmt = Database.user_db.prepare("DELETE FROM Songs WHERE song_id = ?");
                stmt.run(song.get('sid'));
            }

        },
        saveSong: function (song) {

            if (!(song instanceof App.Model.Song)) {
                win.error("Object is not song type: " + song);
                return;
            }

            switch (song.get('db')) {

                case ('1'):

                    /* It is a global song, so create a new song in local db */

                    var stmt = Database.user_db.prepare("INSERT INTO Songs (author_id, name, global_author_id, global_song_id, text) VALUES (?,?,?,?,?)");
                    stmt.run(song.get('aid'), song.get('name'), song.get('gaid'), song.get('gsid'), song.get('text'));

                    break;
                case ('2'):

                    /* It is a local song, update  */

                    var stmt = Database.user_db.prepare("UPDATE Songs SET author_id = ?, name = ?, global_author_id = ?, global_song_id = ?, text = ? WHERE song_id = ?");
                    stmt.run(song.get('aid'), song.get('name'), song.get('gaid'), song.get('gsid'), song.get('text'), song.get('sid'));

                    break;
                case ('0'):

                    /* New song, create */

                    var stmt = Database.user_db.prepare("INSERT INTO Songs (author_id, name, global_author_id, global_song_id, text) VALUES (?,?,?,?,?)");
                    stmt.run(song.get('aid'), song.get('name'), song.get('gaid'), "0", song.get('text'));

                    break;
                default:
                    win.error('Unknown song`s DB');
                    return;

            }


        },
        loadAuthors: function () {

            var d = Q.defer();

            Database.db.all("SELECT * FROM Authors", function (err, rows) {

                if (err != null) {
                    win.error("Load author failed. Got error: " + err);
                    d.reject(err);
                }

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

                var stmt = Database.user_db.prepare("DELETE FROM Authors WHERE author_id = ?");
                stmt.run(author.get('aid'));
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

                    var stmt = Database.user_db.prepare("INSERT INTO Authors (name, global_author_id) VALUES (?,?)");
                    stmt.run(author.get('name'), author.get('gaid'));

                    break;
                case ('2'):

                    /* It is a local author, update  */

                    var stmt = Database.user_db.prepare("UPDATE Authors SET name = ? WHERE author_id = ?");
                    stmt.run(author.get('name'), author.get('aid'));

                    break;
                case ('0'):

                    /* New author, create */

                    var stmt = Database.user_db.prepare("INSERT INTO Authors (name, global_author_id) VALUES (?,?)");
                    stmt.run(author.get('name'), '0');

                    break;
                default:
                    win.error('Unknown author`s DB');
                    return;

            }


        }

    };

    App.Database = Database;

})(window.App);
