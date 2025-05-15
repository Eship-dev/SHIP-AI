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
                return "01/01/1970";
            }
            
            if(sDate && sDate.length === 8){
                const year = sDate.slice(0, 4);
                const month = sDate.slice(4, 6) - 1; // Months are zero-indexed in JavaScript
                const day = sDate.slice(6, 8);
                sDate =  new Date(year, month, day);
            }
            let oDate = new Date(sDate);
            let oDateFormat = DateFormat.getDateInstance({ pattern: "MM/dd/yyyy" });
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
        },

        carrierDisplay:function(sCarrier){
            if(sCarrier && sCarrier.toUpperCase() === "FEDEX"){
                return "FedEx";
            }else{
                return sCarrier;
            }
        },

        formatCustomDateTimeForOrders: function (sDateStr) {
            if (!sDateStr) return "";
      
            // Convert the string to a Date object
            var oDate = new Date(sDateStr);
      
            // Extract components
            var iDay = oDate.getDate();
            var iMonth = oDate.getMonth() + 1; // Months are 0-based
            var iYear = oDate.getFullYear();
            var iHours = oDate.getHours();
            var iMinutes = oDate.getMinutes();
      
            // Pad single digits with leading zeros
            var sDay = iDay < 10 ? "0" + iDay : iDay;
            var sMonth = iMonth < 10 ? "0" + iMonth : iMonth;
            var sHours = iHours < 10 ? "0" + iHours : iHours;
            var sMinutes = iMinutes < 10 ? "0" + iMinutes : iMinutes;
      
            // Format: MM/DD/YYYY HH:mm
            return sMonth + "/" + sDay + "/" + iYear + " " + sHours + ":" + sMinutes;
          },
          formatCustomDateShipmentTable: function (sDateStr) {
            if (!sDateStr) return "";
      
            // Convert the string to a Date object
            var oDate = new Date(sDateStr);
      
            // Extract components
            var iDay = oDate.getDate();
            var iMonth = oDate.getMonth() + 1; // Months are 0-based
            var iYear = oDate.getFullYear();
            var iHours = oDate.getHours();
            var iMinutes = oDate.getMinutes();
      
            // Pad single digits with leading zeros
            var sDay = iDay < 10 ? "0" + iDay : iDay;
            var sMonth = iMonth < 10 ? "0" + iMonth : iMonth;
            var sHours = iHours < 10 ? "0" + iHours : iHours;
            var sMinutes = iMinutes < 10 ? "0" + iMinutes : iMinutes;
      
            // Format: MM/DD/YYYY
            return sMonth + "/" + sDay + "/" + iYear;
          },

          getCarrierIconClass: function (sCarrierType) {
            switch (sCarrierType) {
              case "UPS":
                return "greenColorForIcon";
              case "FedEx":
                return "redColorForIcon";
              case "ABFS":
                return "yellowColorForIcon";
            }
          },

          getDeliveryStatusClass: function (sStatus) {
			if (sStatus === "Shipped") {
				return "greenColorForIcon";
			} else if (sStatus === "Cancelled") {
				return "redColorForIcon";
			}
			return "";
		},

        formatShipmentType:function(shipType){
            if(shipType === "SHIP"){
                return "Shipped";
            }else if(shipType === "CANC"){
                return "Cancelled";
            }
        }
	};
});