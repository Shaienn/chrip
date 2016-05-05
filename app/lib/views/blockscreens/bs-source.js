/* Opens directories, check files and provide valid files for using*/


App.View.BlockScreens.Source = Backbone.Marionette.ItemView.extend({
//    template: '#blockscreens-source-tpl',
//    ui: {
//	fakeBackgroundsDir: '#fakebackgroundsdir',
//	blockscreens_path: '#bs-directory-path',
//	sections: 'section',
//    },
//    events: {
//	'change select,input': 'saveSetting',
//	'change #bs-directory-path': 'parseBlockscreensDirectory',
//	'click #change_blockscreens_dir': 'showBlockscreensDirectoryDialog',
//    },
//    showBlockscreensDirectoryDialog: function () {
//	this.ui.blockscreens_path.click();
//    },
//    parseBlockscreensDirectory: function () {
//	var path = this.ui.blockscreens_path.val();
//	var blockscreens_files = Settings.Utils.getBlockscreens(path);
//	this.parseBlockscreensFiles(blockscreens_files).then(function (results) {
//	    results.forEach(function (result) {
//		if (result.state === "fulfilled") {
//
//		    /* Prepared XML of file is here */
//		    
//		    
//		    
//		}
//	    });
//
//	});
//
//    },
//    parseBlockscreensFiles: function (blockscreens_files) {
//
//	var files = [];
//	blockscreens_files.forEach(function (item) {
//
//	    var d = Q.defer();
//
//	    var timeout = setTimeout(function () {
//		d.reject('timeout');
//	    }, 5000);
//
//	    fse.readSync(item.path, function (err, data) {
//
//		if (err) {
//		    d.reject(err);
//		    clearTimeout(timeout);
//		    
//		}
//
//		var parser = new xml2js.Parser();
//		parser.parseString(data, function (err, result) {
//		    if (err) {
//			d.reject(err);
//			clearTimeout(timeout);
//		    }
//
//		    d.resolve(result);
//		    clearTimeout(timeout);
//		});
//
//
//		files.push(d.promise);
//	    });
//
//	});
//
//	return Q.allSettled(files);
//    }
});