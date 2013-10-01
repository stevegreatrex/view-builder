/*global exports:true*/
(function (designDocuments) {

	designDocuments.designDocumentName = {
		views: {
			viewName: {
				map: function () { }
			}
		},
		filters: {
			filterName: function() {}
		}
	};

	designDocuments.design2 = {
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

}(exports || (window.designDocuments = {})));