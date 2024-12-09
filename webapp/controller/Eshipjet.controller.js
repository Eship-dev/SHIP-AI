sap.ui.define([
    "sap/ui/Device",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Popover",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/m/Dialog",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/Fragment",
    "sap/ui/export/Spreadsheet",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Device, Controller, JSONModel, Popover, Button, library, MessageToast, BusyIndicator, Dialog, DateFormat, Fragment, Spreadsheet, formatter, Filter, FilterOperator) {
    "use strict";

    var ButtonType = library.ButtonType,
        PlacementType = library.PlacementType,
        oController, oResourceBundle;

    return Controller.extend("com.eshipjet.zeshipjet.controller.Eshipjet", {
        Formatter: formatter,
        onInit: function () {
            var oModel = new JSONModel(sap.ui.require.toUrl("com/eshipjet/zeshipjet/model/data.json"));
            this.getView().setModel(oModel);
            oController = this;
            // Initialize a JSON model to store chat messages
            var obj = {
                "messages": [],
                "listState": false,
                "iconState": true
            }
            const oShipperCopilotModel = new JSONModel(obj);
            this.getView().setModel(oShipperCopilotModel, "ShipperCopilotModel");
            oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this._setToggleButtonTooltip(!Device.system.desktop);
        },

        // _handleDisplayScanShipTable: function () {
        //     var oController = this;
        //     const oView = oController.getView();
        //     var eshipjetModel = oController.getView().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
        //     var scanShipTableData = eshipjetModel.getData().scanShipTableData;
        //     var ScanShipTableDataModel = new JSONModel(scanShipTableData);
        //     this.getView().setModel(ScanShipTableDataModel, "ScanShipTableDataModel");
        //     const oTable = oView.byId("idScanAndShipTable");
        //     oTable.setModel(ScanShipTableDataModel);
        //     oTable.bindColumns("/columns", function (sId, oContext) {
        //         columnName = oContext.getObject().name;
        //         label = oContext.getObject().label;

        //         if (columnName === "actions") {
        //             var oHBox = new sap.m.HBox({}); // Create Text instance 
        //             var Link1 = new sap.m.Link({ text: "View Now" });
        //             var Link2 = new sap.m.Link({ endIcon: "sap-icon://navigation-down-arrow" });
        //             oHBox.addItem(Link1);
        //             oHBox.addItem(Link2);
        //             return new sap.ui.table.Column({
        //                 label: oResourceBundle.getText(columnName),
        //                 template: oHBox,
        //                 visible: oContext.getObject().visible,
        //                 width: "8rem",
        //                 sortProperty: columnName
        //             });
        //         } else {
        //             return new sap.ui.table.Column({
        //                 label: oResourceBundle.getText(columnName),
        //                 template: columnName,
        //                 visible: oContext.getObject().visible,
        //                 width: "8rem",
        //                 sortProperty: columnName
        //             });
        //         }

        //     });
        //     oTable.bindRows("/rows");
        // },

        onItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var sKey = oItem.getKey();
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");

            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(false);

            if (sKey === "ShipperCopilot") {
                var obj = {
                    "messages": [],
                    "listState": false,
                    "iconState": true
                }
                const oShipperCopilotModel = new JSONModel(obj);
                this.getView().setModel(oShipperCopilotModel, "ShipperCopilotModel");
            } else if (sKey === "ScanShip") {
                // var oModel = {
                //     "items": [],
                //     "SASTableLength": 0
                // };
                // var oModel = new JSONModel(oModel);
                // this.getView().setModel(oModel, "oModel");
                this._handleDisplayScanShipTable();
            } else if (sKey === "Orders") {
                this._handleDisplayOrdersTable();
            } else if (sKey === "ShipRequestLabel") {
                this._handleDisplayShipReqTable();
            } else if (sKey === "QuoteNow") {

            }else if (sKey === "TrackNow") {
                this._handleDisplayTrackNowTable();
            } else if (sKey === "Manifest") {
                this._handleDisplayManifestTable();
            } else if (sKey === "AESDirect") {

            } else if (sKey === "Dashboard") {

            } else if (sKey === "Reports") {

            } else if (sKey === "Reports") {

            } else if (sKey === "BatchShip") {
                this._handleDisplayBatchShipTable();
            }


            eshipjetModel.setProperty("/SideNavigation", false);
            this.byId("pageContainer").to(this.getView().createId(sKey));
        },

        handleUserNamePress: function (event) {
            var oPopover = new Popover({
                showHeader: false,
                placement: PlacementType.Bottom,
                content: [
                    new Button({
                        text: 'Feedback',
                        type: ButtonType.Transparent
                    }),
                    new Button({
                        text: 'Help',
                        type: ButtonType.Transparent
                    }),
                    new Button({
                        text: 'Logout',
                        type: ButtonType.Transparent
                    })
                ]
            }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');

            oPopover.openBy(event.getSource());
        },

        onSideNavButtonPress: function () {
            var oToolPage = this.byId("toolPage");
            var bSideExpanded = oToolPage.getSideExpanded();

            this._setToggleButtonTooltip(bSideExpanded);
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            var SideNavigation = eshipjetModel.getProperty("/SideNavigation");
            if (SideNavigation === true) {
                eshipjetModel.setProperty("/SideNavigation", false);
            } else if (SideNavigation === false) {
                eshipjetModel.setProperty("/SideNavigation", true);
            }

            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },

        _setToggleButtonTooltip: function (bLarge) {
            var oToggleButton = this.byId('sideNavigationToggleButton');
            if (bLarge) {
                oToggleButton.setTooltip('Large Size Navigation');
            } else {
                oToggleButton.setTooltip('Small Size Navigation');
            }
        },

        // shipper Copilot changes start

        onSendPress: async function () {
            BusyIndicator.show();
            const oShipperCopilotModel = this.getView().getModel("ShipperCopilotModel");
            const sUserMessage = this.getView().byId("userInput").getValue();
            if (!sUserMessage) {
                MessageToast.show("Please enter a message.");
                return;
            }

            oShipperCopilotModel.setProperty("/iconState", false);
            oShipperCopilotModel.setProperty("/listState", true);

            // Add the user's message to the chat list
            const aMessages = oShipperCopilotModel.getProperty("/messages");
            aMessages.push({ sender: "You", text: sUserMessage });
            oShipperCopilotModel.setProperty("/messages", aMessages);
            this.getView().byId("userInput").setValue("");

            // Simulate a bot response after sending the user message
            try {
                const sResponse = await this._simulateBotResponse(sUserMessage);
                var aShippinDocs = sResponse.shippingDocuments;
                var aLabel = aShippinDocs.filter((obj) => obj.contentType === "Label");
                var sLabel;
                if (aLabel.length !== 0 && aLabel !== undefined) {
                    sLabel = aLabel[0].encodedLabel;
                    var dataUrl = "data:image/png;base64," + sLabel;
                    aMessages.push({ sender: "Bot", text: dataUrl });
                    oShipperCopilotModel.setProperty("/messages", aMessages);
                    BusyIndicator.hide();
                } else {
                    var aError = sResponse.Errors;
                    if (aError.length !== 0) {
                        aMessages.push({ sender: "BotError", text: aError[0] });
                        oShipperCopilotModel.setProperty("/messages", aMessages);
                        BusyIndicator.hide();
                    }
                }

            } catch (error) {
                if (error.responseText !== undefined) {
                    aMessages.push({ sender: "BotError", text: error.responseText });
                    oShipperCopilotModel.setProperty("/messages", aMessages);
                }
                //MessageToast.show("Error communicating with Copilot.");
                BusyIndicator.hide();
            }
        },

        // Simulate bot response for testing purposes
        _simulateBotResponse: function (sMessage) {
            var obj = {
                "message": sMessage // Match DeliveryNo in the message if needed
            }
            var sPath = "https://eshipjet-demo-srv-hvacbxf0fqapdpgd.francecentral-01.azurewebsites.net/copilot/v1/bot/process";

            return new Promise((resolve, reject) => {
                $.ajax({
                    url: sPath, // Replace with your API endpoint
                    method: "POST",
                    contentType: "application/json", // Set content type to JSON if sending JSON data
                    data: JSON.stringify(obj),
                    success: function (response) {
                        // Handle successful response
                        resolve(response);
                        console.log("Success:", response);
                    },
                    error: function (error) {
                        // Handle error
                        reject(error);
                        console.log("Error:", error);
                    }
                });
            });
        },

        onZoomImage: function (oEvent) {
            var dataUrl = oEvent.getSource().getBindingContext("ShipperCopilotModel").getObject().text
            // Create a dialog if it does not exist
            if (!this._oDialog) {
                this._oDialog = new Dialog({
                    title: "Ship Image",
                    contentWidth: "30%", // Adjust width as needed
                    contentHeight: "80%", // Adjust height as needed
                    content: new sap.m.Image({
                        class: "sapUiSmallMargin",
                        src: dataUrl,
                        width: "100%", // Full width of dialog content
                        height: "100%"
                    }),
                    endButton: new sap.m.Button({
                        text: "Close",
                        press: function () {
                            this._oDialog.close();
                        }.bind(this)
                    })
                });
            }
            // Open the dialog
            this._oDialog.open();
        },

        // Shipper Copilot Changes end

        // Ship Now changes starts here

        onShipNowGetPress: async function () {
            var that = this;
            BusyIndicator.show();
            const sUserMessage = this.getView().byId("idShipNowSearch").getValue();
            if (!sUserMessage) {
                MessageToast.show("Please Enter Request ID.");
                BusyIndicator.hide();
                return;
            }
            this.getView().byId("idShipNowSearch").setValue("");
            var obj = {
                "message": "ship " + sUserMessage // Match DeliveryNo in the message if needed
            }
            var sPath = "https://eshipjet-demo-srv-hvacbxf0fqapdpgd.francecentral-01.azurewebsites.net/copilot/v1/bot/process";

            return new Promise((resolve, reject) => {
                $.ajax({
                    url: sPath, // Replace with your API endpoint
                    method: "POST",
                    contentType: "application/json", // Set content type to JSON if sending JSON data
                    data: JSON.stringify(obj),
                    success: function (response) {
                        var ShipNowDataModel = new JSONModel();
                        that.getView().setModel(ShipNowDataModel, "ShipNowDataModel");
                        var obj = {
                            "sapShipmentID": response.HeaderInfo.DocumentNumber,
                            "ShipFromCONTACT": response.ShipFrom.CONTACT,
                            "ShipFromCOMPANY": response.ShipFrom.COMPANY,
                            "ShipFromPHONE": response.ShipFrom.PHONE,
                            "ShipFromEMAIL": response.ShipFrom.EMAIL,
                            "ShipFromCITY": response.ShipFrom.CITY,
                            "ShipFromSTATE": response.ShipFrom.STATE,
                            "ShipFromCOUNTRY": response.ShipFrom.COUNTRY,
                            "ShipFromZIPCODE": response.ShipFrom.ZIPCODE,
                            "ShipFromADDRESS_LINE1": response.ShipFrom.ADDRESS_LINE1,
                            "ShipFromADDRESS_LINE2": response.ShipFrom.ADDRESS_LINE2,
                            "ShipFromADDRESS_LINE3": response.ShipFrom.ADDRESS_LINE3,

                            "ShipToCONTACT": response.ShipTo.CONTACT,
                            "ShipToCOMPANY": response.ShipTo.COMPANY,
                            "ShipToPHONE": response.ShipTo.PHONE,
                            "ShipToEMAIL": response.ShipFrom.EMAIL,
                            "ShipToCITY": response.ShipTo.CITY,
                            "ShipToSTATE": response.ShipTo.STATE,
                            "ShipToCOUNTRY": response.ShipTo.COUNTRY,
                            "ShipToZIPCODE": response.ShipTo.ZIPCODE,
                            "ShipToADDRESS_LINE1": response.ShipTo.ADDRESS_LINE1,
                            "ShipToADDRESS_LINE2": response.ShipTo.ADDRESS_LINE2,
                            "ShipToADDRESS_LINE3": response.ShipTo.ADDRESS_LINE3
                        }

                        ShipNowDataModel.setData(obj);
                        ShipNowDataModel.updateBindings(true);
                        // eshipjetModel.setProperty("/scanShipTableData/ScanShipTableLength", rows.length);
                        // Handle successful response
                        BusyIndicator.hide();
                        resolve(response);
                        console.log("Success:", response);
                    },
                    error: function (error) {
                        // Handle error
                        BusyIndicator.hide();
                        reject(error);
                        console.log("Error:", error);
                    }
                });
            });
        },

        // Ship Now Changes End here


        // Scan & Ship Code Changes Start

        _handleDisplayScanShipTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getView().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var scanShipTableData = eshipjetModel.getData().scanShipTableData;
            var ScanShipTableDataModel = new JSONModel(scanShipTableData);
            this.getView().setModel(ScanShipTableDataModel, "ScanShipTableDataModel");
            const oTable = oView.byId("idScanAndShipTable");
            oTable.setModel(ScanShipTableDataModel);
            oTable.bindColumns("/columns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                if (columnName === "actions") {
                    var oHBox = new sap.m.HBox({}); // Create Text instance 
                    var Btn1 = new sap.m.Button({ text: "Ship Now", type: "Transparent" });
                    var Btn2 = new sap.m.Button({
                        icon: "sap-icon://megamenu", type: "Transparent",
                        press: function (oEvent) {
                            that.handleDownArrowPress(oEvent);
                        }
                    });
                    oHBox.addItem(Btn1);
                    oHBox.addItem(Btn2);
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oHBox,
                        visible: oContext.getObject().visible,
                        width: "8rem",
                        sortProperty: columnName
                    });
                } else if (columnName === "CreatedDate" || columnName === "ShipDate") {
                    var DateTxt = new sap.m.Text({
                        text: {
                            path: 'ScanShipTableDataModel>ShipDate',
                            formatter: formatter.formatDate  // Attach the formatter dynamically
                        },
                        wrapping: false
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: "10rem",
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: "10rem",
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/rows");
        },

        openScanShipColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pScanPopover) {
                this._pScanPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ScanShipTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pScanPopover.then(function (oPopover) {
                oController.ScanShipColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        ScanShipColumnsVisiblity: function () {
            var oView = oController.getView();
            var oScanTableModel = oView.getModel("eshipjetModel");
            var aColumns = oScanTableModel.getProperty("/scanShipTableData/columns");
            var oScanTable = oView.byId("myScanColumnSelectId");
            var aTableItems = oScanTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("ScanShipTableDataModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onScanShipColSelectOkPress: function () {
            var oView = this.getView()
            var oScanTable = oView.byId("myScanColumnSelectId");
            var ScanShipTableDataModel = oView.getModel("ScanShipTableDataModel");
            var oScanTblItems = oScanTable.getItems();
            var aColumnsData = ScanShipTableDataModel.getProperty("/columns");
            oScanTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("ScanShipTableDataModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }

                })
            });
            ScanShipTableDataModel.updateBindings(true);
            this._pScanPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onScanShipColSelectClosePress: function () {
            this._pScanPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onScanShipColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myScanColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onScanShipSearchPress: async function () {
            var that = this;
            BusyIndicator.show();
            const sUserMessage = this.getView().byId("userscanShipInput").getValue();
            if (!sUserMessage) {
                MessageToast.show("Please Enter Request ID.");
                BusyIndicator.hide();
                return;
            }
            this.getView().byId("userscanShipInput").setValue("");
            var obj = {
                "message": "ship " + sUserMessage // Match DeliveryNo in the message if needed
            }
            var sPath = "https://eshipjet-demo-srv-hvacbxf0fqapdpgd.francecentral-01.azurewebsites.net/copilot/v1/bot/process";

            return new Promise((resolve, reject) => {
                $.ajax({
                    url: sPath, // Replace with your API endpoint
                    method: "POST",
                    contentType: "application/json", // Set content type to JSON if sending JSON data
                    data: JSON.stringify(obj),
                    success: function (response) {
                        var ScanShipTableDataModel = that.getView().getModel("ScanShipTableDataModel");

                        var obj = {
                            "sapShipmentID": response.HeaderInfo.DocumentNumber,
                            "CreatedDate": response.HeaderInfo.CreatedDate,
                            "ShipDate": response.HeaderInfo.ShipDate,
                            "ShipmentType": response.HeaderInfo.ShipmentType,
                            "shipMethod": response.CarrierDetails.Carrier,
                            "ServiceName": response.CarrierDetails.ServiceName,
                            "TrackingNumber": response.Packages[0].TrackingNumber,
                            "status": response.status,
                            "ShipToContact": response.ShipTo.CONTACT,
                            "ShipToCompany": response.ShipTo.COMPANY,
                            "ShipToAddressLine1": response.ShipTo.ADDRESS_LINE1,
                            "shipToCity": response.ShipTo.CITY,
                            "shipToState": response.ShipTo.STATE,
                            "shipToCountry": response.ShipTo.COUNTRY,
                            "shipToZipcode": response.ShipTo.ZIPCODE,
                            "shipToPhone": response.ShipTo.PHONE,
                            "shipToEmail": response.ShipTo.EMAIL,
                            "requesterName": response.ShipFrom.EMAIL,
                            "connectedTo": "Ship Request / Label",
                            "orderType": response.HeaderInfo.DocumentType,
                            "actions": "Ship Now",
                            "downArrow": "sap-icon://megamenu",
                            "encodedLabel": "data:image/png;base64," + response.shippingDocuments[0].encodedLabel
                        }

                        // that.encodedLabel = obj.encodedLabel;
                        var rows = ScanShipTableDataModel.getData().rows;
                        rows.push(obj);
                        ScanShipTableDataModel.updateBindings(true);
                        // eshipjetModel.setProperty("/scanShipTableData/ScanShipTableLength", rows.length);
                        // Handle successful response
                        BusyIndicator.hide();
                        resolve(response);
                        console.log("Success:", response);
                    },
                    error: function (error) {
                        // Handle error
                        BusyIndicator.hide();
                        reject(error);
                        console.log("Error:", error);
                    }
                });
            });
        },

        scanShipFilterPopoverPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pPopover) {
                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ScanShipFilterPopover",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    // oPopover.bindElement("/ProductCollection/0");
                    return oPopover;
                });
            }
            this._pPopover.then(function (oPopover) {
                oPopover.openBy(oButton);
            });
        },

        onScanShipFilterClosePress: function (oEvent) {
            this.byId("idScanAndShipPopover").close();
        },
        onScanShipFilterResetPress: function (oEvent) {
            this.byId("idScanAndShipPopover").close();
        },
        onScanShipFilterApplyPress: function (oEvent) {
            this.byId("idScanAndShipPopover").close();
        },

        onScanShipExportToExcel: function () {
            var ScanShipTableDataModel = this.getView().getModel("ScanShipTableDataModel");
            var rows = ScanShipTableDataModel.getProperty("/rows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "SAP Shipment ID", property: "sapShipmentID" },
                        { label: "Created Date", property: "CreatedDate" },
                        { label: "Ship Date", property: "ShipDate" },
                        { label: "Shipment Type", property: "ShipmentType" },
                        { label: "Ship Method", property: "shipMethod" },
                        { label: "Service Name", property: "ServiceName" },
                        { label: "Tracking Number", property: "TrackingNumber" },
                        { label: "Status", property: "status" },
                        { label: "Ship To Contact", property: "ShipToContact" },
                        { label: "Ship To Company", property: "ShipToCompany" },
                        { label: "Ship To Address Line 1", property: "ShipToAddressLine1" },
                        { label: "Ship To City", property: "shipToCity" },
                        { label: "Ship To State", property: "shipToState" },
                        { label: "Ship To Country", property: "shipToCountry" },
                        { label: "Ship to Zipcode", property: "shipToZipcode" },
                        { label: "Ship To Phone", property: "shipToPhone" },
                        { label: "Ship To Email", property: "shipToEmail" },
                        { label: "Requester Name", property: "requesterName" },
                        { label: "Connected To", property: "connectedTo" },
                        { label: "Order Type", property: "orderType" },
                        // { label: "Actions", property: "actions" }
                    ]
                },
                dataSource: rows,
                fileName: 'Shipment_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },




        handleDownArrowPress: function (oEvent) {
            var aPath = oEvent.getSource().getBindingContext().sPath.split("/");
            var idx = parseInt(aPath[aPath.length - 1]);
            var idx = parseInt(aPath[aPath.length - 1]);
            var eshipjetModel = this.getView().getModel("eshipjetModel");
            var scanShipTableData = eshipjetModel.getData().scanShipTableData;
            this.encodedLabel = scanShipTableData.rows[idx].encodedLabel;
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._addPopover) {
                this._addPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ScanAndShipActPopover",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    // oPopover.bindElement("/ProductCollection/0");
                    return oPopover;
                });
            }
            this._addPopover.then(function (oPopover) {
                oPopover.openBy(oButton);
            });
        },

        handleSASActionPress: function (oEvent) {
            var title = oEvent.getSource().mProperties.title;
            if (title === "View") {
                this.handleShowViewLabel();
            }
        },
        handleShowViewLabel: function () {
            var localModel = this.getView().getModel();
            var encodedLabel = this.encodedLabel;
            localModel.setProperty("/encodedLabel", encodedLabel);
            var oView = this.getView();
            if (!this._oDialog) {
                this._oDialog = new Dialog({
                    title: "Ship Image",
                    contentWidth: "30%", // Adjust width as needed
                    contentHeight: "80%", // Adjust height as needed
                    content: new sap.m.Image({
                        class: "sapUiSmallMargin",
                        src: encodedLabel,
                        width: "100%", // Full width of dialog content
                        height: "100%"
                    }),
                    endButton: new sap.m.Button({
                        text: "Close",
                        press: function () {
                            this._oDialog.close();
                        }.bind(this)
                    })
                });
            }
            this._oDialog.open();
        },
        // Scan & Ship Changes End


        // Dashboard Tiles Changes Starts

        onTilePress: function (oEvent) {
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(false);
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            var tileTitle = oEvent.getParameters().domRef.innerText;
            if (tileTitle === "Ship Request/Label") {
                var sKey = "ShipRequestLabel";
                this.byId("pageContainer").to(this.getView().createId(sKey));
            } else if (tileTitle === "Ship Now") {
                var sKey = "ShipNow";                
                this.byId("pageContainer").to(this.getView().createId(sKey));                
            } else if (tileTitle === "Track Now") {
                var sKey = "TrackNow";
                this.byId("pageContainer").to(this.getView().createId(sKey));
            }
            var SideNavigation = eshipjetModel.getProperty("/SideNavigation");
            if (SideNavigation === true) {
                eshipjetModel.setProperty("/SideNavigation", false);
            }

        },

        // Dashboar Tiles Changes End

        // Order Changes Starts

        _handleDisplayOrdersTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getView().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var OrderTableData = eshipjetModel.getData().OrderTableData;
            var OrderTableDataModel = new JSONModel(OrderTableData);
            this.getView().setModel(OrderTableDataModel, "OrderTableDataModel");
            const oTable = oView.byId("idOrdersTable");
            oTable.setModel(OrderTableDataModel);
            oTable.bindColumns("/OrderColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                if (columnName === "actions") {
                    var oHBox = new sap.m.HBox({}); // Create Text instance 
                    var Btn1 = new sap.m.Button({ text: "Edit", type: "Transparent" });
                    var Btn2 = new sap.m.Button({
                        icon: "sap-icon://megamenu", type: "Transparent",
                        press: function (oEvent) {
                            that.handleDownArrowPress(oEvent);
                        }
                    });
                    oHBox.addItem(Btn1);
                    oHBox.addItem(Btn2);
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oHBox,
                        visible: oContext.getObject().visible,
                        width: "8rem",
                        sortProperty: columnName
                    });
                } else if (columnName === "CreatedDate" || columnName === "ShipDate") {
                    var DateTxt = new sap.m.Text({
                        text: {
                            path: 'OrderTableDataModel>ShipDate',
                            formatter: formatter.formatDate  // Attach the formatter dynamically
                        },
                        wrapping: false
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: "10rem",
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: "10rem",
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/rows");
        },

        openOrderColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pOrderPopover) {
                this._pOrderPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.OrderTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pOrderPopover.then(function (oPopover) {
                oController.OrderColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        OrderColumnsVisiblity: function () {
            var oView = oController.getView();
            var oOrderTableModel = oView.getModel("eshipjetModel");
            var aColumns = oOrderTableModel.getProperty("/OrderTableData/OrderColumns");
            var oOrderTable = oView.byId("myOrderColumnSelectId");
            var aTableItems = oOrderTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("OrderTableDataModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },
        onOrderColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myOrderColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onoOrderColSelectOkPress: function () {
            var oView = this.getView()
            var oOrderTable = oView.byId("myOrderColumnSelectId");
            var OrderTableDataModel = oView.getModel("OrderTableDataModel");
            var oOrderTblItems = oOrderTable.getItems();
            var aColumnsData = OrderTableDataModel.getProperty("/OrderColumns");
            oOrderTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("OrderTableDataModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            OrderTableDataModel.updateBindings(true);
            this._pOrderPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onOrderColSelectClosePress: function () {
            this._pOrderPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        onOrdersFilterPopoverPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._orderPopover) {
                this._orderPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.OrderFilterPopover",
                    controller: this
                }).then(function (orderPopover) {
                    oView.addDependent(orderPopover);
                    // orderPopover.bindElement("/ProductCollection/0");
                    return orderPopover;
                });
            }
            this._orderPopover.then(function (orderPopover) {
                orderPopover.openBy(oButton);
            });
        },
        onOrderFilterPopoverClosePress: function () {
            this.byId("idOrdersFilterPopover").close();
        },
        onOrderFilterPopoverResetPress: function () {
            this.byId("idOrdersFilterPopover").close();
        },
        onOrderFilterPopoverApplyPress: function () {
            this.byId("idOrdersFilterPopover").close();
        },
        // Order Changes End

        // Ship Request/Lable Code Changes Starts

        _handleDisplayShipReqTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getView().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var ShipReqTableData = eshipjetModel.getData().ShipReqTableData;
            var ShipReqTableDataModel = new JSONModel(ShipReqTableData);
            this.getView().setModel(ShipReqTableDataModel, "ShipReqTableDataModel");
            const oTable = oView.byId("idShipReqsTable");
            oTable.setModel(ShipReqTableDataModel);
            oTable.bindColumns("/ShipReqColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                if (columnName === "actions") {
                    var oHBox = new sap.m.HBox({}); // Create Text instance 
                    var Btn1 = new sap.m.Button({ text: "View Now", type: "Transparent" });
                    var Btn2 = new sap.m.Button({
                        icon: "sap-icon://megamenu", type: "Transparent",
                        press: function (oEvent) {
                            that.handleDownArrowPress(oEvent);
                        }
                    });
                    oHBox.addItem(Btn1);
                    oHBox.addItem(Btn2);
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oHBox,
                        visible: oContext.getObject().visible,
                        width: "8rem",
                        sortProperty: columnName
                    });
                } else if (columnName === "CreatedDate" || columnName === "ShipDate") {
                    var DateTxt = new sap.m.Text({
                        text: {
                            path: 'ShipReqTableDataModel>ShipDate',
                            formatter: formatter.formatDate  // Attach the formatter dynamically
                        },
                        wrapping: false
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: "10rem",
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: "10rem",
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/rows");
        },

        openShipReqColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pShipReqPopover) {
                this._pShipReqPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipReqTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pShipReqPopover.then(function (oPopover) {
                oController.ShipReqColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        ShipReqColumnsVisiblity: function () {
            var oView = oController.getView();
            var oShipReqTableModel = oView.getModel("eshipjetModel");
            var aColumns = oShipReqTableModel.getProperty("/ShipReqTableData/ShipReqColumns");
            var oShipReqTable = oView.byId("myShipReqColumnSelectId");
            var aTableItems = oShipReqTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("ShipReqTableDataModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onShipReqColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myShipReqColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onoShipReqColSelectOkPress: function () {
            var oView = this.getView()
            var oShipReqTable = oView.byId("myShipReqColumnSelectId");
            var ShipReqTableDataModel = oView.getModel("ShipReqTableDataModel");
            var oShipReqTblItems = oShipReqTable.getItems();
            var aColumnsData = ShipReqTableDataModel.getProperty("/ShipReqColumns");
            oShipReqTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("ShipReqTableDataModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            ShipReqTableDataModel.updateBindings(true);
            this._pShipReqPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onShipReqColSelectClosePress: function () {
            this._pShipReqPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        onShipReqFltrPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            // create popover
            if (!this._shipReqPopover) {
                this._shipReqPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipReqFilterPopover",
                    controller: this
                }).then(function (shipReqPopover) {
                    oView.addDependent(shipReqPopover);
                    // shipReqPopover.bindElement("/ProductCollection/0");
                    return shipReqPopover;
                });
            }
            this._shipReqPopover.then(function (shipReqPopover) {
                shipReqPopover.openBy(oButton);
            });
        },
        onShipReqFilterPopoverClosePress: function () {
            this.byId("idShipReqFilterPopover").close();
        },
        onShipReqFilterPopoverResetPress: function () {
            this.byId("idShipReqFilterPopover").close();
        },
        onShipReqFilterPopoverApplyPress: function () {
            this.byId("idShipReqFilterPopover").close();
        },

        // Ship Request/Lable Code Changes ENd


        // Track Now changes start

        _handleDisplayTrackNowTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getView().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var TrackNowTableData = eshipjetModel.getData().TrackNowTableData;
            var TrackNowTableDataModel = new JSONModel(TrackNowTableData);
            this.getView().setModel(TrackNowTableDataModel, "TrackNowTableDataModel");
            const oTable = oView.byId("idTrackNowTable");
            oTable.setModel(TrackNowTableDataModel);
            oTable.bindColumns("/TrackNowColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                if (columnName === "actions") {
                    var oHBox = new sap.m.HBox({}); // Create Text instance 
                    var Btn1 = new sap.m.Button({ text: "Edit", type: "Transparent" });
                    var Btn2 = new sap.m.Button({
                        icon: "sap-icon://megamenu", type: "Transparent",
                        press: function (oEvent) {
                            that.handleDownArrowPress(oEvent);
                        }
                    });
                    oHBox.addItem(Btn1);
                    oHBox.addItem(Btn2);
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oHBox,
                        visible: oContext.getObject().visible,
                        width: "8rem",
                        sortProperty: columnName
                    });
                } else if (columnName === "CreatedDate" || columnName === "ShipDate") {
                    var DateTxt = new sap.m.Text({
                        text: {
                            path: 'TrackNowTableDataModel>ShipDate',
                            formatter: formatter.formatDate  // Attach the formatter dynamically
                        },
                        wrapping: false
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: "10rem",
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: "10rem",
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/rows");
        },

        openTrackNowColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pTrackNowPopover) {
                this._pTrackNowPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.TrackNowTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pTrackNowPopover.then(function (oPopover) {
                oController.TrackNowColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        TrackNowColumnsVisiblity: function () {
            var oView = oController.getView();
            var oTrackNowTableModel = oView.getModel("eshipjetModel");
            var aColumns = oTrackNowTableModel.getProperty("/TrackNowTableData/TrackNowColumns");
            var oTrackNowTable = oView.byId("myTrackNowColumnSelectId");
            var aTableItems = oTrackNowTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("TrackNowTableDataModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onTrackNowColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myTrackNowColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onoTrackNowColSelectOkPress: function () {
            var oView = this.getView()
            var oTrackNowTable = oView.byId("myTrackNowColumnSelectId");
            var TrackNowTableDataModel = oView.getModel("TrackNowTableDataModel");
            var oTrackNowTblItems = oTrackNowTable.getItems();
            var aColumnsData = TrackNowTableDataModel.getProperty("/TrackNowColumns");
            oTrackNowTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("TrackNowTableDataModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            TrackNowTableDataModel.updateBindings(true);
            this._pTrackNowPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onTrackNowColSelectClosePress: function () {
            this._pTrackNowPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        onTrackNowFilterPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            // create popover
            if (!this._trackNowPopover) {
                this._trackNowPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.TrackNowFilterPopover",
                    controller: this
                }).then(function (trackNowPopover) {
                    oView.addDependent(trackNowPopover);
                    // trackNowPopover.bindElement("/ProductCollection/0");
                    return trackNowPopover;
                });
            }
            this._trackNowPopover.then(function (trackNowPopover) {
                trackNowPopover.openBy(oButton);
            });
        },
        onTrackNowFilterPopoverClosePress: function () {
            this.byId("idTrackNowFilterPopover").close();
        },
        onTrackNowFilterPopoverResetPress: function () {
            this.byId("idTrackNowFilterPopover").close();
        },
        onTrackNowFilterPopoverApplyPress: function () {
            this.byId("idTrackNowFilterPopover").close();
        },

        // Track Now changes End


        // Manifest Changes Starts here

        _handleDisplayManifestTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getView().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var ManifestTableData = eshipjetModel.getData().ManifestTableData;
            var ManifestTableDataModel = new JSONModel(ManifestTableData);
            this.getView().setModel(ManifestTableDataModel, "ManifestTableDataModel");
            const oTable = oView.byId("idManifestTable");
            oTable.setModel(ManifestTableDataModel);
            oTable.bindColumns("/ManifestColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                if (columnName === "actions") {
                    var oHBox = new sap.m.HBox({}); // Create Text instance 
                    var Btn1 = new sap.m.Button({ text: "View Now", type: "Transparent" });
                    var Btn2 = new sap.m.Button({
                        icon: "sap-icon://megamenu", type: "Transparent",
                        press: function (oEvent) {
                            that.handleDownArrowPress(oEvent);
                        }
                    });
                    oHBox.addItem(Btn1);
                    oHBox.addItem(Btn2);
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oHBox,
                        visible: oContext.getObject().visible,
                        width: "8rem",
                        sortProperty: columnName
                    });
                } else if (columnName === "CreatedDate" || columnName === "ShipDate") {
                    var DateTxt = new sap.m.Text({
                        text: {
                            path: 'ManifestTableDataModel>ShipDate',
                            formatter: formatter.formatDate  // Attach the formatter dynamically
                        },
                        wrapping: false
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: "10rem",
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: "10rem",
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/rows");
        },

        openManifestColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pManifestPopover) {
                this._pManifestPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ManifestTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pManifestPopover.then(function (oPopover) {
                oController.ManifestColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        ManifestColumnsVisiblity: function () {
            var oView = oController.getView();
            var oManifestTableModel = oView.getModel("eshipjetModel");
            var aColumns = oManifestTableModel.getProperty("/ManifestTableData/ManifestColumns");
            var oManifestTable = oView.byId("myManifestColumnSelectId");
            var aTableItems = oManifestTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("ManifestTableDataModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onManifestColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myManifestColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onManifestColSelectOkPress: function () {
            var oView = this.getView()
            var oManifestTable = oView.byId("myManifestColumnSelectId");
            var ManifestTableDataModel = oView.getModel("ManifestTableDataModel");
            var oManifestTblItems = oManifestTable.getItems();
            var aColumnsData = ManifestTableDataModel.getProperty("/ManifestColumns");
            oManifestTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("ManifestTableDataModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            ManifestTableDataModel.updateBindings(true);
            this._pManifestPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onManifestColSelectClosePress: function () {
            this._pManifestPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        // Manifest Changes End here

        // Batch Ship Changes Starts

        _handleDisplayBatchShipTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getView().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var BatchShipTableData = eshipjetModel.getData().BatchShipTableData;
            var BatchShipTableDataModel = new JSONModel(BatchShipTableData);
            this.getView().setModel(BatchShipTableDataModel, "BatchShipTableDataModel");
            const oTable = oView.byId("idBatchShipTable");
            oTable.setModel(BatchShipTableDataModel);
            oTable.bindColumns("/BatchShipColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                if (columnName === "actions") {
                    var oHBox = new sap.m.HBox({}); // Create Text instance 
                    var Btn1 = new sap.m.Button({ text: "View Now", type: "Transparent" });
                    var Btn2 = new sap.m.Button({
                        icon: "sap-icon://megamenu", type: "Transparent",
                        press: function (oEvent) {
                            that.handleDownArrowPress(oEvent);
                        }
                    });
                    oHBox.addItem(Btn1);
                    oHBox.addItem(Btn2);
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oHBox,
                        visible: oContext.getObject().visible,
                        width: "8rem",
                        sortProperty: columnName
                    });
                } else if (columnName === "CreatedDate" || columnName === "ShipDate") {
                    var DateTxt = new sap.m.Text({
                        text: {
                            path: 'BatchShipTableDataModel>ShipDate',
                            formatter: formatter.formatDate  // Attach the formatter dynamically
                        },
                        wrapping: false
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: "10rem",
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: "10rem",
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/rows");
        },

        openBatchShipColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pBatchShipPopover) {
                this._pBatchShipPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.BatchShipTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pBatchShipPopover.then(function (oPopover) {
                oController.BatchShipColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        BatchShipColumnsVisiblity: function () {
            var oView = oController.getView();
            var oBatchShipTableModel = oView.getModel("eshipjetModel");
            var aColumns = oBatchShipTableModel.getProperty("/BatchShipTableData/BatchShipColumns");
            var oBatchShipTable = oView.byId("myBatchShipColumnSelectId");
            var aTableItems = oBatchShipTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("BatchShipTableDataModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onBatchShipColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myBatchShipColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onBatchShipColSelectOkPress: function () {
            var oView = this.getView()
            var oBatchShipTable = oView.byId("myBatchShipColumnSelectId");
            var BatchShipTableDataModel = oView.getModel("BatchShipTableDataModel");
            var oBatchShipTblItems = oBatchShipTable.getItems();
            var aColumnsData = BatchShipTableDataModel.getProperty("/BatchShipColumns");
            oBatchShipTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("BatchShipTableDataModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            BatchShipTableDataModel.updateBindings(true);
            this._pBatchShipPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onBatchShipColSelectClosePress: function () {
            this._pBatchShipPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        onBatchShipFilterPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._batchShipPopover) {
                this._batchShipPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.BatchShipFilterPopover",
                    controller: this
                }).then(function (batchShipPopover) {
                    oView.addDependent(batchShipPopover);
                    // batchShipPopover.bindElement("/ProductCollection/0");
                    return batchShipPopover;
                });
            }
            this._batchShipPopover.then(function (batchShipPopover) {
                batchShipPopover.openBy(oButton);
            });
        },
        onBatchShipFilterPopoverClosePress: function () {
            this.byId("idBatchShipFilterPopover").close();
        },
        onBatchShipFilterPopoverResetPress: function () {
            this.byId("idBatchShipFilterPopover").close();
        },
        onBatchShipFilterPopoverApplyPress: function () {
            this.byId("idBatchShipFilterPopover").close();
        },

        onScanShipColSelectOkPress: function () {
            var oView = this.getView()
            var oScanTable = oView.byId("myScanColumnSelectId");
            var ScanShipTableDataModel = oView.getModel("ScanShipTableDataModel");
            var oScanTblItems = oScanTable.getItems();
            var aColumnsData = ScanShipTableDataModel.getProperty("/columns");
            oScanTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("ScanShipTableDataModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            ``
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }

                })
            });
            ScanShipTableDataModel.updateBindings(true);
            this._pScanPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onScanShipColSelectClosePress: function () {
            this._pScanPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onOpenRecentShipmentPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            // create popover
            if (!this._recentShipPopover) {
                this._recentShipPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.RecentShipment",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._recentShipPopover.then(function (oPopover) {
                oPopover.openBy(oButton);
            });

        },
        onRecentShipmentClosePress: function () {
            this._recentShipPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        onColumnSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myScanColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },
        onPressSettingsButton: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            // create popover
            if (!this._dashBoardAddPopover) {
                this._dashBoardAddPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.DashboardAddIconPopover",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._dashBoardAddPopover.then(function (oPopover) {
                oPopover.openBy(oButton);
            });

        },
        handlePopoverListItemPress: function (oEvent) {
            var oSrc = oEvent.getSource();
            var oView = oController.getView();
            var oCurrObj = oSrc.getBindingContext().getObject();
            var oToolPage = this.byId("toolPage");
            var oPageContainer = this.byId("pageContainer");
                oToolPage.setSideExpanded(false);
                this._dashBoardAddPopover.then(function(oPopover) {
                    oPopover.close();
                });
                if(oCurrObj && oCurrObj.name === "Locations"){

                oController._displayTables("_IDLocationTable", "LocationTableColumns", "LocationTableRows", "Locations");
                oPageContainer.to(oView.createId("_ID_Location_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Address Book") {

                oController._displayTables("_IDAddressBookTable", "AddressBookTableColumns", "AddressBookTableRows", "Address Book");
                oPageContainer.to(oView.createId("_ID_AddressBook_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Users") {

                oController._displayTables("_IDUsersTable", "UsersTableColumns", "UsersTableRows", "Users");
                oPageContainer.to(oView.createId("_ID_Users_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Roles") {

                oController._displayTables("_IDRolesTable", "RolesTableColumns", "RolesTableRows", "Roles");
                oPageContainer.to(oView.createId("_ID_Roles_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Carrier Catalog") {

                oController._displayTables("_IDCarriesCatalogTable", "CarrierCatalogTableColumns", "CarrierCatalogTableRows", "Carrier Catalog");
                oPageContainer.to(oView.createId("_ID_CarrierCatalog_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Carrier Accounts") {

                oController._displayTables("_IDCarriesAccountsTable", "CarrierAccountsTableColumns", "CarrierAccountsTableRows", "Carrier Accounts");
                oPageContainer.to(oView.createId("_ID_CarrierAccounts_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Cost Centers") {

                oController._displayTables("_IDCostCenterTable", "CostCenterTableColumns", "CostCenterTableRows", "Cost Centers");
                oPageContainer.to(oView.createId("_ID_CostCenters_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Statuses") {

                oController._displayTables("_IDStatusesTable", "StatusesTableColumns", "StatusesTableRows", "Statuses");
                oPageContainer.to(oView.createId("_ID_Statuses_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Products") {

                oController._displayTables("_IDProductsTable", "ProductsTableColumns", "ProductsTableRows", "Products");
                oPageContainer.to(oView.createId("_ID_Products_TableScrollContainer"));


            } else if (oCurrObj && oCurrObj.name === "Package Types") {

                oController._displayTables("_IDPackageTypesTable", "PackageTypeTableColumns", "PackageTypeTableRows", "Package Types");
                oPageContainer.to(oView.createId("_ID_PackageTypes_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Third Party") {

                oController._displayTables("_IDThirdPartyTable", "ThirdPartiesTableColumns", "ThirdPartiesTableRows", "Third Party");
                oPageContainer.to(oView.createId("_ID_ThirdParties_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "LTL Classes") {

                oController._displayTables("_IDLTLClassTable", "LtlClassesTableColumns", "LtlClassesTableRows", "LTL Classes");
                oPageContainer.to(oView.createId("_ID_LTLClasses_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "NMFC") {

                oController._displayTables("_IDNMFCTable", "NmfcTableColumns", "NmfcTableRows", "NMFC");
                oPageContainer.to(oView.createId("_ID_NMFC_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "MOT") {

                oController._displayTables("_IDModeOfTransportTable", "MotTableColumns", "MotTableRows", "MOT");
                oPageContainer.to(oView.createId("_ID_MOT_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Order Types") {

                oController._displayTables("_IDOrderTypeTable", "OrderTypesTableColumns", "OrderTypesTableRows", "Order Types");
                oPageContainer.to(oView.createId("_ID_OrderTypes_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Incoterms") {

                oController._displayTables("_ID_IncotermsTable", "IncoTermsTableColumns", "IncoTermsTableRows", "Incoterms");
                oPageContainer.to(oView.createId("_ID_Incoterms_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Dimensions") {

                oController._displayTables("_ID_DimensionTable", "DiemnsionsTableColumns", "DiemnsionsTableRows", "Dimensions");
                oPageContainer.to(oView.createId("_ID_Dimensions_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Payment Types") {

                oController._displayTables("_ID_PaymentTypeTable", "PaymentTypesTableColumns", "PaymentTypesTableRows", "Payment Types");
                oPageContainer.to(oView.createId("_ID_PaymentTypes_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "SMTP Configuration") {

                oController._displayTables("_ID_SMTPConfigTable", "SMTPConfigsTableColumns", "SMTPConfigsTableRows", "SMTP Configuration");
                oPageContainer.to(oView.createId("_ID_SMTPConfig_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "ERP Configuration") {

                oController._displayTables("_ID_ERPTable", "ERPTableColumns", "ERPTableRows", "ERP Configuration");
                oPageContainer.to(oView.createId("_ID_ERP_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Default Configuration") {

               this.OpenDefaultConfigDialog();

            }else if(oCurrObj && oCurrObj.name === "Countries"){

                oController._displayTables("_ID_CountriesTable", "CountriesTableColumns", "CountriesTableRows", "Countries");
                oPageContainer.to(oView.createId("_ID_Countries_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "EU Countries") {

                oController._displayTables("_ID_EUCountriesTable", "EUCountriesTableColumns", "EUCountriesTableRows", "EU Countries");
                oPageContainer.to(oView.createId("_ID_EUCountries_TableScrollContainer"));

            }
        },
        _displayTables: function (oTableId, aColumns, aRows, selectedItem) {
            var oView = oController.getView(), columnName, columnLabel;
            const oTable = oView.byId(oTableId);
            var oModel = oView.getModel();
            if (oTable) {
                oTable.setModel(oModel);    
                oTable.bindColumns("/" + aColumns, function (sId, oContext) {
                    columnName = oContext.getObject().key;
                    columnLabel = oContext.getObject().label;

                    if (columnName === "actions") {
                        var oHBox = new sap.m.HBox({}); // Create Text instance 
                        var Link1 = new sap.m.Link({ text: "View" });
                        var Link2 = new sap.m.Link({ endIcon: "sap-icon://navigation-down-arrow" });
                        oHBox.addItem(Link1);
                        oHBox.addItem(Link2);
                        var Link1 = new sap.m.Link({ text: "View" });
                        var Link2 = new sap.m.Link({ endIcon: "sap-icon://navigation-down-arrow" });
                        oHBox.addItem(Link1);
                        oHBox.addItem(Link2);
                        return new sap.ui.table.Column({
                            label: oResourceBundle.getText(columnName),
                            template: oHBox,
                            visible: oContext.getObject().visible,
                            width: "8rem",
                            sortProperty: columnName
                        });
                    } else {
                        return new sap.ui.table.Column({
                            label: oResourceBundle.getText(columnName),
                            template: columnName,
                            visible: oContext.getObject().visible,
                            width: "8rem",
                            sortProperty: columnName
                        });
                    }
                });
                oTable.bindRows("/" + aRows);
            }
          },

          onThemeChange:function(oEvent){
            var bState = oEvent.getSource().getState();
            if(bState){
                document.body.classList.remove("dark-theme");
            }else{
                document.body.classList.add("dark-theme");
            }
          },
          OpenDefaultConfigDialog: function () {
            var oView = this.getView();
            if (!this.byId("openDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.DefaultConfigDialog",
                    controller: this // Pass the controller for binding
                }).then(function (oDialog) {
                    oView.addDependent(oDialog); 
                    oDialog.open(); 
                });
            } else {
                this.byId("openDialog").open(); // Open existing dialog
            }
        },
        // Function to handle the "Cancel" button
        CancelDialog: function () {
            var oDialog = this.byId("openDialog");
            if (oDialog) {
                oDialog.close();
            }
        },
        // Function to handle the "Update" button
        UpdateDialog: function () {
            var oDialog = this.byId("openDialog");
            if (oDialog) {
                oDialog.close(); // Close the dialog
            }
        }
        

    });
});
