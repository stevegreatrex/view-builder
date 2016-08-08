# view-builder

A node utility to create and update couchdb views

## Installation

    npm install -g view-builder

## Usage

### Command Line (Update)
Updates the views found in the specified database from the specified definitions

    view-builder --url http://localhost:5984/databasename --defs ./path/to/views.js

If omitted, the `defs` parameter will default to a file named `views.js` in the current folder.

This relies on `views.js` containing something like the following:

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

### Updating Existing documents
To avoid accidental rebuilds of entire views, `view-builder` will not automatically overwrite an existing design document (see [#1](https://github.com/stevegreatrex/view-builder/issues/1)).  If this behaviour is required then you can use the `force` flag:

    view-builder --url http://... --force

### Command Line (Generate)
Generates a view definition file based on the views already in the database

    view-builder --url http://localhost:5984/databasename --defs ./path/to/views.js --generate

If omitted, the `defs` parameter will default to a file named `views.js` in the current folder.

### require

    var builder = require("view-builder");
    builder("http://localhost:5984/databasename", "./path/to/views.js");
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

As in the command line example, the second parameter will default to a file named `views.js` in the current folder.