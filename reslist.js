var args = require("minimist")(process.argv.slice(2))._;

var fs = require("fs");
var directory_tree = require("directory-tree");
var jsonfile = require("jsonfile");
var colors = require("colors");
var configPath = args[0];

var dirSeparator = ".";
var filePrefix = "::";

jsonfile.readFile(configPath, function(err, obj){
	if (err){
		console.log("RESLIST".blue, err.code, err);
	} else {
		run(obj);
	}
});

function run(config){
	if (config.dirSeparator) dirSeparator = config.dirSeparator;
	if (config.filePrefix)   filePrefix   = config.filePrefix;

	var tasks = config.tasks;

	for (var k in tasks){
		make(tasks[k].output, k, tasks[k].extensions, {
			readFile 				: JSON.parse(tasks[k].readFile || "false"),
			noName 					: JSON.parse(tasks[k].noName || "false"),
			extensionInName : JSON.parse(tasks[k].extensionInName || "false"),
			extensionInPath : JSON.parse(tasks[k].extensionInPath || "true"),
			trim						: JSON.parse(tasks[k].trim || "false"),
			outputType : tasks[k].output.split(".")[1]
		})
	}

};

/*template*/
/*---------------------------------------------------------------------------------*/
function superTrim(input){
	input = input.replace(/\s\s+/g, " ");
	input = input.replace(/(\r\n|\n|\r)/gm,"");
	input = input.trim();
	return input;
}

function writeJSON(path, data){
	jsonfile.writeFile(path, data, {spaces: 4}, function(err){
	  	console.log("RESLIST".blue, path.red, "done".yellow, "[" + data.size.toString().green, "bytes".green + "]");
	});
}

function writeJS(path, data){
	//console.log(path, data);

	var fileData = '!function(e,o){if("function"==typeof define&&define.amd)define(o);else if("object"==typeof module&&module.exports)module.exports=o(!0);else{var i=o(),n=new i;window.clavis=n}}(this,function(){ return ' + JSON.stringify(data) + '});'

	fs.writeFile(path, fileData, function (err) {
	  	if (err) {
	    	return console.log(err);
	  	}
	  	console.log("RESLIST".blue, path.red, "done".yellow, "[" + data.size.toString().green, "bytes".green + "]");
	});
}

function make(/*str*/outputPath, /*str*/path, /*arr*/exts, /*obj*/options){
	var tree = directory_tree(path);

	if (!tree){
		console.log("RESLIST".blue, "no such directory".red, path.yellow);
		return;
	}

	var result = {
		content  : {},
		size  : 0,
		count : 0,
		total : countFiles(tree, exts)
	};

	var outputType = outputPath.split(".")[1];

	result = filterIteration(options, tree, exts, result, function(data){
		switch(outputType){
			case "json":
				writeJSON(outputPath, data);
			break;
			case "js":
				writeJS(outputPath, data);
			break;
		}
	});

	//console.dir(tree);
}

function filterIteration(/*obj*/options, /*obj*/dir, /*arr*/exts, /*obj*/target, /*func*/onComplete){
	var item;

	for (var a = 0, l = dir.children.length; a < l; a++){
		item = dir.children[a];

		if (item.extension && fileMatches(item, exts)){

			if (options.readFile){

				if (options.outputType == "js"){
					jsonfile.readFile(item.path, function(err, obj){
						var name = options.extensionInName ? this.name : removeExtension(this);
						var path = cvrtPath(this);


						target.count++;
						target.size += item.size;

						if (options.noName == true){
							target.content[path + "." + name] = obj;
						} else {
							target.content[path + "::" + name] = obj;
						}


						if (target.total == target.count){
							delete target.count;
							onComplete(target);
						}
					}.bind(item));
				} else {
					fs.readFile(item.path, "utf8", function(err, data) {
						var name = options.extensionInName ? this.name : removeExtension(this);
						var path = cvrtPath(this);

						if (options.trim){
							data = superTrim(data);
						}

						target.count++;
						target.size += item.size;

						if (options.noName == true){
							target.content[path + "." + name] = data;
						} else {
							target.content[path + "::" + name] = data;
						}


						if (target.total == target.count){
							delete target.count;
							onComplete(target);
						}

					}.bind(item));
				}				

			} else {
				var name = options.extensionInName ? item.name : removeExtension(item);
				var path = cvrtPath(item);

				target.count++;
				target.size += item.size;

				if (options.noName == true){
					target.content[path + "." + name] = formatPath(item, options.extensionInPath);
				} else {
					target.content[path + "::" + name] = formatPath(item, options.extensionInPath);
				}


				if (target.total == target.count){
					delete target.count;
					onComplete(target);
				}
			}

		} else if (item.children){
			target = filterIteration(options, item, exts, target, onComplete);
		}
	}

	return target;
}

function fileMatches(file, exts){
	var ext = file.extension.split(".")[1];
	return exts.indexOf(ext) > -1;
}

function removeExtension(file){
	return file.name.replace(file.extension, "");
}

function cvrtPath(file){
	var path = file.path;
	path = path.replace(file.name, "");
	path = path.replace("assets\\", "");
	path = path.replace(/\\/g, ".");
	path = path.substring(0, path.length - 1);
	return path;
}

function formatPath(file, includeExt){
	var path = file.path;
	if (includeExt === false){
		path = path.replace(file.extension, "");
	}

	return path.replace(/\\/g, "/");
}

function countFiles(dir, exts){
	var result = 0, item;

	for (var a = 0, l = dir.children.length; a < l; a++){
		item = dir.children[a];

		if (item.extension && fileMatches(item, exts)){
			result++;
		} else if (item.children){
			result += countFiles(item, exts);
		}

	}

	return result;
}
/*---------------------------------------------------------------------------------*/
