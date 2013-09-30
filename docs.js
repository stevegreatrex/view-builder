/*global exports:true*/
(function (exports) {

	exports.design = {
		views: {
			view1: {
				map: function (doc) { emit(doc.id, null); }
			},

			view2: {
				map: function () { },
				reduce: function () { }
			}
		}
	};

	exports.designDocumentName = {
		views: {
			viewName: {
				map: function () { }
			}
		},
		filters: {
			filterName: function() {}
		}
	};

}(exports));