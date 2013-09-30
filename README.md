# view-builder

A node utility to create and update couchdb views

## Usage

### Command Line

    node builder.js "http://localhost:5984/databasename" "./path/to/config.js"

This relies on `config.js` containing something like the following:

    exports.designDocumentName = {
        views: {
            viewName: {
                map: function () { }
            }
        },
        filters: {
            filter1: function() {}
        }
    };

The config file can contain multiple design documents, each of which can contain multiple views and filters.

### require

    var builder = require("./builder.js");
    builder("http://localhost:5984/databasename", "./path/to/config.js");
    // or...
    builder("http://localhost:5984/databasename", {
        designDocumentName = {
            views: {
                viewName: {
                    map: function () { }
                }
            },
            filters: {
                filter1: function() {}
            }
        }
    });