sap.ui.define([
    "sap/ui/core/format/DateFormat"
], (DateFormat) => {
	"use strict";

	return {
		formatDate: function (sDate) {
            if (!sDate) return "";  // Handle null/empty date values

            var oDateFormat = DateFormat.getInstance({ pattern: "dd MMM yyyy" });
            return oDateFormat.format(new Date(sDate));
        },

        weightState(fValue) {
			try {
				fValue = parseFloat(fValue);
				if (fValue === "") {
					return None;
				} else if (fValue === "Open") {
					return Success;
				} else if (fValue === "Shipped") {
					return Error;
				}
			} catch (err) {
				return None;
			}
		}
	};
});