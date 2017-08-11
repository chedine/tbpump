import * as db from "./db";
// db.main();


function simulateDB(input, cb) {

    setTimeout(function () {
        cb(input * 3);
    }, 3000);
}

function simResponse(input, cb) {
    setTimeout(function () {
        cb(input * 3);
        //return input * 3;
    }, 600);
}

function simWrite(input, cb) {
    setTimeout(function () {
        cb(input * 3);
    }, 200);
}

function waterfall(inputs) {
    var results = [];

    for (var i = 0; i < inputs.length; i++) {
        function filesAvailable(input) {
            results.push(input);

            if (results.length == inputs.length) {
                console.log("done with " + results);

                var f = function (result) {
                    console.log("Complete with " + result);
                    var r = results.shift();
                    if (r) {
                        simulateDB(r, f);
                    }
                    else {
                        console.log("done");
                    }
                }
                simulateDB(results.shift(), f);

                //return results;
            }
        }
        var writer = function (input) {

            simWrite(input, filesAvailable);
        }
        var resp = simResponse(inputs[i], writer);
        console.log("Response for " + i + " = " + resp);
    }
}

waterfall([1, 2, 3]);

