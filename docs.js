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

	exports.design2 = {
		views: {
			view1: {
				map: function () { }
			}
		},
		filters: {
			filter1: function() {}
		}
	};

}(exports));