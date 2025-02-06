sap.ui.define([
    "sap/ui/core/format/DateFormat"
], (DateFormat) => {
	"use strict";

	return {
		/**
         * Formats a date to "d/MM/yy (EEE)"
         * Example: "2/12/25 (Wed)"
         * @param {string|Date} sDate - The date to format
         * @returns {string} - Formatted date string
         */
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
		},

		formatEstimatedDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            let oDate = new Date(sDate);
            let oDateFormat = DateFormat.getDateInstance({ pattern: "d/MM/yy (EEE)" });
            return oDateFormat.format(oDate);
        },

		calculateDaysDifference: function (sDate) {
            if (!sDate) {
                return "";
            }
            let oTargetDate = new Date(sDate);
            let oToday = new Date();
            oToday.setHours(0, 0, 0, 0);
            oTargetDate.setHours(0, 0, 0, 0);
            let iDiff = Math.round((oTargetDate - oToday) / (1000 * 60 * 60 * 24));
            return iDiff;
        }
	};
});