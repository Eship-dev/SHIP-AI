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

            var oDateFormat = DateFormat.getInstance({ pattern: "MM/dd/yyyy" });
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
                return "01/01/70 (Thu)";
            }
            
            if(sDate && sDate.length === 8){
                const year = sDate.slice(0, 4);
                const month = sDate.slice(4, 6) - 1; // Months are zero-indexed in JavaScript
                const day = sDate.slice(6, 8);
                sDate =  new Date(year, month, day);
            }
            let oDate = new Date(sDate);
            let oDateFormat = DateFormat.getDateInstance({ pattern: "d/MM/yy (EEE)" });
            return oDateFormat.format(oDate);
        },

		getTransitDays: function (sDate) {
            // if (!sDate) {
            //     return "";
            // }
            // let oTargetDate = new Date(sDate);
            // let oToday = new Date();
            // oToday.setHours(0, 0, 0, 0);
            // oTargetDate.setHours(0, 0, 0, 0);
            // let iDiff = Math.round((oTargetDate - oToday) / (1000 * 60 * 60 * 24));
            // return iDiff;
			const today = new Date();
			const expectedDate = new Date(sDate);
			const timeDiff = expectedDate.getTime() - today.getTime();
			const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
			return dayDiff > 0 ? dayDiff : 5;
        },

        getHBoxStyleClass: function(sMethod, sService) {
            return (sMethod || sService) ? "blueBackground" : "whiteBackground";
        }
	};
});