'use strict';
(function (App) {


    App.Update = {
	client: null,
	init: function () {
	    App.vent.on("update:run_update", _.bind(this.runUpdate, this));

	    this.client = restify.createJsonClient({
		url: Settings.GeneralSettings.updateServer
	    });

	    this.sendSongsForApprove();
	    this.runPeriodicalCheck();
	},
	runPeriodicalCheck: function () {
	    var that = this;
	    (function p() {
		_.bind(that.runCheckUpdate, that)().done(function (res) {

		    if (res == true) {
			that.runUpdate();
		    } else {
			setTimeout(p, Settings.GeneralSettings.update_period);
		    }

		}, function (err) {
		    win.error(err);
		    setTimeout(p, Settings.GeneralSettings.update_period);
		});
	    })();
	},
	runCheckUpdate: function () {
	    var d = Q.defer();
	    this.client.get('/api/songbase/get_version', function (err, req, res, obj) {

		if (err) {
		    win.error(err);
		    d.reject(err);
		}

		win.log(obj);

		if ((typeof obj != "undefined") && (typeof obj.version != "undefined") && (obj != false)) {
		    if (obj.version != Settings.Config.songbase_version) {
			win.log("Server has: " + obj.version + " but application has: " + Settings.Config.songbase_version);
			d.resolve(true);
		    } else {
			win.log("Server has: " + obj.version + " and application has: " + Settings.Config.songbase_version);
			d.resolve(false);
		    }
		} else {
		    d.reject("Wrong server answer");
		}
	    });
	    return d.promise;
	},
	runUpdate: function () {
	    var d = Q.defer();
	    var that = this;

	    /* Download file */

	    var basePath = Settings.Config.tmpPath;
	    fse.emptyDirSync(basePath);
	    var dest = basePath + '/global.db';
	    var file = fse.createOutputStream(dest);

	    http.get(Settings.GeneralSettings.updateServer + '/api/songbase/get_database', function (response) {
		response.pipe(file);
		file.on('finish', function () {
		    file.close(function () {

			win.info("Download finished. Copy to source location");

			App.Database.close()
				.then(
					function () {
					    win.log("Copying to " + App.Config.runDir + Settings.GeneralSettings.global_db);
					    try {
						fse.copySync(dest, App.Config.runDir + Settings.GeneralSettings.global_db, {clobber: true});
					    } catch (err) {
						win.error('Copying got an error: ', err, err.stack);
					    }
					    App.Database.init().then(function () {
						that.runPeriodicalCheck();
					    });
					});
		    });
		});
	    }).on('error', function (err) { // Handle errors
		fse.unlink(dest);
		win.error(err);
		throw new Error(err);
	    });
	    return d.promise;
	},
	sendSongsForApprove: function () {
	    var that = this;
	    App.Database.getSongsForApprove().then(
		    function (res) {
			for (var i = 0; i < res.length; i++) {

			    var song = res[i];
			    song.mac = Settings.Config.mac;
			    console.log(song);
			    that.client.post('/api/song/add', song, function (err, req, res, obj) {
				
				if (err) {
				    win.error(err);
				    throw new Error(err);
				}

				if (typeof obj.approve != "undefined") {
				    App.Database.removeSongForApprove(obj.approve);
				}
			    });
			}
		    }
	    );
	}
    }
})(window.App);

