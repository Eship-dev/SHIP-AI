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

        formatStatusClass: function (status) {
            if (status === "Open") {
                return "textSuccess";
            } else if (status === "Shipped") {
                return "textWarning";
            } else {
                return "textError";
            }
        }
	};
});