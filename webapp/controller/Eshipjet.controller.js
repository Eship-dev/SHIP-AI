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
    "sap/ui/model/FilterOperator",
    "sap/ui/core/library",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (Device, Controller, JSONModel, Popover, Button, library, MessageToast, BusyIndicator, Dialog, DateFormat, Fragment, Spreadsheet, formatter, Filter, FilterOperator, CoreLibrary, MessageBox, History) {
    "use strict";

    var ButtonType = library.ButtonType,
        PlacementType = library.PlacementType,
        oController, oResourceBundle, eshipjetModel;
    const SortOrder = CoreLibrary.SortOrder;

    return Controller.extend("com.eshipjet.zeshipjet.controller.Eshipjet", {
        formatter: formatter,
        onInit: function () {
            // this.getMasterData();

            // var sAudioPath = sap.ui.require.toUrl("com/eshipjet/zeshipjet/audio/Lock.mp3");
            // var audio = new Audio(sAudioPath);
            // audio.play();

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
            
            var ShipNowDataModel = {
                "sapShipmentID": "",
                "ShipToCONTACT": "",
                "ShipToCOMPANY": "",
                "ShipToPHONE": "",
                "ShipToEMAIL": "",
                "ShipToCITY": "",
                "ShipToSTATE": "",
                "ShipToCOUNTRY": "",
                "ShipToZIPCODE": "",
                "ShipToADDRESS_LINE1": "",
                "ShipToADDRESS_LINE2": "",
                "ShipToADDRESS_LINE3": ""
            };
            var ShipNowDataModel = new JSONModel(ShipNowDataModel);
            this.getOwnerComponent().setModel(ShipNowDataModel, "ShipNowDataModel");
            oController.oBusyDialog = new sap.m.BusyDialog({});
            this.getOwnerComponent().getRouter().getRoute("RouteEshipjet").attachPatternMatched(this._handleRouteMatched, this);
            oController.readAPIProductSrvModel();
            oController.ShippingTypeDropdownData();
        },

        readAPIProductSrvModel:function(){
            var APIProductSrvModel = oController.getOwnerComponent().getModel("APIProductSrvModel");
            var oFilter = new sap.ui.model.Filter("ProductType", sap.ui.model.FilterOperator.EQ, "VERP");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");

            APIProductSrvModel.read("/A_Product", {
                filters: [oFilter],
                success:function(oResult){
                    eshipjetModel.setProperty("/packageMaterial", oResult.results)
                },
                error:function(oError){
                    console.log(oError);
                }
            })
        },

        ShippingTypeDropdownData:function(){
            var ShipReadDataSrvModel = oController.getOwnerComponent().getModel("ShipReadDataSrvModel");
            eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            ShipReadDataSrvModel.read("/ShippingTypeSet", {               
                success:function(response){
                    eshipjetModel.setProperty("/ShipMethodSet",response.results);
                },
                error:function(oError){
                    console.log(oError);
                }
            })

        },
        onPackSectionEmptyRows:function(){
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aHandlingUnits = eshipjetModel.getProperty("/HandlingUnits") || [];
            var aPackAddProductTable = eshipjetModel.getProperty("/commonValues/packAddProductTable") || [];
            var aBusinessPartnersTable = eshipjetModel.getProperty("/BusinessPartners") || [];

            // If HandlingUnits has less than 6 items, add empty rows
            while (aPackAddProductTable.length < 4) {
                aPackAddProductTable.push({ SerialNo: "" });
            }

            while (aHandlingUnits.length < 6) {
                aHandlingUnits.push(
                    { SerialNumber: "", SAPHUID: "" }
                );
            }

            while (aBusinessPartnersTable.length < 5) {
                aBusinessPartnersTable.push(
                    { PartnerType: "Ship From", "FullName": "Eshipjet Software Inc.", "BusinessPartnerName1":"Steve Marsh", "StreetName":"5717 Legacy", "HouseNumber":"Suite 250", "Region":"Plano", "CityName":"TX", "PostalCode":"75024", "Country":"US", "PhoneNumber":"(888) 464-2360", "email":"info@eshipjet.ai" },
                    { PartnerType: "Shipper", "FullName": "Eshipjet Software Inc.", "BusinessPartnerName1":"Steve Marsh", "StreetName":"5717 Legacy", "HouseNumber":"Suite 250", "Region":"Plano", "CityName":"TX", "PostalCode":"75024", "Country":"US", "PhoneNumber":"(888) 464-2360", "email":"info@eshipjet.ai" },
                    { PartnerType: "Freight Forwarder", "FullName": "", "BusinessPartnerName1":"", "StreetName":"", "HouseNumber":"", "Region":"", "CityName":"", "PostalCode":"", "Country":"", "PhoneNumber":"", "email":""  },
                    { PartnerType: "Importer", "FullName": "", "BusinessPartnerName1":"", "StreetName":"", "HouseNumber":"", "Region":"", "CityName":"", "PostalCode":"", "Country":"", "PhoneNumber":"", "email":""  },
                    { PartnerType: "Third Party", "FullName": "", "BusinessPartnerName1":"", "StreetName":"", "HouseNumber":"", "Region":"", "CityName":"", "PostalCode":"", "Country":"", "PhoneNumber":"", "email":""  }
                );
            }
            
            eshipjetModel.setProperty("/commonValues/packAddProductTable", aPackAddProductTable);
            eshipjetModel.setProperty("/HandlingUnits", aHandlingUnits);
            eshipjetModel.setProperty("/BusinessPartners", aBusinessPartnersTable);

            var HandlingUnits = eshipjetModel.getProperty("/HandlingUnits");
            var HandlingUnitsLength = 0;
            for(var i=0; i<HandlingUnits.length; i++){
                if(HandlingUnits[i].SAPHUID !== ""){
                    HandlingUnitsLength += 1
                }
            };
            eshipjetModel.setProperty("/HandlingUnitsLength", HandlingUnitsLength);
        },

        getMasterData:function(){           
            var obj = {
                "locationid": "1001",
                "formname": "shipments",
                        "type": "modules",
                        "defaultmodules": [
                            "erp",
                            "location",
                            "ordertypes",
                            "dimensions",
                            "countrylist",
                            "shipmentstatuses",
                            "costcenter",
                            "products",
                            "addressbook",
                            "packagetypes",
                            "carrierconfiguration",
                            "defaultconfiguration",
                            "eucountrylist",
                            "ltlclass"
                        ]
                    };
                    var sPath = "https://dev-api-v1.eshipjet.site/LocationMaster/defaultdata";
                    return new Promise((resolve, reject) => {
                        $.ajax({
                            url: sPath, // Replace with your API endpoint
                            method: "POST",
                            contentType: "application/json", // Set content type to JSON if sending JSON data
                            data: JSON.stringify(obj),
                            success: function (response) {
                                
                            },
                            error: function (error) {
                                // Handle error
                                oController.oBusyDialog.close();
                                reject(error);
                                console.log("Error:", error);
                            }
                        });
                    });
        },

        _handleRouteMatched:function(){           
            eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            eshipjetModel.setProperty("/pickupDate", new Date());
            eshipjetModel.setSizeLimit(9999999);           
        },

        onItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var sKey = oItem.getKey();            
            // eshipjetModel.setSizeLimit(9999999);
            eshipjetModel.setProperty("/commonValues/sapDeliveryNumber",""); //80000001
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(false);
            eshipjetModel.setProperty("/shippingCharges",[]);
            eshipjetModel.setProperty("/shippingDocuments",[]);
            eshipjetModel.setProperty("/HandlingUnitItems",[]);
            eshipjetModel.setProperty("/HandlingUnits",[]);
            eshipjetModel.setProperty("/shippingDocuments",[]);
            eshipjetModel.setProperty("/BusinessPartners",[]);
            eshipjetModel.setProperty("/commonValues/ShipNowShipMethodSelectedKey","");
            eshipjetModel.setProperty("/commonValues/ShipNowShipsrvNameSelectedKey","");
            eshipjetModel.setProperty("/accountNumber","");
            eshipjetModel.setProperty("/trackingArray", []);
            eshipjetModel.setProperty("/pickAddProductTable",[]);
            eshipjetModel.setProperty("/HandlingUnits",[]);
            eshipjetModel.setProperty("/HandlingUnitItems",[]);
            if (sKey === "ShipperCopilot") {
                var obj = {
                    "messages": [],
                    "listState": false,
                    "iconState": true
                }
                const oShipperCopilotModel = new JSONModel(obj);
                this.getView().setModel(oShipperCopilotModel, "ShipperCopilotModel");
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", true);
                eshipjetModel.setProperty("/commonValues/darkTheme", true);
                document.body.classList.remove("dark-theme");
            } else if (sKey === "ScanShip") {
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", true);
                eshipjetModel.setProperty("/commonValues/darkTheme", true);
                document.body.classList.remove("dark-theme");

                eshipjetModel.setProperty("/sShipAndScan", "");
                eshipjetModel.setProperty("/scanShipTableData2", []);
                // this._handleDisplayScanShipTable();
            } else if (sKey === "Orders") {
                eshipjetModel.setProperty("/commonValues/toolPageHeader", false);
                eshipjetModel.setProperty("/commonValues/allViewsFooter", false);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
                oController.getOrdersHistoryShipments();
                // this._handleDisplayOrdersTable();
            } else if (sKey === "ShipRequestLabel") {
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
                // this._handleDisplayShipReqTable();
                oController.getShipReqLabelHistoryShipments();
            } else if (sKey === "ShipNow") {
                var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
                var obj = {
                    "ShipFromCONTACT": "Steve Marsh",
                    "ShipFromCOMPANY": "Eshipjet Software Inc.",
                    "ShipFromPHONE": "(888) 464-2360",
                    "ShipFromEMAIL": "info@eshipjet.ai",
                    "ShipFromCITY": "Plano",
                    "ShipFromSTATE": "TX",
                    "ShipFromCOUNTRY": "US",
                    "ShipFromZIPCODE": "75024",
                    "ShipFromADDRESS_LINE1": "5717 Legacy",
                    "ShipFromADDRESS_LINE2": "Suite 250",
                    "LocationType": "Commercial"
                };
                ShipNowDataModel.setProperty("/ShipFromAddress", obj);
                ShipNowDataModel.setProperty("/ShipToAddress", "");
                eshipjetModel.setProperty("/commonValues/toolPageHeader", false);
                eshipjetModel.setProperty("/commonValues/allViewsFooter", false);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", true);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
                eshipjetModel.setProperty("/commonValues/shipNowGetBtn", true);
                eshipjetModel.setProperty("/commonValues/OverallGoodsMovementStatus", "");
                eshipjetModel.setProperty("/commonValues/shipNowBtnStatus", true);
                oController.onPackSectionEmptyRows();
                // oController._handleDisplayShipNowPackTable();
                // this._handleDisplayShipNowProductsTable();
                // this._handleDisplayShipNowHandlingUnitTable();
            } else if (sKey === "QuoteNow") {
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", true);
                eshipjetModel.setProperty("/commonValues/darkTheme", true);
                document.body.classList.remove("dark-theme");
            } else if (sKey === "TrackNow") {
                this.getOrdersHistoryShipments();
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
                // this._handleDisplayTrackNowTable();
            } else if (sKey === "Manifest") {
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
                this._handleDisplayManifestTable();
            } else if (sKey === "AESDirect") {
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
            } else if (sKey === "Dashboard") {
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
            } else if (sKey === "Reports") {
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
            } else if (sKey === "BatchShip") {
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
                this._handleDisplayBatchShipTable();
            } else if (sKey === "RoutingGuide") {
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
                // this._handleDisplayRoutingGuideTable();
            } else if (sKey === "FeightAuditAnalysis") {
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
                // this._handleDisplayRoutingGuideTable();
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
            oController.onOpenBusyDialog();
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
                    // sLabel = aLabel[0].encodedLabel;
                    // var dataUrl = "data:image/png;base64," + sLabel;
                    sLabel = aLabel[0].docName;
                    var dataUrl = "https://eshipjetsatge.blob.core.windows.net/shipping-labels/" + sLabel
                    aMessages.push({ sender: "Bot", text: dataUrl });
                    oShipperCopilotModel.setProperty("/messages", aMessages);
                    oController.oBusyDialog.close();
                } else {
                    var aError = sResponse.Errors;
                    if (aError.length !== 0) {
                        aMessages.push({ sender: "BotError", text: aError[0] });
                        oShipperCopilotModel.setProperty("/messages", aMessages);
                        oController.oBusyDialog.close();
                    }
                }

            } catch (error) {
                if (error.responseText !== undefined) {
                    aMessages.push({ sender: "BotError", text: error.responseText });
                    oShipperCopilotModel.setProperty("/messages", aMessages);
                }
                //MessageToast.show("Error communicating with Copilot.");
                oController.oBusyDialog.close();
            }
        },

        // Simulate bot response for testing purposes
        _simulateBotResponse: function (sMessage) {            
            var obj = {
                "message": sMessage // Match DeliveryNo in the message if needed
            }
            var sPath = "https://eshipjet-demo-srv-hvacbxf0fqapdpgd.francecentral-01.azurewebsites.net/copilot/v1/bot/process";

            const oShipperCopilotModel = oController.getView().getModel("ShipperCopilotModel");
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

        onShipNowHUColumnConfigPress:function(oEvent){
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pShipNowHUColumnConfigPopover) {
                this._pShipNowHUColumnConfigPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShipNowHUColumnConfig",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pShipNowHUColumnConfigPopover.then(function (oPopover) {
                oController.ShipNowHUColumnConfigVisiblity();
                oPopover.openBy(oButton);
            });
        },

        ShipNowHUColumnConfigVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/ShipNowHandlingUnitTableColumns");
            var oShipNowHUColumnConfigTable = oView.byId("myShipNowHUColumnConfigSelectId");
            var aTableItems = oShipNowHUColumnConfigTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("eshipjetModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onShipNowHUColumnConfigNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myShipNowHUColumnConfigSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");
        },

        onShipNowHUColumnConfigSelectOkPress: function () {
            var oView = this.getView();
            var oShipNowHUColumnConfigTable = oView.byId("myShipNowHUColumnConfigSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oShipNowHUColumnConfigTableItems = oShipNowHUColumnConfigTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/ShipNowHandlingUnitTableColumns");
            oShipNowHUColumnConfigTableItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            this._pShipNowHUColumnConfigPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onShipNowHUColumnConfigSelectClosePress: function () {
            this._pShipNowHUColumnConfigPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayShipNowPackTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var ShipNowProductsTableColumns = eshipjetModel.getData().ShipNowProductsTableColumns;
            const oTable = oView.byId("idShipNowPackTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < ShipNowProductsTableColumns.length; i++) {
                if (ShipNowProductsTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/ShipNowProductsTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/commonValues/packAddProductTable");
        },

        openShipNowPrdctColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pShipNowPrdctPopover) {
                this._pShipNowPrdctPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShipNowPrdctTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pShipNowPrdctPopover.then(function (oPopover) {
                oController.ShipNowPrdctColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        ShipNowPrdctColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/ShipNowProductsTableColumns");
            var oShipNowPrdTable = oView.byId("myShipNowPrdColumnSelectId");
            var aTableItems = oShipNowPrdTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("eshipjetModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onShipNowPrdColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myShipNowPrdColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");
        },

        onShipNowPrdColSelectOkPress: function () {
            var oView = this.getView()
            var oShipNowPrdTable = oView.byId("myShipNowPrdColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oShipNowPrdTableItems = oShipNowPrdTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/ShipNowProductsTableColumns");
            oShipNowPrdTableItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            // this._handleDisplayShipNowPackTable();
            this._pShipNowPrdctPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onShipNowPrdColSelectClosePress: function () {
            this._pShipNowPrdctPopover.then(function (oPopover) {
                oPopover.close();
            });
        },


        onPartialQtyChange:function(oEvent){
            var currObjItemNetWeight = parseInt(oEvent.getSource().getBindingContext("eshipjetModel").getObject().ItemNetWeight);
            var currValue = parseInt(oEvent.getParameters().value);
            if(currValue > currObjItemNetWeight){
                var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
                var sPathArray = oEvent.getSource().getBindingContext("eshipjetModel").sPath.split("/");                
                var obj = eshipjetModel.getProperty("/commonValues/packAddProductTable")[sPathArray[sPathArray.length - 1]];
                obj["partialQty"] = 0;
                MessageBox.warning("Partial quantity cannot be greater than balance quantity.");
            }
        },

        onShipNowPrdctDltPress:function(oEvent){
            MessageBox.warning("Are you sure you want to delete HU?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if(sAction === "OK"){
                        oController.onConfirmShipNowPrdctDltPress(oEvent);
                    }
                }
            });
        },

        onConfirmShipNowPrdctDltPress:function(oEvent){            
            var packAddProductTable = eshipjetModel.getProperty("/commonValues/packAddProductTable");
            var sPath = oEvent.getSource().getBindingContext("eshipjetModel").sPath.split("/");
            var idx = parseInt(sPath[sPath.length-1]);
            packAddProductTable.splice(idx, 1);
            for(var i=0; i<packAddProductTable.length; i++){
                packAddProductTable[i]["SerialNo"] = i+1;
            };
            eshipjetModel.updateBindings(true);
        },

        onShipNowAllPrdctsDltPress:function(oEvent){
            MessageBox.warning("Are you sure you want to delete all the product?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if(sAction === "OK"){
                        oController.onConfirmShipNowAllPrdctsDltPress(oEvent);
                    }
                }
            });
        },

        onConfirmShipNowAllPrdctsDltPress:function(oEvent){
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            eshipjetModel.setProperty("/commonValues/packAddProductTable", []);
        },
        
        onShipNowHandlingUnitDelPress:function(oEvent){
            MessageBox.warning("Are you sure you want to delete this product?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if(sAction === "OK"){
                        oController.onConfirmShipNowHandlingUnitDelPress(oEvent);
                    }
                }
            });
        },

        onConfirmShipNowHandlingUnitDelPress:function(oEvent){
            oController.onOpenBusyDialog();
            var oCurrObj = oEvent.getSource().getBindingContext("eshipjetModel").getObject();
            var oPayload = {
                "Vbeln" : oCurrObj.HandlingUnitReferenceDocument,
                "HuNo" : oCurrObj.HandlingUnitExternalID
            };
        
            var sPath = "/HuDeleteSet('" + oCurrObj.HandlingUnitReferenceDocument + "')";
            var ShipReadDataSrvModel = oController.getOwnerComponent().getModel("ShipReadDataSrvModel");
            ShipReadDataSrvModel.create("/HuDeleteSet", oPayload, {
                success:function(oData){
                    console.log("Success:", oData);
                    sap.m.MessageToast.show("Handling unit deleted successfully.");
                    oController.readProductsData(oCurrObj.HandlingUnitReferenceDocument);
                    oController.onCloseBusyDialog();
                },
                error:function(oError){
                    var errMsg = JSON.parse(oError.responseText).error.message.value;
                    sap.m.MessageBox.error(errMsg);
                    oController.onCloseBusyDialog();
                }
            });
            // var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            // var HandlingUnits = eshipjetModel.getData().HandlingUnits;
            // var sPath = oEvent.getSource().getBindingContext("eshipjetModel").sPath.split("/");
            // var idx = parseInt(sPath[sPath.length-1]);
            // var packAddProductTable = eshipjetModel.getData().packAddProductTable;
            // for(var i=0; i<oCurrObj.ItemsInfo.length; i++){
            //     for(var j=0; j<packAddProductTable.length; j++){
            //         if(oCurrObj.ItemsInfo[i].DeliveryDocument === packAddProductTable[j].DeliveryDocument){
            //             packAddProductTable[i].ItemNetWeight += oCurrObj.ItemsInfo[i].ItemWeight;
            //         }else{
            //             // oCurrObj.ItemsInfo[i]["SerialNo"] = packAddProductTable.length + 1;
            //             // packAddProductTable.push(oCurrObj.ItemsInfo[i]);
            //         }
            //     };
            // };
            
            // HandlingUnits.splice(idx, 1);
            // for(var i=0; i<HandlingUnits.length; i++){
            //     HandlingUnits[i]["SerialNumber"] = i+1;
            // };
            // eshipjetModel.updateBindings(true);
        },

        readProductsData:function(sDeveliveryNumber){
            var oDeliveryModel = oController.getView().getModel("OutBoundDeliveryModel");
            var aOutBoundDelveryFilter = [], aProductTable = [];
            aOutBoundDelveryFilter.push(new Filter("DeliveryDocument", "EQ", sDeveliveryNumber));
            oDeliveryModel.read("/A_OutbDeliveryItem",{
                filters: aOutBoundDelveryFilter,
                success:function(oData){
                    if(oData && oData.results && oData.results.length > 0){
                        for(var i = 0; i < oData.results.length; i++){
                            oData.results[i]["SerialNumber"] = i+1;
                            oData.results[i]["ItemWeightUnit"] = "10X12X12";
                            oData.results[i]["BalanceQty"] = oData.results[i].ActualDeliveryQuantity;
                            aProductTable.push(oData.results[i]);
                        };
                        var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
                        eshipjetModel.setProperty("/commonValues/packAddProductTable",aProductTable);
                        oController.getSalesOrder(aProductTable);
                        oController.readHUDataSet(sDeveliveryNumber);
                    }
                },
                error: function(oErr){
                    console.log(oErr);
                    oController.oBusyDialog.close();
                }
            });
        },

        onShipNowAllHandlingUnitDelPress:function(oEvent){
            MessageBox.warning("Are you sure you want to delete all packed items?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if(sAction === "OK"){
                        oController.onConfirmShipNowAllHandlingUnitDelPress(oEvent);
                    }
                }
            });
        },

        onConfirmShipNowAllHandlingUnitDelPress:function(oEvent){
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var HandlingUnits = eshipjetModel.getData().HandlingUnits;
            var packAddProductTable = eshipjetModel.getProperty("/commonValues/packAddProductTable");

            HandlingUnits.forEach(oDeletedData => {
               oDeletedData.ItemsInfo.forEach(item => {
                    var matchingDelivery = packAddProductTable.find(delivery => 
                        String(delivery.DeliveryDocument) === String(item.DeliveryDocument)
                    );
        
                    if (matchingDelivery) {
                        matchingDelivery.ItemNetWeight = (matchingDelivery.ItemNetWeight || 0) + (item.ItemWeight || 0);
                    } else {
                        packAddProductTable.push(item);
                    }
                });
            });
        
            eshipjetModel.setProperty("/HandlingUnits", []);
            eshipjetModel.setProperty("/commonValues/packAddProductTable", packAddProductTable);
            eshipjetModel.refresh(true);
        
            MessageToast.show("All items removed and weight updated.");
        },

        onShipNowClosePress:function(){
            var sKey = "Dashboard";            
            // eshipjetModel.setSizeLimit(9999999);
            eshipjetModel.setProperty("/commonValues/sapDeliveryNumber",""); //80000001
            eshipjetModel.setProperty("/BusinessPartners", []);
            eshipjetModel.setProperty("/commonValues/ShipNowShipMethodSelectedKey", "");
            eshipjetModel.setProperty("/commonValues/ShipNowShipsrvNameSelectedKey", "");
            eshipjetModel.setProperty("/accountNumber", "");
            eshipjetModel.setProperty("/commonValues/packAddProductTable", []);
            eshipjetModel.setProperty("/InternationalDetails/shipFromTaxNo", "");
            eshipjetModel.setProperty("/InternationalDetails/shipFromTaxNo", "");
            eshipjetModel.setProperty("/trackingArray", []);


            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(false);
            eshipjetModel.setProperty("/shippingCharges",[]);
            eshipjetModel.setProperty("/shippingDocuments",[]);
            eshipjetModel.setProperty("/HandlingUnitItems",[]);
            eshipjetModel.setProperty("/HandlingUnits",[]);
            if (sKey === "Dashboard") {
                eshipjetModel.setProperty("/commonValues/toolPageHeader", true);
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/commonValues/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
            }
            eshipjetModel.setProperty("/SideNavigation", false);
            this.byId("pageContainer").to(this.getView().createId(sKey));
        },

        onOrdersClosePress:function(){
            var sKey = "Dashboard";
            eshipjetModel.setProperty("/SideNavigation", false);
            this.byId("pageContainer").to(this.getView().createId(sKey));
            eshipjetModel.setProperty("/commonValues/toolPageHeader", true);
        },

        onShipNowNewPress:function(){
            // oController.onOpenBusyDialog();
            oController.getView().setBusy(true);
            var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
            var shipFromObj = {
                "ShipFromCONTACT": "Steve Marsh",
                "ShipFromCOMPANY": "Eshipjet Software Inc.",
                "ShipFromPHONE": "(888) 464-2360",
                "ShipFromEMAIL": "info@eshipjet.ai",
                "ShipFromCITY": "Plano",
                "ShipFromSTATE": "TX",
                "ShipFromCOUNTRY": "US",
                "ShipFromZIPCODE": "75024",
                "ShipFromADDRESS_LINE1": "5717 Legacy",
                "ShipFromADDRESS_LINE2": "Suite 250",
                "LocationType": "Commercial"
            };
            ShipNowDataModel.setProperty("/ShipFromAddress", shipFromObj);            
            ShipNowDataModel.setProperty("/ShipFromAddressType", "");
            ShipNowDataModel.setProperty("/ShipToAddress", {});
            eshipjetModel.setProperty("/BusinessPartners", []);
            eshipjetModel.setProperty("/InternationalDetails/shipFromTaxNo", "");
            eshipjetModel.setProperty("/InternationalDetails/shipFromTaxNo", "");
            eshipjetModel.setProperty("/trackingArray", []);
            eshipjetModel.setProperty("/shippingCharges",[]);
            eshipjetModel.setProperty("/shippingDocuments",[]);
            eshipjetModel.setProperty("/HandlingUnitItems",[]);
            eshipjetModel.setProperty("/HandlingUnits",[]); 
            var oCommonValues = {
                sapDeliveryNumber :"",
                ShipNowShipMethodSelectedKey:"",
                ShipNowShipsrvNameSelectedKey:"",
                ShipNowSelectedServiceName:"",
                accountNumber:"",
                packAddProductTable:[],
                toolPageHeader: false,
                allViewsFooter: false,
                shipNowViewFooter: true,
                createShipReqViewFooter : false,
                routingGuidFooter : false,
                showDarkThemeSwitch :false,
                darkTheme: false,
                shipNowGanderWhiteSelect:false,
                shipNowGetBtn:true,
                OverallGoodsMovementStatus: "",
                shipNowABFSelect : false,
                shipNowARTEXFineArtSrvSelect : false,
                shipNowATLASFineArtSelect : false,
                shipNowBrinksFineArtSelect:false,
                shipNowCrownFineArtSelect: false,
                shipNowDHLSelect : false,
                shipNowDTDCSelect : false,
                shipNowFedExSelect : false,
                shipNowFastFarwarderSelect : false,
                shipNowFedExFreightSelect : false,
                shipNowJPMorganChaseInternalSelect:false,
                "shipNowMalca-AmitSelect":false,
                shipNowMoviGroupSelect: false,
                shipNowOtherSelect:false,
                shipNowRLSelect :false,
                shipNowTheArmorySelect :false,
                shipNowUPSSelect:false,
                shipNowBtnStatus :true,
                shipNowUSPSSelect:false                
            };
            eshipjetModel.setProperty("/commonValues", oCommonValues);        

            jQuery.sap.delayedCall(500, oController, function() {
                oController.getView().byId("idSapDeliveryNumber").focus();
            });
            oController.onPackSectionEmptyRows();            
            // oController.onCloseBusyDialog();
            oController.getView().setBusy(false);

            // var sAudioPath = sap.ui.require.toUrl("com/eshipjet/zeshipjet/audio/clearSound.mp3");
            // var audio = new Audio(sAudioPath);
            // audio.play();
        },
       
        onShipNowPress: function () {       
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var packAddProductTable = eshipjetModel.getProperty("/commonValues/packAddProductTable");
            var HandlingUnits = eshipjetModel.getProperty("/HandlingUnits");
            oController.onOpenBusyDialog();
            var oShipNowDataModel = this.getOwnerComponent().getModel("ShipNowDataModel");

            var currentDate = new Date();
            var shipDate = currentDate.toISOString();
            
            eshipjetModel.setProperty("/commonValues/shipNowGetBtn", true);
            var sapDeliveryNumber = eshipjetModel.getProperty("/commonValues/sapDeliveryNumber");
            var carrier = eshipjetModel.getProperty("/commonValues/ShipNowShipMethodSelectedKey");
            var serviceName = eshipjetModel.getProperty("/commonValues/ShipNowShipsrvNameSelectedKey");
            var id, password, accountNumber, oPayload, Signature_optionType;            
          
            var AccessKey = "";
            var billingAccNumber = "";
            if(carrier && carrier.toUpperCase() === "UPS"){
                id = "6ljUpEbuu1OlOk7ow932lsxXHISUET0WKjTn59GzQ5MRdEbA";  
                password = "ioZmsfcbrzlWfGh7wGMhqHL6sY4EAaKzZObullipni0cEGJGChjFmGpkcdCWQynK";
                accountNumber = "B24W72";
                billingAccNumber = "89W74E";
                Signature_optionType = eshipjetModel.getProperty("/UpsSignatureSelectedKey");
            }else if(carrier && carrier.toUpperCase() === "FEDEX"){
                 id = "l70c717f3eaf284dc9af42169e93874b6e";
                 password = "7f271bf486084e8f8073945bb7e6a020";
                 accountNumber = "740561073";
                 billingAccNumber = "740561073";
                 Signature_optionType = eshipjetModel.getProperty("/fedExSignature_optionType");
            }else if(carrier && carrier.toUpperCase() === "DHL"){
                 id = "apT2vB7mV1qR1b";
                 password = "U#3mO^1vY!5mT@0j";
            }else if(carrier && carrier.toUpperCase() === "USPS"){
                id = "3087617";
                password = "October2024!";
            }else if(carrier && carrier.toUpperCase() === "ABFS"){
                id = "ABFESHIPJET";
                password = "Legacy!@3";
                AccessKey= "JVG9SX85";
            }
            var obj = {
                "ShipTo": {
                    "id": 2,
                    "VAT": "",
                    "CITY": oShipNowDataModel.getProperty("/ShipToAddress/CityName"),
                    "EORI": "",
                    "EMAIL": oShipNowDataModel.getProperty("/ShipToAddress/EMAIL"),
                    "PHONE": oShipNowDataModel.getProperty("/ShipToAddress/PhoneNumber"),
                    "STATE": oShipNowDataModel.getProperty("/ShipToAddress/Region"),
                    "TAXID": "",
                    "COMPANY": oShipNowDataModel.getProperty("/ShipToAddress/BusinessPartnerName1"),
                    "CONTACT": oShipNowDataModel.getProperty("/ShipToAddress/FullName"),
                    "COUNTRY": oShipNowDataModel.getProperty("/ShipToAddress/Country"),
                    "RFIDTag": true,
                    "ZIPCODE": oShipNowDataModel.getProperty("/ShipToAddress/PostalCode"),
                    "IsActive": true,
                    "AddressType": "Commercial",
                    "UpdatedDate": "2024-10-23T13:29:39.574Z",
                    "UpdatedUser": "info@eshipjet.ai",
                    "ADDRESS_TYPE": "Commercial",
                    "LocationType": "",
                    "ADDRESS_LINE1": oShipNowDataModel.getProperty("/ShipToAddress/StreetName"),
                    "ADDRESS_LINE2": oShipNowDataModel.getProperty("/ShipToAddress/HouseNumber"),
                    "AddressCategory": "Billing Address"
                },
                "SoldTo": {
                    "COMPANY": oShipNowDataModel.getProperty("/ShipToAddress/BusinessPartnerName1"),
                    "CONTACT": oShipNowDataModel.getProperty("/ShipToAddress/FullName"),
                    "ADDRESS_LINE1": oShipNowDataModel.getProperty("/ShipToAddress/StreetName"),
                    "ADDRESS_LINE2": oShipNowDataModel.getProperty("/ShipToAddress/HouseNumber"),
                    "CITY": oShipNowDataModel.getProperty("/ShipToAddress/CityName"),
                    "STATE": oShipNowDataModel.getProperty("/ShipToAddress/Region"),
                    "ZIPCODE": oShipNowDataModel.getProperty("/ShipToAddress/PostalCode"),
                    "COUNTRY": oShipNowDataModel.getProperty("/ShipToAddress/Country"),
                    "PHONE": oShipNowDataModel.getProperty("/ShipToAddress/PhoneNumber"),
                    "EMAIL": oShipNowDataModel.getProperty("/ShipToAddress/EMAIL"),
                    "TAXID": "",
                    "VAT": "",
                    "EORI": "",
                    "LocationType": ""
                },
                "Shipper": {
                    "VAT": "",
                    "CITY": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCITY"),
                    "EORI": "",
                    "EMAIL": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromEMAIL"),
                    "PHONE": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromPHONE"),
                    "STATE": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromSTATE"),
                    "TAXID": "",
                    "COMPANY": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCOMPANY"),
                    "CONTACT": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCONTACT"),
                    "COUNTRY": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCOUNTRY"),
                    "ZIPCODE": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromZIPCODE"),
                    "LocationType": "",
                    "ADDRESS_LINE1": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE1"),
                    "ADDRESS_LINE2": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE2"),
                    "ADDRESS_LINE3": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE3")
                },
                "Packages": [
                    {
                        "ItemsInfo": [
                            {
                                "ItemNo": "IT54",
                                "ProductNo": "21",
                                "Description": "Adidas Shoes",
                                "IsDG": false,
                                "UnitCost": 5,
                                "UnitWeight": 1,
                                "Dimension": "10X12X12",
                                "HTSCode": "900410",
                                "ECCN": "null",
                                "UN": "",
                                "Class": "50",
                                "NMFC": "",
                                "Category": "",
                                "IsSerial": null,
                                "IsBatch": null,
                                "IsStackable": null,
                                "IsActive": true,
                                "LocationId": "",
                                "id": 1,
                                "Sno": 1,
                                "Quantity": 21,
                                "Partial": 21,
                                "Balance": 0,
                                "CountryofMFR": "AF",
                                "Currency": "INR",
                                "LicenseNo": "",
                                "UOM": "LB"
                            }
                        ],
                        "SpecialServices": {},
                        "Weightunits": "LB",
                        "DimensionUnits": "",
                        "Sno": 1,
                        "HU": 15224,
                        "Weight": "21.00",
                        "Dimension": "10X12X12",
                        "PackageSpecialServiceTyeps": [],
                        "PackageLevelSpecialServices": {
                            "Signature_optionType": Signature_optionType 
                        }
                    }
                ],
                "ShipFrom": {
                    "VAT": "",
                    "CITY": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCITY"),
                    "EORI": "",
                    "EMAIL": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromEMAIL"),
                    "PHONE": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromPHONE"),
                    "STATE": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromSTATE"),
                    "TAXID": "",
                    "COMPANY": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCOMPANY"),
                    "CONTACT": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCONTACT"),
                    "COUNTRY": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCOUNTRY"),
                    "ZIPCODE": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromZIPCODE"),
                    "AddressType": "",
                    "LocationType": "",
                    "ADDRESS_LINE1": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE1"),
                    "ADDRESS_LINE2": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE2"),
                    "ADDRESS_LINE3": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE3")
                },
                "CompanyId": "CP000000001",
                "HeaderInfo": {
                    "Status": "Open",
                    "Location": "1001",
                    "ShipDate": shipDate,
                    "category": "P1",
                    "Requester": "Myself",
                    "requester": "",
                    "IsDutiable": false,
                    "CreatedDate": "2025-02-11T11:58:58.788Z",
                    "CreatedUser": "info@eshipjet.ai",
                    "shipment_id": 4852,
                    "DocumentType": "Delivery Number",
                    "FeederSystem": "SAP ECC 6.0",
                    "ShipmentType": "Business",
                    "ConsolidationId": null,
                    "UpdateSourceFrom": "",
                    "DocumentNumber": sapDeliveryNumber,
                    "InsuranceAmount": "",
                    "InsuranceCurrency": "",
                    "Currency": "",
                    "Description": "",
                    "Incoterm": "DDU",
                    "Notes": "",
                    "InvoiceNumber": "",
                    "SONumber": "",
                    "PONumber": ""
                },
                "ShippingId": 4852,
                "CarrierDetails": {
                    "Note": "",
                    "PoNo": "",
                    "UserId": id,
                    "Carrier": carrier === 'FEDEX' ? 'FedEx' : carrier ,
                    "MeterId": "",
                    "RateURL": "",
                    "ShipURL": "",
                    "VoidURL": "",
                    "Password": password,
                    "TrackURL": "",
                    "AccessKey": AccessKey,
                    "InvoiceNo": "",
                    "CostCenter": null,
                    "LocationId": "1001",
                    "Reference1": "",
                    "Reference2": "",
                    "Reference3": "",
                    "Reference4": "",
                    "costCenter": "",
                    "CarrierType": "Parcel",
                    "PaymentType": eshipjetModel.getProperty("/selectPaymentType"),
                    "ServiceName": eshipjetModel.getProperty("/carrierServiceCode_display"),
                    "ERPCarrierID":  carrier === 'FEDEX' ? 'FedEx' : carrier ,
                    "ShipToCountry": "",
                    "BillingAccount": billingAccNumber,
                    "BillingCountry": oShipNowDataModel.getProperty("/ShipToAddress/Country"),
                    "BillingZipCode": oShipNowDataModel.getProperty("/ShipToAddress/PostalCode"),
                    "ConnectionType": "API",
                    "CostCenterName": "Cost Center 2",
                    "ShipfromCountry": "",
                    "ShippingAccount": accountNumber
                },
                "shiprequest_id": 5348,
                "InternationalDetails": [],
                "ShipmentLevelSpecialServices": {},
                "id": 5445,
                "Notes": [
                    {
                        "date": "2025-02-11T11:59:00.720Z",
                        "name": "info@eshipjet.ai",
                        "notes": "Items are packed sucessfully"
                    },
                    {
                        "date": "2025-02-11T11:59:00.159Z",
                        "name": "info@eshipjet.ai",
                        "notes": "Ship request created successfully"
                    }
                ]
            }

            var packObj = obj.Packages[0];
            var tempArray = [];
            if(HandlingUnits && HandlingUnits.length > 0 && HandlingUnits[0].HandlingUnitExternalID && HandlingUnits[0].HandlingUnitExternalID.length > 0){
                // HandlingUnits.forEach(function(itm, idx ){
                $.each(HandlingUnits, function( index, itm ) {
                    if(itm.HandlingUnitExternalID && itm.HandlingUnitExternalID.length > 0){
                        packObj = obj.Packages[0];
                        packObj.HU = itm.HandlingUnitExternalID;
                        packObj.Weight = itm.GrossWeight;
                        tempArray.push(jQuery.extend(true, {}, packObj));
                        packObj = {};
                    }
                });
                obj["Packages"] = tempArray;
            }


            // var getShipRatePromise = new Promise((resolve, reject) => {
            //     oController.onShipRateRequest(resolve, reject, "ShipNow");
            // });
            // getShipRatePromise.then(function(response) {
                var sPath;
                if(carrier === "ABFS"){
                    sPath = "https://carrier-api-v1.eshipjet.site/ABF";
                }else{
                    sPath = "https://carrier-api-v1.eshipjet.site/"+carrier;
                }
                      // var sPath = "https://eshipjet-stg-scpn-byargfehdgdtf8f3.francecentral-01.azurewebsites.net/FedEx";
                    let myPromise =  new Promise((resolve, reject) => {
                        $.ajax({
                            url: sPath,
                            method: "POST",
                            contentType: "application/json",
                            data: JSON.stringify(obj),
                            success: function (response) {
                                resolve(response);
                                console.log("Success:", response);
                                if(response && response.status === "Success"){
                                    eshipjetModel.setProperty("/ShipNowPostResponse", response);
                                    if(response.Packages.length > 0){
                                        var trackingArray = [];

                                        var ShipNowShipsrvNameSelectedKey = eshipjetModel.getProperty("/commonValues/ShipNowShipsrvNameSelectedKey");
                                        var serviceNameDropdown = eshipjetModel.getProperty("/serviceNameDropdown");
                                        for(var i=0; i<serviceNameDropdown.length; i++){
                                            if(serviceNameDropdown[i].serviceCode === ShipNowShipsrvNameSelectedKey){
                                                var serviceName = serviceNameDropdown[i].serviceName;
                                            }
                                        }
                                        
                                        for(var i=0; i<response.Packages.length; i++){
                                            var trackingObj = {
                                                "COMPANY": response.Shipper.COMPANY,
                                                "ConsolidationId": response.HeaderInfo.ConsolidationId,
                                                "DocumentNumber": response.HeaderInfo.DocumentNumber,
                                                "CreatedDate": response.HeaderInfo.CreatedDate,
                                                "ShipDate": response.HeaderInfo.ShipDate,
                                                "ShipmentType": response.HeaderInfo.ShipmentType,
                                                "CarrierCode": response.CarrierDetails.Carrier,
                                                "ERPCarrierID": serviceName,
                                                "ServiceName" : eshipjetModel.getProperty("/carrierServiceName_dis"),
                                                "TrackingNumber": response.Packages[i].TrackingNumber,
                                                "TrackingStatus": response.TrackingStatus,
                                                "SHIP_TO_CONTACT": response.ShipTo.CONTACT,
                                                "SHIP_TO_COMPANY": response.ShipTo.COMPANY,
                                                "SHIP_TO_ADDRESS_LINE1": response.ShipTo.ADDRESS_LINE1,
                                                "SHIP_TO_STATE": response.ShipTo.STATE,
                                                "SHIP_TO_CITY": response.ShipTo.CITY,
                                                "SHIP_TO_ZIPCODE": response.ShipTo.ZIPCODE,
                                                "SHIP_TO_COUNTRY": response.ShipTo.COUNTRY,
                                                "SHIP_TO_EMAIL": response.ShipTo.UpdatedUser,
                                                "RequesterName": response.ShipFrom.EMAIL,
                                                "ConnectedTo": "SAP ECC 6.0",
                                                "orderType": "Delivery Number"
                                            };
                                            trackingArray.push(trackingObj);
                                            eshipjetModel.setProperty("/trackingArray", trackingArray);
                                        }
                                    }
                                    // if(response && response.shippingCharges && response.shippingCharges.length > 0 ){
                                    //     eshipjetModel.setProperty("/shippingCharges", response.shippingCharges);
                                    // }
                                    if(response && response.shippingDocuments && response.shippingDocuments.length > 0 ){
                                        var shippingDocuments = response.shippingDocuments;
                                        var ashippingDocuments = [];
                                        for(var i=0; i<shippingDocuments.length; i++){
                                            ashippingDocuments.push(
                                                {
                                                    "srNo": i+1,
                                                    "contentType": shippingDocuments[i].contentType,
                                                    "copiesToPrint": shippingDocuments[i].copiesToPrint,
                                                    "docName": shippingDocuments[i].docName,
                                                    "docProvider": shippingDocuments[i].docProvider,
                                                    "docType": shippingDocuments[i].docType,
                                                    "encodedLabel": shippingDocuments[i].encodedLabel,
                                            })
                                        }
                                        eshipjetModel.setProperty("/shippingDocuments", ashippingDocuments);
                                    }

                                    if(response && response.shippingCharges && response.shippingCharges.length > 0 ){
                                        var shippingCharges = response.shippingCharges;
                                        var oShippingCharges = [];
                                        for(var i=0; i<shippingCharges.length; i++){
                                            if(shippingCharges[i].description === "Discount Freight"){
                                                var discount = shippingCharges[i].amount * 0.20;
                                                var discountFreightAmount = shippingCharges[i].amount - discount;
                                                var obj = {
                                                    "description": shippingCharges[i].description,
                                                    "amount": discountFreightAmount,
                                                    "currency": shippingCharges[i].currency
                                                };
                                            }else{
                                                var obj = {
                                                    "description": shippingCharges[i].description,
                                                    "amount": shippingCharges[i].amount,
                                                    "currency": shippingCharges[i].currency
                                                };
                                            }
                                            oShippingCharges.push(obj);
                                        }
                                        eshipjetModel.setProperty("/shippingCharges", oShippingCharges);
                                    }


                                    //post to manifest service
                                    // oController.getManifestData(response);
                                    
                                    oController.updateManifestHeaderSet();         

                                }else if(response && response.status === "Error"){
                                    var sError = "Shipment process failed reasons:\n";
                                    if(response && response.Errors && response.Errors.length > 0){
                                        response.Errors.forEach(function(item){
                                            sError = sError + item+"\n";
                                        });                               
                                    }
                                    sap.m.MessageBox.error(sError);
                                }
                            },
                            error: function (error) {
                                reject(error);
                                console.log("Error:", error);
                                oController.onCloseBusyDialog();
                            }
                        });
                    // });
                    
                    // myPromise.then(
                    //     function(response) {
                    //         oController.updateManifestHeaderSet();
                    //          //oController.FreightQuoteUpdatedSrvData();
                    //         // var myOutbounddeliveryPromise = new Promise((resolve, reject) => {                            
                    //         //     oController.ApiOutboundDeliverySrvData(resolve, reject, response);
                    //         // });
                    //         // myOutbounddeliveryPromise.then(function(){
                              
                    //         //     oController.onCloseBusyDialog();
                    //         // });                                              
                    //     },
                    //     function(error) {
                    //         oController.onCloseBusyDialog();
                    //     // myDisplayer(error);
                    //     }
                    // );                  
            },
            function(error) {
                   
            });          

        },
        addDurationToCurrentTime:function(durationStr, baseDate = new Date()) {
            const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (!match) return null;
        
            const hours = Number(match[1] || 0);
            const minutes = Number(match[2] || 0);
            const seconds = Number(match[3] || 0);
        
            baseDate.setHours(baseDate.getHours() + hours);
            baseDate.setMinutes(baseDate.getMinutes() + minutes);
            baseDate.setSeconds(baseDate.getSeconds() + seconds);
        
            return baseDate.getFullYear() + "-" +
                String(baseDate.getMonth() + 1).padStart(2, '0') + "-" +
                String(baseDate.getDate()).padStart(2, '0') + "T" +
                String(baseDate.getHours()).padStart(2, '0') + ":" +
                String(baseDate.getMinutes()).padStart(2, '0') + ":" +
                String(baseDate.getSeconds()).padStart(2, '0');
        },

        updateManifestHeaderSet: function () {
            var amount, Discountamt, Fuel;
            var sapDeliveryNumber = eshipjetModel.getProperty("/commonValues/sapDeliveryNumber");
            var ShipReadDataSrvModel = oController.getOwnerComponent().getModel("ShipReadDataSrvModel");
            var shippingCharges = eshipjetModel.getProperty("/shippingCharges");
            shippingCharges.forEach(function(item, idx){
                if(item.description === "Published Freight"){
                    amount = item.amount;
                }else if(item.description === "Discount Freight"){
                    Discountamt = item.amount;
                }else {
                    Fuel = item.amount;
                }
            })
            // var amount = eshipjetModel.getProperty("/shippingCharges/0/amount") ? eshipjetModel.getProperty("/shippingCharges/0/amount") : "0" ;
            // let percentage = (20 / 100) * amount;
            // var Discountamt = eshipjetModel.getProperty("/shippingCharges/1/amount");
            let time = new Date();
            time.setMinutes(time.getMinutes() + 10);
            let SAPDate = "/Date(" + time.getTime() + ")/";
            var date = new Date();
            let hours = String(date.getHours()).padStart(2, '0');
            let minutes = String(date.getMinutes()).padStart(2, '0');
            let seconds = String(date.getSeconds()).padStart(2, '0');
            var timeAdded = `PT${hours}H${minutes}M${seconds}S`;
            var packAddProductTable = eshipjetModel.getProperty("/commonValues/packAddProductTable");
            var HandlingUnitsLength = eshipjetModel.getProperty("/HandlingUnitsLength");
            if (HandlingUnitsLength === "0" || HandlingUnitsLength === 0) {
                HandlingUnitsLength = 1
            };
            var grossWeight, shippingDocName, packingSlip, billOfLading;
            var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
            var shippingDocuments = eshipjetModel.getProperty("/shippingDocuments");
            var aHandlingUnits = eshipjetModel.getProperty("/HandlingUnits");
            var oManifestDataObj = {}, aManifestData = [];
            var aHUnitsFilterData = aHandlingUnits.filter(function (item) {
                 return item.HandlingUnitReferenceDocument === sapDeliveryNumber;
            });            
            grossWeight = eshipjetModel.getProperty("/commonValues/packAddProductTable/0/ItemGrossWeight");
            var trackingArray = eshipjetModel.getProperty("/trackingArray");
            
            
            
            oManifestDataObj =  {
                "Saturdaydel": eshipjetModel.getProperty("/SaturdayDelivery"),
                "Residentialdel": eshipjetModel.getProperty("/ResidentialDelivery"),
                "Priorityalert": eshipjetModel.getProperty("/PriorityAlert"),
                "Satpickup": eshipjetModel.getProperty("/SaturdayPickup"),
                "Insidedel": eshipjetModel.getProperty("/InsideDelivery"),
                "Insidepickup": eshipjetModel.getProperty("/InsidePickup"),
                "Liftgate": false,
                "Hold": eshipjetModel.getProperty("/HoldAtLocation"),
                "Dghazmat": false,
                "CodFlag": false,
                "Closeout": false,
                "Upsoffline": false,
                "ArrivalNotification": false,
                "Bsoflag": false,
                "Documents": false,
                "LimitedAccess": false,
                "Fedexonerate": false,
                "Crossdock": false,
                "Ddo": false,
                "Isc": false,
                "Appointment": false,
                "CrossdockRecdate": SAPDate,
                "PodDate": SAPDate,
                "DateAdded": SAPDate,
                "Createddate": SAPDate,
                // "CancDt": "/Date(1734480000000)/",
                "PackageWeight": grossWeight,
                "Chargweight": grossWeight,
                "Codamount": "0.00",
                "Customs": "0.00",
                "Freightamt": amount ? amount.toString() : "0.00" ,
                "Discountamt": Discountamt ?  Discountamt.toString() : "0.00",
                "Insurance": "0.00",
                "Dryweight": "0.000",
                "Mandt": "200",
                "Vbeln": sapDeliveryNumber,
                "Posnr": "",
                "Plant": eshipjetModel.getProperty("/PlantCode"),
                "Shipmenttype": "O",
                "Pkgcount": HandlingUnitsLength ? HandlingUnitsLength.toString() : "0",
                "MultiSeq": "1",
                "MultiLegno": "0",
                "Totalpkg": HandlingUnitsLength ? HandlingUnitsLength.toString() : "0",
                "HandlingUnit": "10006973",
                "SalesOrder": "10006973",
                "PurchaseOrder": "CANCL",
                "TrackingNumber": eshipjetModel.getProperty("/trackingArray/0/TrackingNumber"),
                "Mastertracking": eshipjetModel.getProperty("/trackingArray/0/TrackingNumber"),
                "Uspstracking": "",
                "Iorcode": "",
                "Externaldoc": "",
                "CarrierCode": eshipjetModel.getProperty("/commonValues/ShipNowShipMethodSelectedKey"),
                "Carriertype": eshipjetModel.getProperty("/commonValues/ShipNowShipMethodSelectedKey"),
                "CarrierDesc": eshipjetModel.getProperty("/carrierServiceName_dis"),
                "Paymentcode": "Sender",
                "Shipperacct": eshipjetModel.getProperty("/accountNumber"),
                "Accountnumber": eshipjetModel.getProperty("/accountNumber"),
                "Dutytaxpaytype": "SENDER",
                "Dtaccountnumber": "",
                "Dimensions": "10X12X12",
                "Aesitn": "",
                "Vhilm": eshipjetModel.getProperty("/selectedPackageMat"),
                "Emailaddress": "",
                "Signaturetype": "",
                "RecCompany": ShipNowDataModel.getProperty("/ShipToAddress/BusinessPartnerName1"),
                "RecContact": ShipNowDataModel.getProperty("/ShipToAddress/FullName"),
                "RecAddress1": ShipNowDataModel.getProperty("/ShipToAddress/StreetName"),
                "RecAddress2": ShipNowDataModel.getProperty("/ShipToAddress/HouseNumber"),
                "RecAddress3": "null",
                "RecCity": ShipNowDataModel.getProperty("/ShipToAddress/CityName"),
                "RecRegion": ShipNowDataModel.getProperty("/ShipToAddress/Region"),
                "RecPostalcode": ShipNowDataModel.getProperty("/ShipToAddress/PostalCode"),
                "RecCountry": ShipNowDataModel.getProperty("/ShipToAddress/Country"),
                "RecPhone": ShipNowDataModel.getProperty("/ShipToAddress/PhoneNumber"),
                "Company": ShipNowDataModel.getProperty("/ShipToAddress/BusinessPartnerName1"),
                "Contact": ShipNowDataModel.getProperty("/ShipToAddress/FullName"),
                "Address1": ShipNowDataModel.getProperty("/ShipToAddress/StreetName"),
                "Address2": ShipNowDataModel.getProperty("/ShipToAddress/HouseNumber"),
                "Address3": "null",
                "City": ShipNowDataModel.getProperty("/ShipToAddress/CityName"),
                "Region": ShipNowDataModel.getProperty("/ShipToAddress/Region"),
                "Postalcode": ShipNowDataModel.getProperty("/ShipToAddress/PostalCode"),
                "Country": ShipNowDataModel.getProperty("/ShipToAddress/Country"),
                "Phone": ShipNowDataModel.getProperty("/ShipToAddress/PhoneNumber"),
                "Stceg": "",
                "PodSignature": "",
                "PodLocation": "",
                "PodActivity": "",
                "Podstatus": "",
                "Podcurrentstatus": "",
                "Podexpstatus": "",
                "ReturnTrack": "",
                "FromCompany": ShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCOMPANY"),
                "FromContact": ShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCONTACT"),
                "FromStreet": ShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE1"),
                "Fromcity": ShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCITY"),
                "FromPostalcode": ShipNowDataModel.getProperty("/ShipFromAddress/ShipFromZIPCODE"),
                "FromCountry": ShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCOUNTRY"),
                "FromPhone": ShipNowDataModel.getProperty("/ShipFromAddress/ShipFromPHONE"),
                "EnteredBy": "dm_atla",
                "Sammg": "",
                "Lifnr": "",
                "Waerk": "USD",
                "Billoflading": "",
                "Ltlclass": "",
                "Ltlboxcount": "",
                "Ltlhutype": "",
                "Ltlpacktype": "",
                "Ltlnmfccode": "",
                "TpCompany": "",
                "TpContact": "",
                "TpStreet": "",
                "TpStreet2": "",
                "TpCity1": "",
                "TpRegion": "",
                "TpPostCode1": "",
                "TpCountry": "",
                "TpPhone": "",
                "EuClearance": "",
                "Reference1": "0010006973",
                "Reference2": "",
                "Kunnr": "100188",
                "Kunag": "100188",
                "Vkorg": "BP01",
                "Werks": "BP01",
                "Auart": "OR",
                "Lfart": "LF",
                "Description": "",
                "Shipprocess": "SHIP",
                "Venum": "123",
                "Gewei": "LB",                
                "Reasonforexport": "",
                "Addcomments": "",
                "DimensionFactor": "00000",
                "TransitDays": "000",
                "Delivery": sapDeliveryNumber ? sapDeliveryNumber : "",
                "UpsEod": "",
                "Tcode": "/PWEAVER/PPS",
                "Packagetype": "",
                "Manifestid": "",
                "Scac": "",
                "Sealnumber": "",
                "Trailerno": "",
                "Door": "",
                "Tu": "",
                "Odo": "",
                "Returntype": "",
                "Volumequote": "",
                "Truckno": "",
                "Container": "",
                "Pallets": "",
                "Seal": "",
                "Crossdockloc": "",
                "Ecsid": "",
                "Saleterms": "FOB",
                "Iorpartner": "",
                "Iorcompany": "",
                "Iorcontact": "",
                "Ioraddress1": "",
                "Ioraddress2": "",
                "Iorcity": "",
                "Iorregion": "",
                "Iorpostalcode": "",
                "Iorcountry": "",
                "Iorphone": "",
                "SfOrderid": "",
                "CrossdockStatus": "",
                "CrossdockRecby": "",
                "CrossdockShipby": "",
                "EdiControlNo": "",
                "Edi997Status": "",
                "Shipmentid": "",
                "EodTimestamp": "",
                "Labelurl": shippingDocName,
                "PackURL" : packingSlip,
                "BOLURL": billOfLading,
                "DgUrl": "",
                "Multi": "",
                "Legno": "",
                "Wemshipid": "",
                "Weshipid": "",
                "Wemanfid": "",
                "WeconsolManfid": "",
                "Weportcode": "",
                "Wecloseout": "",
                "WecloseBy": "",
                "Leg": "",
                "Knota": "",
                "Knotz": "",
                "DeliveryStatus": "",
                "Stagloc": "Z00001",
                "Licence": "",
                "Orate": "",
                "Ocarrier": "",
                "Accessorial": "",
                "Fuel": Fuel ?  Fuel.toString() : "0.00",
                "Deliverynno": sapDeliveryNumber ? sapDeliveryNumber : "",
                "TimeAdded": timeAdded ? timeAdded : "",

            };
            // var packCount = 0;
            var Count  = 0
            if(aHUnitsFilterData && aHUnitsFilterData.length > 0) {
                aHUnitsFilterData.forEach(function(item, index){
                    Count = Count  + 1 
                    grossWeight = item.GrossWeight;                
                    oManifestDataObj["HandlingUnit"] = item.HandlingUnitExternalID;
                    oManifestDataObj["PackageWeight"] = grossWeight;
                    oManifestDataObj["Chargweight"]   = grossWeight;   
                    // oManifestDataObj["Labelurl"] = shippingDocuments[index].docName;
                    oManifestDataObj["Pkgcount"] = Count.toString();
                    oManifestDataObj["TrackingNumber"] = trackingArray[index].TrackingNumber;
                    oManifestDataObj["Labelurl"] = shippingDocuments[index].docName;
                    for(var i=0; i<shippingDocuments.length; i++){
                        if(shippingDocuments[i].contentType === "Packing Slip"){
                            oManifestDataObj["PackURL"] = shippingDocuments[i].docName;
                        }else if(shippingDocuments[i].contentType === "Bill Of Lading"){
                            oManifestDataObj["BOLURL"] = shippingDocuments[i].docName;
                        }
                    };
                    // if(shippingDocuments[shippingDocuments.length - 1].contentType === "Packing Slip"){
                    //     oManifestDataObj["PackURL"] = shippingDocuments[shippingDocuments.length - 1].docName;
                    // }
                    aManifestData.push(jQuery.extend(true, {}, oManifestDataObj));
                });
            }else{
                aManifestData.push(oManifestDataObj);
            }
            var oPayload = {
                "Vbeln": sapDeliveryNumber,
                "ToManifestData": aManifestData
            };
            ShipReadDataSrvModel.create("/ManifestHeaderSet", oPayload, {
                success: function (oData) {
                    // MessageBox.success("Shipment processed successfully.", {
                    //     actions: [MessageBox.Action.OK],
                    //     emphasizedAction: MessageBox.Action.OK,
                    //     onClose: function (sAction) {
                    //         oController.showLabelAfterShipmentSuccess(eshipjetModel.getProperty("/ShipNowPostResponse"));
                    //     },
                    //     dependentOn: oController.getView()
                    // });
                    // console.log("Success:", oData);
                    // oController.onCloseBusyDialog();
                    MessageToast.show("Shipment processed successfully.");
                    oController.showLabelAfterShipmentSuccess(eshipjetModel.getProperty("/ShipNowPostResponse"));
                    oController.createPostGoodsIssue(sapDeliveryNumber);
                    
                    // var sAudioPath = sap.ui.require.toUrl("com/eshipjet/zeshipjet/audio/ShipNow.mp3");
                    // var audio = new Audio(sAudioPath);
                    // audio.play();
                    oController.onCloseBusyDialog();
                },
                error: function (oError) {
                    var errMsg = JSON.parse(oError.responseText).error.message.value;
                    sap.m.MessageBox.error(errMsg);
                    oController.onCloseBusyDialog();
                }
            });
        },

        toMicrosoftJsonDate:function(date) {
            return `/Date(${date.getTime()})/`;
        },

    //    for order tables TotalPkg
    formatTotalPkg: function (sValue) {
        if (!sValue) return "";
        return parseInt(sValue, 10).toString();
    },
    
        
        

        createHandlingUnits:function(){
            oController.onOpenBusyDialog();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            // var HandlingUnits = eshipjetModel.getProperty("/HandlingUnits");

            var oPayload = {
                "HandlingUnitExternalID": "300000006",
                "Warehouse": "1710",
                "StockItemUUID": "00000000-0000-0000-0000-000000000001",
                "HandlingUnitItem": "1",
                "HandlingUnitReferenceDocument": "80000001",
                "HandlingUnitRefDocumentItem": "0000000010",
                "HandlingUnitQuantity": "10",
                "HandlingUnitQuantityUnit": "PC",
                "HandlingUnitAltUnitOfMeasure": "PC",
                "Material": "EWMS4-02",
                "ShelfLifeExpirationDate": null,
                "HandlingUnitGoodsReceiptDate": null,
                "to_HandlingUnit": [
                    {
                        "HandlingUnitExternalID": "300000006",
                        "Warehouse": "1710",
                        "PackagingMaterial": "EWMS4-WBTRO00",
                        "PackagingMaterialType": "YN03",
                        "Plant": "",
                        "StorageLocation": "",
                        "ShippingPoint": "1710",
                        "ParentHandlingUnitNumber": "",
                        "GrossWeight": 40.000,
                        "NetWeight": 40.000,
                        "HandlingUnitMaxWeight": 0.000,
                        "WeightUnit": "KG",
                        "HandlingUnitTareWeight": 0.000,
                        "HandlingUnitTareWeightUnit": "KG",
                        "GrossVolume": 30.000,
                        "HandlingUnitNetVolume": 30.000,
                        "VolumeUnit": "L",
                        "HandlingUnitTareVolume": 0.000,
                        "HandlingUnitTareVolumeUnit": "",
                        "HandlingUnitLength": 0.000,
                        "HandlingUnitWidth": 0.000,
                        "HandlingUnitHeight": 0.000,
                        "UnitOfMeasureDimension": "",
                        "HandlingUnitPackingObjectKey": "0080000001",
                        "HandlingUnitReferenceDocument": "80000001",
                        "CreatedByUser": "SOUJANYA.T",
                        "CreationDateTime": "2025-02-18T21:37:55",
                        "LastChangedByUser": "SOUJANYA.T",
                        "LastChangeDateTime": "2025-02-18T21:37:55",
                        "HandlingUnitProcessStatus": "B"
                      }
                ]
            };
            var sPath = "/HandlingUnit(HandlingUnitExternalID='300000006',Warehouse='1710',StockItemUUID=guid'0b246343-97f5-1edf-a498-b24e8bb93e0a')"

            var urlParameters = {
                "$expand": "to_HandlingUnitItem"
            };

            var OutBoundDeliveryModel = oController.getOwnerComponent().getModel("OutBoundDeliveryModel");
            OutBoundDeliveryModel.create(sPath, oPayload, {
                urlParameters: urlParameters,
                success: function (oData) {
                    MessageToast.show("Handling Unit Created Successfully");
                    console.log("Success:", oData);
                    oController.oBusyDialog.close();
                },
                error: function (oError) {
                    var errMsg = JSON.parse(oError.responseText).error.message.value;
                    sap.m.MessageBox.error(errMsg);
                    oController.oBusyDialog.close();
                }
            });
        },

        // createRecentShipments:function(response){
        //     var ShipDate = new Date(response.HeaderInfo.ShipDate);
        //     var timestamp = ShipDate.getTime();
        //     var ShipDate = `/Date(${timestamp})/`;

        //     var CreatedDate = new Date(response.HeaderInfo.CreatedDate);
        //     var timestamp = CreatedDate.getTime();
        //     var CreatedDate = `/Date(${timestamp})/`;

        //     var date = new Date();
        //     let hours = String(date.getHours()).padStart(2, '0');
        //     let minutes = String(date.getMinutes()).padStart(2, '0');
        //     let seconds = String(date.getSeconds()).padStart(2, '0');
        //     var timeAdded = `PT${hours}H${minutes}M${seconds}S`;

        //     var oPayload = {
        //         "Saturdaydel": false,
        //         "Residentialdel": false,
        //         "Priorityalert": false,
        //         "Satpickup": false,
        //         "Insidedel": false,
        //         "Insidepickup": false,
        //         "Liftgate": false,
        //         "Hold": false,
        //         "Dghazmat": false,
        //         "CodFlag": false,
        //         "Closeout": false,
        //         "Upsoffline": false,
        //         "ArrivalNotification": false,
        //         "Bsoflag": false,
        //         "Documents": false,
        //         "LimitedAccess": false,
        //         "Fedexonerate": false,
        //         "Tpc": false,
        //         "Crossdock": false,
        //         "Ddo": false,
        //         "Isc": false,
        //         "Appointment": false,
        //         "DateAdded": ShipDate,
        //         "Createddate": CreatedDate,
        //         "CancDt": null,
        //         "PodDate": null,
        //         "PodCurrentdate": null,
        //         "PodPickupdate": null,
        //         "ExpDelDate": null,
        //         "Scandate": null,
        //         "EtaDate": null,
        //         "CrossdockRecdate": null,
        //         "CrossdockShipdate": null,
        //         "WecloseDate": null,
        //         "PackageWeight": response.Packages[0].Weight,
        //         "Chargweight": "10.000",
        //         "Codamount": "100.000",
        //         "Customs": "0.000",
        //         "Freightamt": response.shippingCharges[0].amount.toString(),
        //         "Discountamt": response.shippingCharges[1].amount.toString(),
        //         "Insurance": "0.000",
        //         "Dryweight": "0.000",
        //         "Vbeln": response.HeaderInfo.DocumentNumber,
        //         "Posnr": "000010",
        //         "Plant": response.HeaderInfo.Location,
        //         "Shipmenttype": "",
        //         "Pkgcount": "00001",
        //         "MultiSeq": "",
        //         "MultiLegno": "",
        //         "Totalpkg": "00001",
        //         "HandlingUnit": "1",
        //         "SalesOrder": "34455",
        //         "PurchaseOrder": "233",
        //         "TrackingNumber": response.Packages[0].TrackingNumber,
        //         "Mastertracking": response.Packages[0].TrackingNumber,
        //         "Uspstracking": "",
        //         "Iorcode": "",
        //         "Externaldoc": "",
        //         "CarrierCode": response.CarrierDetails.Carrier,
        //         "Carriertype": response.CarrierDetails.Carrier,
        //         "CarrierDesc": response.CarrierDetails.Carrier,
        //         "Paymentcode": "SENDER",
        //         "Shipperacct": "4577788",
        //         "Accountnumber": "",
        //         "Dutytaxpaytype": "",
        //         "Dtaccountnumber": "",
        //         "Dimensions": response.Packages[0].Dimension,
        //         "Aesitn": "",
        //         "Vhilm": "",
        //         "Emailaddress": response.HeaderInfo.CreatedUser,
        //         "Signaturetype": "",
        //         "RecCompany": response.ShipTo.COMPANY,
        //         "RecContact": response.ShipTo.CONTACT,
        //         "RecAddress1": response.ShipTo.ADDRESS_LINE1,
        //         "RecAddress2": response.ShipTo.ADDRESS_LINE2,
        //         "RecAddress3": response.ShipTo.ADDRESS_LINE3,
        //         "RecCity": response.ShipTo.CITY,
        //         "RecRegion": "",
        //         "RecPostalcode": response.ShipTo.ZIPCODE,
        //         "RecCountry": response.ShipTo.COUNTRY,
        //         "RecPhone": response.ShipTo.PHONE,
        //         "Company": response.ShipFrom.COMPANY,
        //         "Contact": response.ShipFrom.CONTACT,
        //         "Address1": response.ShipFrom.ADDRESS_LINE1,
        //         "Address2": response.ShipFrom.ADDRESS_LINE2,
        //         "Address3": response.ShipFrom.ADDRESS_LINE3,
        //         "City": response.ShipFrom.CITY,
        //         "Region": "",
        //         "Postalcode": response.ShipFrom.ZIPCODE,
        //         "Country": response.ShipFrom.COUNTRY,
        //         "Phone": response.ShipFrom.PHONE,
        //         "Stceg": "",
        //         "PodSignature": "",
        //         "PodLocation": "",
        //         "PodActivity": "",
        //         "Podstatus": "",
        //         "Podcurrentstatus": "",
        //         "Podexpstatus": "",
        //         "Consolidation": "",
        //         "ReturnTrack": "",
        //         "FromCompany": response.ShipFrom.COMPANY,
        //         "FromContact": response.ShipFrom.CONTACT,
        //         "FromStreet": response.ShipFrom.ADDRESS_LINE1,
        //         "FromStreet2": response.ShipFrom.ADDRESS_LINE2,
        //         "Fromcity": response.ShipFrom.CITY,
        //         "FromRegion": "",
        //         "FromPostalcode": response.ShipFrom.ZIPCODE,
        //         "FromCountry": response.ShipFrom.COUNTRY,
        //         "FromPhone": response.ShipFrom.PHONE,
        //         "EnteredBy": "",
        //         "Sammg": "",
        //         "Lifnr": "",
        //         "Waerk": "",
        //         "Meabm": "",
        //         "Billoflading": "",
        //         "Ltlclass": "",
        //         "Ltlboxcount": "",
        //         "Ltlhutype": "",
        //         "Ltlpacktype": "",
        //         "Ltlnmfccode": "",
        //         "TpCompany": response.ShipTo.COMPANY,
        //         "TpContact": response.ShipTo.CONTACT,
        //         "TpStreet": response.ShipTo.ADDRESS_LINE1,
        //         "TpStreet2": response.ShipTo.ADDRESS_LINE2,
        //         "TpCity1": response.ShipTo.CITY,
        //         "TpRegion": "",
        //         "TpPostCode1": response.ShipTo.ZIPCODE,
        //         "TpCountry": response.ShipTo.COUNTRY,
        //         "TpPhone": response.ShipTo.PHONE,
        //         "EuClearance": "",
        //         "Reference1": "",
        //         "Reference2": "",
        //         "Kunnr": "",
        //         "Kunag": "",
        //         "Vkorg": "",
        //         "Werks": "",
        //         "Auart": "",
        //         "Lfart": "",
        //         "Description": "",
        //         "Shipprocess": "",
        //         "Venum": "",
        //         "Gewei": "",
        //         "Reasonforexport": "",
        //         "Addcomments": "",
        //         "DimensionFactor": "00000",
        //         "TransitDays": "000",
        //         "Delivery": "",
        //         "UpsEod": "",
        //         "Tcode": "",
        //         "Packagetype": "",
        //         "Manifestid": "",
        //         "Scac": "",
        //         "Sealnumber": "",
        //         "Trailerno": "",
        //         "Door": "",
        //         "Paperlessinv": "",
        //         "Tu": "",
        //         "Odo": "",
        //         "Scanflag": "",
        //         "Returntype": "",
        //         "Volumequote": "",
        //         "Truckno": "",
        //         "Container": "",
        //         "Pallets": "",
        //         "Seal": "",
        //         "Crossdockloc": "",
        //         "Ecsid": "",
        //         "Saleterms": "",
        //         "Iorpartner": "",
        //         "Iorcompany": "",
        //         "Iorcontact": "",
        //         "Ioraddress1": "",
        //         "Ioraddress2": "",
        //         "Iorcity": "",
        //         "Iorregion": "",
        //         "Iorpostalcode": "",
        //         "Iorcountry": "",
        //         "Iorphone": "",
        //         "SfOrderid": "",
        //         "CrossdockStatus": "",
        //         "CrossdockRecby": "",
        //         "CrossdockShipby": "",
        //         "EdiControlNo": "",
        //         "Edi997Status": "",
        //         "Shipmentid": "",
        //         "EodTimestamp": "",
        //         "Labelurl": "",
        //         "DgUrl": "",
        //         "Multi": "",
        //         "Legno": "",
        //         "Wemshipid": "",
        //         "Weshipid": "",
        //         "Wemanfid": "",
        //         "WeconsolManfid": "",
        //         "Weportcode": "",
        //         "Wecloseout": "",
        //         "WecloseBy": "",
        //         "Leg": "",
        //         "Knota": "",
        //         "Knotz": "",
        //         "DeliveryStatus": "",
        //         "Stagloc": "",
        //         "Licence": "",
        //         "Orate": "",
        //         "Ocarrier": "",
        //         "Accessorial": "",
        //         "Fuel": "",
        //         "Deliverynno": "",
        //         "TimeAdded": timeAdded,
        //         "CancTim": "PT00H00M00S",
        //         "PodTime": "PT00H00M00S",
        //         "PodCurrenttime": "PT00H00M00S",
        //         "PodPickuptime": "PT00H00M00S",
        //         "Scantime": "PT00H00M00S",
        //         "EtaTime": "PT00H00M00S",
        //         "CrossdockRectime": "PT00H00M00S",
        //         "CrossdockShiptime": "PT00H00M00S",
        //         "WecloseTime": "PT00H00M00S"
        //     };
        //     var ManifestSrvModel = oController.getOwnerComponent().getModel("ManifestSrvModel");
        //     ManifestSrvModel.create("/EshipjetManfestSet", oPayload, {
        //         success: function (oData) {
        //             console.log("Created Successfully", oData);
        //         },
        //         error: function (oError) {
        //             var errMsg = JSON.parse(oError.responseText).error.message.value
        //             sap.m.MessageBox.error(errMsg);
        //         }
        //     });

        //     // var oController = this;
        //     // var ManifestSrvModel = oController.getOwnerComponent().getModel("ManifestSrvModel");
        //     // var Vbeln = response.HeaderInfo.DocumentNumber;

        //     // // Construct the key filter for OData read
        //     // var sFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, Vbeln);

        //     // // Read operation to check if Vbeln exists
        //     // ManifestSrvModel.read("/EshipjetManfestSet", {
        //     //     filters: [sFilter],
        //     //     success: function (oData) {
        //     //         var ShipDate = `/Date(${new Date(response.HeaderInfo.ShipDate).getTime()})/`;
        //     //         var CreatedDate = `/Date(${new Date(response.HeaderInfo.CreatedDate).getTime()})/`;
        //     //         var oPayload = {
        //     //             "Saturdaydel": false,
        //     //             "Residentialdel": false,
        //     //             "Priorityalert": false,
        //     //             "Satpickup": false,
        //     //             "Insidedel": false,
        //     //             "Insidepickup": false,
        //     //             "Liftgate": false,
        //     //             "Hold": false,
        //     //             "Dghazmat": false,
        //     //             "CodFlag": false,
        //     //             "Closeout": false,
        //     //             "Upsoffline": false,
        //     //             "ArrivalNotification": false,
        //     //             "Bsoflag": false,
        //     //             "Documents": false,
        //     //             "LimitedAccess": false,
        //     //             "Fedexonerate": false,
        //     //             "Tpc": false,
        //     //             "Crossdock": false,
        //     //             "Ddo": false,
        //     //             "Isc": false,
        //     //             "Appointment": false,
        //     //             "DateAdded": ShipDate,
        //     //             "Createddate": CreatedDate,
        //     //             "CancDt": null,
        //     //             "PodDate": null,
        //     //             "PodCurrentdate": null,
        //     //             "PodPickupdate": null,
        //     //             "ExpDelDate": null,
        //     //             "Scandate": null,
        //     //             "EtaDate": null,
        //     //             "CrossdockRecdate": null,
        //     //             "CrossdockShipdate": null,
        //     //             "WecloseDate": null,
        //     //             "PackageWeight": response.Packages[0].Weight,
        //     //             "Chargweight": "10.000",
        //     //             "Codamount": "100.000",
        //     //             "Customs": "0.000",
        //     //             "Freightamt": response.shippingCharges[0].amount.toString(),
        //     //             "Discountamt": response.shippingCharges[1].amount.toString(),
        //     //             "Insurance": "0.000",
        //     //             "Dryweight": "0.000",
        //     //             "Vbeln": response.HeaderInfo.DocumentNumber,
        //     //             "Posnr": "000010",
        //     //             "Plant": response.HeaderInfo.Location,
        //     //             "Shipmenttype": "",
        //     //             "Pkgcount": "00001",
        //     //             "MultiSeq": "",
        //     //             "MultiLegno": "",
        //     //             "Totalpkg": "00001",
        //     //             "HandlingUnit": "1",
        //     //             "SalesOrder": "34455",
        //     //             "PurchaseOrder": "233",
        //     //             "TrackingNumber": response.Packages[0].TrackingNumber,
        //     //             "Mastertracking": response.Packages[0].TrackingNumber,
        //     //             "Uspstracking": "",
        //     //             "Iorcode": "",
        //     //             "Externaldoc": "",
        //     //             "CarrierCode": response.CarrierDetails.Carrier,
        //     //             "Carriertype": response.CarrierDetails.Carrier,
        //     //             "CarrierDesc": response.CarrierDetails.Carrier,
        //     //             "Paymentcode": "SENDER",
        //     //             "Shipperacct": "4577788",
        //     //             "Accountnumber": "",
        //     //             "Dutytaxpaytype": "",
        //     //             "Dtaccountnumber": "",
        //     //             "Dimensions": response.Packages[0].Dimension,
        //     //             "Aesitn": "",
        //     //             "Vhilm": "",
        //     //             "Emailaddress": response.HeaderInfo.CreatedUser,
        //     //             "Signaturetype": "",
        //     //             "RecCompany": response.ShipTo.COMPANY,
        //     //             "RecContact": response.ShipTo.CONTACT,
        //     //             "RecAddress1": response.ShipTo.ADDRESS_LINE1,
        //     //             "RecAddress2": response.ShipTo.ADDRESS_LINE2,
        //     //             "RecAddress3": response.ShipTo.ADDRESS_LINE3,
        //     //             "RecCity": response.ShipTo.CITY,
        //     //             "RecRegion": "",
        //     //             "RecPostalcode": response.ShipTo.ZIPCODE,
        //     //             "RecCountry": response.ShipTo.COUNTRY,
        //     //             "RecPhone": response.ShipTo.PHONE,
        //     //             "Company": response.ShipFrom.COMPANY,
        //     //             "Contact": response.ShipFrom.CONTACT,
        //     //             "Address1": response.ShipFrom.ADDRESS_LINE1,
        //     //             "Address2": response.ShipFrom.ADDRESS_LINE2,
        //     //             "Address3": response.ShipFrom.ADDRESS_LINE3,
        //     //             "City": response.ShipFrom.CITY,
        //     //             "Region": "",
        //     //             "Postalcode": response.ShipFrom.ZIPCODE,
        //     //             "Country": response.ShipFrom.COUNTRY,
        //     //             "Phone": response.ShipFrom.PHONE,
        //     //             "Stceg": "",
        //     //             "PodSignature": "",
        //     //             "PodLocation": "",
        //     //             "PodActivity": "",
        //     //             "Podstatus": "",
        //     //             "Podcurrentstatus": "",
        //     //             "Podexpstatus": "",
        //     //             "Consolidation": "",
        //     //             "ReturnTrack": "",
        //     //             "FromCompany": response.ShipFrom.COMPANY,
        //     //             "FromContact": response.ShipFrom.CONTACT,
        //     //             "FromStreet": response.ShipFrom.ADDRESS_LINE1,
        //     //             "FromStreet2": response.ShipFrom.ADDRESS_LINE2,
        //     //             "Fromcity": response.ShipFrom.CITY,
        //     //             "FromRegion": "",
        //     //             "FromPostalcode": response.ShipFrom.ZIPCODE,
        //     //             "FromCountry": response.ShipFrom.COUNTRY,
        //     //             "FromPhone": response.ShipFrom.PHONE,
        //     //             "EnteredBy": "",
        //     //             "Sammg": "",
        //     //             "Lifnr": "",
        //     //             "Waerk": "",
        //     //             "Meabm": "",
        //     //             "Billoflading": "",
        //     //             "Ltlclass": "",
        //     //             "Ltlboxcount": "",
        //     //             "Ltlhutype": "",
        //     //             "Ltlpacktype": "",
        //     //             "Ltlnmfccode": "",
        //     //             "TpCompany": response.ShipTo.COMPANY,
        //     //             "TpContact": response.ShipTo.CONTACT,
        //     //             "TpStreet": response.ShipTo.ADDRESS_LINE1,
        //     //             "TpStreet2": response.ShipTo.ADDRESS_LINE2,
        //     //             "TpCity1": response.ShipTo.CITY,
        //     //             "TpRegion": "",
        //     //             "TpPostCode1": response.ShipTo.ZIPCODE,
        //     //             "TpCountry": response.ShipTo.COUNTRY,
        //     //             "TpPhone": response.ShipTo.PHONE,
        //     //             "EuClearance": "",
        //     //             "Reference1": "",
        //     //             "Reference2": "",
        //     //             "Kunnr": "",
        //     //             "Kunag": "",
        //     //             "Vkorg": "",
        //     //             "Werks": "",
        //     //             "Auart": "",
        //     //             "Lfart": "",
        //     //             "Description": "",
        //     //             "Shipprocess": "",
        //     //             "Venum": "",
        //     //             "Gewei": "",
        //     //             "Reasonforexport": "",
        //     //             "Addcomments": "",
        //     //             "DimensionFactor": "00000",
        //     //             "TransitDays": "000",
        //     //             "Delivery": "",
        //     //             "UpsEod": "",
        //     //             "Tcode": "",
        //     //             "Packagetype": "",
        //     //             "Manifestid": "",
        //     //             "Scac": "",
        //     //             "Sealnumber": "",
        //     //             "Trailerno": "",
        //     //             "Door": "",
        //     //             "Paperlessinv": "",
        //     //             "Tu": "",
        //     //             "Odo": "",
        //     //             "Scanflag": "",
        //     //             "Returntype": "",
        //     //             "Volumequote": "",
        //     //             "Truckno": "",
        //     //             "Container": "",
        //     //             "Pallets": "",
        //     //             "Seal": "",
        //     //             "Crossdockloc": "",
        //     //             "Ecsid": "",
        //     //             "Saleterms": "",
        //     //             "Iorpartner": "",
        //     //             "Iorcompany": "",
        //     //             "Iorcontact": "",
        //     //             "Ioraddress1": "",
        //     //             "Ioraddress2": "",
        //     //             "Iorcity": "",
        //     //             "Iorregion": "",
        //     //             "Iorpostalcode": "",
        //     //             "Iorcountry": "",
        //     //             "Iorphone": "",
        //     //             "SfOrderid": "",
        //     //             "CrossdockStatus": "",
        //     //             "CrossdockRecby": "",
        //     //             "CrossdockShipby": "",
        //     //             "EdiControlNo": "",
        //     //             "Edi997Status": "",
        //     //             "Shipmentid": "",
        //     //             "EodTimestamp": "",
        //     //             "Labelurl": "",
        //     //             "DgUrl": "",
        //     //             "Multi": "",
        //     //             "Legno": "",
        //     //             "Wemshipid": "",
        //     //             "Weshipid": "",
        //     //             "Wemanfid": "",
        //     //             "WeconsolManfid": "",
        //     //             "Weportcode": "",
        //     //             "Wecloseout": "",
        //     //             "WecloseBy": "",
        //     //             "Leg": "",
        //     //             "Knota": "",
        //     //             "Knotz": "",
        //     //             "DeliveryStatus": "",
        //     //             "Stagloc": "",
        //     //             "Licence": "",
        //     //             "Orate": "",
        //     //             "Ocarrier": "",
        //     //             "Accessorial": "",
        //     //             "Fuel": "",
        //     //             "Deliverynno": "",
        //     //             "TimeAdded": "PT00H00M00S",
        //     //             "CancTim": "PT00H00M00S",
        //     //             "PodTime": "PT00H00M00S",
        //     //             "PodCurrenttime": "PT00H00M00S",
        //     //             "PodPickuptime": "PT00H00M00S",
        //     //             "Scantime": "PT00H00M00S",
        //     //             "EtaTime": "PT00H00M00S",
        //     //             "CrossdockRectime": "PT00H00M00S",
        //     //             "CrossdockShiptime": "PT00H00M00S",
        //     //             "WecloseTime": "PT00H00M00S"
        //     //         };
        //     //         if (oData.results.length > 0) {
        //     //             // If Vbeln exists, perform an update
        //     //             var sUpdatePath = `/EshipjetManfestSet('${Vbeln}')`;
        //     //             ManifestSrvModel.update(sUpdatePath, oPayload, {
        //     //                 success: function () {
        //     //                     sap.m.MessageToast.show("Shipment updated successfully");
        //     //                 },
        //     //                 error: function (oError) {
        //     //                     var errMsg = JSON.parse(oError.responseText).error.message.value;
        //     //                     sap.m.MessageBox.error(errMsg);
        //     //                 }
        //     //             });
        //     //         } else {
        //     //             // If Vbeln does not exist, perform a create
        //     //             ManifestSrvModel.create("/EshipjetManfestSet", oPayload, {
        //     //                 success: function (oData) {
        //     //                     sap.m.MessageToast.show("Shipment created successfully");
        //     //                 },
        //     //                 error: function (oError) {
        //     //                     var errMsg = JSON.parse(oError.responseText).error.message.value;
        //     //                     sap.m.MessageBox.error(errMsg);
        //     //                 }
        //     //             });
        //     //         }
        //     //     },
        //     //     error: function (oError) {
        //     //         var errMsg = JSON.parse(oError.responseText).error.message.value;
        //     //         sap.m.MessageBox.error("Error checking existing shipment: " + errMsg);
        //     //     }
        //     // });
        // },


        showLabelAfterShipmentSuccess: function (response) {
            var oView = this.getView();
            var localModel = oView.getModel();
            var shippingDocuments = eshipjetModel.getProperty("/shippingDocuments");

            var sDocName, encodedLabel, currentObj;
            if(response && response.shippingDocuments && response.shippingDocuments.length > 0){
                for(var i=0; i<response.shippingDocuments.length; i++){
                    if(response.shippingDocuments[i].contentType === "Label"){
                        currentObj = response.shippingDocuments[i];
                    }
                }
                // encodedLabel = response.shippingDocuments[0].docName;
            }            
            // localModel.setProperty("/encodedLabel", encodedLabel);        
            // if (!this.byId("idAfterShipmentLabelDialog")) {
            //     Fragment.load({
            //         id: oView.getId(),
            //         name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.AfterShipNowClickDialog",
            //         controller: this
            //     }).then(function (oDialog) {
            //         oView.addDependent(oDialog);
            //         oDialog.getContent()[0].getItems()[0].setSrc(encodedLabel);
            //         oDialog.open();
            //     });
            // } else {
            //     this.byId("idAfterShipmentLabelDialog").getContent()[0].getItems()[0].setSrc(encodedLabel);
            //     this.byId("idAfterShipmentLabelDialog").open();
            // }
            // oController.onCloseBusyDialog();
            

            // var currentObj = oEvent.getSource().getBindingContext("eshipjetModel").getObject();
            var docName = currentObj.docName;
            this._contentType = currentObj.contentType;
            var oDialogContent;
            if (this._contentType === "Label") {
                this._contentType = "Carrier Label";
            }
            this._dialogContent;
                if(currentObj.docType.toUpperCase() === "PDF"){
                    this._dialogContent = new sap.ui.core.HTML({
                        content: "<iframe src='"+docName+"' width='500px' height='600px'></iframe>"
                    });
                }else{
                    var oCarousel = new sap.m.Carousel({});
                    for(var i=0; i<shippingDocuments.length-1; i++) {
                        var oImage = new sap.m.Image({
                            src: shippingDocuments[i].docName,
                            class: "sapUiSmallMargin",
                            width: "500px",
                            height: "620px"
                        });
                        oCarousel.addPage(oImage);
                    };
                    this._dialogContent = oCarousel;
                }
                var oDeclineButton = new sap.m.Button({
                    icon: "sap-icon://decline",
                    class: "Decline_Btn ship-now-decline_btn",
                    type: "Transparent",
                    press: function () {
                        this.onShipmentLabelDialogClosePress();
                    }.bind(this)
                });
                // **Create a toolbar as a custom header**
                var oCustomHeader = new sap.m.Toolbar({
                    content: [
                        new sap.m.Title({ text: this._contentType, level: "H2" }),
                        new sap.m.ToolbarSpacer(), // Pushes the Decline button to the right
                        oDeclineButton
                    ]
                });
            //if (!this._oShippingDocumentDialog) {
                this._oShipmentSuccessLabelDialog = new Dialog({
                    customHeader: oCustomHeader,
                    contentWidth: "500px",
                    contentHeight: "620px",
                    content: [this._dialogContent]
                });
                this.getView().addDependent(this._oShipmentSuccessLabelDialog);
            //}
            this._oShipmentSuccessLabelDialog.open();
        },
        
        onShipmentLabelDialogClosePress: function () {
            oController._oShipmentSuccessLabelDialog.close();
            oController.onOpenBusyDialog(); 
            // this.byId("idAfterShipmentLabelDialog").close();
            var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
            var shipFromObj = {
                "ShipFromCONTACT": "",
                "ShipFromCOMPANY": "",
                "ShipFromPHONE": "",
                "ShipFromEMAIL": "",
                "ShipFromCITY": "",
                "ShipFromSTATE": "",
                "ShipFromCOUNTRY": "",
                "ShipFromZIPCODE": "",
                "ShipFromADDRESS_LINE1": "",
                "ShipFromADDRESS_LINE2": "",
                "ShipFromADDRESS_LINE3": ""
            }
            ShipNowDataModel.setProperty("/ShipFromAddress", shipFromObj);
            ShipNowDataModel.setProperty("/ShipFromAddressType", "");
            ShipNowDataModel.setProperty("/ShipToAddress", {});
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            
            eshipjetModel.setProperty("/commonValues/sapDeliveryNumber","");
            eshipjetModel.setProperty("/BusinessPartners", []);
            eshipjetModel.setProperty("/commonValues/ShipNowShipMethodSelectedKey", "");
            eshipjetModel.setProperty("/commonValues/ShipNowShipsrvNameSelectedKey", "");
            eshipjetModel.setProperty("/accountNumber", "");
            eshipjetModel.setProperty("/commonValues/packAddProductTable", []);
            eshipjetModel.setProperty("/InternationalDetails/shipFromTaxNo", "");
            eshipjetModel.setProperty("/InternationalDetails/shipFromTaxNo", "");
            eshipjetModel.setProperty("/trackingArray", []);
            eshipjetModel.setProperty("/shippingCharges",[]);
            eshipjetModel.setProperty("/shippingDocuments",[]);
            eshipjetModel.setProperty("/HandlingUnitItems",[]);
            eshipjetModel.setProperty("/HandlingUnits",[]);
            eshipjetModel.setProperty("/commonValues/toolPageHeader", false);
            eshipjetModel.setProperty("/commonValues/allViewsFooter", false);
            eshipjetModel.setProperty("/commonValues/shipNowViewFooter", true);
            eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
            eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
            eshipjetModel.setProperty("/showDarkThemeSwitch", false);
            eshipjetModel.setProperty("/commonValues/darkTheme", false);
            eshipjetModel.setProperty("/commonValues/OverallGoodsMovementStatus", ""); 

            jQuery.sap.delayedCall(500, oController, function() {
                oController.getView().byId("idSapDeliveryNumber").focus();
            });
            
            oController.onPackSectionEmptyRows();

            oController.onCloseBusyDialog();
        },
        onShipmentLabelDialogClosePress1: function () {
            this.byId("idAfterShipmentLabelDialog").close();
        },
        
        onShippingDocumentsViewPress:function(oEvent){
            var currentObj = oEvent.getSource().getBindingContext("eshipjetModel").getObject();
            var shippingDocuments = eshipjetModel.getProperty("/shippingDocuments");
            var tepmShippingDocs = eshipjetModel.getProperty("/tepmShippingDocs");
            var docName = currentObj.docName;
            this._contentType = currentObj.contentType;
            if (this._contentType === "Label") {
                this._contentType = "Carrier Label";
            }
            this._dialogContent;
                if(currentObj.docType.toUpperCase() === "PDF"){
                    this._dialogContent = new sap.ui.core.HTML({
                        content: "<iframe src='"+docName+"' width='500px' height='600px'></iframe>"
                    })
                }else{
                    var oCarousel = new sap.m.Carousel({});
                    for(var i=0; i<tepmShippingDocs.length; i++) {
                        var oImage = new sap.m.Image({
                        class: "sapUiSmallMargin",
                        src: tepmShippingDocs[i].docName,
                        width: "500px",
                        height: "620px"
                    });
                    oCarousel.addPage(oImage);
                };
                this._dialogContent = oCarousel;
                }
                var oDeclineButton = new sap.m.Button({
                    icon: "sap-icon://decline",
                    class: "Decline_Btn ship-now-decline_btn",
                    type: "Transparent",
                    press: function () {
                        this._oShippingDocumentDialog.close();
                    }.bind(this)
                });
                // **Create a toolbar as a custom header**
                var oCustomHeader = new sap.m.Toolbar({
                    content: [
                        new sap.m.Title({ text: this._contentType, level: "H2" }),
                        new sap.m.ToolbarSpacer(), // Pushes the Decline button to the right
                        oDeclineButton
                    ]
                });
            //if (!this._oShippingDocumentDialog) {
                this._oShippingDocumentDialog = new Dialog({
                    customHeader: oCustomHeader,
                    contentWidth: "500px",
                    contentHeight: "620px",
                    content: [this._dialogContent]
                });
                this.getView().addDependent(this._oShippingDocumentDialog);
            //}
            this._oShippingDocumentDialog.open();
        },

        // getManifestData:function(response){
        //     var ManifestSrvModel = oController.getOwnerComponent().getModel("ManifestSrvModel");
        //     // var sDeveliveryNumber = eshipjetModel.getProperty("/sapDeliveryNumber");
        //     // var plant = response.ShipTo.COMPANY.split(" ")[1]
        //     // var ShipDate = `/Date(${new Date(response.HeaderInfo.ShipDate).getTime()})/`
        //     // var Createddate = `/Date(${new Date(response.HeaderInfo.CreatedDate).getTime()})/`
        //     var hours = 2;
        //     var minutes = 30;
        //     var seconds = 45;
        //     //var TimeAdded = `PT${String(hours).padStart(2, '0')}H${String(minutes).padStart(2, '0')}M${String(seconds).padStart(2, '0')}S`;

        //     var Residentialdel;
        //     if(response.ShipTo === "Residential"){
        //         Residentialdel = true;
        //     }else{
        //         Residentialdel = false;
        //     }
        //     var obj = 
        //     {
        //         "Vbeln": "80000001",
        //         "Posnr": "000010",
        //         "Plant": "1710",
        //         "TimeAdded": "PT00H00M00S",
        //         "Pkgcount": "00001",
        //         "Totalpkg": "00001",
        //         "HandlingUnit": "1",
        //         "SalesOrder": "34455",
        //         "PurchaseOrder": "233",
        //         "TrackingNumber": "890000890",
        //         "Mastertracking": "890000890",
        //         "PackageWeight": "10.000",
        //         "Chargweight": "10.000",
        //         "CarrierCode": "FEDEX",
        //         "Carriertype": "FEDEX",
        //         "CarrierDesc": "FEDEX",
        //         "Paymentcode": "SENDER",
        //         "Shipperacct": "4577788",
        //         "Dimensions": "10X10X19",
        //         "Codamount": "100.000",
        //         "Freightamt": "40.000",
        //         "Discountamt": "40.000",
        //         "Saturdaydel": false,
        //         "Residentialdel": false,
        //         "Priorityalert": false,
        //         "Satpickup": false,
        //         "Insidedel": false,
        //         "Insidepickup": false,
        //         "Liftgate": false,
        //         "Hold": false,
        //         "Dghazmat": false,
        //         "CancDt": null,
        //         "CancTim": "PT00H00M00S",
        //         "PodDate": null,
        //         "PodTime": "PT00H00M00S",
        //         "PodCurrentdate": null,
        //         "PodCurrenttime": "PT00H00M00S",
        //         "PodPickupdate": null,
        //         "PodPickuptime": "PT00H00M00S",
        //         "CodFlag": false,
        //         "Closeout": false,
        //         "ExpDelDate": null,
        //         "Upsoffline": false,
        //         "ArrivalNotification": false,
        //         "Bsoflag": false,
        //         "Documents": false,
        //         "LimitedAccess": false,
        //         "Fedexonerate": false,
        //         "Tpc": false,
        //         "Scandate": null,
        //         "Scantime": "PT00H00M00S",
        //         "EtaDate": null,
        //         "EtaTime": "PT00H00M00S",
        //         "Crossdock": false,
        //         "CrossdockRecdate": null,
        //         "CrossdockRectime": "PT00H00M00S",
        //         "CrossdockShipdate": null,
        //         "CrossdockShiptime": "PT00H00M00S",
        //         "Ddo": false,
        //         "Isc": false,
        //         "WecloseDate": null,
        //         "WecloseTime": "PT00H00M00S",
        //         "Appointment": false,
        //     };
        //     ManifestSrvModel.create("/EshipjetManfestSet", obj, {
        //         success:function(oRes){

        //         },
        //         error(oErr){

        //         }
        //     });
        // },

        onShipNowGetPress: async function () {            
            var sDeveliveryNumber = eshipjetModel.getProperty("/commonValues/sapDeliveryNumber");
            eshipjetModel.setProperty("/commonValues/ShipNowShipsrvNameSelectedKey","");
            eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
            eshipjetModel.setProperty("/shippingCharges", []);
            eshipjetModel.setProperty("/shippingDocuments", []);
            eshipjetModel.setProperty("/trackingArray", []);
            eshipjetModel.setProperty("/commonValues/ShipNowShipMethodSelectedKey","");
            eshipjetModel.setProperty("/commonValues/accountNumber","");    
            eshipjetModel.setProperty("/commonValues/OverallGoodsMovementStatus", "");
            eshipjetModel.setProperty("/commonValues/shipNowBtnStatus", true);
            let myPromise = new Promise(function(myResolve, myReject) {
                oController.shipNowData(sDeveliveryNumber, "ShipNow", myResolve);                                                    
            });
        },

        onOpenBusyDialog: function () {
            if (!oController._pBusyDialog) {
				oController._pBusyDialog = Fragment.load({
                    name: "com.eshipjet.zeshipjet.view.fragments.BusyDialog",
					controller: oController
				}).then(function (oBusyDialog) {
					oController.getView().addDependent(oBusyDialog);
					//syncStyleClass("sapUiSizeCompact", this.getView(), oBusyDialog);
					return oBusyDialog;
				}.bind(oController));
			}

			oController._pBusyDialog.then(function(oBusyDialog) {
				oBusyDialog.open();				
			}.bind(oController));
        },

        onCloseBusyDialog:function(oEvent){
            //this.byId("idBusyDialog").close();
            oController._pBusyDialog.then(function(oBusyDialog) {
                oBusyDialog.close();
            });
        },     

        shipNowData:function(sDeveliveryNumber ,sFromMenu, myResolve){
            var oDeliveryModel = oController.getView().getModel("OutBoundDeliveryModel");                    
            var oHandlingUnitModel = oController.getView().getModel("HandlingUnitModel");           
            var sPath = "/A_OutbDeliveryHeader('"+ sDeveliveryNumber +"')/to_DeliveryDocumentPartner";
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            if(sDeveliveryNumber && sDeveliveryNumber.length >= 7){
                oController.onOpenBusyDialog();
                
                var path = "/A_OutbDeliveryHeader('"+ sDeveliveryNumber +"')"
                oDeliveryModel.read(path,{
                    urlParameters: {
                        "$expand": "to_DeliveryDocumentItem,to_DeliveryDocumentPartner"
                    },
                    success:function(oData){                        
                        oController.etag = oData.__metadata.etag;
                        oController.ShippingType = oData.ShippingType;
                        eshipjetModel.setProperty("/PlantCode",oData.ShippingPoint);
                        eshipjetModel.setProperty("/commonValues/ShipNowShipsrvNameSelectedKey", oData.ShippingType);
                        eshipjetModel.setProperty("/commonValues/OverallGoodsMovementStatus", oData.OverallGoodsMovementStatus);
                        oController.getManifestHeaderForCharges(sDeveliveryNumber);
                    },
                    error: function(oErr){
                        oController.onCloseBusyDialog();
                    }
                });

                oDeliveryModel.read(sPath,{
                    // urlParameters: {
                    //     "$expand": "to_DeliveryDocumentItem,to_DeliveryDocumentPartner"
                    // },
                    success:function(oData){
                        if(oData){                      
                            oController._getShipToAddress(oData.results, sDeveliveryNumber, sFromMenu);
                        }
                        myResolve();
                    },
                    error: function(oErr){                        
                        console.log(oErr);
                        myResolve();
                        oController.onCloseBusyDialog();
                    }
                });

               
                //var promise = new promise(function(resolved, rejected){
                    var aOutBoundDelveryFilter = [], aProductTable = [];
                    aOutBoundDelveryFilter.push(new Filter("DeliveryDocument", "EQ", sDeveliveryNumber));
                    oDeliveryModel.read("/A_OutbDeliveryItem",{
                        filters: aOutBoundDelveryFilter,
                        success:function(oData){
                            if(oData && oData.results && oData.results.length > 0){
                                for(var i = 0; i < oData.results.length; i++){
                                    oData.results[i]["SerialNumber"] = i+1;
                                    oData.results[i]["ItemWeightUnit"] = "10X12X12";
                                    oData.results[i]["BalanceQty"] = oData.results[i].ActualDeliveryQuantity;
                                    aProductTable.push(oData.results[i]);
                                };
                                var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
                                eshipjetModel.setProperty("/commonValues/packAddProductTable",aProductTable);
                                oController.getSalesOrder(aProductTable);
                                oController.readHUDataSet(sDeveliveryNumber)
                            }
                        },
                        error: function(oErr){
                            console.log(oErr);
                            oController.onCloseBusyDialog();
                        }
                    });
                
            }
        },

        getManifestHeaderForCharges:function(sDeveliveryNumber){
            oController.onOpenBusyDialog();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var ManifestSrvModel = oController.getOwnerComponent().getModel("ManifestSrvModel");
            var aFilters = [
                new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sDeveliveryNumber)
            ];

            ManifestSrvModel.read("/EshipjetManfestSet",{
                filters: aFilters,
                success:function(response){
                    eshipjetModel.setProperty("/getManifestHeader", response.results);
                    if (response && response.results) {
                        // Apply filtering after receiving the response
                        var aFilteredData = response.results.filter(function (item) {
                            return item.Vbeln === sDeveliveryNumber;
                        });
                        var OverallGoodsMovementStatus = eshipjetModel.getProperty("/commonValues/OverallGoodsMovementStatus");
                        var shipNowStatus = true;
                        if(response.results.length > 0){
                            shipNowStatus = false;
                        };
                        eshipjetModel.setProperty("/commonValues/shipNowBtnStatus", shipNowStatus);
                        if(aFilteredData && aFilteredData.length > 0){
                            var aShippingCharges = [
                                { "description": "Freight Amount", "amount": parseInt(aFilteredData[0].Freightamt).toFixed(2), "currency": "USD" },
                                { "description": "Discount Amount", "amount": parseInt(aFilteredData[0].Discountamt).toFixed(2), "currency": "USD" },
                                { "description": "Fuel", "amount": parseInt(aFilteredData[0].Fuel).toFixed(2) === "" ? "amount" : "0.00", "currency": "USD" }
                            ];
                            eshipjetModel.setProperty("/shippingCharges", aShippingCharges);
                            var shippingDocuments = response.shippingDocuments;
                            var ashippingDocuments = [];
                            var tepmShippingDocs = [];
                            tepmShippingDocs.push({
                                "srNo": 1,
                                "contentType": "Label",
                                "copiesToPrint": 1,
                                "encodedLabel": "",
                                "docProvider": aFilteredData[0].Carriertype,
                                "docType": aFilteredData[0].Labelurl.split(".")[aFilteredData[0].Labelurl.split(".").length-1],
                                "docName": aFilteredData[0].Labelurl,
                            });
                            
                            for(var i=0; i<aFilteredData.length; i++){
                                var obj = {
                                        "srNo": i+1,
                                        "contentType": "Label",
                                        "copiesToPrint": 1,
                                        "encodedLabel": "",
                                        "docProvider": aFilteredData[i].Carriertype,
                                        "docType": aFilteredData[i].Labelurl.split(".")[aFilteredData[i].Labelurl.split(".").length-1],
                                        "docName": aFilteredData[i].Labelurl,
                                };
                                
                                ashippingDocuments.push(obj);
                            }

                            var packObj = {
                                "srNo": 2,
                                "contentType": "Packing Slip",
                                "copiesToPrint": 1,
                                "encodedLabel": "",
                                "docProvider": "Eshipjet",
                                "docType": aFilteredData[0].PackURL.split(".")[aFilteredData[0].PackURL.split(".").length-1],
                                "docName": aFilteredData[0].PackURL,
                        };
                        tepmShippingDocs.push(packObj);

                        if(aFilteredData[0].BolURL !== "" && aFilteredData[0].BolURL !== undefined){    
                            var billOfLading = {
                                    "srNo": 3,
                                    "contentType": "Bill Of lading",
                                    "copiesToPrint": 1,
                                    "encodedLabel": "",
                                    "docProvider": "Eshipjet",
                                    "docType": aFilteredData[0].BolURL.split(".")[aFilteredData[0].BolURL.split(".").length-1],
                                    "docName": aFilteredData[0].BolURL,
                            }
                            tepmShippingDocs.push(billOfLading);
                        }

                            


                                
                            eshipjetModel.setProperty("/shippingDocuments", tepmShippingDocs);
                            eshipjetModel.setProperty("/tepmShippingDocs", ashippingDocuments );

                            var trackingArray = [];
                            for(var i=0; i<aFilteredData.length; i++){
                                var trackingObj = {
                                    "COMPANY":aFilteredData[i].Company,
                                    "ConsolidationId": aFilteredData[i].Consolidation,
                                    "DocumentNumber": aFilteredData[i].Delivery,
                                    "CreatedDate": aFilteredData[i].Createddate,
                                    "ShipDate": aFilteredData[i].DateAdded,
                                    "ShipmentType": aFilteredData[i].Shipmenttype,
                                    "CarrierCode": aFilteredData[i].CarrierCode,
                                    "ERPCarrierID": aFilteredData[i].CarrierCode,
                                    "ServiceName": aFilteredData[i].CarrierDesc,
                                    "TrackingNumber": aFilteredData[i].TrackingNumber,
                                    "TrackingStatus": aFilteredData[i].Shipprocess,
                                    "SHIP_TO_CONTACT": aFilteredData[i].Contact,
                                    "SHIP_TO_COMPANY": aFilteredData[i].Company,
                                    "SHIP_TO_ADDRESS_LINE1": aFilteredData[i].Address1,
                                    "SHIP_TO_STATE": aFilteredData[i].RecRegion,
                                    "SHIP_TO_CITY": aFilteredData[i].City,
                                    "SHIP_TO_ZIPCODE": aFilteredData[i].RecPostalcode,
                                    "SHIP_TO_COUNTRY": aFilteredData[i].Country,
                                    "SHIP_TO_EMAIL": aFilteredData[i].Emailaddress,
                                    "RequesterName": "",
                                    "ConnectedTo": "SAP ECC 6.0",
                                    "orderType": "Delivery Number"
                                };
                                trackingArray.push(trackingObj);
                                eshipjetModel.setProperty("/trackingArray", trackingArray);
                            }
                            eshipjetModel.updateBindings(true);
                        }
                    }
                    // oController.onCloseBusyDialog();
                },
                error: function(error){
                    MessageBox.warning(error.responseText);
                    oController.onCloseBusyDialog();
                }
            });
        },

        getHandlingUnit:function(aHanlingUnits){            
            var oView = oController.getView();
            var oHandlingUnitModel = this.getView().getModel("HandlingUnitModel");            
            let sPath = "", aFilters = [] ;
            for (var i = 0; i < aHanlingUnits.length; i++) {               
                aFilters.push(new Filter("HandlingUnitReferenceDocument", "EQ", aHanlingUnits[i].HandlingUnitReferenceDocument));              
            }
            oHandlingUnitModel.read("/HandlingUnitItem",{
                filters: aFilters,
                success:function(oData){
                    if(oData && oData.results && oData.results.length > 0){
                        var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
                        eshipjetModel.setProperty("/HandlingUnitItems",oData.results);
                        var aProductTableData = eshipjetModel.getProperty("/commonValues/packAddProductTable");
                        aProductTableData.forEach(function(obj, idx){
                            if(obj.DeliveryDocumentItem !== undefined){
                                var count = 0;
                                oData.results.forEach(function(huObj){
                                    if(parseInt(obj.DeliveryDocumentItem) === parseInt(huObj.HandlingUnitRefDocumentItem)){
                                        count += parseInt(huObj.HandlingUnitQuantity);
                                    }
                                });
                                var qty = parseInt(obj.ActualDeliveryQuantity) - count;
                                if(qty === 0){
                                    aProductTableData.splice(idx, 1);
                                }else{
                                    obj.BalanceQty = qty;
                                }
                            }
                        });

                        eshipjetModel.updateBindings(true);
                        
                        // var oShipNowHandlingUnitTable = oView.byId("idShipNowHandlingUnitTable");
                        // if(oShipNowHandlingUnitTable){
                        //     oShipNowHandlingUnitTable.setModel(eshipjetModel);
                        //    // oShipNowHandlingUnitTable.bindRows("/HandlingUnitItems");
                        // }
                    }
                },
                error: function(oErr){
                    var err = oErr;
                }
            });
            oController.onPackSectionEmptyRows();
        },
        getSalesOrder:function(aProductTable){
            var oSalesOrderModel = oController.getOwnerComponent().getModel("SalesOrderModel");            
            var sPath = "", aFilters = [] ;
            for (var i = 0; i < aProductTable.length; i++) {               
                aFilters.push(new Filter("SalesOrder", "EQ", aProductTable[i].ReferenceSDDocument));              
            }
            oSalesOrderModel.read("/A_SalesOrderItem",{
                filters: aFilters,
                success:function(oData){
                    if(oData && oData.results && oData.results.length > 0){
                        eshipjetModel.setProperty("/SalesOrderItems",oData.results);
                    }
                },
                error: function(oErr){
                    var err = oErr;
                }
            });

        },
        _getShipToAddress:function(aResults, sDocNumber, sFromMenu){
            var oDeliveryModel = oController.getView().getModel("OutBoundDeliveryModel");
            var oShipNowModel = oController.getView().getModel("ShipNowDataModel");
            oDeliveryModel.setDeferredGroups(["addressDefferedgroupID"]);
            oDeliveryModel.setUseBatch(true);
            var batchChanges = [], aBusinessPartnerTable = [], promise1;           
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var sPath = "";
            promise1 = new Promise((resolve, reject) => {    
                var Supplier;
                aResults.sort((a, b) => b.PartnerFunction.localeCompare(a.PartnerFunction)); 
                if(aResults && aResults.length > 0){
                    Supplier = aResults[2].Supplier
                }
                eshipjetModel.setProperty("/commonValues/ShipNowShipMethodSelectedKey", Supplier);
                oController.onShopNowShipMethodAfterChange(Supplier);
                for (var i = 0; i < aResults.length; i++) {               
                    sPath = "/A_OutbDeliveryHeader('"+ sDocNumber +"')/to_DeliveryDocumentPartner(PartnerFunction='"+ aResults[i].PartnerFunction + "',SDDocument='"+ sDocNumber +"')/to_Address";
                    oDeliveryModel.read(sPath,{ "groupId":"addressDefferedgroupID", "merge":false});                               
                }
                oDeliveryModel.submitChanges({
                    "groupId":"addressDefferedgroupID",
                    success: function(oData){
                        oController.oBusyDialog.close();
                        if(oData &&  oData.__batchResponses &&  oData.__batchResponses.length > 0){
                            oData.__batchResponses.map(function(currentValue, index, arr){
                                if(index == 0){
                                    currentValue.data["PartnerType"]  = "Ship From";
                                    currentValue.data["FullName"]  = "Steve Marsh";
                                    currentValue.data["BusinessPartnerName1"]  = "Eshipjet Software Inc.";
                                    currentValue.data["StreetName"]  = "5717 Legacy";
                                    currentValue.data["HouseNumber"]  = "Suite 250";
                                    currentValue.data["Region"]  = "TX";
                                    currentValue.data["CityName"]  = "Plano";
                                    currentValue.data["PostalCode"]  = "75024";
                                    currentValue.data["Country"]  = "US";
                                    currentValue.data["email"]  = "info@eshipjet.ai";
                                }else if(index == 1){
                                    currentValue.data["PartnerType"]  = "Ship To";
                                }else {
                                    currentValue.data["PartnerType"]  = "Freight Forwarder";
                                }
                                aBusinessPartnerTable.push(currentValue.data);                           
                            });
                                                    
                            var  Obj = {
                                "ShipFromCONTACT": "Steve Marsh",
                                "ShipFromCOMPANY": "Eshipjet Software Inc.",
                                "ShipFromPHONE": "(888) 464-2360",
                                "ShipFromEMAIL": "info@eshipjet.ai",
                                "ShipFromCITY": "Plano",
                                "ShipFromSTATE": "TX",
                                "ShipFromCOUNTRY": "US",
                                "ShipFromZIPCODE": "75024",
                                "ShipFromADDRESS_LINE1": "5717 Legacy",
                                "ShipFromADDRESS_LINE2": "Suite 250",
                                "ShipFromADDRESS_LINE3": "",
                                "LocationType": "Commercial"
                            };
                            oShipNowModel.setProperty("/ShipFromAddress",Obj);
                            aBusinessPartnerTable[1]["LocationType"] = "Commercial"
                            oShipNowModel.setProperty("/ShipToAddress",aBusinessPartnerTable[1]);
                            eshipjetModel.setProperty("/BusinessPartners",aBusinessPartnerTable);
                            eshipjetModel.setProperty("/InternationalDetails/shipFromTaxNo",aBusinessPartnerTable[0].TaxJurisdiction);
                            oShipNowModel.updateBindings(true);
                            eshipjetModel.updateBindings(true);
                        }
                    resolve();
                    eshipjetModel.setProperty("/commonValues/shipNowGetBtn", false);      
                }, error: function(oErr){
                    resolve();
                    oController.onCloseBusyDialog();
                    console.log(oErr);
                }});                
            });  
            Promise.all([promise1]).then((values) => {
                if(sFromMenu === "ScanAndShip"){
                    oController.onShipNowPress();
                }    
            });            
        },

        onPackPress:function(){
            var productTable = this.byId("idShipNowPackTable");
            var selectedItems = productTable.getSelectedIndices();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var selectedPackageMat = eshipjetModel.getProperty("/selectedPackageMat");
            if(selectedPackageMat === ""){
                MessageBox.warning("Please Select Package Material");
            }else if(selectedItems.length === 0){
                MessageBox.warning("Please Select atleast one record from Product Table");
            }else{
                var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
                var totalWeight = 0;
                var ItemsInfo = [];
                for (var i = 0; i < selectedItems.length; i++) {
                    var currentObj = productTable.getContextByIndex(i).getObject();
                    if(currentObj.partialQty === "" || currentObj.partialQty === undefined){
                        MessageBox.warning("Please add partial quantity for at least one valid product.");
                    }else{
                        oController.onOpenBusyDialog();
                        var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
                        var sapDeliveryNumber = eshipjetModel.getProperty("/commonValues/sapDeliveryNumber");
                        var partialQty = eshipjetModel.getProperty("/partialQty");
                        var Material = eshipjetModel.getProperty("/Material");

                        var oPayload = {
                            "Vbeln": sapDeliveryNumber,
                            "Posnr": "000010",
                            "Matnr": currentObj.Material,
                            "Qty": currentObj.partialQty,
                            "Humatnr": selectedPackageMat
                        };
                        
                        var ShipReadDataSrvModel = oController.getOwnerComponent().getModel("ShipReadDataSrvModel");
                        ShipReadDataSrvModel.create("/HuDataSet", oPayload, {
                            success: function (oData) {
                                oController.readHUDataSet(sapDeliveryNumber);
                                MessageToast.show("Handling Unit Created Successfully");
                                currentObj.partialQty = "";
                                eshipjetModel.updateBindings(true);
                                // oController.onCloseBusyDialog();

                                // var sAudioPath = sap.ui.require.toUrl("com/eshipjet/zeshipjet/audio/PackToHU.mp3");
                                // var audio = new Audio(sAudioPath);
                                // audio.play();
                            },
                            error: function (oError) {
                                // var errMsg = JSON.parse(oError.responseText).error.message.value;
                                var errMsg = new DOMParser().parseFromString(oError.responseText, "text/xml").getElementsByTagName("message")[0].textContent;
                                sap.m.MessageBox.error(errMsg);
                                oController.onCloseBusyDialog();
                            }
                        });
                    }        
                }
            }
        },

        readHUDataSet:function(sapDeliveryNumber){
            let oFilter, aHandlingUnits = [];
            oFilter = [];
            oFilter.push(new Filter("HandlingUnitReferenceDocument", "EQ", sapDeliveryNumber));
            var oHandlingUnitModel = oController.getOwnerComponent().getModel("HandlingUnitModel");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            oHandlingUnitModel.read("/HandlingUnit",{
                urlParameters: {
                    "$expand": "to_HandlingUnitItem"
                },
                filters: oFilter,
                success:function(oData){
                    var getManifestHeader = eshipjetModel.getProperty("/getManifestHeader");
                    if(oData && oData.results && oData.results.length > 0){
                        for(var i = 0; i < oData.results.length; i++){
                            oData.results[i]["SerialNumber"] = i + 1;
                            aHandlingUnits.push(oData.results[i]);
                            oData.results[i]["boxCount"] = "1";
                            // if(getManifestHeader.length > 0){
                            //     oData.results[i]["Tracking"] = getManifestHeader[i].TrackingNumber;
                            // }
                        };
                        eshipjetModel.setProperty("/HandlingUnits", aHandlingUnits);
                        oController.getHandlingUnit(aHandlingUnits);
                    }else{
                        eshipjetModel.setProperty("/HandlingUnits", aHandlingUnits);
                        oController.onPackSectionEmptyRows();
                    }
                    oController.onCloseBusyDialog();
                },
                error: function(oErr){
                    console.log(oErr);                        
                    oController.onCloseBusyDialog();
                }
            });
        },

        onPackAllPress:function(){
            var productTable = this.byId("idShipNowPackTable");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var packAddProductTable = eshipjetModel.getProperty("/commonValues/packAddProductTable");
            var selectedPackageMat = eshipjetModel.getProperty("/selectedPackageMat");
            if(selectedPackageMat === ""){
                MessageBox.warning("Please Select Package Material");
                return;
            }
                var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
                var totalWeight = 0;
                var ItemsInfo = [];
                for (var i = 0; i < packAddProductTable.length; i++) {
                    var currentObj = packAddProductTable[i];
                    // if(currentObj.partialQty === "" || currentObj.partialQty === undefined){
                    //     MessageBox.warning("Please add partial quantity for at least one valid product.");
                    // }else{
                        if(currentObj.DeliveryDocument !== undefined){
                            oController.onOpenBusyDialog();
                            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
                            var sapDeliveryNumber = eshipjetModel.getProperty("/commonValues/sapDeliveryNumber");
                            var partialQty = eshipjetModel.getProperty("/partialQty");
                            var Material = eshipjetModel.getProperty("/Material");

                            var oPayload = {
                                "Vbeln": sapDeliveryNumber,
                                "Posnr": "000010",
                                "Matnr": currentObj.Material,
                                "Qty": currentObj.BalanceQty.toString(),
                                "Humatnr": selectedPackageMat
                            };
                            
                            var ShipReadDataSrvModel = oController.getOwnerComponent().getModel("ShipReadDataSrvModel");
                            ShipReadDataSrvModel.create("/HuDataSet", oPayload, {
                                success: function (oData) {
                                    oController.readHUDataSet(sapDeliveryNumber);
                                    MessageToast.show("Handling Unit Created Successfully");
                                    currentObj.partialQty = "";
                                    eshipjetModel.updateBindings(true);

                                    // var sAudioPath = sap.ui.require.toUrl("com/eshipjet/zeshipjet/audio/PackToHU.mp3");
                                    // var audio = new Audio(sAudioPath);
                                    // audio.play();
                                    
                                    // oController.onCloseBusyDialog();
                                },
                                error: function (oError) {
                                    // var errMsg = JSON.parse(oError.responseText).error.message.value;
                                    var errMsg = new DOMParser().parseFromString(oError.responseText, "text/xml").getElementsByTagName("message")[0].textContent;
                                    sap.m.MessageBox.error(errMsg);
                                    oController.onCloseBusyDialog();
                                }
                            });
                        }
                        
                    //}        
                }
            //}
        },

        // onShipNowCodEditPress:function(){
        //     var oView = this.getView();
        //     if (!this.byId("idCodEditDialog")) {
        //         Fragment.load({
        //             id: oView.getId(),
        //             name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.CodEditDialog",
        //             controller: this // Pass the controller for binding
        //         }).then(function (oCodEditDialog) {
        //             oView.addDependent(oCodEditDialog);
        //             oCodEditDialog.open();
        //         });
        //     } else {
        //         this.byId("idCodEditDialog").open(); // Open existing dialog
        //     }

            
        // },

        // onCodEditDialogCancelPress: function () {
        //     this.byId("idCodEditDialog").close();
        // },

       

        onDryIceEditPress: function (oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource(); 
        
            if (!this._oDryIceEditDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.DryIceEditDialog",
                    controller: this
                }).then(function (oPopover) {
                    this._oDryIceEditDialog = oPopover;
                    oView.addDependent(this._oDryIceEditDialog);
                    this._oDryIceEditDialog.openBy(oSource); 
                }.bind(this));
            } else {
                this._oDryIceEditDialog.openBy(oSource);
            }
        },
        
        onDryIceEditDialogClosePress: function () {
            if (this._oDryIceEditDialog) {
                this._oDryIceEditDialog.close();
            }
        },

        onOpenBatteryDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenBatteryEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExBatteryEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenBatteryEditDialog").open();
            }
        },

        onCloseBatteryDialog: function() {
            this.byId("_IDGenBatteryEditDialog").close();
        },

        onOpenFedExDeliveryIncAcceptDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedExDeliveryIncAcceptEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExDeliveryIncAcceptEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedExDeliveryIncAcceptEditDialog").open();
            }
        },

        onCloseFedExDeliveryIncAcceptDialog: function() {
            this.byId("_IDGenFedExDeliveryIncAcceptEditDialog").close();
        },

        onOpenFedExBrokerSelectDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedExBrokerSelectEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExBrokerSelectEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedExBrokerSelectEditDialog").open();
            }
        },

        onCloseFedExBrokerSelectDialog: function() {
            this.byId("_IDGenFedExBrokerSelectEditDialog").close();
        },


        onOpenAlcoholDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenAlcoholEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExAlcoholEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenAlcoholEditDialog").open();
            }
        },

        onCloseAlcoholDialog: function() {
            this.byId("_IDGenAlcoholEditDialog").close();
        },


        onOpenFedExHoldAtLoctionEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedExHoldAtLoctionEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExHoldAtLoctionEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedExHoldAtLoctionEditDialog").open();
            }
        },

        onCloseHoldAtLoctionDialog: function() {
            this.byId("_IDGenFedExHoldAtLoctionEditDialog").close();
        },

        onOpenFedExETDDetailEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedExETDDetailEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExETDDetailEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedExETDDetailEditDialog").open();
            }
        },

        onCloseETDDetailDialog: function() {
            this.byId("_IDGenFedExETDDetailEditDialog").close();
        },

        onOpenFedexInternationalTrafficInArmsRegulationsDetailEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedexInternationalTrafficInArmsRegulationsDetailEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedexInternationalTrafficInArmsRegulationsDetailEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedexInternationalTrafficInArmsRegulationsDetailEditDialog").open();
            }
        },

        onCloseFedexInternationalTrafficInArmsRegulationsDetailEditDialog: function() {
            this.byId("_IDGenFedexInternationalTrafficInArmsRegulationsDetailEditDialog").close();
        },


        onOpenFedexEmailReturnLabelEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedExEmailReturnLabelEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExEmailReturnLabelEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedExEmailReturnLabelEditDialog").open();
            }
        },

        onCloseFedexEmailReturnLabelEditDialog: function() {
            this.byId("_IDGenFedExEmailReturnLabelEditDialog").close();
        },

        onOpenFedexHomeDeliveryEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedExHomeDeliveryEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExHomeDeliveryEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedExHomeDeliveryEditDialog").open();
            }
        },

        onCloseFedexHomeDeliveryEditDialog: function() {
            this.byId("_IDGenFedExHomeDeliveryEditDialog").close();
        },

        onOpenFedexPendingShipmentDetailEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedExPendingShipmentDetailEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExPendingShipmentDetailEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedExPendingShipmentDetailEditDialog").open();
            }
        },

        onCloseFedexPendingShipmentDetailEditDialog: function() {
            this.byId("_IDGenFedExPendingShipmentDetailEditDialog").close();
        },


        onOpenFedexInternationalControlledExportEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedExInternationalControlledExportEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExInternationalControlledExportEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedExInternationalControlledExportEditDialog").open();
            }
        },

        onCloseFedexInternationalControlledExportEditDialog: function() {
            this.byId("_IDGenFedExInternationalControlledExportEditDialog").close();
        },

        onOpenFedexPrintReturnLabelEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedExPrintReturnLabelEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExPrintReturnLabelEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedExPrintReturnLabelEditDialog").open();
            }
        },

        onCloseFedexPrintReturnLabelEditDialog: function() {
            this.byId("_IDGenFedExPrintReturnLabelEditDialog").close();
        },

        onOpenFedexHomeDeliveryPremiumEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedExHomeDeliveryPremiumEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExHomeDeliveryPremiumEditDilog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedExHomeDeliveryPremiumEditDialog").open();
            }
        },

        onCloseFedexHomeDeliveryPremiumEditDialog: function() {
            this.byId("_IDGenFedExHomeDeliveryPremiumEditDialog").close();
        },

        onOpenFedexShipmentCODDetailEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedExShipmentCODDetailEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExShipmentCODDetailEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedExShipmentCODDetailEditDialog").open();
            }
        },

        onCloseFedexShipmentCODDetailEditDialog: function() {
            this.byId("_IDGenFedExShipmentCODDetailEditDialog").close();
        },

        onOpenFedexShipmentCODDetailEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenFedExShipmentCODDetailEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.FedExShipmentCODDetailEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenFedExShipmentCODDetailEditDialog").open();
            }
        },

        onCloseFedexShipmentCODDetailEditDialog: function() {
            this.byId("_IDGenFedExShipmentCODDetailEditDialog").close();
        },

         onOpenUPSHazMatEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenUPSHazMatEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.UPSHazMatEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenUPSHazMatEditDialog").open();
            }
        },

        onCloseUPSHazMatEditDialog: function() {
            this.byId("_IDGenUPSHazMatEditDialog").close();
        },


        onOpenUPSImportControlEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenUPSImportControlEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.UPSImportControlEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenUPSImportControlEditDialog").open();
            }
        },

        onCloseUPSImportControlEditDialog: function() {
            this.byId("_IDGenUPSImportControlEditDialog").close();
        },

        onOpenUPSCODInformationEditDialog: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenUPSCODInformationEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.UPSCODInformationEditDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenUPSCODInformationEditDialog").open();
            }
        },

        onCloseUPSCODInformationEditDialog: function() {
            this.byId("_IDGenUPSCODInformationEditDialog").close();
        },
 
        
        onHoldAtLocationEditPress: function () {
            var oView = this.getView();
            if (!this.byId("idHoldAtLocationEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.HoldAtLocationEditDialog",
                    controller: this // Pass the controller for binding
                }).then(function (oHoldAtLocationEditDialog) {
                    oView.addDependent(oHoldAtLocationEditDialog);
                    oHoldAtLocationEditDialog.open();
                });
            } else {
                this.byId("idHoldAtLocationEditDialog").open(); // Open existing dialog
            }
        },

        onHoldAtLocationEditDialogClosePress: function () {
            this.byId("idHoldAtLocationEditDialog").close();
        },

        onReturnLabelEditPress: function () {
            var oView = this.getView();
            if (!this.byId("idReturnLabelEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ReturnLabelEditDialog",
                    controller: this // Pass the controller for binding
                }).then(function (oReturnLabelEditDialog) {
                    oView.addDependent(oReturnLabelEditDialog);
                    oReturnLabelEditDialog.open();
                });
            } else {
                this.byId("idReturnLabelEditDialog").open(); // Open existing dialog
            }
        },

        onReturnLabelEditDialogClosePress: function () {
            this.byId("idReturnLabelEditDialog").close();
        },

        onShipNowDocPress:function(oEvent){
            var sLabel = oEvent.getSource().mProperties.text;
            var dataUrl = "https://eshipjetsatge.blob.core.windows.net/shipping-labels/" + sLabel;

            if (!oController._shipNowDocDialog) {
                oController._shipNowDocDialog = new Dialog({
                    title: "Ship Now Document",
                    contentWidth: "30%", // Adjust width as needed
                    contentHeight: "70%", // Adjust height as needed
                    content: new sap.m.Image({
                        class: "sapUiSmallMargin",
                        src: dataUrl,
                        width: "100%", // Full width of dialog content
                        height: "100%"
                    }),
                    endButton: new sap.m.Button({
                        text: "Close",
                        press: function () {
                            oController._shipNowDocDialog.close();
                        }.bind(oController)
                    })
                });
            }
            oController._shipNowDocDialog.open();
        },
        // Ship Now Changes End here

        // Scan & Ship Code Changes Start
        _handleDisplayShipNowProductsTable:function(){
            const oView = oController.getView();
            var columnName, label, oTemplate, oHboxControl;
            const oTable = oView.byId("idShipNowProductTable");
            oTable.setModel(eshipjetModel);
            var ShipNowProductsTableColumns = eshipjetModel.getProperty("/ShipNowProductsTableColumns");
            var count = 0;
            for (var i = 0; i < ShipNowProductsTableColumns.length; i++) {
                if (ShipNowProductsTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/ShipNowProductsTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
                if (columnName === "deleteIcon") {
                    var Btn1 = new sap.m.Button({ icon: "sap-icon://delete", type: "Transparent",
                        press: function (oEvent) {
                            oController.handleDownArrowPress(oEvent);
                        }
                    });
                    var Btn2 = new sap.m.Button({
                        icon: "sap-icon://delete", type: "Transparent",
                        press: function (oEvent) {
                            oController.handleDownArrowPress(oEvent);
                        }
                    });
                    return new sap.ui.table.Column({
                        label: Btn2,
                        template: Btn1,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    var template = new sap.m.Text({
                        text: {
                            path: columnName
                        }
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: template,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/pickAddProductTable");
        },

        openShipNowProductsColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pShipNowProductsPopover) {
                this._pShipNowProductsPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShipNowProductsTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pShipNowProductsPopover.then(function (oPopover) {
                oController.ShipNowProductsColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        ShipNowProductsColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/ShipNowProductsTableColumns");
            var oShipNowProductsTable = oView.byId("myShipNowProductsColumnSelectId");
            var aTableItems = oShipNowProductsTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("eshipjetModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onShipNowProductsColSelectOkPress: function () {
            var oView = this.getView()
            var oShipNowProductsTable = oView.byId("myShipNowProductsColumnSelectId");
            var eshipjetModel = oView.getModel("eshipjetModel");
            var oShipNowProductsTblItems = oShipNowProductsTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/ShipNowProductsTableColumns");
            oShipNowProductsTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            this._handleDisplayShipNowProductsTable();
            this._pShipNowProductsPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onShipNowProductsColSelectClosePress: function () {
            this._pShipNowProductsPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onShipNowProductsColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myShipNowProductsColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },        

        _handleDisplayShipNowHandlingUnitTable:function(){
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            const oTable = oView.byId("idShipNowHandlingUnitTable");
            oTable.setModel(eshipjetModel);
            var ShipNowHandlingUnitTableColumns = eshipjetModel.getProperty("/ShipNowHandlingUnitTableColumns");
            var count = 0;
            for (var i = 0; i < ShipNowHandlingUnitTableColumns.length; i++) {
                if (ShipNowHandlingUnitTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/ShipNowHandlingUnitTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
                if (columnName === "DeleteIcon") {
                    var Btn1 = new sap.m.Button({ icon: "sap-icon://delete", type: "Critical" });
                    return new sap.ui.table.Column({
                        label: Btn1,
                        template: Btn1,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: Btn1
                    });
                } else if (columnName === "H.U."){
                    var template = new sap.m.Link({
                        text: {
                            path: columnName
                        }
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: template,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "Weight"){
                    var template = new sap.m.Input({
                        value: {
                            path: columnName
                        }
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: template,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "WeightUnits"){
                    var template = new sap.m.Input({
                        value: {
                            path: columnName
                        }
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: template,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "Dimensions"){
                    var template = new sap.m.Input({
                        value: {
                            path: columnName
                        }
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: template,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    var template = new sap.m.Text({
                        text: {
                            path: columnName
                        }
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: template,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/HandlingUnits");
        },

        openShipNowHandlingUnitColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pShipNowHandlingUnitPopover) {
                this._pShipNowHandlingUnitPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShipNowHandlingUnitTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pShipNowHandlingUnitPopover.then(function (oPopover) {
                oController.ShipNowHandlingUnitColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        ShipNowHandlingUnitColumnsVisiblity: function () {
            var oView = oController.getView();            
            var aColumns = eshipjetModel.getProperty("/ShipNowHandlingUnitTableColumns");
            var oShipNowHandlingUnitTable = oView.byId("myShipNowHandlingUnitColumnSelectId");
            var aTableItems = oShipNowHandlingUnitTable.getItems();
            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("eshipjetModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onShipNowHandlingUnitColSelectOkPress: function () {
            var oView = oController.getView()
            var oShipNowHandlingUnitTable = oView.byId("myShipNowHandlingUnitColumnSelectId");            
            var oShipNowHandlingUnitTblItems = oShipNowHandlingUnitTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/ShipNowHandlingUnitTableColumns");
            oShipNowHandlingUnitTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            this._handleDisplayShipNowHandlingUnitTable();
            this._pShipNowHandlingUnitPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onShipNowHandlingUnitColSelectClosePress: function () {
            this._pShipNowHandlingUnitPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onShipNowHandlingUnitColNameSearch: function (oEvent) {
            let aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myShipNowHandlingUnitColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        _handleDisplayScanShipTable: function () {            
            const oView = oController.getView();
            var columnName, label, oTemplate, oHboxControl;
            var scanShipTableData = eshipjetModel.getProperty("/scanShipTableData");
            var ScanShipTableDataModel = new JSONModel(scanShipTableData);
            oController.getOwnerComponent().setModel(ScanShipTableDataModel, "ScanShipTableDataModel");
            var oTable = oView.byId("idScanAndShipTable");
            
            var ScanShipTableDataModel = oController.getOwnerComponent().getModel("ScanShipTableDataModel");
            oTable.setModel(ScanShipTableDataModel);
            var columns = ScanShipTableDataModel.getProperty("/columns");
            var count = 0;
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/columns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
                if (columnName === "actions") {
                    var oHBox = new sap.m.HBox({}); // Create Text instance 
                    var Btn1 = new sap.m.Button({ text: "Ship Now", type: "Transparent" });
                    var Btn2 = new sap.m.Button({
                        icon: "sap-icon://megamenu", type: "Transparent",
                        press: function (oEvent) {
                            oController.handleDownArrowPress(oEvent);
                        }
                    });
                    oHBox.addItem(Btn1);
                    oHBox.addItem(Btn2);
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oHBox,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "CreatedDate" || columnName === "ShipDate") {
                    var template = new sap.m.Text({
                        text: {
                            path: columnName,
                            formatter: function (date) {
                                if (date) {
                                    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MM/dd/yyyy" });
                                    return oDateFormat.format(new Date(date));
                                }
                                return "";
                            }
                        }
                    });

                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: template,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    var template = new sap.m.Text({
                        text: {
                            path: columnName
                        }
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: template,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/rows");
            oTable.updateBindings(true);
        },

        openScanShipColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pScanPopover) {
                this._pScanPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ScanAndShip.ScanShipTableColumns",
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
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/scanShipTableData1/scanShipColumns");
            var oScanTable = oView.byId("myScanColumnSelectId");
            var aTableItems = oScanTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("eshipjetModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onScanShipColSelectOkPress: function () {
            var oView = oController.getView()
            var oScanTable = oView.byId("myScanColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oScanTblItems = oScanTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/scanShipTableData1/scanShipColumns");
            var scanShipColSelectedCount = 0;
            oScanTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                            scanShipColSelectedCount += 1;
                        } else {
                            oColObj.visible = false;
                        }
                    }

                })
            });
            console.log(scanShipColSelectedCount);
            eshipjetModel.setProperty("/scanShipColSelectedCount", scanShipColSelectedCount);
            eshipjetModel.updateBindings(true);
            // this._handleDisplayScanShipTable();
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
             oController.onOpenBusyDialog();            
            const sUserMessage = eshipjetModel.getProperty("/sShipAndScan");
            if (!sUserMessage) {
                MessageToast.show("Please Enter Request ID.");
                oController.oBusyDialog.close();
                return;
            }
             let myPromise = new Promise(function(myResolve, myReject) {
                // "Producing Code" (May take some time)
                oController.shipNowData(sUserMessage, "ScanAndShip", myResolve);                                     
                });                
                // "Consuming Code" (Must wait for a fulfilled Promise)
                myPromise.then(
                  function(value) { 
                    eshipjetModel.setProperty("/sShipAndScan","");
                    var obj = {
                        "message": "ship " + sUserMessage // Match DeliveryNo in the message if needed
                    };
                    var sPath = "https://eshipjet-demo-srv-hvacbxf0fqapdpgd.francecentral-01.azurewebsites.net/copilot/v1/bot/process";
                    return new Promise((resolve, reject) => {
                        $.ajax({
                            url: sPath, // Replace with your API endpoint
                            method: "POST",
                            contentType: "application/json", // Set content type to JSON if sending JSON data
                            data: JSON.stringify(obj),
                            success: function (response) {
                                if(response.Errors !== undefined){
                                    sap.m.MessageBox.error(response.Errors[0]);
                                }else{
                                var ScanShipTableDataModel = oController.getOwnerComponent().getModel("ScanShipTableDataModel");
                                // var sEncodedLabel   = response.shippingDocuments && response.shippingDocuments.length > 0 ? response.shippingDocuments[0].encodedLabel:"";
                                var aShippinDocs = response.shippingDocuments;
                                var aLabel = aShippinDocs.filter((obj) => obj.contentType === "Label");

                                var dataUrl;
                                if (aLabel.length !== 0 && aLabel !== undefined) {
                                    // sLabel = aLabel[0].encodedLabel;
                                    // var dataUrl = "data:image/png;base64," + sLabel;
                                    var sLabel = aLabel[0].docName;
                                    dataUrl = "https://eshipjetsatge.blob.core.windows.net/shipping-labels/" + sLabel;
                                }

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
                                    // "encodedLabel": "data:image/png;base64," + sEncodedLabel
                                    "encodedLabel": dataUrl
                                }

                                // that.encodedLabel = obj.encodedLabel;
                                var rows = ScanShipTableDataModel.getProperty("/rows");
                                if(rows){
                                    rows.push(obj);
                                }
                                ScanShipTableDataModel.updateBindings(true);
                                ScanShipTableDataModel.setProperty("/ScanShipTableLength", rows.length);
                                // Handle successful response
                                oController.oBusyDialog.close();
                                resolve(response);
                                console.log("Success:", response);
                            }
                            },
                            error: function (error) {
                                // Handle error
                                oController.oBusyDialog.close();
                                reject(error);
                                console.log("Error:", error);
                            }
                        });
                    });
                   }
                );                
        },

        scanShipFilterPopoverPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pPopover) {
                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ScanAndShip.ScanShipFilterPopover",
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
            // var oTable = oController.getView().byId("idScanAndShipTable");
            // var oModel = oController.getView().getModel("ScanShipTableDataModel");
            // var aData = oModel.getProperty("/rows");
            // var aColumns = oTable.getColumns().map(function (oColumn, index) {
            //     var oLabel = oColumn.getLabel();
            //     var sLabel = oLabel && oLabel.getText ? oLabel.getText() : "Column " + (index + 1);
            //     var sProperty = oColumn.getCustomData().length > 0 ? oColumn.getCustomData()[0].getValue() : "col" + index;
            //     return {
            //         label: sLabel,
            //         property: sProperty,
            //         type: "string"
            //     };
            // });
            // var oSettings = {
            //     workbook: { columns: aColumns },
            //     dataSource: aData,
            //     fileName: "ExportedData.xlsx"
            // };
            // var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
            // oSpreadsheet.build().finally(function () {
            //     oSpreadsheet.destroy();
            // });

            var ScanShipTableDataModel = this.getView().getModel("ScanShipTableDataModel");
            var rows = ScanShipTableDataModel.getProperty("/scanShipTableData");
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
            // var aPath = oEvent.getSource().getBindingContext().sPath.split("/");
            // var idx = parseInt(aPath[aPath.length - 1]);
            // var idx = parseInt(aPath[aPath.length - 1]);
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            var currentObj = oEvent.getSource().getBindingContext("eshipjetModel").getObject();
            eshipjetModel.setProperty("/Labelurl", currentObj.Labelurl);
            // var scanShipTableData = eshipjetModel.getProperty("/scanShipTableData");
            // this.encodedLabel = scanShipTableData.rows[idx].encodedLabel;
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._addPopover) {
                this._addPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ScanAndShip.ScanAndShipActPopover",
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
                oController.handleShowViewLabel();
            }
        },
        
        handleShowViewLabel: function () {
            if (!oController._oScanShipLabelDialog) {
                oController._oScanShipLabelDialog = new Dialog({
                    title: "Ship Image",
                    contentWidth: "30%", // Adjust width as needed
                    contentHeight: "80%", // Adjust height as needed
                    content: new sap.m.Image({
                        // class: "sapUiSmallMargin",
                        src: eshipjetModel.getProperty("/Labelurl"),
                        width: "100%", // Full width of dialog content
                        height: "100%"
                    }),
                    endButton: new sap.m.Button({
                        text: "Close",
                        press: function () {
                            oController._oScanShipLabelDialog.close();
                        }.bind(oController)
                    })
                });
            }else{
                oController._oScanShipLabelDialog = new Dialog({
                    title: "Ship Image",
                    contentWidth: "30%", // Adjust width as needed
                    contentHeight: "80%", // Adjust height as needed
                    content: new sap.m.Image({
                        // class: "sapUiSmallMargin",
                        src: eshipjetModel.getProperty("/Labelurl"),
                        width: "100%", // Full width of dialog content
                        height: "100%"
                    }),
                    endButton: new sap.m.Button({
                        text: "Close",
                        press: function () {
                            oController._oScanShipLabelDialog.close();
                        }.bind(oController)
                    })
                });
            };
            oController._oScanShipLabelDialog.open();
        },
        // Scan & Ship Changes End


        // Dashboard Tiles Changes Starts

        onTilePress: function (oEvent) {
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(false);
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            var tileTitle = oEvent.getParameters().domRef.innerText;
            if (tileTitle === "Ship Request/Label") {
                // this._handleDisplayShipReqTable();
                oController.getShipReqLabelHistoryShipments();
                var sKey = "ShipRequestLabel";
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                this.byId("pageContainer").to(this.getView().createId(sKey));
            } else if (tileTitle === "Ship Now") {
                var sKey = "ShipNow";
                eshipjetModel.setProperty("/commonValues/toolPageHeader", false);
                eshipjetModel.setProperty("/commonValues/allViewsFooter", false);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", true);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                this.byId("pageContainer").to(this.getView().createId(sKey));
                var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
                var obj = {
                    "ShipFromCONTACT": "Steve Marsh",
                    "ShipFromCOMPANY": "Eshipjet Software Inc.",
                    "ShipFromPHONE": "(888) 464-2360",
                    "ShipFromEMAIL": "info@eshipjet.ai",
                    "ShipFromCITY": "Plano",
                    "ShipFromSTATE": "TX",
                    "ShipFromCOUNTRY": "US",
                    "ShipFromZIPCODE": "75024",
                    "ShipFromADDRESS_LINE1": "5717 Legacy",
                    "ShipFromADDRESS_LINE2": "Suite 250",
                    "LocationType": "Commercial"
                };
                ShipNowDataModel.setProperty("/ShipFromAddress", obj);
                ShipNowDataModel.setProperty("/ShipToAddress", "");
                eshipjetModel.setProperty("/BusinessPartners", []);
                eshipjetModel.setProperty("/commonValues/shipNowGetBtn", true);
                eshipjetModel.setProperty("/commonValues/OverallGoodsMovementStatus", ""); 
                eshipjetModel.setProperty("/commonValues/shipNowBtnStatus", true);
                oController.onPackSectionEmptyRows();
                // oController._handleDisplayShipNowPackTable();

            } else if (tileTitle === "Track Now") {
                // this._handleDisplayTrackNowTable();
                this.getOrdersHistoryShipments();
                var sKey = "TrackNow";
                eshipjetModel.setProperty("/commonValues/toolPageHeader", false);
                eshipjetModel.setProperty("/commonValues/allViewsFooter", false);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
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
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var OrderTableData = eshipjetModel.getData().OrderTableData;
            var OrderTableDataModel = new JSONModel(OrderTableData);
            this.getView().setModel(OrderTableDataModel, "OrderTableDataModel");
            const oTable = oController.byId("idOrdersTable");
            oTable.setModel(OrderTableDataModel);
            var OrderTableDataModel = this.getView().getModel("OrderTableDataModel");
            var OrderColumns = OrderTableDataModel.getData().OrderColumns;
            var count = 0;
            for (var i = 0; i < OrderColumns.length; i++) {
                if (OrderColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/OrderColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }


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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "CreatedDate" || columnName === "ShipDate") {
                    var DateTxt = new sap.m.Text({
                        text: {
                            path: 'OrderTableDataModel>ShipDate',
                            formatter: formatter.formatDate
                        },
                        wrapping: false
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: DateTxt,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/orderRows");
        },

        openOrderColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pOrderPopover) {
                this._pOrderPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.Orders.OrderTableColumns",
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
            var oOrderTableModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = oOrderTableModel.getProperty("/OrderTableData/OrderColumns");
            var oOrderTable = oView.byId("myOrderColumnSelectId");
            var aTableItems = oOrderTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("eshipjetModel").getObject().name && oColObj.visible) {
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


        onOrderExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/OrderTableData/orderRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Order ID", property: "orderID" },
                        { label: "Created Date", property: "CreatedDate" },
                        { label: "Ship Date", property: "ShipDate" },
                        { label: "Shipment Type", property: "ShipmentType" },
                        { label: "Ship Method", property: "shipMethod" },
                        { label: "Service Name", property: "ServiceName" },
                        { label: "Tracking Number", property: "TrackingNumber" },
                        { label: "Status", property: "status" },
                        { label: "Ship To Contact", property: "ShipToContact" },
                        { label: "Ship To Company", property: "ShipToCompany" },
                        { label: "Ship To AddressLine1", property: "ShipToAddressLine1" },
                        { label: "Ship To City", property: "shipToCity" },
                        { label: "Ship To State", property: "shipToState" },
                        { label: "Ship To Country", property: "shipToCountry" },
                        { label: "Ship To Zip", property: "shipToZip" },
                        { label: "Ship To Phone", property: "shipToPhone" },
                        { label: "Ship To Email", property: "shipToEmail" },
                        { label: "Requestor Name", property: "requesterName" },
                        { label: "Connected To", property: "connectedTo" },
                        { label: "Priority Level", property: "priorityLevel" },
                        { label: "Actions", property: "actions" },
                    ]
                },
                dataSource: rows,
                fileName: 'Orders_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        onoOrderColSelectOkPress: function () {
            var oView = this.getView();
            var oOrderTable = oView.byId("myOrderColumnSelectId");
            var eshipjetModel = oView.getModel("eshipjetModel");
            var oOrderTblItems = oOrderTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/OrderTableData/OrderColumns");
            var orderColSelectedCount = 0;
            oOrderTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                            orderColSelectedCount += 1;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            console.log(orderColSelectedCount);
            eshipjetModel.setProperty("/orderColSelectedCount", orderColSelectedCount);
            eshipjetModel.updateBindings(true);
            // this._handleDisplayOrdersTable();
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
                    name: "com.eshipjet.zeshipjet.view.fragments.Orders.OrderFilterPopover",
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

        onOrderNowTotalFilterPress:function(oEvent){
            var oTable = oController.getView().byId("idOrdersTable");
            var oBinding = oTable.getBinding("rows");
            var oFilter = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.Contains, "Total");
            oBinding.filter([oFilter]);
        },
        onOrderNowShippedFilterPress:function(){
            var oTable = oController.getView().byId("idOrdersTable");
            var oBinding = oTable.getBinding("rows");
            var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, "Shipped");
            oBinding.filter([oFilter]);
        },

        onOrderNowOpenFilterPress:function(){
            var oTable = oController.getView().byId("idOrdersTable");
            var oBinding = oTable.getBinding("rows");
            var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, "Open");
            oBinding.filter([oFilter]);
        },

        onOrderNowCancelledFilterPress:function(){
            var oTable = oController.getView().byId("idOrdersTable");
            var oBinding = oTable.getBinding("rows");
            var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, "Cancelled");
            oBinding.filter([oFilter]);
        },
        // Order Changes End


        // RoutingGuide Changes Starts

        _handleDisplayRoutingGuideTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var RoutingGuideTableData = eshipjetModel.getData().RoutingGuideTableData;
            var RoutingGuideTableDataModel = new JSONModel(RoutingGuideTableData);
            this.getView().setModel(RoutingGuideTableDataModel, "RoutingGuideTableDataModel");
            const oTable = oView.byId("idRoutingGuideTable1");
            oTable.setModel(RoutingGuideTableDataModel);
            var RoutingGuideTableDataModel = this.getView().getModel("RoutingGuideTableDataModel");
            var RoutingGuideColumns = RoutingGuideTableDataModel.getData().RoutingGuideColumns;
            var count = 0;
            for (var i = 0; i < RoutingGuideColumns.length; i++) {
                if (RoutingGuideolumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/RoutingGuideColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }


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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "CreatedDate" || columnName === "ShipDate") {
                    var DateTxt = new sap.m.Text({
                        text: {
                            path: 'RoutingGuideTableDataModel>ShipDate',
                            formatter: formatter.formatDate
                        },
                        wrapping: false
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: DateTxt,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/rows");
        },

        openRoutingGuideColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pRoutingGuidePopover) {
                this._pRoutingGuidePopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.RoutingGuide.RoutingGuideTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pRoutingGuidePopover.then(function (oPopover) {
                oController.RoutingGuideColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        RoutingGuideColumnsVisiblity: function () {
            var oView = oController.getView();
            var oRoutingGuideTableModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = oRoutingGuideTableModel.getProperty("/RoutingGuideTableData/RoutingGuideColumns");
            var oRoutingGuideTable = oView.byId("myRoutingGuideColumnSelectId");
            var aTableItems = oRoutingGuideTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("RoutingGuideTableDataModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },
        onRoutingGuideColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myRoutingGuideColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onoRoutingGuideColSelectOkPress: function () {
            var oView = this.getView()
            var oRoutingGuideTable = oView.byId("myRoutingGuideColumnSelectId");
            var RoutingGuideTableDataModel = oView.getModel("RoutingGuideTableDataModel");
            var oRoutingGuideTblItems = oRoutingGuideTable.getItems();
            var aColumnsData = RoutingGuideTableDataModel.getProperty("/RoutingGuideColumns");
            oRoutingGuideTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("RoutingGuideTableDataModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            RoutingGuideTableDataModel.updateBindings(true);
            this._handleDisplayRoutingGuidesTable();
            this._pRoutingGuidePopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onRoutingGuideColSelectClosePress: function () {
            this._pRoutingGuidePopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        onRoutingGuideFilterPopoverPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._RoutingGuidePopover) {
                this._RoutingGuidePopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.RoutingGuide.RoutingGuideFilterPopover",
                    controller: this
                }).then(function (RoutingGuidePopover) {
                    oView.addDependent(RoutingGuidePopover);
                    // RoutingGuidePopover.bindElement("/ProductCollection/0");
                    return RoutingGuidePopover;
                });
            }
            this._RoutingGuidePopover.then(function (RoutingGuidePopover) {
                RoutingGuidePopover.openBy(oButton);
            });
        },
        onRoutingGuideFilterPopoverClosePress: function () {
            this.byId("idRoutingGuideFilterPopover").close();
        },
        onRoutingGuideFilterPopoverResetPress: function () {
            this.byId("idRoutingGuideFilterPopover").close();
        },
        onRoutingGuideFilterPopoverApplyPress: function () {
            this.byId("idRoutingGuideFilterPopover").close();
        },


        onRoutingGuidePress:function(){
            var oView = this.getView();
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(false);
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            eshipjetModel.setProperty("/commonValues/routingGuidFooter", true);
            var SideNavigation = eshipjetModel.getProperty("/SideNavigation");
            if (SideNavigation === true) {
                eshipjetModel.setProperty("/SideNavigation", false);
            }
            var oPageContainer = this.byId("pageContainer");
            oPageContainer.to(oView.createId("_ID_RoutingGuide_TableScrollContainer"));
        },

        onRoutingGuidSaveOptionsPress:function(oEvent){
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._RoutingGuideSaveOptionsPopover) {
                this._RoutingGuideSaveOptionsPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.RoutingGuide.RoutingGuideSaveOptions",
                    controller: this
                }).then(function (RoutingGuideSaveOptionsPopover) {
                    oView.addDependent(RoutingGuideSaveOptionsPopover);
                    // RoutingGuideSaveOptionsPopover.bindElement("/ProductCollection/0");
                    return RoutingGuideSaveOptionsPopover;
                });
            }
            this._RoutingGuideSaveOptionsPopover.then(function (RoutingGuideSaveOptionsPopover) {
                RoutingGuideSaveOptionsPopover.openBy(oButton);
            });
        },
//   first add row and Col in table pendding
        onRoutingGuideExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/RoutingGuideTableData/rows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Order ID", property: "orderID" },
                        { label: "Created Date", property: "CreatedDate" },
                        { label: "Ship Date", property: "ShipDate" },
                        { label: "Shipment Type", property: "ShipmentType" },
                        { label: "Ship Method", property: "shipMethod" },
                        { label: "Service Name", property: "ServiceName" },
                        { label: "Tracking Number", property: "TrackingNumber" },
                        { label: "Status", property: "status" },
                        { label: "Ship To Contact", property: "ShipToContact" },
                        { label: "Ship To Company", property: "ShipToCompany" },
                        { label: "Ship To AddressLine1", property: "ShipToAddressLine1" },
                        { label: "Ship To City", property: "shipToCity" },
                        { label: "Ship To State", property: "shipToState" },
                        { label: "Ship To Country", property: "shipToCountry" },
                        { label: "Ship To Zip", property: "shipToZip" },
                        { label: "Ship To Phone", property: "shipToPhone" },
                        { label: "Ship To Email", property: "shipToEmail" },
                        { label: "Requestor Name", property: "requesterName" },
                        { label: "Connected To", property: "connectedTo" },
                        { label: "Priority Level", property: "priorityLevel" },
                        { label: "Actions", property: "actions" },
                    ]
                },
                dataSource: rows,
                fileName: 'RoutingGide_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },
        // RoutingGuide Changes End

        // Ship Request/Lable Code Changes Starts


        onCreateShipReqClosePress:function(){
            var sKey = "ShipRequestLabel";
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            if (sKey === "ShipRequestLabel") {
                eshipjetModel.setProperty("/commonValues/toolPageHeader", true);
                eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
                eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
                eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/commonValues/darkTheme", false);
                document.body.classList.remove("dark-theme");
                // this._handleDisplayShipReqTable();
                oController.getShipReqLabelHistoryShipments();
            }
            eshipjetModel.setProperty("/SideNavigation", false);
            this.byId("pageContainer").to(this.getView().createId(sKey));
        },

        _handleDisplayShipReqTable: function () {
            var that = this;
            oController.getShipReqLabelHistoryShipments();
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var ShipReqTableData = eshipjetModel.getData().ShipReqTableData;
            var ShipReqTableDataModel = new JSONModel(ShipReqTableData);
            this.getView().setModel(ShipReqTableDataModel, "ShipReqTableDataModel");
            const oTable = oView.byId("idShipReqsTable");
            oTable.setModel(ShipReqTableDataModel);
            var ShipReqTableDataModel = this.getView().getModel("ShipReqTableDataModel");
            var ShipReqColumns = ShipReqTableDataModel.getData().ShipReqColumns;
            var count = 0;
            for (var i = 0; i < ShipReqColumns.length; i++) {
                if (ShipReqColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/ShipReqColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    minWidth = "150px";
                }
                if (columnName === "actions") {
                    var oHBox = new sap.m.HBox({}); // Create Text instance 
                    var Btn1 = new sap.m.Button({ 
                        text: "View Now", 
                        type: "Transparent",
                        press: function(oEvent){
                            oController.onViewNowPressBackToShipNow(oEvent);
                        }
                    });
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "TrackingNumber") {
                    var Link = new sap.m.Link({
                        text: '{TrackingNumber}',
                        press: function (oEvent) {
                            that.onTrackingNumberPress(oEvent);
                        }
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: Link,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "Createddate" || columnName === "CrossdockShipdate") {
                    var DateTxt = new sap.m.Text({
                        text: {
                            path: '{Createddate}',
                            formatter: formatter.formatDate  // Attach the formatter dynamically
                        },
                        wrapping: false
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: DateTxt,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.setModel(eshipjetModel);
            oTable.bindRows("/RecentShipmentSetShipReqLabel");
        },

        openShipReqColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pShipReqPopover) {
                this._pShipReqPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipReqLabel.ShipReqTableColumns",
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


        onShipReqExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/ShipReqTableData/ShipReqRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "locationName" },
                        { label: "Consolidation ID", property: "consolidationID" },
                        { label: "Request ID / Label ID", property: "requestIdLabelId" },
                        { label: "Created Date", property: "CreatedDate" },
                        { label: "Ship Date", property: "ShipDate" },
                        { label: "Shipment Type", property: "ShipmentType" },
                        { label: "Ship Method", property: "shipMethod" },
                        { label: "Service Name", property: "ServiceName" },
                        { label: "Tracking Number", property: "TrackingNumber" },
                        { label: "Status", property: "status" },
                        { label: "Ship To Contact", property: "ShipToContact" },
                        { label: "Ship To Company", property: "ShipToCompany" },
                        { label: "Ship To AddressLine1", property: "ShipToAddressLine1" },
                        { label: "Ship To State / Provincey", property: "shipToStateProvince" },
                        { label: "Ship To City", property: "shipToCity" },
                        { label: "Ship To Zip / Postal Code", property: "shipToZipPostalCode" },
                        { label: "Ship To Country", property: "shipToCountry" },
                        { label: "Ship To Phone", property: "shipToPhone" },
                        { label: "Ship To Email", property: "shipToEmail" },
                        { label: "Requestor Name", property: "requesterName" },
                        { label: "Connected To", property: "connectedTo" },
                        { label: "Order Type", property: "orderType" },
                        { label: "RFID", property: "RFID" },
                        { label: "Actions", property: "actions" },
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


        ShipReqColumnsVisiblity: function () {
            var oView = oController.getView();
            var oShipReqTableModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = oShipReqTableModel.getProperty("/ShipReqColumns");
            var oShipReqTable = oView.byId("myShipReqColumnSelectId");
            var aTableItems = oShipReqTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("eshipjetModel").getObject().name && oColObj.visible) {
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
            var eshipjetModel = oView.getModel("eshipjetModel");
            var oShipReqTblItems = oShipReqTable.getItems();
            // var aColumnsData = ShipReqTableDataModel.getProperty("/ShipReqColumns");
            var aColumnsData = eshipjetModel.getData().ShipReqColumns;
            oShipReqTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            // this._handleDisplayShipReqTable();
            oController.getShipReqLabelHistoryShipments();
            this._pShipReqPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onShipReqColSelectClosePress: function () {
            this._pShipReqPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        onShipReqFilterPopoverPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            // create popover
            if (!this._shipReqPopover) {
                this._shipReqPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipReqLabel.ShipReqFilterPopover",
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
        onSettingsPress: function (oEvent) {
            var that = this;
            
            if (!this._oPopover) {
                this._oPopover = new sap.m.Popover({
                    title: "Filter Columns",
                    placement: "Left",
                    contentWidth: "200px",
                    content: new sap.m.VBox({
                        items: [
                            new sap.m.CheckBox({
                                id: "cbSelectAll",
                                text: "Select All",
                                select: function (oEvent) {
                                    var bSelected = oEvent.getParameter("selected");
                                    that.toggleAllColumns(bSelected);
                                }
                            }),
                            new sap.m.CheckBox({ id: "cbShipMethodID", text: "Ship Method ID", selected: true }),
                            new sap.m.CheckBox({ id: "cbShipMethodDescription", text: "Ship Method Description", selected: true }),
                            new sap.m.CheckBox({ id: "cbCarrierEmail", text: "Carrier Email", selected: true }),
                            new sap.m.CheckBox({ id: "cbCarrierPhone", text: "Carrier Phone", selected: true }),
                            new sap.m.CheckBox({ id: "cbTotalFreightQuote", text: "Total Freight Quote", selected: true }),
                            new sap.m.CheckBox({ id: "cbTransitDays", text: "Transit Days", selected: true }),
                            new sap.m.CheckBox({ id: "cbQuoteStatus", text: "Quote Status", selected: true }),
                            new sap.m.CheckBox({ id: "cbReview", text: "Review", selected: true })
                        ]
                    }),
                    footer: new sap.m.Bar({
                        contentRight: [
                            new sap.m.Button({
                                text: "Apply",
                                type: "Emphasized",
                                press: function () {
                                    that.onFilterChange();
                                    that._oPopover.close();
                                }
                            }),
                           
                        ]
                    })
                });
                this.getView().addDependent(this._oPopover);
            }
        
            this._oPopover.openBy(oEvent.getSource());
        },
        
        toggleAllColumns: function (bSelected) {
            var aCheckBoxes = [
                "cbShipMethodID",
                "cbShipMethodDescription",
                "cbCarrierEmail",
                "cbCarrierPhone",
                "cbTotalFreightQuote",
                "cbTransitDays",
                "cbQuoteStatus",
                "cbReview"
            ];
        
            aCheckBoxes.forEach(function (sCheckBoxId) {
                var oCheckBox = sap.ui.getCore().byId(sCheckBoxId);
                if (oCheckBox) {
                    oCheckBox.setSelected(bSelected);
                }
            });
        },
        
        onFilterChange: function () {
            var aColumns = [
                "colShipMethodID",
                "colShipMethodDescription",
                "colCarrierEmail",
                "colCarrierPhone",
                "colTotalFreightQuote",
                "colTransitDays",
                "colQuoteStatus",
                "colReview"
            ];
        
            aColumns.forEach(function (sColumnId) {
                var oCheckBox = sap.ui.getCore().byId("cb" + sColumnId.replace("col", ""));
                var oColumn = this.getView().byId(sColumnId);
                if (oColumn && oCheckBox) {
                    oColumn.setVisible(oCheckBox.getSelected());
                }
            }.bind(this));
        }
        ,
        

        onCreateShipReqLabelPress: function () {
            var oView = this.getView();
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(false);
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            var SideNavigation = eshipjetModel.getProperty("/SideNavigation");
            if (SideNavigation === true) {
                eshipjetModel.setProperty("/SideNavigation", false);
            }
            var oPageContainer = this.byId("pageContainer");
            oPageContainer.to(oView.createId("_ID_CreateShipReqLabel_TableScrollContainer"));
            this._handleDisplayCreateShipReqTable();
            eshipjetModel.setProperty("/commonValues/toolPageHeader", false);
            eshipjetModel.setProperty("/commonValues/allViewsFooter", false);
            eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
            eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
            eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", true);
            var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
            ShipNowDataModel.setProperty("/ShipFromAddress", "");
            ShipNowDataModel.setProperty("/ShipToAddress", "");
        },


        onCreateShipReqSavePress:function(){
            var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
            var ShipFromAddress = ShipNowDataModel.getProperty("/ShipFromAddress");
            var ShipToAddress = ShipNowDataModel.getProperty("/ShipToAddress");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var ShipReqRows = eshipjetModel.getData().ShipReqTableData.ShipReqRows;
            var oCurrObj = {
                "locationName": "eshipJet Software Inc.",
                "requestIdLabelId": "DN000001385",
                "CreatedDate": "01/20/2025",
                "ShipDate": "01/21/2025",
                "shipMethod": eshipjetModel.getProperty("/commonValues/ShipNowShipMethodSelectedKey"),
                "ServiceName": eshipjetModel.getProperty("/commonValues/ShipNowShipsrvNameSelectedKey"),
                "TrackingNumber": null,
                "quoteStatus": "Sent for Clarifications",
                "ShipToContact": ShipToAddress.FullName,
                "ShipToCompany": ShipToAddress.BusinessPartnerName1,
                "shipToCity": ShipToAddress.CityName,
                "status": "Open",
                "shipToStateProvince": ShipToAddress.Region,
                "shipToZipPostalCode": ShipToAddress.PostalCode,
                "shipToCountry": ShipToAddress.Country,
                "shipToPhone": ShipToAddress.PhoneNumber,
                "shipToEmail": ShipToAddress.EMAIL
              };

              ShipReqRows.push(oCurrObj);
              eshipjetModel.updateBindings(true);

            ShipNowDataModel.setProperty("/ShipFromAddress", "");
            ShipNowDataModel.setProperty("/ShipToAddress", "");
        },


        _handleDisplayCreateShipReqTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var ShipReqTableData = eshipjetModel.getData().ShipReqTableData;
            var ShipReqTableDataModel = new JSONModel(ShipReqTableData);
            this.getView().setModel(ShipReqTableDataModel, "ShipReqTableDataModel");
            var oTable = oView.byId("idCreateShipReqTable");
            oTable.setModel(ShipReqTableDataModel);
            var ShipReqTableDataModel = this.getView().getModel("ShipReqTableDataModel");
            var CreateShipReqColumnsData = ShipReqTableDataModel.getData().CreateShipReqColumns;
            var count = 0;
            for (var i = 0; i < CreateShipReqColumnsData.length; i++) {
                if (CreateShipReqColumnsData[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/CreateShipReqColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
                if (columnName != "actions") {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        hAlign: "Begin",
                        sortProperty: columnName
                    });
                }else if (columnName === "actions") {
                    var oHBox = new sap.m.HBox({}); // Create Text instance 
                    var Btn1 = new sap.m.Button({ icon: "sap-icon://delete", type: "Transparent" });
                    var Btn2 = new sap.m.Button({
                        icon: "sap-icon://delete", type: "Attention",
                        press: function (oEvent) {
                            MessageBox.warning("Are you sure you want to delete this record?", {
                                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
                                    if(sAction === "OK"){
                                        oController.onCreateShipReqPrdTableDelPress(oEvent);
                                    }
                                }
                            });
                        }
                    });
                    oHBox.addItem(Btn2);
                    // oHBox.addItem(Btn2);
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oHBox,
                        visible: oContext.getObject().visible,
                        width: "100px",
                        hAlign: "Begin",
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/CreateShipReqRows");
        },

        onCreateShipReqPrdTableDelPress:function(oEvent){
            var sPath = oEvent.getSource().getBindingContext().sPath.split("/");
            var idx = parseInt(sPath[sPath.length-1]);
            var ShipReqTableDataModel = oController.getView().getModel("ShipReqTableDataModel");
            ShipReqTableDataModel.getData().CreateShipReqRows.splice(idx, 1);
            ShipReqTableDataModel.updateBindings(true);
        },

        openCreateShipReqColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pCreateShipReqPopover) {
                this._pCreateShipReqPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipReqLabel.CreateShipReqTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pCreateShipReqPopover.then(function (oPopover) {
                oController.CreateShipReqColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        CreateShipReqColumnsVisiblity: function () {
            var oView = oController.getView();
            var oCreateShipReqTableModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = oCreateShipReqTableModel.getProperty("/ShipReqTableData/CreateShipReqColumns");
            var oCreateShipReqTable = oView.byId("myCreateShipReqColumnSelectId");
            var aTableItems = oCreateShipReqTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("ShipReqTableDataModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },
        onCreateShipReqColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myCreateShipReqColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onoCreateShipReqColSelectOkPress: function () {
            var oView = this.getView()
            var oCreateShipReqTable = oView.byId("myCreateShipReqColumnSelectId");
            var ShipReqTableDataModel = oView.getModel("ShipReqTableDataModel");
            var oCreateShipReqTblItems = oCreateShipReqTable.getItems();
            var aColumnsData = ShipReqTableDataModel.getProperty("/CreateShipReqColumns");
            oCreateShipReqTblItems.map(function (oTableItems) {
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
            this._handleDisplayCreateShipReqTable();
            this._pCreateShipReqPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onCreateShipReqColSelectClosePress: function () {
            this._pCreateShipReqPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        ShipReqActDownArrowPress: function (oEvent) {
            // var aPath = oEvent.getSource().getBindingContext().sPath.split("/");
            // var eshipjetModel = this.getView().getModel("eshipjetModel");
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._addPopover) {
                this._addPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipReqLabel.ShipReqActPopover",
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

        onShipmentChange : function(oEvent){
            var eshipjetModel =  this.getOwnerComponent().getModel("eshipjetModel");
            var shipmentTypeSelectedKey =  eshipjetModel.getData().shipmentTypeSelectedKey;
            var createShipReqSpecialSrvsShow = eshipjetModel.getProperty("/createShipReqSpecialSrvsShow");
            if (shipmentTypeSelectedKey === "business" && createShipReqSpecialSrvsShow){
                eshipjetModel.setProperty("/shipMethodKey", "" );
                eshipjetModel.setProperty("/ServiceNameSelectedKeys", "" );
                eshipjetModel.setProperty("/createShipReqBusinessSelect", false );
                eshipjetModel.setProperty("/createShipReqPersonalSelect", false );

            }else if(shipmentTypeSelectedKey === "personal" && createShipReqSpecialSrvsShow){
                eshipjetModel.setProperty("/shipMethodKey", "" );
                eshipjetModel.setProperty("/ServiceNameSelectedKeys", "" );
                eshipjetModel.setProperty("/createShipReqBusinessSelect", false );
                eshipjetModel.setProperty("/createShipReqPersonalSelect", true );

            }else if(shipmentTypeSelectedKey === "interbranch" && createShipReqSpecialSrvsShow){
                eshipjetModel.setProperty("/shipMethodKey", "JPMC" );
                eshipjetModel.setProperty("/ServiceNameSelectedKeys", "intraExpress" );
                eshipjetModel.setProperty("/createShipReqBusinessSelect", false );
                eshipjetModel.setProperty("/createShipReqPersonalSelect", false );

             }else if (shipmentTypeSelectedKey === "business" && createShipReqSpecialSrvsShow != true){
                eshipjetModel.setProperty("/shipMethodKey", "" );
                eshipjetModel.setProperty("/ServiceNameSelectedKeys", "" );
                eshipjetModel.setProperty("/createShipReqBusinessSelect", true );
                eshipjetModel.setProperty("/createShipReqPersonalSelect", false );

            }else if(shipmentTypeSelectedKey === "personal" && createShipReqSpecialSrvsShow != true){
                eshipjetModel.setProperty("/shipMethodKey", "" );
                eshipjetModel.setProperty("/ServiceNameSelectedKeys", "" );
                eshipjetModel.setProperty("/createShipReqBusinessSelect", true );
                eshipjetModel.setProperty("/createShipReqPersonalSelect", true );
                eshipjetModel.setProperty("/createShipReqSpecialSrvsShow", false );

            }else if(shipmentTypeSelectedKey === "interbranch" && createShipReqSpecialSrvsShow != true){
                eshipjetModel.setProperty("/shipMethodKey", "JPMC" );
                eshipjetModel.setProperty("/ServiceNameSelectedKeys", "intraExpress" );
                eshipjetModel.setProperty("/createShipReqBusinessSelect", false );
                eshipjetModel.setProperty("/createShipReqPersonalSelect", false );

             }

        },

        onCreateShipReqOrderTypeChange:function(oEvent){
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var ShipReqOrderType = eshipjetModel.getProperty("/ShipReqOrderType");
            var shipmentTypeSelectedKey =  eshipjetModel.getData().shipmentTypeSelectedKey;

            var createShipReqPersonalSelect = eshipjetModel.getProperty("/createShipReqPersonalSelect");
            if(ShipReqOrderType === "freight_quote" && shipmentTypeSelectedKey === "business"){
                eshipjetModel.setProperty("/createShipReqSpecialSrvsShow", true);
                eshipjetModel.setProperty("/createShipReqBusinessSelect", false);
                eshipjetModel.setProperty("/createShipReqPersonalSelect", false);
            }else if(ShipReqOrderType === "freight_quote" && shipmentTypeSelectedKey === "personal"){
                eshipjetModel.setProperty("/createShipReqSpecialSrvsShow", true);
                eshipjetModel.setProperty("/createShipReqBusinessSelect", false);
                eshipjetModel.setProperty("/createShipReqPersonalSelect", true);
            }else if(ShipReqOrderType === "freight_quote" && shipmentTypeSelectedKey === "interbranch"){
                eshipjetModel.setProperty("/createShipReqSpecialSrvsShow", true);
                eshipjetModel.setProperty("/createShipReqBusinessSelect", false);
                eshipjetModel.setProperty("/createShipReqPersonalSelect", false);
            }else if(ShipReqOrderType !== "freight_quote" && shipmentTypeSelectedKey === "business"){
                eshipjetModel.setProperty("/createShipReqSpecialSrvsShow", false);
                eshipjetModel.setProperty("/createShipReqBusinessSelect", true);
                eshipjetModel.setProperty("/createShipReqPersonalSelect", false);
            }else if(ShipReqOrderType !== "freight_quote" && shipmentTypeSelectedKey === "personal"){
                eshipjetModel.setProperty("/createShipReqSpecialSrvsShow", false);
                eshipjetModel.setProperty("/createShipReqBusinessSelect", true);
                eshipjetModel.setProperty("/createShipReqPersonalSelect", true);
            }else if(ShipReqOrderType !== "freight_quote" && shipmentTypeSelectedKey === "interbranch"){
                eshipjetModel.setProperty("/createShipReqSpecialSrvsShow", false);
                eshipjetModel.setProperty("/createShipReqBusinessSelect", false);
                eshipjetModel.setProperty("/createShipReqPersonalSelect", false);
            }
        },

        // Ship Request/Lable Code Changes ENd


        // Track Now changes start

        _handleDisplayTrackNowTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var TrackNowTableData = eshipjetModel.getData().TrackNowTableData;
            var TrackNowTableDataModel = new JSONModel(TrackNowTableData);
            this.getView().setModel(TrackNowTableDataModel, "TrackNowTableDataModel");
            const oTable = oView.byId("idTrackNowTable");
            oTable.setModel(TrackNowTableDataModel);
            var TrackNowTableDataModel = this.getView().getModel("TrackNowTableDataModel");
            var TrackNowColumns = TrackNowTableDataModel.getData().TrackNowColumns;
            var count = 0;
            for (var i = 0; i < TrackNowColumns.length; i++) {
                if (TrackNowColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/TrackNowColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/TrackNowRows");
        },

        onTrackNowShippedFilterPress:function(oEvent){
            var oTable = oController.getView().byId("idTrackNowTable");
            var oBinding = oTable.getBinding("rows");
            var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, "Shipped");
            oBinding.filter([oFilter]);
        },

        onTrackNowInTransitFilterPress:function(){
            var oTable = oController.getView().byId("idTrackNowTable");
            var oBinding = oTable.getBinding("rows");
            var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, "In-Transit");
            oBinding.filter([oFilter]);
        },

        onTrackNowCancelledFilterPress:function(){
            var oTable = oController.getView().byId("idTrackNowTable");
            var oBinding = oTable.getBinding("rows");
            var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, "Cancelled");
            oBinding.filter([oFilter]);
        },

        onTrackNowDeliveredFilterPress:function(){
            var oTable = oController.getView().byId("idTrackNowTable");
            var oBinding = oTable.getBinding("rows");
            var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, "Delivered");
            oBinding.filter([oFilter]);
        },
        formatPriorityAlert: function(value) {
            if (value === false) {
                return "";
            }
            return value;
        },
        
    
       

        openTrackNowColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pTrackNowPopover) {
                this._pTrackNowPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.TrackNow.TrackNowTableColumns",
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
            var oTrackNowTableModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = oTrackNowTableModel.getProperty("/TrackNowTableData/TrackNowColumns");
            var oTrackNowTable = oView.byId("myTrackNowColumnSelectId");
            var aTableItems = oTrackNowTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("eshipjetModel").getObject().name && oColObj.visible) {
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
            var eshipjetModel = oView.getModel("eshipjetModel");
            var oTrackNowTblItems = oTrackNowTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/TrackNowTableData/TrackNowColumns");
            var TrackNowColSelectedCount = 0;

            oTrackNowTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().name === oColObj.name) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                            TrackNowColSelectedCount +=1;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            
            eshipjetModel.setProperty("/TrackNowColSelectedCount", TrackNowColSelectedCount);
            eshipjetModel.updateBindings(true);

            // this._handleDisplayTrackNowTable();
            this.getOrdersHistoryShipments();
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
                    name: "com.eshipjet.zeshipjet.view.fragments.TrackNow.TrackNowFilterPopover",
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
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var ManifestTableData = eshipjetModel.getData().ManifestTableData;
            var ManifestTableDataModel = new JSONModel(ManifestTableData);
            this.getView().setModel(ManifestTableDataModel, "ManifestTableDataModel");
            const oTable = oView.byId("idManifestTable");
            oTable.setModel(ManifestTableDataModel);
            var ManifestTableDataModel = this.getView().getModel("ManifestTableDataModel");
            var ManifestColumns = ManifestTableDataModel.getData().ManifestColumns;
            var count = 0;
            for (var i = 0; i < ManifestColumns.length; i++) {
                if (ManifestColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/ManifestColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/ManifestRows");
        },

        openManifestColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pManifestPopover) {
                this._pManifestPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.Manifest.ManifestTableColumns",
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
            var oManifestTableModel = oController.getOwnerComponent().getModel("eshipjetModel");
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
            this._handleDisplayManifestTable();
            this._pManifestPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onManifestColSelectClosePress: function () {
            this._pManifestPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        onManifestPrintPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pManifestPrintPopover) {
                this._pManifestPrintPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.Manifest.ManifestPrintDialog",
                    controller: this
                }).then(function (oManifestPrintPopover) {
                    oView.addDependent(oManifestPrintPopover);
                    // oManifestPrintPopover.bindElement("/ProductCollection/0");
                    return oManifestPrintPopover;
                });
            }
            this._pManifestPrintPopover.then(function (oManifestPrintPopover) {
                oManifestPrintPopover.openBy(oButton);
            })
        },

        onManifestPrintClosePress: function () {
            this.byId("idManifestPrintPopover").close();
        },


        OnManifestExportToExcel: function () {
            
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/ManifestTableData/ManifestRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Request ID / Label ID", property: "requestIdLabelId" },
                        { label: "Created Date", property: "CreatedDate" },
                        { label: "Ship Date", property: "ShipDate" },
                        { label: "Shipment Type", property: "ShipmentType" },
                        { label: "Ship Method", property: "shipMethod" },
                        { label: "Service Name", property: "ServiceName" },
                        { label: "Tracking Number", property: "TrackingNumber" },
                        { label: "Status", property: "status" },
                        { label: "Ship To Contact", property: "ShipToContact" },
                        { label: "Ship To Company", property: "ShipToCompany" },
                        { label: "Ship To AddressLine1", property: "ShipToAddressLine1" },
                        { label: "Ship To City", property: "shipToCity" },
                        { label: "Ship To State", property: "shipToState" },
                        { label: "Ship To Country", property: "shipToCountry" },
                        { label: "Ship To Zipcode", property: "shipToZipcode" },
                        { label: "Ship To Phone", property: "shipToPhone" },
                        { label: "Ship To Email", property: "shipToEmail" },
                        { label: "Requestor Name", property: "requesterName" },
                        
                        { label: "Connected To", property: "connectedTo" },
                        { label: "Order Type", property: "orderType" },
                        { label: "Priority Level", property: "priorityLevel" },
                        { label: "Actions", property: "actions" },
                    ]
                },
                dataSource: rows,
                fileName: 'Manifast_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },
        // Manifest Changes End here

        // FeightAuditAnalysis start here's

        _handleDisplayFeightAuditAnalysisTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            // var FeightAuditAnalysisTableData = eshipjetModel.getData().FeightAuditAnalysisTableData;
            // var FeightAuditAnalysisTableDataModel = new JSONModel(FeightAuditAnalysisTableData);
            // this.getView().setModel(FeightAuditAnalysisTableDataModel, "FeightAuditAnalysisTableDataModel");
            const oTable = oView.byId("idFeightAuditAnalysisTable");
            oTable.setModel(eshipjetModel);
            var eshipjetModel = this.getView().getModel("eshipjetModel");
            var FeightAuditAnalysisColumns = eshipjetModel.getData().FeightAuditAnalysisColumns;
            var count = 0;
            for (var i = 0; i < FeightAuditAnalysisColumns.length; i++) {
                if (FeightAuditAnalysisColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/FeightAuditAnalysisColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "CreatedDate" || columnName === "ShipDate") {
                    var DateTxt = new sap.m.Text({
                        text: {
                            path: 'eshipjetModel>ShipDate',
                            formatter: formatter.formatDate  // Attach the formatter dynamically
                        },
                        wrapping: false
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/FeightAuditAnalysisRows");
        },
        openFeightAuditAnalysisColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pFeightAuditAnalysisPopover) {
                this._pFeightAuditAnalysisPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.FeightAuditAnalysis.FeightAuditAnalysisTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pFeightAuditAnalysisPopover.then(function (oPopover) {
                oController.FeightAuditAnalysisColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        FeightAuditAnalysisColumnsVisiblity: function () {
            var oView = oController.getView();
            var oFeightAuditAnalysisTableModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = oFeightAuditAnalysisTableModel.getProperty("/FeightAuditAnalysisColumns");
            var oFeightAuditAnalysisTable = oView.byId("myFeightAuditAnalysisColumnSelectId");
            var aTableItems = oFeightAuditAnalysisTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.name === oItem.getBindingContext("eshipjetModel").getObject().name && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onFeightAuditAnalysisColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myFeightAuditAnalysisColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onoFeightAuditAnalysisColSelectOkPress: function () {
            var oView = this.getView()
            var oFeightAuditAnalysisTable = oView.byId("myFeightAuditAnalysisColumnSelectId");
            var eshipjetModel = oView.getModel("eshipjetModel");
            var oFeightAuditAnalysisTblItems = oFeightAuditAnalysisTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/FeightAuditAnalysisColumns");
            var FeightAuditAnalysisColSelectedCount = 0;

            oFeightAuditAnalysisTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                            FeightAuditAnalysisColSelectedCount +=1;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            
            eshipjetModel.setProperty("/FeightAuditAnalysisColSelectedCount", FeightAuditAnalysisColSelectedCount);
            eshipjetModel.updateBindings(true);

            this._handleDisplayFeightAuditAnalysisTable();
            // this.getOrdersHistoryShipments();
            this._pFeightAuditAnalysisPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onFeightAuditAnalysisColSelectClosePress: function () {
            this._pFeightAuditAnalysisPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        onFeightAuditAnalysisFilterPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            // create popover
            if (!this._FeightAuditAnalysisPopover) {
                this._FeightAuditAnalysisPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.FeightAuditAnalysis.FeightAuditAnalysisFilterPopover",
                    controller: this
                }).then(function (FeightAuditAnalysisPopover) {
                    oView.addDependent(FeightAuditAnalysisPopover);
                    // FeightAuditAnalysisPopover.bindElement("/ProductCollection/0");
                    return FeightAuditAnalysisPopover;
                });
            }
            this._FeightAuditAnalysisPopover.then(function (FeightAuditAnalysisPopover) {
                FeightAuditAnalysisPopover.openBy(oButton);
            });
        },
        onFeightAuditAnalysisFilterPopoverClosePress: function () {
            this.byId("idFeightAuditAnalysisFilterPopover").close();
        },
        onFeightAuditAnalysisFilterPopoverResetPress: function () {
            this.byId("idFeightAuditAnalysisFilterPopover").close();
        },
        onFeightAuditAnalysisFilterPopoverApplyPress: function () {
            this.byId("idFeightAuditAnalysisFilterPopover").close();
        },


        // FeightAuditAnalysis ends here
        _handleDisplayBatchShipTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var BatchShipTableData = eshipjetModel.getData().BatchShipTableData;
            var BatchShipTableDataModel = new JSONModel(BatchShipTableData);
            this.getView().setModel(BatchShipTableDataModel, "BatchShipTableDataModel");
            const oTable = oView.byId("idBatchShipTable");
            oTable.setModel(BatchShipTableDataModel);
            var BatchShipTableDataModel = this.getView().getModel("BatchShipTableDataModel");
            var BatchShipColumns = BatchShipTableDataModel.getData().BatchShipColumns;
            var count = 0;
            for (var i = 0; i < BatchShipColumns.length; i++) {
                if (BatchShipColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/BatchShipColumns", function (sId, oContext) {
                columnName = oContext.getObject().name;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/BatchShipRows");
        },

        openBatchShipColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pBatchShipPopover) {
                this._pBatchShipPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.BatchShip.BatchShipTableColumns",
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
            var oBatchShipTableModel = oController.getOwnerComponent().getModel("eshipjetModel");
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
            this._handleDisplayBatchShipTable();
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
                    name: "com.eshipjet.zeshipjet.view.fragments.BatchShip.BatchShipFilterPopover",
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

        onBatchShipFilterPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._batchShipPopover) {
                this._batchShipPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.BatchShip.BatchShipFilterPopover",
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

       

        onBatchShipTotalFilterPress: function(){
            var oTable = this.getView().byId("idBatchShipTable"); // Ensure this is the actual table ID
            var oBinding = oTable.getBinding("rows");
            var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, "Total");
            oBinding.filter([oFilter]);
        },
        
        onBatchShipopenFilterPress: function(){
            var oTable = this.getView().byId("idBatchShipTable"); // Ensure this is the actual table ID
            var oBinding = oTable.getBinding("rows");
            var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, "open");
            oBinding.filter([oFilter]);
        },
        
        onBatchShipShippedFilterPress: function(){
            var oTable = this.getView().byId("idBatchShipTable"); // Ensure this is the actual table ID
            var oBinding = oTable.getBinding("rows");
            var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, "Shipped");
            oBinding.filter([oFilter]);
        },
        
        onBatchShipCancelledFilterPress: function(){
            var oTable = this.getView().byId("idBatchShipTable"); // Ensure this is the actual table ID
            var oBinding = oTable.getBinding("rows");
            var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, "Cancelled");
            oBinding.filter([oFilter]);
        },
        onBatchShipExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/BatchShipTableData/BatchShipRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Batch ID", property: "batchId", visible: true },
                        { label: "Batch Description", property: "batchDescription", visible: true },
                        { label: "Batch-Request ID", property: "BatchRequestId", visible: true },
                        { label: "Created Date", property: "CreatedDate", visible: true },
                        { label: "Ship Date", property: "ShipDate", visible: true },
                        { label: "Shipment Type", property: "ShipmentType", visible: true },
                        { label: "Ship Method", property: "shipMethod", visible: true },
                        { label: "Service Name", property: "ServiceName", visible: true },
                        { label: "Tracking Number", property: "TrackingNumber", visible: true },
                        { label: "Status", property: "status", visible: true },
                        { label: "Ship To Contact", property: "ShipToContact", visible: false },
                        { label: "Ship To Company", property: "ShipToCompany", visible: false },
                        { label: "Ship To AddressLine1", property: "ShipToAddressLine1", visible: false },
                        { label: "Ship To City", property: "shipToCity", visible: false },
                        { label: "Ship To State", property: "shipToState", visible: false },
                        { label: "Ship To Country", property: "shipToCountry", visible: false },
                        { label: "Ship To Zipcode", property: "shipToZipcode", visible: false },
                        { label: "Ship To Phone", property: "shipToPhone", visible: false },
                        { label: "Ship To Email", property: "shipToEmail", visible: false },
                        { label: "Requestor Name", property: "requesterName", visible: false },
                        { label: "Connected To", property: "connectedTo", visible: false },
                        { label: "Order Type", property: "orderType", visible: false },
                        { label: "Priority Level", property: "priorityLevel", visible: true },
                        { label: "RFID", property: "RFID", visible: true },
                        { label: "Updated", property: "Updated", visible: true },
                        { label: "Notes", property: "Notes", visible: true },
                        { label: "Actions", property: "actions", visible: true }
                    ]
                },
                
                dataSource: rows,
                fileName: 'BatchShip_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },


        
    

        onOpenRecentShipmentPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
            oView = this.getView();            
            var sPath = oEvent.getSource().getId().split("--");
            var btnId = sPath[sPath.length - 1];
            eshipjetModel.setProperty("/RecentShipmentTab", btnId);
            let myPromise =  new Promise((resolve, reject) => {
                oController.getHistoryShipments(resolve);
            });
            myPromise.then(
                function(response) {
                    // create popover
                    if (!oController._recentShipPopover) {
                        oController._recentShipPopover = Fragment.load({
                            id: oView.getId(),
                            name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.RecentShipment",
                            controller: oController
                        }).then(function (oPopover) {
                            oView.addDependent(oPopover);
                            return oPopover;
                        });
                    }
                    oController._recentShipPopover.then(function (oPopover) {
                        oPopover.openBy(oButton);
                    });
                },
                function(error) {
                   
                }
            );     

        },
        onRecentShipmentClosePress: function () {
            this._recentShipPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        parseDate: function(dateStr) {
            return new Date(dateStr.replace(" {}", "")); // Removing "{}" before parsing
        },

        getHistoryShipments:function(resolve){
            oController.onOpenBusyDialog();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var ManifestSrvModel = oController.getOwnerComponent().getModel("ManifestSrvModel");
            var RecentShipmentTab = eshipjetModel.getProperty("/RecentShipmentTab");
            ManifestSrvModel.read("/EshipjetManfestSet",{
                // urlParameters: {
                //     "$expand": "to_DeliveryDocumentItem,to_DeliveryDocumentPartner"
                // },
                success:function(response){
                    if(response && response.results.length > 0){
                        // var last10Records = response.results.slice(-10);
                        // response.results.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
                        // 
                        // eshipjetModel.setProperty("/RecentShipmentSet",last10Records);
                        //response.results.sort((a, b) => oController.extractTimestamp(a.DateAdded) - oController.extractTimestamp(b.DateAdded));
                        //response.results.sort((a, b) => (new Date(b.DateAdded) && new Date(b.TimeAdded.ms))  - (new Date(a.DateAdded) && new Date(a.TimeAdded.ms)));
                        
                        response.results.sort((a, b) => {
                            let dateA = new Date(a.DateAdded).getTime();
                            let dateB = new Date(b.DateAdded).getTime();
                        
                            // Compare dateAdded first (Descending order)
                            if (dateA !== dateB) {
                                return dateB - dateA; // Reverse order
                            }
                        
                            // If dates are the same, compare timeAdded (Descending order)
                            return b.TimeAdded.ms - a.TimeAdded.ms; // Reverse order
                        });
                        var firstTenRecords = response.results.slice(0, 10);
                        //var lastTenReversed = response.results.slice(-10).reverse();
                        eshipjetModel.setProperty("/RecentShipmentSet", firstTenRecords);
                    }
                    resolve();
                    oController.onCloseBusyDialog();
                },
                error: function(error){
                    resolve();
                    MessageBox.warning(error.responseText);
                    oController.onCloseBusyDialog();
                }
            });

            // var obj = {
            //     "user_id":"info@eshipjet.ai",
            //     "filters":{
            //         "status":"Shipped",
            //         "locationid":"1001"
            //     }
            // };
            // var sPath = "https://dev-api-v1.eshipjet.site/shipments/gethistoryshipments";
            // $.ajax({
            //     url: sPath,
            //     method: "POST",
            //     contentType: "application/json",
            //     data: JSON.stringify(obj),
            //     success: function (response) {
            //         if(response && response.length > 0){
            //             eshipjetModel.setProperty("/RecentShipmentSet",response);
            //         }
            //         resolve();                      
            //         oController.oBusyDialog.close();
            //     },
            //     error: function (error) {
            //         console.log("Error:", error);
            //         resolve();
            //         MessageBox.warning(error.responseText);
            //         oController.oBusyDialog.close();
            //     }
            // });
        },

        getOrdersHistoryShipments:function(){
            oController.onOpenBusyDialog();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var ManifestSrvModel = oController.getOwnerComponent().getModel("ManifestSrvModel");
            var RecentShipmentTab = eshipjetModel.getProperty("/RecentShipmentTab");
            ManifestSrvModel.read("/EshipjetManfestSet",{
                // urlParameters: {
                //     "$expand": "to_DeliveryDocumentItem,to_DeliveryDocumentPartner"
                // },
                success:function(response){
                    if (response && response.results.length > 0) {
                        // Get today's date info
                        const today = new Date();
                        const currentMonth = today.getMonth(); // 0-based index
                        const currentYear = today.getFullYear();
                
                        // Filter to only include current month entries
                        const filteredResults = response.results.filter(item => {
                            const itemDate = new Date(item.DateAdded);
                            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
                        });
                
                        // Sort filtered results by date and time
                        filteredResults.sort((a, b) => {
                            let dateA = new Date(a.DateAdded).getTime();
                            let dateB = new Date(b.DateAdded).getTime();
                
                            if (dateA !== dateB) {
                                return dateB - dateA; // Descending by date
                            }
                
                            return b.TimeAdded.ms - a.TimeAdded.ms; // Descending by time
                        });
                
                        // Normalize ShipmentType
                        filteredResults.forEach(item => {
                            let shipmentValue = item.Type || item.Shipmenttype || item.ShipmentType;
                            if (shipmentValue && typeof shipmentValue === "string") {
                                shipmentValue = shipmentValue.trim().toUpperCase();
                                item.ShipmentType = shipmentValue === 'O' ? "Parcel" : "LTL";
                            } else {
                                item.ShipmentType = "LTL";
                            }
                        });
                
                        // Set the filtered, sorted data to the model
                        eshipjetModel.setProperty("/allOrders", filteredResults);
                        eshipjetModel.setProperty("/allOrdersLength", filteredResults.length);
                    }
                    oController.onCloseBusyDialog();
                },
                error: function(error){
                    MessageBox.warning(error.responseText);
                    oController.onCloseBusyDialog();
                }
            });
        },

        onOrdersDateFilterChange: function (oEvent) {
            const selectedKey = oEvent.getSource().getSelectedKey();
            // oController.getOrdersHistoryShipments();
            const eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            const allOrders = eshipjetModel.getProperty("/allOrders");
        
            if (!allOrders || allOrders.length === 0) return;
        
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        
            const filteredOrders = allOrders.filter(order => {
                const orderDate = new Date(order.DateAdded);
                orderDate.setHours(0, 0, 0, 0); // Normalize
        
                switch (selectedKey) {
                    case "today":
                        return this._isSameDate(orderDate, today);
                    case "yesterday":
                        const yesterday = new Date(today);
                        yesterday.setDate(today.getDate() - 1);
                        return this._isSameDate(orderDate, yesterday);
                    case "thisWeek":
                        const dayOfWeek = today.getDay(); // Sunday = 0
                        const thisWeekStart = new Date(today);
                        thisWeekStart.setDate(today.getDate() - dayOfWeek);
                        thisWeekStart.setHours(0, 0, 0, 0);
                        return orderDate >= thisWeekStart;
                    case "lastWeek":
                        const lastWeekStart = new Date(today);
                        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                        lastWeekStart.setHours(0, 0, 0, 0);
                        const lastWeekEnd = new Date(lastWeekStart);
                        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
                        return orderDate >= lastWeekStart && orderDate <= lastWeekEnd;
                    case "thisMonth":
                        return (
                            orderDate.getMonth() === today.getMonth() &&
                            orderDate.getFullYear() === today.getFullYear()
                        );
                    default:
                        return true;
                }
            });
        
            // Update table binding path or model property to reflect filter
            eshipjetModel.setProperty("/allOrders", filteredOrders);
            eshipjetModel.setProperty("/allOrdersLength", filteredOrders.length);
        },

        _isSameDate: function (d1, d2) {
            return (
                d1.getDate() === d2.getDate() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getFullYear() === d2.getFullYear()
            );
        },

        getShipReqLabelHistoryShipments:function(){
            oController.onOpenBusyDialog();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var ManifestSrvModel = oController.getOwnerComponent().getModel("ManifestSrvModel");
            ManifestSrvModel.read("/EshipjetManfestSet",{
                // urlParameters: {
                //     "$expand": "to_DeliveryDocumentItem,to_DeliveryDocumentPartner"
                // },
                success:function(response){
                    var last50Records = response.results.slice(-50);
                    if(response && response.results.length > 0){
                        eshipjetModel.setProperty("/RecentShipmentSetShipReqLabel",last50Records);
                    }
                    oController.onCloseBusyDialog();
                },
                error: function(error){
                    MessageBox.warning(error.responseText);
                    oController.onCloseBusyDialog();
                }
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
            var oHeader = $(".sapTntToolHeader.sapMTBStandard");
            oHeader.removeClass("customHeaderStyle");
            
            var oSrc = oEvent.getSource();
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            eshipjetModel.setProperty("/commonValues/allViewsFooter", true);
            eshipjetModel.setProperty("/commonValues/shipNowViewFooter", false);
            eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
            eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);

            eshipjetModel.setProperty("/showDarkThemeSwitch", false);
            var oCurrObj = oSrc.getBindingContext().getObject();
            var oToolPage = this.byId("toolPage");
            var oPageContainer = this.byId("pageContainer");
            oToolPage.setSideExpanded(false);
            this._dashBoardAddPopover.then(function (oPopover) {
                oPopover.close();
            });
            if (oCurrObj && oCurrObj.name === "Locations") {

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
                
            } else if (oCurrObj && oCurrObj.name === "Dangerous Goods") {
                oController._handleDisplayDangerousGoodsTable();
                oController._displayTables("_IDDangerousGoodsTable", "DangerousGoodsTableColumns", "DangerousGoodsTableRows", "Dangerous Goods");
                oPageContainer.to(oView.createId("_ID_DangerousGoods_TableScrollContainer"));

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

            } else if (oCurrObj && oCurrObj.name === "Tracking Range") {

                oController._displayTables("_ID_TrackingRangeTable", "TrackingRangeTableColumns", "TrackingRangeTableRows", "Tracking Range");
                oPageContainer.to(oView.createId("_ID_TrackingRange_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Dimensions") {

                oController._displayTables("_ID_DimensionTable", "DimensionsTableColumns", "DiemnsionsTableRows", "Dimensions");
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
            } else if (oCurrObj && oCurrObj.name === "Company Settings") {

                this.OpenCompanySettingsDialog();

            } else if (oCurrObj && oCurrObj.name === "Countries") {

                oController._displayTables("_ID_CountriesTable", "CountriesTableColumns", "CountriesTableRows", "Countries");
                oPageContainer.to(oView.createId("_ID_Countries_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "EU Countries") {

                oController._displayTables("_ID_EUCountriesTable", "EUCountriesTableColumns", "EUCountriesTableRows", "EU Countries");
                oPageContainer.to(oView.createId("_ID_EUCountries_TableScrollContainer"));

            } else if (oCurrObj && oCurrObj.name === "Routing Guide") {

                oController._displayTables("_IDRoutingGuideTable", "RoutingGuideTableColumns", "RoutingGuideTableRows", "Routing Guide");
                oPageContainer.to(oView.createId("_ID_RoutingGuide_TableScrollContainer"));

            } eshipjetModel.setProperty("/SideNavigation", false);
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
                            sortProperty: columnName
                        });
                    } else if (columnName === "status") {
                        var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                        return new sap.ui.table.Column({
                            label: oResourceBundle.getText(columnName),
                            template: oSwitch,
                            visible: oContext.getObject().visible,
                            sortProperty: columnName
                        });
                    } else {
                        return new sap.ui.table.Column({
                            label: oResourceBundle.getText(columnName),
                            template: columnName,
                            visible: oContext.getObject().visible,
                            sortProperty: columnName
                        });
                    }
                });
                oTable.bindRows("/" + aRows);
            }
        },

        onThemeChange: function (oEvent) {
            var oHeader = $(".sapTntToolHeader.sapMTBStandard");
            var bState = oEvent.getSource().getState();

            if (bState && oHeader.hasClass("customHeaderStyle")) {
                document.body.classList.remove("dark-theme");
                oHeader.removeClass("customHeaderStyle");
            } else {
                document.body.classList.add("dark-theme");
                oHeader.addClass("customHeaderStyle");
            }
        },
        OpenDefaultConfigDialog: function () {
            var oView = this.getView();
            if (!this.byId("DefaultconfopenDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.DefaultConfigDialog",
                    controller: this // Pass the controller for binding
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("DefaultconfopenDialog").open(); // Open existing dialog
            }
        },
        DefaultCancelDialog: function () {
            this.byId("DefaultconfopenDialog").close();
        },
        DefaultSaveDialog: function () {
            this.byId("DefaultconfopenDialog").close();
        },
        onDefaultConfigurationClosePress: function () {
            this.byId("DefaultconfopenDialog").close();
        },


        // Address Book Column Names Popover code changes starts here

        openAddressBookColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pAddressBookPopover) {
                this._pAddressBookPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddressBookTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pAddressBookPopover.then(function (oPopover) {
                oController.AddressBookColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        AddressBookColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/AddressBookTableColumns");
            var oAddressBookTable = oView.byId("myAddressBookColumnSelectId");
            var aTableItems = oAddressBookTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onAddressBookColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myAddressBookColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onAddressBookColSelectOkPress: function () {
            var oView = this.getView();
            var oAddressBookTable = oView.byId("myAddressBookColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDAddressBookTable")
            oTable.setModel(eshipjetModel);

            var oAddressBookTblItems = oAddressBookTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/AddressBookTableColumns");
            oAddressBookTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oAddressBookTable.setModel(eshipjetModel);
            this._handleDisplayAddressBookTable();
            this._pAddressBookPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onAddressBookColSelectClosePress: function () {
            this._pAddressBookPopover.then(function (oPopover) {
                oPopover.close();
            });
        },



        _handleDisplayAddressBookTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var AddressBookTableColumns = eshipjetModel.getData().AddressBookTableColumns;
            const oTable = oView.byId("_IDAddressBookTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < AddressBookTableColumns.length; i++) {
                if (AddressBookTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/AddressBookTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status" || columnName === "rfidTag") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/AddressBookTableRows");
        },


        onAddressBookExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/AddressBookTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Contact Name", property: "contactName", visible: true },
                        { label: "Company Name", property: "companyName", visible: true },
                        { label: "Phone No", property: "phonenum", visible: true },
                        { label: "Address Email", property: "addressEmail", visible: true },
                        { label: "Address Line 1", property: "addressLine1", visible: false },
                        { label: "Address Line 2", property: "addressLine2", visible: false },
                        { label: "Address Line 3", property: "addressLine3", visible: false },
                        { label: "State / Provience", property: "stateProvience", visible: true },
                        { label: "City", property: "addressCity", visible: true },
                        { label: "Zip / Postal Code", property: "addressZip", visible: false },
                        { label: "Country", property: "addressCountry", visible: true },
                        { label: "Address Category", property: "addCategory", visible: false },
                        { label: "Address Type", property: "addressType", visible: false },
                        { label: "Cost Center", property: "addCostCenter", visible: false },
                        { label: "Locker No", property: "lockerNo", visible: true },
                        { label: "Locker Location", property: "lockerLocation", visible: true },
                        { label: "Locker Access Code", property: "lockerAccCode", visible: true },
                        { label: "Building No", property: "buildingNo", visible: true },
                        { label: "Floor No", property: "floorNo", visible: true },
                        { label: "Mail Stop", property: "mailStop", visible: true },
                        { label: "Status", property: "status", visible: true },
                        { label: "RFID Tag", property: "rfidTag", visible: true }
                    ]
                    
                    
                },
                dataSource: rows,
                fileName: 'AddressBook_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },


        onRolesExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/RolesTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Role ID", property: "roleId", visible: true },
                        { label: "Role Name", property: "roleName", visible: true },
                        { label: "Status", property: "status", visible: true }
                    ]                    
                                        
                },
                dataSource: rows,
                fileName: 'Roles_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },



        onCarrierCatalogExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/CarrierCatalogTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Ship Method ID", property: "shipMethodId", visible: true },
                        { label: "Ship Method", property: "shipMethodName", visible: true },
                        { label: "Ship Method Type", property: "shipMethodType", visible: true },
                        { label: "Ship Method Coverage", property: "shipMethodCoverage", visible: true },
                        { label: "Ship Method Status", property: "status", visible: true }
                    ]                     
                },
                dataSource: rows,
                fileName: 'CarrierCatalog_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },




        onCarrierAccountsExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/CarrierAccountsTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "locationName", visible: true },
                        { label: "Ship Method", property: "shipMethodName", visible: true },
                        { label: "Cost Center", property: "costCenter", visible: true },
                        { label: "Ship From Country", property: "shipFromCountry", visible: true },
                        { label: "Ship To Country", property: "shipToCountry", visible: true },
                        { label: "Ship Url", property: "shipUrl", visible: true },
                        { label: "Void Url", property: "voidUrl", visible: true },
                        { label: "Rate Url", property: "rateUrl", visible: true },
                        { label: "Track Url", property: "trackUrl", visible: true },
                        { label: "Environment", property: "environment", visible: true },
                        { label: "Carrier Type", property: "carrierType", visible: true },
                        { label: "Status", property: "status", visible: true },
                        { label: "ERP Carrier ID", property: "erpCarrierID", visible: true },
                        { label: "Rate Shop", property: "rateShop", visible: true },
                        { label: "EDOC", property: "edoc", visible: true },
                        { label: "Manual Rates", property: "manualRates", visible: true },
                        { label: "Actions", property: "actions", visible: true }
                    ]
                                      
                },
                dataSource: rows,
                fileName: 'CarrierAccounts_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        onStatusesRefreshPress: function () {
            location.reload();
        },
        

        onStatusesExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/StatusesTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Ship Method ID", property: "shipMethodId", visible: true },
                        { label: "Ship Method", property: "shipMethodName", visible: true },
                        { label: "Ship Method Type", property: "shipMethodType", visible: true },
                        { label: "Ship Method Coverage", property: "shipMethodCoverage", visible: true },
                        { label: "Ship Method Status", property: "status", visible: true }
                    ]                     
                },
                dataSource: rows,
                fileName: 'Statuses_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        onPackagesExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/PackageTypeTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "locationName", visible: true },
                        { label: "Package Code", property: "packageCode", visible: true },
                        { label: "Package Type", property: "packageType", visible: true },
                        { label: "Ship Method", property: "shipMethod", visible: true },
                        { label: "Dimension Units", property: "dimensionUnits", visible: true },
                        { label: "Status", property: "status", visible: true },
                        { label: "Ship Method ID", property: "shipMethodId", visible: true },
                        { label: "Ship Method", property: "shipMethodName", visible: true },
                        { label: "Ship Method Type", property: "shipMethodType", visible: true },
                        { label: "Ship Method Coverage", property: "shipMethodCoverage", visible: true },
                        { label: "Ship Method Status", property: "status", visible: true }
                    ]                                  
                },
                dataSource: rows,
                fileName: 'Packages_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },



        onLTLClassesExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/LtlClassesTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "locationName", visible: true },
                        { label: "Package Code", property: "packageCode", visible: true },
                        { label: "Package Type", property: "packageType", visible: true },
                        { label: "Ship Method", property: "shipMethod", visible: true },
                        { label: "Dimension Units", property: "dimensionUnits", visible: true },
                        { label: "Status", property: "status", visible: true },
                        { label: "Ship Method ID", property: "shipMethodId", visible: true },
                        { label: "Ship Method", property: "shipMethodName", visible: true },
                        { label: "Ship Method Type", property: "shipMethodType", visible: true },
                        { label: "Ship Method Coverage", property: "shipMethodCoverage", visible: true },
                        { label: "Ship Method Status", property: "status", visible: true }
                    ]                                  
                },
                dataSource: rows,
                fileName: 'LTLClasses_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        onLTLClassesExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/LtlClassesTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "locationName", visible: true },
                        { label: "Package Code", property: "packageCode", visible: true },
                        { label: "Package Type", property: "packageType", visible: true },
                        { label: "Ship Method", property: "shipMethod", visible: true },
                        { label: "Dimension Units", property: "dimensionUnits", visible: true },
                        { label: "Status", property: "status", visible: true },
                        { label: "Ship Method ID", property: "shipMethodId", visible: true },
                        { label: "Ship Method", property: "shipMethodName", visible: true },
                        { label: "Ship Method Type", property: "shipMethodType", visible: true },
                        { label: "Ship Method Coverage", property: "shipMethodCoverage", visible: true },
                        { label: "Ship Method Status", property: "status", visible: true }
                    ]                                  
                },
                dataSource: rows,
                fileName: 'LTLClasses_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        onNMFCExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/NmfcTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "locationName", visible: true },
                        { label: "NMFC Code", property: "nmfcCode", visible: true },
                        { label: "NMFC Description", property: "nmfcDesc", visible: true },
                        { label: "Ship Method", property: "shipMethod", visible: true },
                        { label: "Status", property: "status", visible: true }
                    ]                                    
                },
                dataSource: rows,
                fileName: 'NMFC_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },



        onModeOfTransportsExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/MotTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "locationName", visible: true },
                        { label: "Mode", property: "mode", visible: true },
                        { label: "Status", property: "status", visible: true }
                    ]                                                 
                },
                dataSource: rows,
                fileName: 'ModeOfTransports_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        onOrdersTypeExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/OrderTypesTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "locationName", visible: true },
                        { label: "Mode", property: "mode", visible: true },
                        { label: "Status", property: "status", visible: true }
                    ]                                                 
                },
                dataSource: rows,
                fileName: 'OrdersType_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        onIncotermsExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/IncotermsTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Incoterm", property: "incoterm", visible: true },
                        { label: "Description", property: "desc", visible: true },
                        { label: "Status", property: "status", visible: true }
                    ]                                                                 
                },
                dataSource: rows,
                fileName: 'Incoterms_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },


        onTrackingRangeExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/TrackingRangeTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "LocationName", visible: true },
                        { label: "Carrier", property: "Carrier", visible: true },
                        { label: "Range From", property: "RangeFrom", visible: true },
                        { label: "Range To", property: "RangeTo", visible: true },
                        { label: "Status", property: "status", visible: true }
                    ]
                                                                                 
                },
                dataSource: rows,
                fileName: 'TrackingRange_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },


        onDimensionsExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/DiemnsionsTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "locationName", visible: true },
                        { label: "Dimension Code", property: "dimensionCode", visible: true },
                        { label: "Dimension Value", property: "dimensionValue", visible: true },
                        { label: "Length", property: "length", visible: true },
                        { label: "Width", property: "width", visible: true },
                        { label: "Height", property: "height", visible: true },
                        { label: "Maximum Weight", property: "maxWeight", visible: true },
                        { label: "Material Weight", property: "materialWeight", visible: true },
                        { label: "Status", property: "status", visible: true }
                    ]                                                              
                },
                dataSource: rows,
                fileName: 'Dimensions_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        onPaymentTypesExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/PaymentTypesTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Payment Type", property: "paymentType", visible: true },
                        { label: "Payment Code", property: "paymentCode", visible: true },
                        { label: "Description", property: "desc", visible: true },
                        { label: "Status", property: "status", visible: true }
                    ]
                                                                            
                },
                dataSource: rows,
                fileName: 'PaymentTypes_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },


        onERPExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/ERPTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "locationName", visible: true },
                        { label: "ERP Name", property: "erpName", visible: true },
                        { label: "ERP Code", property: "ERPCode", visible: true },
                        { label: "Status", property: "status", visible: true }
                    ]                    
                                                                            
                },
                dataSource: rows,
                fileName: 'ERP_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },


        onCountriesExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/CountriesTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Country Code", property: "countryCode", visible: true },
                        { label: "Country Description", property: "countryDesc", visible: true },
                        { label: "Region", property: "region", visible: true },
                        { label: "Currency", property: "currency", visible: true },
                        { label: "Status", property: "status", visible: true }
                    ]                                                                                        
                },
                dataSource: rows,
                fileName: 'Countries_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        onEUCountriesExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/EUCountriesTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Country Code", property: "countryCode", visible: true },
                        { label: "Country Description", property: "countryDesc", visible: true },
                        { label: "Status", property: "status", visible: true }
                    ]                                                                                                         
                },
                dataSource: rows,
                fileName: 'EUCountries_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },


        onProductsExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/ProductsTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                            { "label": "Location Name", "property": "locationName", "visible": true },
                            { "label": "Item No", "property": "itemNo", "visible": true },
                            { "label": "Product No", "property": "productNo", "visible": true },
                            { "label": "Description", "property": "desc", "visible": true },
                            { "label": "Quantity", "property": "quantity", "visible": true },
                            { "label": "Unit Cost", "property": "unitCost", "visible": true },
                            { "label": "Unit Weight", "property": "unitWeight", "visible": true },
                            { "label": "Dimensions", "property": "dimensions", "visible": true },
                            { "label": "Harmonized Code", "property": "harmonizedcode", "visible": true },
                            { "label": "ECCN", "property": "eccn", "visible": true },
                            { "label": "Un No", "property": "unNo", "visible": true },
                            { "label": "Class", "property": "class", "visible": true },
                            { "label": "NMFC", "property": "nmfc", "visible": true },
                            { "label": "UOM", "property": "uom", "visible": true },
                            { "label": "EPC-RFID", "property": "epcRfidNo", "visible": true },
                            { "label": "Country Of MFR", "property": "countryOfMFR", "visible": true },
                            { "label": "Status", "property": "status", "visible": true }
                    ]                     
                },
                dataSource: rows,
                fileName: 'Products_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        // Address Book Column Names Popover code changes End here


        // Users Column Names Popover code changes starts here

        openUsersColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pUsersPopover) {
                this._pUsersPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.UsersTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pUsersPopover.then(function (oPopover) {
                oController.UsersColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        UsersColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/UsersTableColumns");
            var oUsersTable = oView.byId("myUsersColumnSelectId");
            var aTableItems = oUsersTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onUsersColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myUsersColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onUsersColSelectOkPress: function () {
            var oView = this.getView();
            var oUsersTable = oView.byId("myUsersColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDUsersTable")
            oTable.setModel(eshipjetModel);

            var oUsersTblItems = oUsersTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/UsersTableColumns");
            oUsersTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oUsersTable.setModel(eshipjetModel);
            this._handleDisplayUsersTable();
            this._pUsersPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onUsersColSelectClosePress: function () {
            this._pUsersPopover.then(function (oPopover) {
                oPopover.close();
            });
        },


        _handleDisplayUsersTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var UsersTableColumns = eshipjetModel.getData().UsersTableColumns;
            const oTable = oView.byId("_IDUsersTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < UsersTableColumns.length; i++) {
                if (UsersTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/UsersTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/UsersTableRows");
        },

        // Users Column Names Popover code changes End here


        // Roles Column Names Popover code changes starts here

        openRolesColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pRolesPopover) {
                this._pRolesPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.RolesTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pRolesPopover.then(function (oPopover) {
                oController.RolesColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        RolesColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/RolesTableColumns");
            var oRolesTable = oView.byId("myRolesColumnSelectId");
            var aTableItems = oRolesTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onRolesColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myRolesColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onRolesColSelectOkPress: function () {
            var oView = this.getView();
            var oRolesTable = oView.byId("myRolesColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDRolesTable")
            oTable.setModel(eshipjetModel);

            var oRolesTblItems = oRolesTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/RolesTableColumns");
            oRolesTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oRolesTable.setModel(eshipjetModel);
            this._handleDisplayRolesTable();
            this._pRolesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onRolesColSelectClosePress: function () {
            this._pRolesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayRolesTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var RolesTableColumns = eshipjetModel.getData().RolesTableColumns;
            const oTable = oView.byId("_IDLocationTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < RolesTableColumns.length; i++) {
                if (RolesTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/RolesTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/RolesTableRows");
        },

        // Roles Column Names Popover code changes End here


        // CarrierCatalog Column Names Popover code changes starts here

        openCarrierCatalogColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pCarrierCatalogPopover) {
                this._pCarrierCatalogPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.CarrierCatalogTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pCarrierCatalogPopover.then(function (oPopover) {
                oController.CarrierCatalogColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        CarrierCatalogColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/CarrierCatalogTableColumns");
            var oCarrierCatalogTable = oView.byId("myCarrierCatalogColumnSelectId");
            var aTableItems = oCarrierCatalogTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onCarrierCatalogColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myCarrierCatalogColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onCarrierCatalogColSelectOkPress: function () {
            var oView = this.getView();
            var oCarrierCatalogTable = oView.byId("myCarrierCatalogColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDCarriesCatalogTable")
            oTable.setModel(eshipjetModel);

            var oCarrierCatalogTblItems = oCarrierCatalogTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/CarrierCatalogTableColumns");
            oCarrierCatalogTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oCarrierCatalogTable.setModel(eshipjetModel);
            this._handleDisplayCarrierCatalogTable();
            this._pCarrierCatalogPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onCarrierCatalogColSelectClosePress: function () {
            this._pCarrierCatalogPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayCarrierCatalogTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var CarrierCatalogTableColumns = eshipjetModel.getData().CarrierCatalogTableColumns;
            const oTable = oView.byId("_IDCarriesCatalogTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < CarrierCatalogTableColumns.length; i++) {
                if (CarrierCatalogTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/CarrierCatalogTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/CarrierCatalogTableRows");
        },

        // CarrierCatalog Column Names Popover code changes End here


        // CarrierAccount Column Names Popover code changes starts here

        openCarrierAccountColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pCarrierAccountPopover) {
                this._pCarrierAccountPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.CarrierAccountTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pCarrierAccountPopover.then(function (oPopover) {
                oController.CarrierAccountColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        CarrierAccountColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/CarrierAccountsTableColumns");
            var oCarrierAccountTable = oView.byId("myCarrierAccountColumnSelectId");
            var aTableItems = oCarrierAccountTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onCarrierAccountColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myCarrierAccountColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onCarrierAccountColSelectOkPress: function () {
            var oView = this.getView();
            var oCarrierAccountTable = oView.byId("myCarrierAccountColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDCarriesAccountsTable")
            oTable.setModel(eshipjetModel);

            var oCarrierAccountTblItems = oCarrierAccountTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/CarrierAccountsTableColumns");
            oCarrierAccountTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oCarrierAccountTable.setModel(eshipjetModel);
            this._handleDisplayCarrierAccountTable();
            this._pCarrierAccountPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onCarrierAccountColSelectClosePress: function () {
            this._pCarrierAccountPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayCarrierAccountTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var CarrierAccountsTableColumns = eshipjetModel.getData().CarrierAccountsTableColumns;
            const oTable = oView.byId("_IDCarriesAccountsTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < CarrierAccountsTableColumns.length; i++) {
                if (CarrierAccountsTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/CarrierAccountsTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status" || columnName === "rateShop" || columnName === "edoc" || columnName === "manualRates") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/CarrierAccountsTableRows");
        },

        // CarrierAccount Column Names Popover code changes End here


        // CostCenter Column Names Popover code changes starts here

        openCostCenterColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pCostCenterPopover) {
                this._pCostCenterPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.CostCenterTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pCostCenterPopover.then(function (oPopover) {
                oController.CostCenterColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        CostCenterColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/CostCenterTableColumns");
            var oCostCenterTable = oView.byId("myCostCenterColumnSelectId");
            var aTableItems = oCostCenterTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onCostCenterColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myCostCenterColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onCostCenterColSelectOkPress: function () {
            var oView = this.getView();
            var oCostCenterTable = oView.byId("myCostCenterColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDCostCenterTable")
            oTable.setModel(eshipjetModel);

            var oCostCenterTblItems = oCostCenterTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/CostCenterTableColumns");
            oCostCenterTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oCostCenterTable.setModel(eshipjetModel);
            this._handleDisplayCostCenterTable();
            this._pCostCenterPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onCostCenterColSelectClosePress: function () {
            this._pCostCenterPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayCostCenterTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var CostCenterTableColumns = eshipjetModel.getData().CostCenterTableColumns;
            const oTable = oView.byId("_IDCostCenterTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < CostCenterTableColumns.length; i++) {
                if (CostCenterTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/CostCenterTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/CostCenterTableRows");
        },

        // CostCenter Column Names Popover code changes End here

        // Statuses Column Names Popover code changes starts here

        openStatusesColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pStatusesPopover) {
                this._pStatusesPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.StatusesTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pStatusesPopover.then(function (oPopover) {
                oController.StatusesColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        StatusesColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/StatusesTableColumns");
            var oStatusesTable = oView.byId("myStatusesColumnSelectId");
            var aTableItems = oStatusesTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onStatusesColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myStatusesColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onStatusesColSelectOkPress: function () {
            var oView = this.getView();
            var oStatusesTable = oView.byId("myStatusesColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDStatusesTable")
            oTable.setModel(eshipjetModel);

            var oStatusesTblItems = oStatusesTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/StatusesTableColumns");
            oStatusesTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oStatusesTable.setModel(eshipjetModel);
            this._handleDisplayStatusesTable();
            this._pStatusesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onStatusesColSelectClosePress: function () {
            this._pStatusesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayStatusesTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var StatusesTableColumns = eshipjetModel.getData().StatusesTableColumns;
            const oTable = oView.byId("_IDStatusesTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < StatusesTableColumns.length; i++) {
                if (StatusesTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/StatusesTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/StatusesTableRows");
        },

        // Statuses Column Names Popover code changes End here


        // Products Column Names Popover code changes starts here

        openProductsColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pProductsPopover) {
                this._pProductsPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ProductsTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pProductsPopover.then(function (oPopover) {
                oController.ProductsColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        ProductsColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/ProductsTableColumns");
            var oProductsTable = oView.byId("myProductsColumnSelectId");
            var aTableItems = oProductsTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onProductsColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myProductsColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onProductsColSelectOkPress: function () {
            var oView = this.getView();
            var oProductsTable = oView.byId("myProductsColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDProductsTable")
            oTable.setModel(eshipjetModel);

            var oProductsTblItems = oProductsTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/ProductsTableColumns");
            oProductsTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oProductsTable.setModel(eshipjetModel);
            this._handleDisplayProductsTable();
            this._pProductsPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onProductsColSelectClosePress: function () {
            this._pProductsPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayProductsTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var ProductsTableColumns = eshipjetModel.getData().ProductsTableColumns;
            const oTable = oView.byId("_IDProductsTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < ProductsTableColumns.length; i++) {
                if (ProductsTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/ProductsTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/ProductsTableRows");
        },

        // Products Column Names Popover code changes End here


        // PackageTypes Column Names Popover code changes starts here

        openPackageTypesColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pPackageTypesPopover) {
                this._pPackageTypesPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.PackageTypesTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pPackageTypesPopover.then(function (oPopover) {
                oController.PackageTypesColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        PackageTypesColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/PackageTypeTableColumns");
            var oPackageTypesTable = oView.byId("myPackageTypesColumnSelectId");
            var aTableItems = oPackageTypesTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onPackageTypesColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myPackageTypesColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onPackageTypesColSelectOkPress: function () {
            var oView = this.getView();
            var oPackageTypesTable = oView.byId("myPackageTypesColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDPackageTypesTable")
            oTable.setModel(eshipjetModel);

            var oPackageTypesTblItems = oPackageTypesTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/PackageTypeTableColumns");
            oPackageTypesTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oPackageTypesTable.setModel(eshipjetModel);
            this._handleDisplayPackageTypesTable();
            this._pPackageTypesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onPackageTypesColSelectClosePress: function () {
            this._pPackageTypesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayPackageTypesTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var PackageTypeTableColumns = eshipjetModel.getData().PackageTypeTableColumns;
            const oTable = oView.byId("_IDPackageTypesTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < PackageTypeTableColumns.length; i++) {
                if (PackageTypeTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/PackageTypeTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/PackageTypeTableRows");
        },

        // PackageTypes Column Names Popover code changes End here



          // DangerousGoods Column Names Popover code changes starts here

          openDangerousGoodsColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pDangerousGoodsPopover) {
                this._pDangerousGoodsPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.DangerousGoodsTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pDangerousGoodsPopover.then(function (oPopover) {
                oController.DangerousGoodsColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        DangerousGoodsColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/DangerousGoodsTableColumns");
            var oDangerousGoodsTable = oView.byId("myDangerousGoodsColumnSelectId");
            var aTableItems = oDangerousGoodsTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onDangerousGoodsColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myDangerousGoodsColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onDangerousGoodsColSelectOkPress: function () {
            var oView = this.getView();
            var oDangerousGoodsTable = oView.byId("myDangerousGoodsColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDDangerousGoodsTable")
            oTable.setModel(eshipjetModel);

            var oDangerousGoodsTblItems = oDangerousGoodsTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/DangerousGoodsTableColumns");
            oDangerousGoodsTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oDangerousGoodsTable.setModel(eshipjetModel);
            this._handleDisplayDangerousGoodsTable();
            this._pDangerousGoodsPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onDangerousGoodsColSelectClosePress: function () {
            this._pDangerousGoodsPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayDangerousGoodsTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var DangerousGoodsTableColumns = eshipjetModel.getData().DangerousGoodsTableColumns;
            const oTable = oView.byId("_IDDangerousGoodsTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < DangerousGoodsTableColumns.length; i++) {
                if (DangerousGoodsTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/DangerousGoodsTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
                if (columnName === "Actions") {
                    var oHBox = new sap.m.HBox({}); // Create Text instance 
                    var Btn1 = new sap.m.Button({ text: "Edit", type: "Transparent", press:"onDangerousGoodsEditPress" });
                    var Btn2 = new sap.m.Button({
                        icon: "sap-icon://megamenu", type: "Transparent",
                        press: function (oEvent) {
                            that.onDangerousGoodsDownArrowPress(oEvent);
                        }
                    });
                    oHBox.addItem(Btn1);
                    oHBox.addItem(Btn2);
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oHBox,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }  else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/DangerousGoodsTableRows");
        },


        onDangerousGoodsExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/DangerousGoodsTableRows");
            var oSettings = {
                Workbook: {
                    columns: [
                        { label: "UN No", property: "unNo", visible: true },
                        { label: "Carrier", property: "carrier", visible: true },
                        { label: "Transport Mode", property: "transportMode", visible: true },
                        { label: "Destination", property: "destination", visible: true },
                        { label: "Hazard ID", property: "hazardId", visible: true },
                        { label: "ERG Guide Number", property: "ergGuideNumber", visible: true },
                        { label: "Hazard Class", property: "hazardClass", visible: true },
                        { label: "Labels Required", property: "labelsRequired", visible: true },
                        { label: "Limited Quantity Max Net Qty Per Package", property: "limitedQuantityMaxNetQty", visible: true },
                        { label: "Limited Quantity Packing Instructions", property: "limitedQuantityPackingInstructions", visible: true },
                        { label: "Limited Quantity", property: "limitedQuantity", visible: true },
                        { label: "Limited Quantity Unit of Measure", property: "limitedQuantityUnit", visible: true },
                        { label: "Packaging Exceptions", property: "packagingExceptions", visible: true },
                        { label: "Packaging Non-Bulk", property: "packagingNonBulk", visible: true },
                        { label: "Passenger & Cargo Aircraft Packing Instructions", property: "passengerCargoAircraftPackingInstructions", visible: true },
                        { label: "Passenger & Cargo Aircraft Quantity", property: "passengerCargoAircraftQuantity", visible: true },
                        { label: "Passenger & Cargo Aircraft Unit of Measure", property: "passengerCargoAircraftUnit", visible: true },
                        { label: "Technical Info Flag", property: "technicalInfoFlag", visible: true },
                        { label: "Actions", property: "actions", visible: true },
                        
                        // Fields with `visible: false`
                        { label: "Additional Info", property: "additionalInfo", visible: false },
                        { label: "Packing Group", property: "packingGroup", visible: false },
                        { label: "Passenger & Cargo Max Net Qty", property: "passengerCargoMaxNetQty", visible: false },
                        { label: "Proper Shipping Name", property: "properShippingName", visible: false },
                        { label: "Canada Permitted", property: "canadaPermitted", visible: false },
                        { label: "Cargo Aircraft Only Quantity", property: "cargoAircraftOnlyQuantity", visible: false },
                        { label: "Cargo Aircraft Only Unit of Measure", property: "cargoAircraftOnlyUnit", visible: false },
                        { label: "Do Not Print PSN Reference Only", property: "doNotPrintPSN", visible: false },
                        { label: "Excepted Quantity Code", property: "exceptedQuantityCode", visible: false },
                        { label: "Exemption Required", property: "exemptionRequired", visible: false },
                        { label: "Forbidden", property: "forbidden", visible: false }
                    ]
                },
                
                dataSource: rows,
                fileName: 'DangerousGoods_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        // DangerousGoods Column Names Popover code changes End here


        // ThirdParties Column Names Popover code changes starts here

        openThirdPartiesColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pThirdPartiesPopover) {
                this._pThirdPartiesPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ThirdPartiesTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pThirdPartiesPopover.then(function (oPopover) {
                oController.ThirdPartiesColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        ThirdPartiesColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/ThirdPartiesTableColumns");
            var oThirdPartiesTable = oView.byId("myThirdPartiesColumnSelectId");
            var aTableItems = oThirdPartiesTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onThirdPartiesColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myThirdPartiesColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onThirdPartiesColSelectOkPress: function () {
            var oView = this.getView();
            var oThirdPartiesTable = oView.byId("myThirdPartiesColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDThirdPartyTable")
            oTable.setModel(eshipjetModel);

            var oThirdPartiesTblItems = oThirdPartiesTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/ThirdPartiesTableColumns");
            oThirdPartiesTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oThirdPartiesTable.setModel(eshipjetModel);
            this._handleDisplayThirdPartiesTable();
            this._pThirdPartiesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onThirdPartiesColSelectClosePress: function () {
            this._pThirdPartiesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayThirdPartiesTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var ThirdPartiesTableColumns = eshipjetModel.getData().ThirdPartiesTableColumns;
            const oTable = oView.byId("_IDThirdPartyTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < ThirdPartiesTableColumns.length; i++) {
                if (ThirdPartiesTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/ThirdPartiesTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/ThirdPartiesTableRows");
        },

        onThirdPartyExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/ThirdPartiesTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "locationName", visible: true },
                        { label: "Account", property: "account", visible: true },
                        { label: "Contact Name", property: "contactName", visible: true },
                        { label: "Company Name", property: "companyName", visible: true },
                        { label: "Address Line 1", property: "addressLine1", visible: false },
                        { label: "Address Line 2", property: "addressLine2", visible: false },
                        { label: "City", property: "addressCity", visible: true },
                        { label: "State / Provience", property: "stateProvience", visible: true },
                        { label: "Zip / Postal Code", property: "addressZip", visible: true },
                        { label: "Country", property: "addressCountry", visible: true },
                        { label: "Status", property: "status", visible: true }
                    ]   
                },
                dataSource: rows,
                fileName: 'ThirdParty',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        // ThirdParties Column Names Popover code changes End here


        // LTLClasses Column Names Popover code changes starts here

        openLTLClassesColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pLTLClassesPopover) {
                this._pLTLClassesPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.LTLClassesTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pLTLClassesPopover.then(function (oPopover) {
                oController.LTLClassesColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        LTLClassesColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/LtlClassesTableColumns");
            var oLTLClassesTable = oView.byId("myLTLClassesColumnSelectId");
            var aTableItems = oLTLClassesTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onLTLClassesColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myLTLClassesColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onLTLClassesColSelectOkPress: function () {
            var oView = this.getView();
            var oLTLClassesTable = oView.byId("myLTLClassesColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDLTLClassTable")
            oTable.setModel(eshipjetModel);

            var oLTLClassesTblItems = oLTLClassesTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/LtlClassesTableColumns");
            oLTLClassesTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oLTLClassesTable.setModel(eshipjetModel);
            this._handleDisplayLTLClassesTable();
            this._pLTLClassesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onLTLClassesColSelectClosePress: function () {
            this._pLTLClassesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayLTLClassesTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var LtlClassesTableColumns = eshipjetModel.getData().LtlClassesTableColumns;
            const oTable = oView.byId("_IDLTLClassTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < LtlClassesTableColumns.length; i++) {
                if (LtlClassesTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/LtlClassesTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/LtlClassesTableRows");
        },

        // LTLClasses Column Names Popover code changes End here


        // NMFC Column Names Popover code changes starts here

        openNMFCColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pNMFCPopover) {
                this._pNMFCPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.NMFCTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pNMFCPopover.then(function (oPopover) {
                oController.NMFCColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        NMFCColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/NmfcTableColumns");
            var oNMFCTable = oView.byId("myNMFCColumnSelectId");
            var aTableItems = oNMFCTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onNMFCColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myNMFCColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onNMFCColSelectOkPress: function () {
            var oView = this.getView();
            var oNMFCTable = oView.byId("myNMFCColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDNMFCTable")
            oTable.setModel(eshipjetModel);

            var oNMFCTblItems = oNMFCTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/NmfcTableColumns");
            oNMFCTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oNMFCTable.setModel(eshipjetModel);
            this._handleDisplayNMFCTable();
            this._pNMFCPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onNMFCColSelectClosePress: function () {
            this._pNMFCPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayNMFCTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var NmfcTableColumns = eshipjetModel.getData().NmfcTableColumns;
            const oTable = oView.byId("_IDNMFCTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < NmfcTableColumns.length; i++) {
                if (NmfcTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/NmfcTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/NmfcTableRows");
        },

        // NMFC Column Names Popover code changes End here


        // MOT Column Names Popover code changes starts here

        openMOTColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pMOTPopover) {
                this._pMOTPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.MOTTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pMOTPopover.then(function (oPopover) {
                oController.MOTColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        MOTColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/MotTableColumns");
            var oMOTTable = oView.byId("myMOTColumnSelectId");
            var aTableItems = oMOTTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onMOTColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myMOTColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onMOTColSelectOkPress: function () {
            var oView = this.getView();
            var oMOTTable = oView.byId("myMOTColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDModeOfTransportTable")
            oTable.setModel(eshipjetModel);

            var oMOTTblItems = oMOTTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/MotTableColumns");
            oMOTTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oMOTTable.setModel(eshipjetModel);
            this._handleDisplayMOTTable();
            this._pMOTPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onMOTColSelectClosePress: function () {
            this._pMOTPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayMOTTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var MotTableColumns = eshipjetModel.getData().MotTableColumns;
            const oTable = oView.byId("_IDModeOfTransportTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < MotTableColumns.length; i++) {
                if (MotTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/MotTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/MotTableRows");
        },

        // MOT Column Names Popover code changes End here

        // Locations Column Names Popover code changes starts here

        openLocationsColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pLocationsPopover) {
                this._pLocationsPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.LocationsTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pLocationsPopover.then(function (oPopover) {
                oController.LocationsColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        LocationsColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/LocationTableColumns");
            var oLocationsTable = oView.byId("myLocationsColumnSelectId");
            var aTableItems = oLocationsTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onLocationsColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myLocationsColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onLocationsColSelectOkPress: function () {
            var oView = this.getView();
            var oLocationsTable = oView.byId("myLocationsColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDLocationTable")
            oTable.setModel(eshipjetModel);

            var oLocationsTblItems = oLocationsTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/LocationTableColumns");
            oLocationsTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oLocationsTable.setModel(eshipjetModel);
            this._handleDisplayLocationTable();
            this._pLocationsPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onLocationsColSelectClosePress: function () {
            this._pLocationsPopover.then(function (oPopover) {
                oPopover.close();
            });
        },


        _handleDisplayLocationTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var LocationTableColumns = eshipjetModel.getData().LocationTableColumns;
            const oTable = oView.byId("_IDLocationTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < LocationTableColumns.length; i++) {
                if (LocationTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/LocationTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/LocationTableRows");
        },

        onLocationsExportToExcel: function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var rows = eshipjetModel.getProperty("/LocationTableRows");
            var oSettings = {
                workbook: {
                    columns: [
                        { label: "Location Name", property: "locationName", visible: false },
                        { label: "Contact Name", property: "contactName", visible: true },
                        { label: "Phone No", property: "phonenum", visible: true },
                        { label: "Email", property: "Email", visible: true },
                        { label: "Address Line 1", property: "addressLine1", visible: false },
                        { label: "Address Line 2", property: "addressLine2", visible: false },
                        { label: "State Provience", property: "stateProvience", visible: true },
                        { label: "Location City", property: "locaCity", visible: true },
                        { label: "ZipCode", property: "locZip", visible: false },
                        { label: "Country", property: "locCountry", visible: true },
                        { label: "Weight Unit", property: "locWeightUnit", visible: false },
                        { label: "Currency", property: "locCurr", visible: false },
                        { label: "Dimension Unit", property: "locDimensionUnit", visible: false },
                        { label: "Status", property: "status", visible: true }
                    ]
                    
                },
                dataSource: rows,
                fileName: 'Location_Data',
                Worker: true
            };
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        // Locations Column Names Popover code changes End here

        // OrderTypes Column Names Popover code changes starts here

        openOrderTypesColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pOrderTypesPopover) {
                this._pOrderTypesPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.OrderTypesTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pOrderTypesPopover.then(function (oPopover) {
                oController.OrderTypesColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        OrderTypesColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/OrderTypesTableColumns");
            var oOrderTypesTable = oView.byId("myOrderTypesColumnSelectId");
            var aTableItems = oOrderTypesTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onOrderTypesColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myOrderTypesColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onOrderTypesColSelectOkPress: function () {
            var oView = this.getView();
            var oOrderTypesTable = oView.byId("myOrderTypesColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_IDOrderTypeTable")
            oTable.setModel(eshipjetModel);

            var oOrderTypesTblItems = oOrderTypesTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/OrderTypesTableColumns");
            oOrderTypesTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oOrderTypesTable.setModel(eshipjetModel);
            this._handleDisplayOrderTypesTable();
            this._pOrderTypesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onOrderTypesColSelectClosePress: function () {
            this._pOrderTypesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayOrderTypesTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var OrderTypesTableColumns = eshipjetModel.getData().OrderTypesTableColumns;
            const oTable = oView.byId("_IDOrderTypeTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < OrderTypesTableColumns.length; i++) {
                if (OrderTypesTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/OrderTypesTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/OrderTypesTableRows");
        },

        // OrderTypes Column Names Popover code changes End here


        // Incoterms Column Names Popover code changes starts here

        openIncotermsColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pIncotermsPopover) {
                this._pIncotermsPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.IncotermsTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pIncotermsPopover.then(function (oPopover) {
                oController.IncotermsColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        IncotermsColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/IncoTermsTableColumns");
            var oIncotermsTable = oView.byId("myIncotermsColumnSelectId");
            var aTableItems = oIncotermsTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onIncotermsColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myIncotermsColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onIncotermsColSelectOkPress: function () {
            var oView = this.getView();
            var oIncotermsTable = oView.byId("myIncotermsColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_ID_IncotermsTable")
            oTable.setModel(eshipjetModel);

            var oIncotermsTblItems = oIncotermsTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/IncoTermsTableColumns");
            oIncotermsTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oIncotermsTable.setModel(eshipjetModel);
            this._handleDisplayIncotermsTable();
            this._pIncotermsPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onIncotermsColSelectClosePress: function () {
            this._pIncotermsPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayIncotermsTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var IncoTermsTableColumns = eshipjetModel.getData().IncoTermsTableColumns;
            const oTable = oView.byId("_ID_IncotermsTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < IncoTermsTableColumns.length; i++) {
                if (IncoTermsTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/IncoTermsTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/IncoTermsTableRows");
        },

        // Incoterms Column Names Popover code changes End here

        // Tracking Range Column Names Popover code changes starts here

        openTrackingRangeColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pTrackingRangePopover) {
                this._pTrackingRangePopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.TrackingRangeTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pTrackingRangePopover.then(function (oPopover) {
                oController.TrackingRangeColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        TrackingRangeColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/TrackingRangeTableColumns");
            var oTrackingRangeTable = oView.byId("myTrackingRangeColumnSelectId");
            var aTableItems = oTrackingRangeTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onTrackingRangeColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myTrackingRangeColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onTrackingRangeColSelectOkPress: function () {
            var oView = this.getView();
            var oTrackingRangeTable = oView.byId("myTrackingRangeColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_ID_TrackingRangeTable")
            oTable.setModel(eshipjetModel);

            var oTrackingRangeTblItems = oTrackingRangeTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/TrackingRangeTableColumns");
            oTrackingRangeTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oTrackingRangeTable.setModel(eshipjetModel);
            this._handleDisplayTrackingRangeTable();
            this._pTrackingRangePopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onTrackingRangeColSelectClosePress: function () {
            this._pTrackingRangePopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayTrackingRangeTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var TrackingRangeTableColumns = eshipjetModel.getData().TrackingRangeTableColumns;
            const oTable = oView.byId("_ID_TrackingRangeTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < TrackingRangeTableColumns.length; i++) {
                if (TrackingRangeTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/TrackingRangeTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/TrackingRangeTableRows");
        },

        // Dimensions Column Names Popover code changes starts here

        openDimensionsColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pDimensionsPopover) {
                this._pDimensionsPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.DimensionsTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pDimensionsPopover.then(function (oPopover) {
                oController.DimensionsColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        DimensionsColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/DimensionsTableColumns");
            var oDimensionsTable = oView.byId("myDimensionsColumnSelectId");
            var aTableItems = oDimensionsTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onDimensionsColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myDimensionsColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onDimensionsColSelectOkPress: function () {
            var oView = this.getView();
            var oDimensionsTable = oView.byId("myDimensionsColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_ID_DimensionTable")
            oTable.setModel(eshipjetModel);

            var oDimensionsTblItems = oDimensionsTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/DimensionsTableColumns");
            oDimensionsTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oDimensionsTable.setModel(eshipjetModel);
            this._handleDisplayDimensionsTable();
            this._pDimensionsPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onDimensionsColSelectClosePress: function () {
            this._pDimensionsPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayDimensionsTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var DimensionsTableColumns = eshipjetModel.getData().DimensionsTableColumns;
            const oTable = oView.byId("_ID_DimensionTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < DimensionsTableColumns.length; i++) {
                if (DimensionsTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/DimensionsTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/DiemnsionsTableRows");
        },

        // Dimensions Column Names Popover code changes End here


        // PaymentTypes Column Names Popover code changes starts here

        openPaymentTypesColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pPaymentTypesPopover) {
                this._pPaymentTypesPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.PaymentTypesTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pPaymentTypesPopover.then(function (oPopover) {
                oController.PaymentTypesColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        PaymentTypesColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/PaymentTypesTableColumns");
            var oPaymentTypesTable = oView.byId("myPaymentTypesColumnSelectId");
            var aTableItems = oPaymentTypesTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onPaymentTypesColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myPaymentTypesColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onPaymentTypesColSelectOkPress: function () {
            var oView = this.getView();
            var oPaymentTypesTable = oView.byId("myPaymentTypesColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_ID_PaymentTypeTable")
            oTable.setModel(eshipjetModel);

            var oPaymentTypesTblItems = oPaymentTypesTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/PaymentTypesTableColumns");
            oPaymentTypesTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oPaymentTypesTable.setModel(eshipjetModel);
            this._pPaymentTypesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onPaymentTypesColSelectClosePress: function () {
            this._pPaymentTypesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayPaymentTypesTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var PaymentTypesTableColumns = eshipjetModel.getData().PaymentTypesTableColumns;
            const oTable = oView.byId("_ID_PaymentTypeTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < PaymentTypesTableColumns.length; i++) {
                if (PaymentTypesTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/PaymentTypesTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/PaymentTypesTableRows");
        },

        // PaymentTypes Column Names Popover code changes End here

        // SMTP Column Names Popover code changes starts here

        openSMTPColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pSMTPPopover) {
                this._pSMTPPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.SMTPTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pSMTPPopover.then(function (oPopover) {
                oController.SMTPColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        SMTPColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/SMTPConfigsTableColumns");
            var oSMTPTable = oView.byId("mySMTPColumnSelectId");
            var aTableItems = oSMTPTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onSMTPColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("mySMTPColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onSMTPColSelectOkPress: function () {
            var oView = this.getView();
            var oSMTPTable = oView.byId("mySMTPColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_ID_SMTPConfigTable")
            oTable.setModel(eshipjetModel);

            var oSMTPTblItems = oSMTPTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/SMTPConfigsTableColumns");
            oSMTPTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oSMTPTable.setModel(eshipjetModel);
            this._handleDisplaySMTPTable();
            this._pSMTPPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onSMTPColSelectClosePress: function () {
            this._pSMTPPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplaySMTPTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var SMTPConfigsTableColumns = eshipjetModel.getData().SMTPConfigsTableColumns;
            const oTable = oView.byId("_ID_SMTPConfigTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < SMTPConfigsTableColumns.length; i++) {
                if (SMTPConfigsTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/SMTPConfigsTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status" || columnName === "ssl") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/SMTPConfigsTableRows");
        },

        // SMTP Column Names Popover code changes End here


        // ERP Column Names Popover code changes starts here

        openERPColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pERPPopover) {
                this._pERPPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ERPTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pERPPopover.then(function (oPopover) {
                oController.ERPColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        ERPColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/ERPTableColumns");
            var oERPTable = oView.byId("myERPColumnSelectId");
            var aTableItems = oERPTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onERPColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myERPColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onERPColSelectOkPress: function () {
            var oView = this.getView();
            var oERPTable = oView.byId("myERPColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_ID_ERPTable")
            oTable.setModel(eshipjetModel);

            var oERPTblItems = oERPTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/ERPTableColumns");
            oERPTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oERPTable.setModel(eshipjetModel);
            this._handleDisplayERPTable();
            this._pERPPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onERPColSelectClosePress: function () {
            this._pERPPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayERPTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var ERPTableColumns = eshipjetModel.getData().ERPTableColumns;
            const oTable = oView.byId("_ID_ERPTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < ERPTableColumns.length; i++) {
                if (ERPTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/ERPTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/ERPTableRows");
        },

        // ERP Column Names Popover code changes End here


        // Countries Column Names Popover code changes starts here

        openCountriesColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pCountriesPopover) {
                this._pCountriesPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.CountriesTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pCountriesPopover.then(function (oPopover) {
                oController.CountriesColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        CountriesColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/CountriesTableColumns");
            var oCountriesTable = oView.byId("myCountriesColumnSelectId");
            var aTableItems = oCountriesTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onCountriesColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myCountriesColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onCountriesColSelectOkPress: function () {
            var oView = this.getView();
            var oCountriesTable = oView.byId("myCountriesColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_ID_CountriesTable")
            oTable.setModel(eshipjetModel);

            var oCountriesTblItems = oCountriesTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/CountriesTableColumns");
            oCountriesTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oCountriesTable.setModel(eshipjetModel);
            this._handleDisplayCountriesTable();
            this._pCountriesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onCountriesColSelectClosePress: function () {
            this._pCountriesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayCountriesTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var CountriesTableColumns = eshipjetModel.getData().CountriesTableColumns;
            const oTable = oView.byId("_ID_CountriesTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < CountriesTableColumns.length; i++) {
                if (CountriesTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/CountriesTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/CountriesTableRows");
        },

        // Countries Column Names Popover code changes End here


        // EUCountries Column Names Popover code changes starts here

        openEUCountriesColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pEUCountriesPopover) {
                this._pEUCountriesPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.EUCountriesTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pEUCountriesPopover.then(function (oPopover) {
                oController.EUCountriesColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        EUCountriesColumnsVisiblity: function () {
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = eshipjetModel.getProperty("/EUCountriesTableColumns");
            var oEUCountriesTable = oView.byId("myEUCountriesColumnSelectId");
            var aTableItems = oEUCountriesTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("eshipjetModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },

        onEUCountriesColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myEUCountriesColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onEUCountriesColSelectOkPress: function () {
            var oView = this.getView();
            var oEUCountriesTable = oView.byId("myEUCountriesColumnSelectId");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var oTable = oView.byId("_ID_EUCountriesTable")
            oTable.setModel(eshipjetModel);

            var oEUCountriesTblItems = oEUCountriesTable.getItems();
            var aColumnsData = eshipjetModel.getProperty("/EUCountriesTableColumns");
            oEUCountriesTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("eshipjetModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            eshipjetModel.updateBindings(true);
            oEUCountriesTable.setModel(eshipjetModel);
            this._handleDisplayEUCountriesTable();
            this._pEUCountriesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onEUCountriesColSelectClosePress: function () {
            this._pEUCountriesPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        _handleDisplayEUCountriesTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var EUCountriesTableColumns = eshipjetModel.getData().EUCountriesTableColumns;
            const oTable = oView.byId("_ID_EUCountriesTable");
            oTable.setModel(eshipjetModel);
            var count = 0;
            for (var i = 0; i < EUCountriesTableColumns.length; i++) {
                if (EUCountriesTableColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/EUCountriesTableColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count >= 14) {
                    var minWidth = "130px";
                }
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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "status") {
                    var oSwitch = new sap.m.Switch({ type: "AcceptReject" });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: oSwitch,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/EUCountriesTableRows");
        },

        // EUCountries Column Names Popover code changes End here

        // add location popover changes start
        onAddLocationPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            // create popover
            if (!this._AddLocPopover) {
                this._AddLocPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddLocationPopover",
                    controller: this
                }).then(function (oAddLocPopover) {
                    oView.addDependent(oAddLocPopover);
                    return oAddLocPopover;
                });
            }
            this._AddLocPopover.then(function (oAddLocPopover) {
                oAddLocPopover.openBy(oButton);
            });
        },

        onAddLocationClosePress: function (oEvent) {
            this.byId("addLocationPopover").close();
        },
        AddLocPopoverClose: function () {
            var oPopover = this.byId("addLocationPopover");
            if (oPopover) {
                oPopover.close(); // Close the popover
            }
        },
        AddLocCancelPopover: function () {
            var oPopover = this.byId("addLocationPopover");
            if (oPopover) {
                oPopover.close(); // Close the popover
            }
        },

        AddLocSelectPopover: function () {
            var oPopover = this.byId("addLocationPopover");
            if (oPopover) {
                oPopover.close(); // Close the popover
            }
        },
        // add location popover changes end

        // add ShipNowPickAnAddressPopover changes start
        ShipNowPickAnAddressPopoverPress: function() {
            var oView = this.getView();

            if (!this.byId("_IDGenAlcoholEditDialogshipnow")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShipNowPickAnAddressPopover",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("_IDGenAlcoholEditDialogshipnow").open();
            }
        },

        onShipNowPickAnAddressCancelPress1: function() {
            this.byId("_IDGenAlcoholEditDialogshipnow").close();
        },

        


        onShipNowPickAnAddressSelectPress: function () {
            var ShipNowDataModel = this.getView().getModel("ShipNowDataModel");
            var shipNowBtnId = ShipNowDataModel.getProperty("/shipNowBtnId");
            var oTable = this.getView().byId("idShipNowPickAnAddressTable");
            

            var oSelectedItem = oTable.getSelectedItem();

            var oContext = oSelectedItem.getBindingContext();
            var oSelectedData = oContext.getObject();
            var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
            ShipNowDataModel.setProperty("/ShipFromAddress", oSelectedData);
            // var oAddressModel = new JSONModel(oSelectedData);
            // this.getView().setModel(oAddressModel, "oAddressModel");

           
            oTable.removeSelections(true);
            oController.byId("_IDGenAlcoholEditDialogshipnow").close();
        },
        

        onShipToPickAnAddressSelectPress: function () {
            var ShipNowDataModel = this.getView().getModel("ShipNowDataModel");
            var shipNowBtnId = ShipNowDataModel.getProperty("/shipNowBtnId");
            var oShipToTable = this.getView().byId("idShipToAddressTable");
            var oSelectedItem = oShipToTable.getSelectedItem();
            var oContext = oSelectedItem.getBindingContext();
            var oSelectedData = oContext.getObject();
            var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
            ShipNowDataModel.setProperty("/ShipToAddress", oSelectedData);
            // var oAddressModel = new JSONModel(oSelectedData);
            // this.getView().setModel(oAddressModel, "oAddressModel");
            oShipToTable.removeSelections(true);
            this.byId("idShipToPickAnAddressPopover").close();
        },

      

            ShipToPickAnAddressPopoverPress: function() {
                var oView = this.getView();
    
                if (!this.byId("_IDGenAlcoholEditDialogshipnowTo")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShipToPickAnAddressPopover",
                        controller: this
                    }).then(function(oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                    });
                } else {
                    this.byId("_IDGenAlcoholEditDialogshipnowTo").open();
                }
            },
    
            onShipNowPickAnAddressCancelPress123: function() {
                this.byId("_IDGenAlcoholEditDialogshipnowTo").close();
            },
    

        onShipToPickAnAddressSelectPress: function () {
            var ShipNowDataModel = this.getView().getModel("ShipNowDataModel");
            var shipNowBtnId = ShipNowDataModel.getProperty("/shipNowBtnId");
            var oShipToTable = this.getView().byId("idShipTOPickAnAddressTable");
            

            var oSelectedItem = oShipToTable.getSelectedItem();

            var oContext = oSelectedItem.getBindingContext();
            var oSelectedData = oContext.getObject();
            var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
            ShipNowDataModel.setProperty("/ShipToAddress", oSelectedData);
            // var oAddressModel = new JSONModel(oSelectedData);
            // this.getView().setModel(oAddressModel, "oAddressModel");

           
            oShipToTable.removeSelections(true);
            oController.byId("_IDGenAlcoholEditDialogshipnowTo").close();
        },



        


        


        // add ShipNowPlusIcon popover changes start
        onShipNowAddIconPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            // create popover
            if (!this._AddShioReqLabelAddIconPopover) {
                this._AddShioReqLabelAddIconPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShipNowAddIconPopover",
                    controller: this
                }).then(function (oAddShioReqLabelAddIconPopover) {
                    oView.addDependent(oAddShioReqLabelAddIconPopover);
                    return oAddShioReqLabelAddIconPopover;
                });
            }
            this._AddShioReqLabelAddIconPopover.then(function (oAddShioReqLabelAddIconPopover) {
                oAddShioReqLabelAddIconPopover.openBy(oButton);
            });
        },

        onShipNowAddClosePress: function (oEvent) {
            this.byId("idShipNowAddIconPopover").close();
        },
        ShipNowAddIconClosePress: function () {
            var oPopover = this.byId("idShipNowAddIconPopover");
            if (oPopover) {
                oPopover.close(); // Close the popover
            }
        },
        ShipNowAddIconCancelPopover: function () {
            var oPopover = this.byId("idShipNowAddIconPopover");
            if (oPopover) {
                oPopover.close(); // Close the popover
            }
        },

        ShipNowAddIconSelectPopover: function () {
            var oPopover = this.byId("idShipNowAddIconPopover");
            if (oPopover) {
                oPopover.close(); // Close the popover
            }
        },

      
      
        // add ShipNowPlusIcon popover changes start
      onPressShipReqLabelEditicon: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        // create popover
        if (!this._AddShioReqLabelEditIconPopover) {
            this._AddShioReqLabelEditIconPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.ShipReqLabel.ShipReqLabelEditIconPopover",
                controller: this
            }).then(function (oAddShioReqLabelEditIconPopover) {
                oView.addDependent(oAddShioReqLabelEditIconPopover);
                return oAddShioReqLabelEditIconPopover;
            });
        }
        this._AddShioReqLabelEditIconPopover.then(function (oAddShioReqLabelEditIconPopover) {
            oAddShioReqLabelEditIconPopover.openBy(oButton);
        });
    },

    onShioReqLabelEditIconClosePress: function (oEvent) {
        this.byId("idShipReqLabelEditIconAddIconPopover").close();
    },
    ShioReqLabelEditIconSubmitPress: function () {
        this.byId("idShipReqLabelEditIconAddIconPopover").close();
    },
    ShioReqLabelEditIconIconCancelPopover: function () {
        this.byId("idShipReqLabelEditIconAddIconPopover").close();
    },

    onCheckBoxSelect: function (oEvent) {
        // Get the state of the checkbox (selected or not)
        var bSelected = oEvent.getParameter("selected");
    
        // Get the button control by its ID
        var oButton = this.byId("btnEditIcon");
    
        // Enable or disable the button based on the checkbox state
        oButton.setEnabled(bSelected);
    },
    

    
        // add onAddAdressBookIconPress popover changes start
        onAddAdressBookIconPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            // create popover
            if (!this._AddAdressBookPopover) {
                this._AddAdressBookPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddAddressBookPopover",
                    controller: this
                }).then(function (oAddAdressBookPopover) {
                    oView.addDependent(oAddAdressBookPopover);
                    return oAddAdressBookPopover;
                });
            }
            this._AddAdressBookPopover.then(function (oAddAdressBookPopover) {
                oAddAdressBookPopover.openBy(oButton);
            });
        },
        AddAddressBookClosePress: function () {
            var oPopover = this.byId("idAddAddressBookPopover");
            if (oPopover) {
                oPopover.close(); // Close the popover
            }
        },
        AddAddressBookCancelPopover: function () {
            var oPopover = this.byId("idAddAddressBookPopover");
            if (oPopover) {
                oPopover.close(); // Close the popover
            }
        },

        AddAddressBookSelectPopover: function () {
            var oPopover = this.byId("idAddAddressBookPopover");
            if (oPopover) {
                oPopover.close(); // Close the popover
            }
        },


        // add onAddUserIconPress popover changes start
        onAddUserIconPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddUserPopover) {
                this._AddUserPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddUserPopOver",
                    controller: this
                }).then(function (oAddUserPopover) {
                    oView.addDependent(oAddUserPopover);
                    return oAddUserPopover;
                });
            }
            this._AddUserPopover.then(function (oAddUserPopover) {
                oAddUserPopover.openBy(oButton);
            });
        },
        AddUserClosePress: function () {
            var oPopover = this.byId("idAddUserPopover");
            if (oPopover) {
                oPopover.close();
            }
        },
        AddUserCancelPopover: function () {
            var oPopover = this.byId("idAddUserPopover");
            if (oPopover) {
                oPopover.close();
            }
        },

        AddUserSelectPopover: function () {
            var oPopover = this.byId("idAddUserPopover");
            if (oPopover) {
                oPopover.close();
            }
        },

        onShipNowSearchDialog: function () {
            var oView = this.getView();
            oController.ShipNowSearchDlg = oController.byId("idShipNowSearchDialog");
            if (!oController.ShipNowSearchDlg) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.shipNowSearchIcon",
                    controller: this
                }).then(function (oShipNowSearchDialog) {
                    oView.addDependent(oShipNowSearchDialog);
                    oShipNowSearchDialog.open();
                });
            } else {
                oController.ShipNowSearchDlg.open();
            }
        },
        onShipNowSearchDialogClosePress: function () {
            oController.byId("idShipNowSearchDialog").close();
        },

        handleConsolidationPress: function () {
            var that = this;
            var oView = this.getView();
            if (!this.byId("idShipNowConsolidationDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.shipNowConsolidationDialog",
                    controller: this
                }).then(function (oShipNowConsolidationDialog) {
                    oView.addDependent(oShipNowConsolidationDialog);
                    oShipNowConsolidationDialog.open();
                    that._handleDisplayShipNowConsolidationTable();
                });
            } else {
                this.byId("idShipNowConsolidationDialog").open();
                this._handleDisplayShipNowConsolidationTable();
            }
        },
        onConsolidationClosePress: function () {
            this.byId("idShipNowConsolidationDialog").close();
        },
        

        handleHULinkPress: function (oEvent) {
            var oView = this.getView();
            var currentObj = oEvent.getSource().getBindingContext('eshipjetModel').getObject();
            var handlingUnitItems = currentObj.to_HandlingUnitItem.results;
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel")
            eshipjetModel.setProperty("/handlingUnitItems", handlingUnitItems);

            // var ItemsInfoModel = new JSONModel(currentObj);
            // oController.getView().setModel(ItemsInfoModel, "ItemsInfoModel");

            oController.HandlingUnitDlg = oController.byId("idHandlingUnitDialog1");
            if (!oController.HandlingUnitDlg) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.HandlingUnitDialog",
                    controller: this
                }).then(function (oHandlingUnitDialog) {
                    oView.addDependent(oHandlingUnitDialog);
                    oHandlingUnitDialog.open();
                });
            } else {
                oController.HandlingUnitDlg.open();
            }
        },
        onHandlingUnitDialogClosePress: function () {
            oController.byId("idHandlingUnitDialog1").close();
        },
        onHandlingUnitDialogClosePress: function () {
            this.byId("idHandlingUnitDialog1").close();
        },



        _handleDisplayShipNowConsolidationTable: function () {
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var ShipNowConsolidationTableData = eshipjetModel.getData().ShipNowConsolidationTableData;
            var ShipNowConsolidationTableDataModel = new JSONModel(ShipNowConsolidationTableData);
            this.getView().setModel(ShipNowConsolidationTableDataModel, "ShipNowConsolidationTableDataModel");
            const oTable = oView.byId("idShipNowConsolidationTable");
            oTable.setModel(ShipNowConsolidationTableDataModel);
            var ShipNowConsolidationTableDataModel = this.getView().getModel("ShipNowConsolidationTableDataModel");
            var ShipNowConsolidationColumns = ShipNowConsolidationTableDataModel.getData().ShipNowConsolidationColumns;
            var count = 0;
            for (var i = 0; i < ShipNowConsolidationColumns.length; i++) {
                if (ShipNowConsolidationColumns[i].visible === true) {
                    count += 1
                }
            }
            oTable.bindColumns("/ShipNowConsolidationColumns", function (sId, oContext) {
                columnName = oContext.getObject().key;
                label = oContext.getObject().label;
                var minWidth = "100%";
                if (count > 10) {
                    var minWidth = "120px";
                }


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
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else if (columnName === "CreatedDate" || columnName === "ShipDate") {
                    var DateTxt = new sap.m.Text({
                        text: {
                            path: 'ShipNowConsolidationTableDataModel>ShipDate',
                            formatter: formatter.formatDate
                        },
                        wrapping: false
                    });
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                } else {
                    return new sap.ui.table.Column({
                        label: oResourceBundle.getText(columnName),
                        template: columnName,
                        visible: oContext.getObject().visible,
                        width: minWidth,
                        sortProperty: columnName
                    });
                }
            });
            oTable.bindRows("/ShipNowConsolidationRows");
        },

        openShipNowConsolidationColNamesPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pShipNowConsolidationPopover) {
                this._pShipNowConsolidationPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShipNowConsolidationTableColumns",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pShipNowConsolidationPopover.then(function (oPopover) {
                oController.ShipNowConsolidationColumnsVisiblity();
                oPopover.openBy(oButton);
            });
        },

        ShipNowConsolidationColumnsVisiblity: function () {
            var oView = oController.getView();
            var oShipNowConsolidationTableModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aColumns = oShipNowConsolidationTableModel.getProperty("/ShipNowConsolidationTableData/ShipNowConsolidationColumns");
            var oShipNowConsolidationTable = oView.byId("myShipNowConsolidationColumnSelectId");
            var aTableItems = oShipNowConsolidationTable.getItems();

            aColumns.map(function (oColObj) {
                aTableItems.map(function (oItem) {
                    if (oColObj.key === oItem.getBindingContext("ShipNowConsolidationTableDataModel").getObject().key && oColObj.visible) {
                        oItem.setSelected(true);
                    }
                });
            });
        },
        onShipNowConsolidationColNameSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("label", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var oList = oController.getView().byId("myShipNowConsolidationColumnSelectId");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        },

        onoShipNowConsolidationColSelectOkPress: function () {
            var oView = this.getView()
            var oShipNowConsolidationTable = oView.byId("myShipNowConsolidationColumnSelectId");
            var ShipNowConsolidationTableDataModel = oView.getModel("ShipNowConsolidationTableDataModel");
            var oShipNowConsolidationTblItems = oShipNowConsolidationTable.getItems();
            var aColumnsData = ShipNowConsolidationTableDataModel.getProperty("/ShipNowConsolidationColumns");
            oShipNowConsolidationTblItems.map(function (oTableItems) {
                aColumnsData.map(function (oColObj) {
                    if (oTableItems.getBindingContext("ShipNowConsolidationTableDataModel").getObject().key === oColObj.key) {
                        if (oTableItems.getSelected()) {
                            oColObj.visible = true;
                        } else {
                            oColObj.visible = false;
                        }
                    }
                })
            });
            ShipNowConsolidationTableDataModel.updateBindings(true);
            this._handleDisplayShipNowConsolidationTable();
            this._pShipNowConsolidationPopover.then(function (oPopover) {
                oPopover.close();
            });
        },
        onShipNowConsolidationColSelectClosePress: function () {
            this._pShipNowConsolidationPopover.then(function (oPopover) {
                oPopover.close();
            });
        },

        onConsolidationFilterPopoverPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._ShipNowConsolidationPopover) {
                this._ShipNowConsolidationPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShipNowConsolidationFilterPopover",
                    controller: this
                }).then(function (ShipNowConsolidationPopover) {
                    oView.addDependent(ShipNowConsolidationPopover);
                    // ShipNowConsolidationPopover.bindElement("/ProductCollection/0");
                    return ShipNowConsolidationPopover;
                });
            }
            this._ShipNowConsolidationPopover.then(function (ShipNowConsolidationPopover) {
                ShipNowConsolidationPopover.openBy(oButton);
            });
        },
        onConsolidationFilterPopoverClosePress: function () {
            this.byId("idShipNowConsolidationFilterPopover").close();
        },
        onConsolidationFilterPopoverResetPress: function () {
            this.byId("idShipNowConsolidationFilterPopover").close();
        },
        onConsolidationFilterPopoverApplyPress: function () {
            this.byId("idShipNowConsolidationFilterPopover").close();
        },
        // add AddEUCountriesPopover popover changes start
        onAddEUCountriesPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddEUPopover) {
                this._AddEUPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddEUCountriesPopover",
                    controller: this
                }).then(function (oAddEUPopover) {
                    oView.addDependent(oAddEUPopover);
                    return oAddEUPopover;
                });
            }
            this._AddEUPopover.then(function (oAddEUPopover) {
                oAddEUPopover.openBy(oButton);
            });
        },
        AddEUCountriesClosePress: function () {
            this.byId("idAddEUCountriesPopover").close();
        },
        AddEUCountriesCancelPopover: function () {
            this.byId("idAddEUCountriesPopover").close();
        },
        AddEUCountriesSelectPopover: function () {
            this.byId("idAddEUCountriesPopover").close();
        },

        // add AddEUCountriesPopover popover changes start
        onAddCountriesPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddCountriesPopover) {
                this._AddCountriesPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddCountriesPopover",
                    controller: this
                }).then(function (oAddCountriesPopover) {
                    oView.addDependent(oAddCountriesPopover);
                    return oAddCountriesPopover;
                });
            }
            this._AddCountriesPopover.then(function (oAddCountriesPopover) {
                oAddCountriesPopover.openBy(oButton);
            });
        },
        AddCountriesClosePress: function () {
            this.byId("idAddCountriesPopover").close();
        },
        AddCountriesCancelPopover: function () {
            this.byId("idAddCountriesPopover").close();
        },

        AddCountriesSelectPopover: function () {
            this.byId("idAddCountriesPopover").close();
        },


        // add onAddERP popover changes start
        onAddERPPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddERPPopover) {
                this._AddERPPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddERPPopover",
                    controller: this
                }).then(function (oAddERPPopover) {
                    oView.addDependent(oAddERPPopover);
                    return oAddERPPopover;
                });
            }
            this._AddERPPopover.then(function (oAddERPPopover) {
                oAddERPPopover.openBy(oButton);
            });
        },
        AddERPClosePress: function () {
            this.byId("idAddERPPopover").close();
        },
        AddERPCancelPopover: function () {
            this.byId("idAddERPPopover").close();
        },

        AddERPSelectPopover: function () {
            this.byId("idAddERPPopover").close();
        },


        // add onAddAddPaymentTypes popover changes start
        onAddAddPaymentTypesPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddPayPopover) {
                this._AddPayPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddPaymentTypesPopover",
                    controller: this
                }).then(function (oAddPayPopover) {
                    oView.addDependent(oAddPayPopover);
                    return oAddPayPopover;
                });
            }
            this._AddPayPopover.then(function (oAddPayPopover) {
                oAddPayPopover.openBy(oButton);
            });
        },
        AddPaymentTypesClosePress: function () {
            this.byId("idAddPaymentTypesPopover").close();
        },
        AddPaymentTypesCancelPopover: function () {
            this.byId("idAddPaymentTypesPopover").close();
        },

        AddPaymentTypesSelectPopover: function () {
            this.byId("idAddPaymentTypesPopover").close();
        },


        // add onAddRolePress popover changes start
        onAddRolePress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddRolePopover) {
                this._AddRolePopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddRolePopover",
                    controller: this
                }).then(function (oAddRolePopover) {
                    oView.addDependent(oAddRolePopover);
                    return oAddRolePopover;
                });
            }
            this._AddRolePopover.then(function (oAddRolePopover) {
                oAddRolePopover.openBy(oButton);
            });
        },
        AddRoleClosePress: function () {
            this.byId("idAddRolePopover").close();
        },
        AddRoleCancelPopover: function () {
            this.byId("idAddRolePopover").close();
        },
        AddRoleSelectPopover: function () {
            this.byId("idAddRolePopover").close();
        },
        onCreateBatchShipPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._oCreateBatchShipPopover) {
                this._oCreateBatchShipPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.BatchShip.CreateBatch",
                    controller: this
                }).then(function (CreateBatchShipPopover) {
                    oView.addDependent(CreateBatchShipPopover);
                    // CreateBatchShipPopover.bindElement("/ProductCollection/0");
                    return CreateBatchShipPopover;
                });
            }
            this._oCreateBatchShipPopover.then(function (CreateBatchShipPopover) {
                CreateBatchShipPopover.openBy(oButton);
            });
        },
        onCreateBatchShipClosePress: function () {
            this.byId("idCreateBatchShipPopover").close();
        },
        onExcelUploadChange: function (oEvent) {
            var that = this;
            var oFileUploader = oEvent.getSource();
            var oFile = oEvent.getParameter("files")[0];
        
            if (oFile && window.FileReader) {
                var reader = new FileReader();
        
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
        
                    // Assuming the first sheet
                    var sheetName = workbook.SheetNames[0];
                    var sheet = workbook.Sheets[sheetName];
        
                    // Convert to JSON
                    var jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        
                    // Optional: log the parsed Excel data
                    console.log("Excel Data", jsonData);
        
                    // Set to eshipjetModel
                    var oModel = that.getView().getModel("eshipjetModel");
                    oModel.setProperty("/BatchShipItems", jsonData);
                };
        
                reader.readAsBinaryString(oFile);
            } else {
                sap.m.MessageToast.show("This browser does not support FileReader.");
            }
        },
        


        // add onAddProductPress popover changes start
        onAddProductPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddPrdPopover) {
                this._AddPrdPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddProductPopover",
                    controller: this
                }).then(function (oAddPrdPopover) {
                    oView.addDependent(oAddPrdPopover);
                    return oAddPrdPopover;
                });
            }
            this._AddPrdPopover.then(function (oAddPrdPopover) {
                oAddPrdPopover.openBy(oButton);
            });
        },
        AddProductClosePress: function () {
            this.byId("idAddProductPopover").close();
        },
        AddProductCancelPopover: function () {
            this.byId("idAddProductPopover").close();
        },
        AddProductSelectPopover: function () {
            this.byId("idAddProductPopover").close();
        },

        // add onAddAddPackageType popover changes start
        onAddAddPackageTypePress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddPackPopover) {
                this._AddPackPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddPackageTypePopover",
                    controller: this
                }).then(function (oAddPackPopover) {
                    oView.addDependent(oAddPackPopover);
                    return oAddPackPopover;
                });
            }
            this._AddPackPopover.then(function (oAddPackPopover) {
                oAddPackPopover.openBy(oButton);
            });
        },
        AddPackageTypeClosePress: function () {
            this.byId("idAddPackageTypePopover").close();
        },
        AddPackageTypeCancelPopover: function () {
            this.byId("idAddPackageTypePopover").close();
        },
        AddPackageTypeSelectPopover: function () {
            this.byId("idAddPackageTypePopover").close();
        },

        // add onAddAddPackageType popover changes start
        OnAddCostCenterPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddCostPopover) {
                this._AddCostPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddCostCenterPopover",
                    controller: this
                }).then(function (oAddCostPopover) {
                    oView.addDependent(oAddCostPopover);
                    return oAddCostPopover;
                });
            }
            this._AddCostPopover.then(function (oAddCostPopover) {
                oAddCostPopover.openBy(oButton);
            });
        },
        AddCostCenterClosePress: function () {
            this.byId("idAddCostCenterPopover").close();
        },
        AddCostCenterCancelPopover: function () {
            this.byId("idAddCostCenterPopover").close();
        },
        AddCostCenterSelectPopover: function () {
            this.byId("idAddCostCenterPopover").close();
        },


        // add onAddAddPackageType popover changes start
        OnAddCostCenterPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddCostPopover) {
                this._AddCostPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddCostCenterPopover",
                    controller: this
                }).then(function (oAddCostPopover) {
                    oView.addDependent(oAddCostPopover);
                    return oAddCostPopover;
                });
            }
            this._AddCostPopover.then(function (oAddCostPopover) {
                oAddCostPopover.openBy(oButton);
            });
        },
        AddCostCenterClosePress: function () {
            this.byId("idAddCostCenterPopover").close();
        },
        AddCostCenterCancelPopover: function () {
            this.byId("idAddCostCenterPopover").close();
        },
        AddCostCenterSelectPopover: function () {
            this.byId("idAddCostCenterPopover").close();
        },

        // add onAddAddPackageType popover changes start
        onAddStatusPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddStatusPopover) {
                this._AddStatusPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddStatusPopover",
                    controller: this
                }).then(function (oAddStatusPopover) {
                    oView.addDependent(oAddStatusPopover);
                    return oAddStatusPopover;
                });
            }
            this._AddStatusPopover.then(function (oAddStatusPopover) {
                oAddStatusPopover.openBy(oButton);
            });
        },
        AddStatusClosePress: function () {
            this.byId("idAddStatusPopover").close();
        },
        AddStatusCancelpress: function () {
            this.byId("idAddStatusPopover").close();
        },
        AddStatusSelectpress: function () {
            this.byId("idAddStatusPopover").close();
        },

        // add onAdd Third Party popover changes start
        onAddThirdPartyPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddThirdPopover) {
                this._AddThirdPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddThirdPartyPopover",
                    controller: this
                }).then(function (oAddThirdPopover) {
                    oView.addDependent(oAddThirdPopover);
                    return oAddThirdPopover;
                });
            }
            this._AddThirdPopover.then(function (oAddThirdPopover) {
                oAddThirdPopover.openBy(oButton);
            });
        },
        AddThirdPartyClosePress1: function () {
            this.byId("idAddThirdPartyPopover1").close();
        },
        AddThirdPartyCancelPress: function () {
            this.byId("idAddThirdPartyPopover1").close();
        },
        AddThirdPartySelectpress: function () {
            this.byId("idAddThirdPartyPopover1").close();
        },
        // add onAdd Third Party popover changes start
        onAddLTLClassPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddLTLPopover) {
                this._AddLTLPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddLTLClassPopover",
                    controller: this
                }).then(function (oAddLTLPopover) {
                    oView.addDependent(oAddLTLPopover);
                    return oAddLTLPopover;
                });
            }
            this._AddLTLPopover.then(function (oAddLTLPopover) {
                oAddLTLPopover.openBy(oButton);
            });
        },
        AddLTLClassClosePress: function () {
            this.byId("idAddLTLClassPopover1").close();
        },
        AddLTLClassCancelPress: function () {
            this.byId("idAddLTLClassPopover1").close();
        },
        AddLTLClassSelectpress: function () {
            this.byId("idAddLTLClassPopover1").close();
        },

        // add onAdd Third Party popover changes start
        onAddNMFCClassPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddNMFCPopover) {
                this._AddNMFCPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddNMFCClassPopover",
                    controller: this
                }).then(function (oAddNMFCPopover) {
                    oView.addDependent(oAddNMFCPopover);
                    return oAddNMFCPopover;
                });
            }
            this._AddNMFCPopover.then(function (oAddNMFCPopover) {
                oAddNMFCPopover.openBy(oButton);
            });
        },
        AddNMFCClassClosePress: function () {
            this.byId("idAddNMFCClassPopover").close();
        },
        AddNMFCClassCancelPress: function () {
            this.byId("idAddNMFCClassPopover").close();
        },
        AddNMFCClassSelectpress: function () {
            this.byId("idAddNMFCClassPopover").close();
        },

        // add onAdd Third Party popover changes start
        AddModeOfTransportPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddModeOfTransPopover) {
                this._AddModeOfTransPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddModeOfTransportPopover",
                    controller: this
                }).then(function (oAddModeOfTransPopover) {
                    oView.addDependent(oAddModeOfTransPopover);
                    return oAddModeOfTransPopover;
                });
            }
            this._AddModeOfTransPopover.then(function (oAddModeOfTransPopover) {
                oAddModeOfTransPopover.openBy(oButton);
            });
        },
        AddModeOfTransportClosePress: function () {
            this.byId("idAddModeOfTransportPopover").close();
        },
        AddModeOfTransportCancelPopover: function () {
            this.byId("idAddModeOfTransportPopover").close();
        },
        AddModeOfTransportSelectPopover: function () {
            this.byId("idAddModeOfTransportPopover").close();
        },


        // add on Add Order Type  popover changes start
        AddOrderTypePress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddModeOfTransPopover) {
                this._AddModeOfTransPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddOrderTypePopover",
                    controller: this
                }).then(function (oAddModeOfTransPopover) {
                    oView.addDependent(oAddModeOfTransPopover);
                    return oAddModeOfTransPopover;
                });
            }
            this._AddModeOfTransPopover.then(function (oAddModeOfTransPopover) {
                oAddModeOfTransPopover.openBy(oButton);
            });
        },
        AddOrderTypeClosePress: function () {
            this.byId("idAddOrderTypePopover").close();
        },
        AddOrderTypeCancelPopover: function () {
            this.byId("idAddOrderTypePopover").close();
        },
        AddOrderTypeSelectPopover: function () {
            this.byId("idAddOrderTypePopover").close();
        },

        // add on Add Order Type  popover changes start
        AddIncotermPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddAddIncotermPopover) {
                this._AddAddIncotermPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddIncotermPopover",
                    controller: this
                }).then(function (oAddAddIncotermPopover) {
                    oView.addDependent(oAddAddIncotermPopover);
                    return oAddAddIncotermPopover;
                });
            }
            this._AddAddIncotermPopover.then(function (oAddAddIncotermPopover) {
                oAddAddIncotermPopover.openBy(oButton);
            });
        },
        AddIncotermClosePress: function () {
            this.byId("idAddIncotermPopover").close();
        },
        AddIncotermCancelPopover: function () {
            this.byId("idAddIncotermPopover").close();
        },
        AddIncotermSelectPopover: function () {
            this.byId("idAddIncotermPopover").close();
        },

        // add on Add Dimensions popover changes start
        AddDimensionsPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddAddDimensionsPopover) {
                this._AddAddDimensionsPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddDimensionsPopover",
                    controller: this
                }).then(function (oAddAddDimensionsPopover) {
                    oView.addDependent(oAddAddDimensionsPopover);
                    return oAddAddDimensionsPopover;
                });
            }
            this._AddAddDimensionsPopover.then(function (oAddAddDimensionsPopover) {
                oAddAddDimensionsPopover.openBy(oButton);
            });
        },
        AddDimensionsClosePress: function () {
            this.byId("idAddDimensionsPopover").close();
        },
        AddDimensionsCancelPopover: function () {
            this.byId("idAddDimensionsPopover").close();
        },
        AddDimensionsSelectPopover: function () {
            this.byId("idAddDimensionsPopover").close();
        },

        // add on Add Dimensions popover changes start
        AddSMTPConfigPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddAddSMTPConfigPopover) {
                this._AddAddSMTPConfigPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddSMTPConfigPopover",
                    controller: this
                }).then(function (oAddAddSMTPConfigPopover) {
                    oView.addDependent(oAddAddSMTPConfigPopover);
                    return oAddAddSMTPConfigPopover;
                });
            }
            this._AddAddSMTPConfigPopover.then(function (oAddAddSMTPConfigPopover) {
                oAddAddSMTPConfigPopover.openBy(oButton);
            });
        },
        AddSMTPConfigClosePress: function () {
            this.byId("idAddSMTPConfigPopover").close();
        },
        AddSMTPConfigCancelPopover: function () {
            this.byId("idAddSMTPConfigPopover").close();
        },
        AddSMTPConfigSelectPopover: function () {
            this.byId("idAddSMTPConfigPopover").close();
        },

        AddCarrierDialog: function () {
            var oView = this.getView();
            if (!this.byId("idAddCarrierDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddCarrierDialog",
                    controller: this // Pass the controller for binding
                }).then(function (oAddCarrierDialog) {
                    oView.addDependent(oAddCarrierDialog);
                    oAddCarrierDialog.open();
                });
            } else {
                this.byId("idAddCarrierDialog").open(); // Open existing dialog
            }
        },
        AddCarrierCancelDialog: function () {
            this.byId("idAddCarrierDialog").close();
        },
        AddCarrierUpdateDialog: function () {
            this.byId("idAddCarrierDialog").close();
        },

        onAddCarrierDialogPlusPress: function () {
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            var addCrrierDialogItems = eshipjetModel.getData().addCrrierDialogItems;
            addCrrierDialogItems.push(
                {
                    "ServiceName": "",
                    "ServiceCode": "",
                    "ServiceCoverage": "",
                    "ConnectionType": "",
                    "Status": false,
                    "Actions": "sap-icon://delete"

                });
            eshipjetModel.updateBindings(true);
        },

        onAddCrrierDialogDeleteIconPress: function (oEvent) {
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            var addCrrierDialogItems = eshipjetModel.getData().addCrrierDialogItems;
            var aSplitPath = oEvent.getSource().getBindingContext("eshipjetModel").sPath.split("/");
            var sPath = aSplitPath[aSplitPath.length - 1];

            sap.m.MessageBox.warning("Are you sure you want to delete this record?", {
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                emphasizedAction: sap.m.MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction === "OK") {
                        addCrrierDialogItems.splice(parseInt(sPath), 1);
                        eshipjetModel.updateBindings(true);
                    }
                },
                dependentOn: this.getView()
            });
        },


        AddCarrierConfigurationDialogPress: function () {
            var oView = this.getView();
            if (!this.byId("idAddCarrierConfigurationDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddCarrierConfigurationDialog",
                    controller: this // Pass the controller for binding
                }).then(function (oAddCarrierConfigurationDialog) {
                    oView.addDependent(oAddCarrierConfigurationDialog);
                    oAddCarrierConfigurationDialog.open();
                });
            } else {
                this.byId("idAddCarrierConfigurationDialog").open(); // Open existing dialog
            }
        },
        AddCarrierConfigurationCancelDialog: function () {
            this.byId("idAddCarrierConfigurationDialog").close();
        },
        AddCarrierConfigurationUpdateDialog: function () {
            this.byId("idAddCarrierConfigurationDialog").close();
        },
        AddCarrierConfigurationCloseDialog: function () {
            this.byId("idAddCarrierConfigurationDialog").close();
        },

        OpenCompanySettingsDialog: function () {
            var oView = this.getView();
            if (!this.byId("CompanySettingsopenDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.UpdateCompanySettingsPopover",
                    controller: this // Pass the controller for binding
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("CompanySettingsopenDialog").open(); // Open existing dialog
            }
        },
        CompanySettingsCancelDialog: function () {
            this.byId("CompanySettingsopenDialog").close();
        },
        CompanySettingsSaveDialog: function () {
            this.byId("CompanySettingsopenDialog").close();
        },
        CompanySettingsClosePress: function () {
            this.byId("CompanySettingsopenDialog").close();
        },


        // Freight Quote Changes Starts Here

        onGetFreightQuotesPress: function () {
            var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
            var ShipFromAddress = ShipNowDataModel.getProperty("/ShipFromAddress");
            var ShipToAddress = ShipNowDataModel.getProperty("/ShipToAddress");
            var oTableLength = oController.byId("idCreateShipReqTable").getBinding("rows").getLength();
        
            if (ShipToAddress.FullName === "" || ShipToAddress.FullName === undefined) {
                MessageBox.warning("Contact Name is required.");
            } else if (ShipToAddress.FullName !== "" && oTableLength === 0) {
                MessageBox.warning("At least one row must have all required fields (Product Code, Product Description, Quantity, Unit Weight)." );
            } else {
                var oView = oController.getView();
                if (!oController.byId("idFreightQuotesDialog")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.eshipjet.zeshipjet.view.fragments.ShipReqLabel.GetFreightQuotesDialog",
                        controller: oController // Pass the controller for binding
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                    });
                } else {
                    oController.byId("idFreightQuotesDialog").open(); // Open existing dialog
                }
        
                // API Call to Fetch Data
                var sPath = "https://dev-api-v1.eshipjet.site/LocationMaster/defaultdata ";
                oController.onOpenBusyDialog();
                
                $.ajax({
                    url: sPath,
                    method: "GET",
                    dataType: "json",
                    success: function (oData) {
                        oController.oBusyDialog.close();
                        console.log("API Response:", oData);
                        
                        // Set the API response to the model
                        var oModel = oController.getView().getModel("eshipjetModel");
                        oModel.setProperty("/freightQuoteSubmition", oData);
                    },
                    error: function (error) {
                        console.log("Error:", error);
                        oController.oBusyDialog.close();
                    }
                });
            }
        },

        FreightQuoteUpdatedSrvData:function(){
            var ShipperDataUpdateSrvModel = oController.getOwnerComponent().getModel("ShipperDataUpdateSrvModel");
            var oEshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var aPackages = oEshipjetModel.getProperty("/ShipNowPostResponse/Packages");
            var oPayload = {
                "Delivery": oEshipjetModel.getProperty("/commonValues/sapDeliveryNumber") ? oEshipjetModel.getProperty("/commonValues/sapDeliveryNumber") : "",
                "Carrier": oEshipjetModel.getProperty("/shipRateSelectItem/Carrier") ?  oEshipjetModel.getProperty("/shipRateSelectItem/Carrier") : "",
                "SerName": oEshipjetModel.getProperty("/shipRateSelectItem/serviceName") ? oEshipjetModel.getProperty("/shipRateSelectItem/serviceName") : "",
                "TotPack": oEshipjetModel.getProperty("/ShipNowPostResponse/Packages") ? oEshipjetModel.getProperty("/ShipNowPostResponse/Packages").length.toString() : "",
                "Currency": oEshipjetModel.getProperty("/shipRateSelectItem/currency") ? oEshipjetModel.getProperty("/shipRateSelectItem/currency") : "",
                "PubFrt": oEshipjetModel.getProperty("/shipRateSelectItem/publishedFreight") ? oEshipjetModel.getProperty("/shipRateSelectItem/publishedFreight").toString() : "",
                "DiscFrt": oEshipjetModel.getProperty("/shipRateSelectItem/discountFreight_Cal") ? oEshipjetModel.getProperty("/shipRateSelectItem/discountFreight_Cal").toString() : "",
                "ItemSet": []               
              };
             
              var aItemInfo  = oEshipjetModel.getProperty("/ShipNowPostResponse/Packages/ItemsInfo");
              var aPayloadPackages = [], packObj = {}, sIdx = 0;
              if(aPackages && aPackages.length > 0){
                aPackages.forEach(function(currObj){
                    sIdx =   sIdx + 10;
                    packObj ={
                        "Delivery": oEshipjetModel.getProperty("/commonValues/sapDeliveryNumber"),
                        "DelItem": sIdx.toString(),
                        "HandUnit": currObj.HU.toString(),
                        "Weight": currObj.Weight,
                        "WeightUnit": currObj.Weightunits,
                        "Dimension": currObj.Dimension,
                        "Tracking": currObj.TrackingNumber
                    };
                    aPayloadPackages.push(packObj);    
                    packObj = {};                                          
                });
                oPayload.ItemSet = aPayloadPackages;
              }
              
              ShipperDataUpdateSrvModel.create("/HeaderSet", oPayload, {
                success: function(oResponse) {
                    var aShippingCharges = [
                        { "description": "Freight Amount", "amount": parseInt(oResponse.PubFrt).toFixed(2), "currency": "USD" },
                        { "description": "Discount Amount", "amount": parseInt(oResponse.DiscFrt).toFixed(2), "currency": "USD" },
                        { "description": "Fuel", "amount": "", "currency": "USD" }
                    ];
                    eshipjetModel.setProperty("/shippingCharges", aShippingCharges);
                    sap.m.MessageToast.show("FreightQuote Updated successful!");
                    oController.updateManifestHeaderSet();
                },
                error: function(oError) {
                    // var errMsg = JSON.parse(oError.responseText).error.message.value
                    // sap.m.MessageBox.error(errMsg);
                }
            });
        },

        ApiOutboundDeliverySrvData:function(resolve, reject, response){
            // oController.onOpenBusyDialog();
            var BillOfLading = response.Packages[0].TrackingNumber;
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            var sapDeliveryNumber = eshipjetModel.getProperty("/commonValues/sapDeliveryNumber");
            var OutBoundDeliveryModel = oController.getOwnerComponent().getModel("OutBoundDeliveryModel");
            var payload = { "BillOfLading" : BillOfLading };
            var mHeaders = {
                "accept": "application/json",
                "content-type": "application/json",
                "If-Match": oController.etag
            }

            OutBoundDeliveryModel.update("/A_OutbDeliveryHeader('" + sapDeliveryNumber + "')", payload, {
                //merge:false,
                method:"PATCH",
                headers: mHeaders,
                success: function(oResponse) {
                    resolve();
                    sap.m.MessageToast.show("OutBoundDelivery Updated successful!");
                    // oController.onCloseBusyDialog();
                },
                error: function(oError) {
                    reject();
                    var errMsg = JSON.parse(oError.responseText).error.message.value
                    sap.m.MessageBox.error(errMsg);
                    oController.onCloseBusyDialog();
                }
            })
        },

        onFreightQuoteClosePress:function() {
            oController.byId("idFreightQuotesDialog").close();
        },
        // Freight Quote Changes End Here



        // add on Add Order Type  popover changes start
        AddTrackingRangePress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._AddAddTrackingRangeopover) {
                this._AddAddTrackingRangePopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddTrackingRangePopover",
                    controller: this
                }).then(function (oAddAddTrackingRangePopover) {
                    oView.addDependent(oAddAddTrackingRangePopover);
                    return oAddAddTrackingRangePopover;
                });
            }
            this._AddAddTrackingRangePopover.then(function (oAddAddTrackingRangePopover) {
                oAddAddTrackingRangePopover.openBy(oButton);
            });
        },
        AddTrackingRangeClosePress: function () {
            this.byId("idAddTrackingRangePopover").close();
        },
        AddTrackingRangeCancelPopover: function () {
            this.byId("idAddTrackingRangePopover").close();
        },
        AddTrackingRangeSelectPopover: function () {
            this.byId("idAddTrackingRangePopover").close();
        },

        onPressAddProduct: function (oEvent) {
            oController.onOpenBusyDialog();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var sPath = oEvent.getSource().sId.split("--");
            var addPrctBtnId = sPath[sPath.length-1];
            eshipjetModel.setProperty("/addPrctBtnId", addPrctBtnId);
            var oDeliveryModel = oController.getView().getModel("OutBoundDeliveryModel");
            var promise = new Promise(function (resolved, rejected) {
                oDeliveryModel.read("/A_OutbDeliveryItem",{
                    success:function(oData){
                        if(oData && oData.results && oData.results.length > 0){
                            var aProductTable = [];
                            for(var i = 0; i < oData.results.length; i++){
                                oData.results[i]["SerialNumber"] = i+1;
                                aProductTable.push(oData.results[i]);
                            };
                            eshipjetModel.setProperty("/pickAddProductTable",aProductTable);
                        }
                        resolved(oData);
                    },
                    error:function(error){
                        rejected(error);
                    }
                })
            });

            promise.then(function (data) {
                oController.onOpenProductsDialog();
                oController.onCloseBusyDialog();
            }).catch(function(oError){
                oController.onCloseBusyDialog();
            });
        },

        onOpenProductsDialog:function(){
            var oView = this.getView();
            if (!this.byId("idAddProductDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipReqLabel.AddProductsDialog",
                    controller: this // Pass the controller for binding
                }).then(function (oAddProductDialog) {
                    oView.addDependent(oAddProductDialog);
                    oAddProductDialog.open();
                });
            } else {
                this.byId("idAddProductDialog").open(); // Open existing dialog
            }
        },

        AddProductCancelDialog: function () {
            this.byId("idAddProductDialog").close();
        },

        onTrackingNumberPress: function (oEvent) {
            var oView = this.getView();
            var oCurrentObject = oEvent.getSource().getBindingContext("eshipjetModel").getObject();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            oCurrentObject["StandardTransit"]= "01/31/25 before 2:39 PM";
            oCurrentObject["Delivered"] = "01/31/25 at 2:39 PM";
            oCurrentObject["SignedBy"] = "Stephen";
            oCurrentObject["ServiceName"] =  eshipjetModel.getProperty("/carrierServiceName_dis");
            eshipjetModel.setProperty("/TrackingNumberTableRows",oCurrentObject);
            var sUrl;
            //Hardcoding values
            var aTravelHistoryData = eshipjetModel.getProperty("/ShipmentTravelHistoryRows");
            if(oCurrentObject.CarrierCode.toUpperCase() === "FEDEX"){
                sUrl = "https://drivemedical.eshipjet.site/next-gen-tracking?Carrier=Fedex&TrackingNumber="+oCurrentObject.TrackingNumber;
                aTravelHistoryData.forEach(function(item, idx){
                    item.Status = item.Status.replace("UPS", oCurrentObject.CarrierCode);
                });   
                oController.TrackDialogWithUrl();             
            }else if(oCurrentObject.CarrierCode.toUpperCase() === "UPS"){
                sUrl = "https://drivemedical.eshipjet.site/next-gen-tracking?Carrier=UPS&TrackingNumber="+oCurrentObject.TrackingNumber;
                aTravelHistoryData.forEach(function(item, idx){
                    item.Status = item.Status.replace("FedEx", oCurrentObject.CarrierCode);
                });
                oController.TrackDialogWithUrl();
            }else{
                oController.TrackDialogWithOutUrl();
            };
            eshipjetModel.setProperty("/ShipmentTravelHistoryRows", aTravelHistoryData);
            eshipjetModel.setProperty("TrackingdisplayUrl", sUrl);
        },

        TrackDialogWithUrl:function(){
            var oView = this.getView();
            if (!this.byId("idTrackingNumberDialog1")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipReqLabel.TrackingNumberDialog1",
                    controller: this // Pass the controller for binding
                }).then(function (oTrackingNumberDialog) {
                    oView.addDependent(oTrackingNumberDialog);
                    oTrackingNumberDialog.open();
                });
            } else {
                this.byId("idTrackingNumberDialog1").open(); // Open existing dialog
            }
        },

        TrackingNumberCancelDialog: function () {
            this.byId("idTrackingNumberDialog1").close();
        },

        TrackDialogWithOutUrl:function(){
            var oView = this.getView();
            if (!this.byId("idTrackingNumberDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipReqLabel.TrackingNumberDialog",
                    controller: this // Pass the controller for binding
                }).then(function (oTrackingNumberDialog) {
                    oView.addDependent(oTrackingNumberDialog);
                    oTrackingNumberDialog.open();
                });
            } else {
                this.byId("idTrackingNumberDialog").open(); // Open existing dialog
            }
        },

        TrackingNumberWithOutUrlCancelDialog: function () {
            this.byId("idTrackingNumberDialog").close();
        },

        onShipMethodUpdate: function () {
            var oView = this.getView();
            if (!this.byId("idShipMethodDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipReqLabel.ShipMethodPlusDialog",
                    controller: this // Pass the controller for binding
                }).then(function (oShipMethodDialog) {
                    oView.addDependent(oShipMethodDialog);
                    oShipMethodDialog.open();
                });
            } else {
                this.byId("idShipMethodDialog").open(); // Open existing dialog
            }
        },
        ShipMethodCancelDialog: function () {
            this.byId("idShipMethodDialog").close();
        },
        onCloseDialog: function () {
            this.byId("idShipMethodDialog").close();
        },

        onShipmentWorkflowPress: function () {
            var oView = this.getView();
            if (!this.byId("idShipmentWorkflowDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipReqLabel.ShipmentWorkflowPlusDialog",
                    controller: this // Pass the controller for binding
                }).then(function (oShipmentWorkflowDialog) {
                    oView.addDependent(oShipmentWorkflowDialog);
                    oShipmentWorkflowDialog.open();
                });
            } else {
                this.byId("idShipmentWorkflowDialog").open(); // Open existing dialog
            }
        },
        ShipmentWorkflowCancelDialog: function () {
            this.byId("idShipmentWorkflowDialog").close();
        },
        onCloseDialog: function () {
            this.byId("idShipmentWorkflowDialog").close();
        },
        saveSelectPopover: function () {
            this.byId("idShipmentWorkflowDialog").close();
        },


        handleAddProductRowPress:function(oEvent){
            var oSelectedObj = oEvent.getSource().getBindingContext("eshipjetModel").getObject();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var addPrctBtnId = eshipjetModel.getProperty("/addPrctBtnId");
            if(addPrctBtnId === "idShipNowAddProduct"){
                var packAddProductTable = eshipjetModel.getProperty("/commonValues/packAddProductTable");
                oSelectedObj["SerialNo"] = packAddProductTable.length+1;
                packAddProductTable.push(oSelectedObj);
                eshipjetModel.updateBindings(true);
                // for(var i=0; i<packAddProductTable.length; i++){
                //     packAddProductTable[i]["SerialNo"] = i+1;
                // };
            }else if(addPrctBtnId === "idShipReqAddProduct"){
                var ShipReqTableDataModel = this.getView().getModel("ShipReqTableDataModel");
                var CreateShipReqRowsData = ShipReqTableDataModel.getData().CreateShipReqRows;
                CreateShipReqRowsData.push(oSelectedObj);
                ShipReqTableDataModel.updateBindings(true);
                for(var i=0; i<CreateShipReqRowsData.length; i++){
                    CreateShipReqRowsData[i]["#"] = i+1;
                    ShipReqTableDataModel.updateBindings(true);
                }
                oController._handleDisplayCreateShipReqTable();
            }
            var oTable = oController.getView().byId("idAddProductsDialog");
            oTable.removeSelections();
            this.byId("idAddProductDialog").close();
        },

        
         // add Ship Req onSearchPickAnAddressPopover changes start
         onSearch: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            var ShipNowDataModel = this.getView().getModel("ShipNowDataModel");
            var sPath = oEvent.getSource().getId().split("--");
            var btnId = sPath[sPath.length - 1];
            ShipNowDataModel.setProperty("/shipNowBtnId", btnId);
            if (!this._onSearchPopover) {
                this._onSearchPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShipNowPickAnAddressPopover",
                    controller: this
                }).then(function (oonSearchPopover) {
                    oView.addDependent(oonSearchPopover);
                    return oonSearchPopover;
                });
            }
            this._onSearchPopover.then(function (oonSearchPopover) {
                oonSearchPopover.openBy(oButton);
            });
        },
        onShipNowPickAnAddressCancelPress: function () {
            this.byId("idShipNowPickAnAddressPopover").close();
        },

        onMoreActionsPress:function(oEvent){
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._moreActionsPopover) {
                this._moreActionsPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.MoreActions",
                    controller: this
                }).then(function (oMoreActionsPopover) {
                    oView.addDependent(oMoreActionsPopover);
                    return oMoreActionsPopover;
                });
            }
            this._moreActionsPopover.then(function (oMoreActionsPopover) {
                oMoreActionsPopover.openBy(oButton);
            });
        },

        onMoreActionItemPress:function(oEvent){
            var oSelectedPGI = oEvent.getParameter("listItem").getBindingContext().getProperty("moreActionItem");
            var sapDeliveryNumber = eshipjetModel.getProperty("/commonValues/sapDeliveryNumber");
            if(sapDeliveryNumber === "" || sapDeliveryNumber === undefined){
                MessageBox.warning("Please enter valid document number.");
            }else if(oSelectedPGI === "Post Goods Issue"){
                oController.onOpenBusyDialog();
                oController.createPostGoodsIssue(sapDeliveryNumber);
            }else if(oSelectedPGI === "Reverse PGI"){
                oController.onOpenBusyDialog();
                oController.createReversePostGoodsIssue(sapDeliveryNumber);
            }
            var oMoreActionsPopover = this.byId("idMoreActionsPopover");
            if (oMoreActionsPopover) {
                oMoreActionsPopover.close();
            }
        },

        createPostGoodsIssue:function(sapDeliveryNumber){
            var ShipReadDataSrvModel = oController.getOwnerComponent().getModel("ShipReadDataSrvModel");
            var oPayload = {
                "Document": sapDeliveryNumber,
                "ResponseDataSet" : []
            };
            ShipReadDataSrvModel.create("/ProcessPGISet", oPayload, {
                success: function (oData) {
                    // MessageBox.success(oData.ResponseDataSet.results[0].Message);
                    console.log("Success:", oData);
                    oController.getShippingDataAfterPGI(sapDeliveryNumber);
                    oController.onCloseBusyDialog();
                },
                error: function (oError) {
                    oController.onCloseBusyDialog();
                    var errMsg = JSON.parse(oError.responseText).error.message.value;
                    sap.m.MessageBox.error(errMsg);
                }
            });
        },

        getShippingDataAfterPGI:function(sDeveliveryNumber){
            var oDeliveryModel = oController.getView().getModel("OutBoundDeliveryModel");                    
            var oHandlingUnitModel = oController.getView().getModel("HandlingUnitModel");           
            var sPath = "/A_OutbDeliveryHeader('"+ sDeveliveryNumber +"')/to_DeliveryDocumentPartner";
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            if(sDeveliveryNumber && sDeveliveryNumber.length >= 7){
                oController.onOpenBusyDialog();
                
                var path = "/A_OutbDeliveryHeader('"+ sDeveliveryNumber +"')"
                oDeliveryModel.read(path,{
                    urlParameters: {
                        "$expand": "to_DeliveryDocumentItem,to_DeliveryDocumentPartner"
                    },
                    success:function(oData){                        
                        oController.etag = oData.__metadata.etag;
                        oController.ShippingType = oData.ShippingType;
                        eshipjetModel.setProperty("/commonValues/OverallGoodsMovementStatus", oData.OverallGoodsMovementStatus);
                        oController.onCloseBusyDialog();
                    },
                    error: function(oErr){
                        oController.onCloseBusyDialog();
                    }
                });
            }
        },

        createReversePostGoodsIssue:function(sapDeliveryNumber){
            var ShipReadDataSrvModel = oController.getOwnerComponent().getModel("ShipReadDataSrvModel");
            var oPayload = {
                "Document": sapDeliveryNumber,
                "ResponseDataSet" : []
            };
            ShipReadDataSrvModel.create("/ReversePGISet", oPayload, {
                success: function (oData) {
                    // MessageBox.error(oData.ResponseDataSet.results[0].Message);
                    console.log("Success:", oData);
                    oController.onCloseBusyDialog();
                },
                error: function (oError) {
                    oController.onCloseBusyDialog();
                    var errMsg = JSON.parse(oError.responseText).error.message.value;
                    sap.m.MessageBox.error(errMsg);
                }
            });
        },

        onAfterRendering: function() {
            var oInput = this.getView().byId("idSapDeliveryNumber");
            if (oInput) {
                setTimeout(function () {
                    var oVHIcon = oInput.$().find(".sapMInputValHelp .sapUiIcon");
                    if (oVHIcon.length) {
                        oVHIcon.removeClass("sapUiIcon-valueHelp").addClass("sapUiIcon");
                        oVHIcon.attr("data-sap-ui-icon-content", "\ue0a8"); // Unicode for search icon
                        oVHIcon.css("font-family", "SAP-icons"); // Ensure correct font
                    }
                }, 100); // Small delay to ensure UI is fully rendered
            }
        },
        onServiceNowDropdownChange:function(oEvent){
            var selectedKey = oEvent.getSource().getSelectedKey();
            var eshipjetModel =  this.getOwnerComponent().getModel("eshipjetModel");
            var ShipMethodKey =  eshipjetModel.getProperty("/commonValues/ShipNowShipsrvNameSelectedKey");
            var ServiceDropdown = oController.getView().getModel("serviceNamesList").getProperty("/carrierServices");
                var serviceObj = {};
                ServiceDropdown.forEach(function(item, Idx){
                    if(item.ShippingType === "UG"){
                        serviceObj = item;
                    }
                });                
                
                eshipjetModel.setProperty("/carrierServiceName_dis", serviceObj.ServiceName);
                eshipjetModel.setProperty("/carrierServiceCode_display", serviceObj.ServiceCode);

        },
        onShopNowShipMethodTypeChange : function(oEvent){
            var selectedKey = oEvent.getSource().getSelectedKey();
            oController.onShopNowShipMethodAfterChange(selectedKey);
        },

        onShopNowShipMethodAfterChange:function(selectedKey){
            var eshipjetModel =  this.getOwnerComponent().getModel("eshipjetModel");
            var carrierconfiguration = eshipjetModel.getProperty("/carrierconfiguration1");
            var ShipNowShipMethodSelectedKey =  eshipjetModel.getProperty("/commonValues/ShipNowShipMethodSelectedKey");
            for(var i=0; i<carrierconfiguration.length; i++){
                if(carrierconfiguration[i].CarrierName === selectedKey){
                    var serviceNamesList = new JSONModel(carrierconfiguration[i]);
                    this.getView().setModel(serviceNamesList, "serviceNamesList");
                }
            };
            eshipjetModel.setProperty("/commonValues/ShipNowShipsrvNameSelectedKey", oController.ShippingType);
            for(var i=0; i<serviceNamesList.getProperty("/carrierServices").length; i++){
                if(serviceNamesList.getProperty("/carrierServices")[i].ShippingType === oController.ShippingType){
                    eshipjetModel.setProperty("/carrierServiceName_dis", serviceNamesList.getProperty("/carrierServices")[i].ServiceName);
                    eshipjetModel.setProperty("/carrierServiceCode_display", serviceNamesList.getProperty("/carrierServices")[i].ServiceCode);
                }
            }
            if(selectedKey === "UPS"){                
                eshipjetModel.setProperty("/accountNumber", "B24W72");                            
            }else{
                eshipjetModel.setProperty("/accountNumber", "740561073");                
            }              
            
            if (ShipNowShipMethodSelectedKey === "FEDEX"){
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", true );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );

            }else if(ShipNowShipMethodSelectedKey === "DHL"){
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", true );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
                
            }else if(ShipNowShipMethodSelectedKey === "FastFarwarder"){
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", true );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );

             }else if(ShipNowShipMethodSelectedKey === "Other"){

                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", true );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "UPS"){

                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", true );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "USPS"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", true );
             }else if(ShipNowShipMethodSelectedKey === "Gander & White"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "ABF"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false  );
             }else if(ShipNowShipMethodSelectedKey === "ARTEX Fine Art Services"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "ATLAS Fine Art"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "Brinks Fine Art"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "Crown Fine Art"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "DTDC"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "FedEx Freight"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "Fine Art Shippers"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "JPMorgan Chase Internal"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "Malca-Amit"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "Movi Group"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "RL"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "The Armory"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }
             else if(ShipNowShipMethodSelectedKey === "ABFS"){
                
                eshipjetModel.setProperty("/commonValues/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowABFSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/commonValues/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowRLSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/commonValues/shipNowUSPSSelect", false );
             }
        },

        // add location popover down arrow 
        onADDLocImpPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._oADDLocImpPopover) {
                this._oADDLocImpPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.AddLocImportPopover",
                    controller: this
                }).then(function (ADDLocImpPopover) {
                    oView.addDependent(ADDLocImpPopover);
                    // ADDLocImpPopover.bindElement("/ProductCollection/0");
                    return ADDLocImpPopover;
                });
            }
            this._oADDLocImpPopover.then(function (ADDLocImpPopover) {
                ADDLocImpPopover.openBy(oButton);
            });
        },
        
          // add location popover down arrow 
          onImagePress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._oADDLocImpPopover) {
                this._oADDLocImpPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.CubeDimPackPopover",
                    controller: this
                }).then(function (ADDLocImpPopover) {
                    oView.addDependent(ADDLocImpPopover);
                    // ADDLocImpPopover.bindElement("/ProductCollection/0");
                    return ADDLocImpPopover;
                });
            }
            this._oADDLocImpPopover.then(function (ADDLocImpPopover) {
                ADDLocImpPopover.openBy(oButton);
            });
        },



         // add location popover down arrow 
         AddIMportLocPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._oAddIMportRolesPopover) {
                this._oAddIMportRolesPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ImportRolesLocPopover",
                    controller: this
                }).then(function (AddIMportRolesPopover) {
                    oView.addDependent(AddIMportRolesPopover);
                    // AddIMportRolesPopover.bindElement("/ProductCollection/0");
                    return AddIMportRolesPopover;
                });
            }
            this._oAddIMportRolesPopover.then(function (AddIMportRolesPopover) {
                AddIMportRolesPopover.openBy(oButton);
            });
        },
        onAddIMportRolesClosePress: function () {
            this.byId("idAddIMportRolesPopover").close();
        },

       // add location popover down arrow 
       onAddAdressBookArrowPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddAdressBookArrowPopover) {
            this._oAddAdressBookArrowPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.AddAddressImportArrowPopover",
                controller: this
            }).then(function (AddAdressBookArrowPopover) {
                oView.addDependent(AddAdressBookArrowPopover);
                // AddAdressBookArrowPopover.bindElement("/ProductCollection/0");
                return AddAdressBookArrowPopover;
            });
        }
        this._oAddAdressBookArrowPopover.then(function (AddAdressBookArrowPopover) {
            AddAdressBookArrowPopover.openBy(oButton);
        });
    },  


      // add AddImportAddressBookPress popover down arrow 
      AddImportAddressBookPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddImportAddressBookPopover) {
            this._oAddImportAddressBookPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.AddAddressImportPopover1",
                controller: this
            }).then(function (AddImportAddressBookPopover) {
                oView.addDependent(AddImportAddressBookPopover);
                // AddImportAddressBookPopover.bindElement("/ProductCollection/0");
                return AddImportAddressBookPopover;
            });
        }
        this._oAddImportAddressBookPopover.then(function (AddImportAddressBookPopover) {
            AddImportAddressBookPopover.openBy(oButton);
        });
    },
    onAddImportAddressBookClosePress: function () {
        this.byId("idAddAddressBookImportPopover").close();
    },

         // add User Arrow click popover down arrow 
       onUserArrowPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddUserArrowPopover) {
            this._oAddUserArrowPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.UserArrowPressPopover",
                controller: this
            }).then(function (AddUserArrowPopover) {
                oView.addDependent(AddUserArrowPopover);
                // AddUserArrowPopover.bindElement("/ProductCollection/0");
                return AddUserArrowPopover;
            });
        }
        this._oAddUserArrowPopover.then(function (AddUserArrowPopover) {
            AddUserArrowPopover.openBy(oButton);
        });
    },  
       

         // add AddUserPress popover down arrow 
         AddImportUserPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddUserImportPopover) {
            this._oAddUserImportPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.UserImportPopover",
                controller: this
            }).then(function (AddUserImportPopover) {
                oView.addDependent(AddUserImportPopover);
                // AddUserImportPopover.bindElement("/ProductCollection/0");
                return AddUserImportPopover;
            });
        }
        this._oAddUserImportPopover.then(function (AddUserImportPopover) {
            AddUserImportPopover.openBy(oButton);
        });
    },
    onAddUserImportClosePress: function () {
        this.byId("idUserImportPopover").close();
    },
    onUserCloseFinishImportingPress: function () {
        this.byId("idUserImportPopover").close();
    },

           // add Third Party Arrow click popover down arrow 
           onThirdPartyArrowPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddThirdPartyArrowPopover) {
            this._oAddThirdPartyArrowPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.ThirdPartyArrowPopover",
                controller: this
            }).then(function (AddThirdPartyArrowPopover) {
                oView.addDependent(AddThirdPartyArrowPopover);
                // AddThirdPartyArrowPopover.bindElement("/ProductCollection/0");
                return AddThirdPartyArrowPopover;
            });
        }
        this._oAddThirdPartyArrowPopover.then(function (AddThirdPartyArrowPopover) {
            AddThirdPartyArrowPopover.openBy(oButton);
        });
    },  

         // add AddThirdPartyPress popover down arrow 
         AddImportThirdPartyPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddThirdPartyImportPopover) {
            this._oAddThirdPartyImportPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.ThirdPartyImportPopover",
                controller: this
            }).then(function (AddThirdPartyImportPopover) {
                oView.addDependent(AddThirdPartyImportPopover);
                // AddThirdPartyImportPopover.bindElement("/ProductCollection/0");
                return AddThirdPartyImportPopover;
            });
        }
        this._oAddThirdPartyImportPopover.then(function (AddThirdPartyImportPopover) {
            AddThirdPartyImportPopover.openBy(oButton);
        });
    },
    onThirdPartyImportClosePress: function () {
        this.byId("idThirdPartyImportPopover").close();
    },
    onThirdPartyCloseFinishImportingPress: function () {
        this.byId("idThirdPartyImportPopover").close();
    },



     // add Third Party Arrow click popover down arrow 
     onRolesArrowPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddRolesArrowPopover) {
            this._oAddRolesArrowPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.RolesArrowPopover",
                controller: this
            }).then(function (AddRolesArrowPopover) {
                oView.addDependent(AddRolesArrowPopover);
                // AddRolesArrowPopover.bindElement("/ProductCollection/0");
                return AddRolesArrowPopover;
            });
        }
        this._oAddRolesArrowPopover.then(function (AddRolesArrowPopover) {
            AddRolesArrowPopover.openBy(oButton);
        });
    },  

         // add AddRolesPress popover down arrow 
         AddImportRolesPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddRolesImportPopover) {
            this._oAddRolesImportPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.RolesImportPopover",
                controller: this
            }).then(function (AddRolesImportPopover) {
                oView.addDependent(AddRolesImportPopover);
                // AddRolesImportPopover.bindElement("/ProductCollection/0");
                return AddRolesImportPopover;
            });
        }
        this._oAddRolesImportPopover.then(function (AddRolesImportPopover) {
            AddRolesImportPopover.openBy(oButton);
        });
    },


    
     // add Third Party Arrow click popover down arrow 
     onCostCenterArrowPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddCostCenterArrowPopover) {
            this._oAddCostCenterArrowPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.CostCenterArrowPopover",
                controller: this
            }).then(function (AddCostCenterArrowPopover) {
                oView.addDependent(AddCostCenterArrowPopover);
                // AddCostCenterArrowPopover.bindElement("/ProductCollection/0");
                return AddCostCenterArrowPopover;
            });
        }
        this._oAddCostCenterArrowPopover.then(function (AddCostCenterArrowPopover) {
            AddCostCenterArrowPopover.openBy(oButton);
        });
        
    },  
    onAddImportCostCenterClosePress: function () {
        this.byId("idCostCenterImportPopover").close();
    },
    onCreateCostcenterFinishImportingPress: function () {
        this.byId("idCostCenterImportPopover").close();
    },

         // add AddCostCenterPress popover down arrow 
         AddImportCostCenterPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddCostCenterImportPopover) {
            this._oAddCostCenterImportPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.CostCenterImportPopover",
                controller: this
            }).then(function (AddCostCenterImportPopover) {
                oView.addDependent(AddCostCenterImportPopover);
                // AddCostCenterImportPopover.bindElement("/ProductCollection/0");
                return AddCostCenterImportPopover;
            });
        }
        this._oAddCostCenterImportPopover.then(function (AddCostCenterImportPopover) {
            AddCostCenterImportPopover.openBy(oButton);
        });
    },


     // add LTLClasses  Arrow click popover down arrow 
     onLTLClassesArrowPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddLTLClassesArrowPopover) {
            this._oAddLTLClassesArrowPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.LTLClassesArrowPopover",
                controller: this
            }).then(function (AddLTLClassesArrowPopover) {
                oView.addDependent(AddLTLClassesArrowPopover);
                // AddLTLClassesArrowPopover.bindElement("/ProductCollection/0");
                return AddLTLClassesArrowPopover;
            });
        }
        this._oAddLTLClassesArrowPopover.then(function (AddLTLClassesArrowPopover) {
            AddLTLClassesArrowPopover.openBy(oButton);
        });
    },  

         // add onLTLClassesArrowPress popover down arrow 
         onLTLClassesImportPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddLTLClassesImportPopover) {
            this._oAddLTLClassesImportPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.LTLClassesImportPopover",
                controller: this
            }).then(function (AddLTLClassesImportPopover) {
                oView.addDependent(AddLTLClassesImportPopover);
                // AddLTLClassesImportPopover.bindElement("/ProductCollection/0");
                return AddLTLClassesImportPopover;
            });
        }
        this._oAddLTLClassesImportPopover.then(function (AddLTLClassesImportPopover) {
            AddLTLClassesImportPopover.openBy(oButton);
        });
    },
    onAddImportLTLCLassesClosePress: function () {
        this.byId("idLTLClassesImportPopover").close();
    },
    onCreateLTLClassesFinishImportingPress: function () {
        this.byId("idLTLClassesImportPopover").close();
    },


     // add carriercatalog  Arrow click popover down arrow 
     onCarrierCatalogArrowPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddCarrierCatalogArrowPopover) {
            this._oAddCarrierCatalogArrowPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.CarrierCatalogArrowPopover",
                controller: this
            }).then(function (AddCarrierCatalogArrowPopover) {
                oView.addDependent(AddCarrierCatalogArrowPopover);
                // AddCarrierCatalogArrowPopover.bindElement("/ProductCollection/0");
                return AddCarrierCatalogArrowPopover;
            });
        }
        this._oAddCarrierCatalogArrowPopover.then(function (AddCarrierCatalogArrowPopover) {
            AddCarrierCatalogArrowPopover.openBy(oButton);
        });
    },  

         // add onCarrierCatalogArrowPress popover down arrow 
         onCarrierCatalogImportPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddCarrierCatalogImportPopover) {
            this._oAddCarrierCatalogImportPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.CarrierCatalogImportPopover",
                controller: this
            }).then(function (AddCarrierCatalogImportPopover) {
                oView.addDependent(AddCarrierCatalogImportPopover);
                // AddCarrierCatalogImportPopover.bindElement("/ProductCollection/0");
                return AddCarrierCatalogImportPopover;
            });
        }
        this._oAddCarrierCatalogImportPopover.then(function (AddCarrierCatalogImportPopover) {
            AddCarrierCatalogImportPopover.openBy(oButton);
        });
    },
    onAddImportCarrierCatalogClosePress: function () {
        this.byId("idCarrierCatalogImportPopover").close();
    },
    onCarrierCatalogcenterFinishImportingPress: function () {
        this.byId("idCarrierCatalogImportPopover").close();
    },

         // add carriercatalog  Arrow click popover down arrow 
     onCarrierAccountsArrowPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddCarrierAccountsArrowPopover) {
            this._oAddCarrierAccountsArrowPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.CarrierAccountsArrowPopover",
                controller: this
            }).then(function (AddCarrierAccountsArrowPopover) {
                oView.addDependent(AddCarrierAccountsArrowPopover);
                // AddCarrierAccountsArrowPopover.bindElement("/ProductCollection/0");
                return AddCarrierAccountsArrowPopover;
            });
        }
        this._oAddCarrierAccountsArrowPopover.then(function (AddCarrierAccountsArrowPopover) {
            AddCarrierAccountsArrowPopover.openBy(oButton);
        });
    },  

         // add onCarrierAccountsArrowPress popover down arrow 
         onCarrierAccountsImportPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._oAddCarrierAccountsImportPopover) {
            this._oAddCarrierAccountsImportPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.CarrierAccountsImportPopover",
                controller: this
            }).then(function (AddCarrierAccountsImportPopover) {
                oView.addDependent(AddCarrierAccountsImportPopover);
                // AddCarrierAccountsImportPopover.bindElement("/ProductCollection/0");
                return AddCarrierAccountsImportPopover;
            });
        }
        this._oAddCarrierAccountsImportPopover.then(function (AddCarrierAccountsImportPopover) {
            AddCarrierAccountsImportPopover.openBy(oButton);
        });
    },
    onAddImportCarrierAccountsClosePress: function () {
        this.byId("idCarrierAccountsImportPopover").close();
    },
    onCarrierAccountscenterFinishImportingPress: function () {
        this.byId("idCarrierAccountsImportPopover").close();
    },




          // add Status  Arrow click popover down arrow 
          onStatusArrowPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._oAddStatusArrowPopover) {
                this._oAddStatusArrowPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.StatusArrowPopover",
                    controller: this
                }).then(function (AddStatusArrowPopover) {
                    oView.addDependent(AddStatusArrowPopover);
                    // AddStatusArrowPopover.bindElement("/ProductCollection/0");
                    return AddStatusArrowPopover;
                });
            }
            this._oAddStatusArrowPopover.then(function (AddStatusArrowPopover) {
                AddStatusArrowPopover.openBy(oButton);
            });
        },  
    
             // add onStatusArrowPress popover down arrow 
             onStatusImportPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._oAddStatusImportPopover) {
                this._oAddStatusImportPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.StatusImportPopover",
                    controller: this
                }).then(function (AddStatusImportPopover) {
                    oView.addDependent(AddStatusImportPopover);
                    // AddStatusImportPopover.bindElement("/ProductCollection/0");
                    return AddStatusImportPopover;
                });
            }
            this._oAddStatusImportPopover.then(function (AddStatusImportPopover) {
                AddStatusImportPopover.openBy(oButton);
            });
        },
        onAddImportStatusClosePress: function () {
            this.byId("idStatusImportPopover").close();
        },
        onStatuscenterFinishImportingPress: function () {
            this.byId("idStatusImportPopover").close();
        },



         // add Product  Arrow click popover down arrow 
         onProductArrowPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._oAddProductArrowPopover) {
                this._oAddProductArrowPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ProductArrowPopover",
                    controller: this
                }).then(function (AddProductArrowPopover) {
                    oView.addDependent(AddProductArrowPopover);
                    // AddProductArrowPopover.bindElement("/ProductCollection/0");
                    return AddProductArrowPopover;
                });
            }
            this._oAddProductArrowPopover.then(function (AddProductArrowPopover) {
                AddProductArrowPopover.openBy(oButton);
            });
        },  
    
             // add onProductArrowPress popover down arrow 
             onProductImportPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._oAddProductImportPopover) {
                this._oAddProductImportPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ProductImportPopover",
                    controller: this
                }).then(function (AddProductImportPopover) {
                    oView.addDependent(AddProductImportPopover);
                    // AddProductImportPopover.bindElement("/ProductCollection/0");
                    return AddProductImportPopover;
                });
            }
            this._oAddProductImportPopover.then(function (AddProductImportPopover) {
                AddProductImportPopover.openBy(oButton);
            });
        },
        onAddImportProductClosePress: function () {
            this.byId("idProductImportPopover").close();
        },
        onProductcenterFinishImportingPress: function () {
            this.byId("idProductImportPopover").close();
        },

         // add PackagesTypes  Arrow click popover down arrow 
         onDangerousGoodsArrowPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._oAddDangerousGoodsArrowPopover) {
                this._oAddDangerousGoodsArrowPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.DangerousGoodsImportArrowPopover",
                    controller: this
                }).then(function (AddDangerousGoodsArrowPopover) {
                    oView.addDependent(AddDangerousGoodsArrowPopover);
                    // AddDangerousGoodsArrowPopover.bindElement("/DangerousGoodsCollection/0");
                    return AddDangerousGoodsArrowPopover;
                });
            }
            this._oAddDangerousGoodsArrowPopover.then(function (AddDangerousGoodsArrowPopover) {
                AddDangerousGoodsArrowPopover.openBy(oButton);
            });
        },  

        AddImportDangerousGoodsPress: function (oEvent) {
            var oView = this.getView();
        
            if (!this._oAddDangerousGoodsImportDialog) {
                this._oAddDangerousGoodsImportDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.DangerousGoodsImportDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
        
            this._oAddDangerousGoodsImportDialog.then(function (oDialog) {
                oDialog.open();
            });
        },
        
        onAddImportDangerousGoodsClosePress: function () {
            this.byId("idDangerousGoodsImportDialog").close();
        },
        
        onDangerousGoodscenterFinishImportingPress: function () {
            this.byId("idDangerousGoodsImportDialog").close();
        },
        

         // add PackagesTypes  Arrow click popover down arrow 
         onPackagesTypesArrowPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._oAddPackagesTypesArrowPopover) {
                this._oAddPackagesTypesArrowPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.PackageTypesArrowPopover",
                    controller: this
                }).then(function (AddPackagesTypesArrowPopover) {
                    oView.addDependent(AddPackagesTypesArrowPopover);
                    // AddPackagesTypesArrowPopover.bindElement("/PackagesTypesCollection/0");
                    return AddPackagesTypesArrowPopover;
                });
            }
            this._oAddPackagesTypesArrowPopover.then(function (AddPackagesTypesArrowPopover) {
                AddPackagesTypesArrowPopover.openBy(oButton);
            });
        },  
    
             // add onPackagesTypesArrowPress popover down arrow 
             onPackagesTypesImportPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._oAddPackagesTypesImportPopover) {
                this._oAddPackagesTypesImportPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.PackageTypesImportPopover",
                    controller: this
                }).then(function (AddPackagesTypesImportPopover) {
                    oView.addDependent(AddPackagesTypesImportPopover);
                    // AddPackagesTypesImportPopover.bindElement("/PackagesTypesCollection/0");
                    return AddPackagesTypesImportPopover;
                });
            }
            this._oAddPackagesTypesImportPopover.then(function (AddPackagesTypesImportPopover) {
                AddPackagesTypesImportPopover.openBy(oButton);
            });
        },
        onAddImportPackagesTypesClosePress: function () {
            this.byId("idPackagesTypesImportPopover").close();
        },
        onPackagesTypescenterFinishImportingPress: function () {
            this.byId("idPackagesTypesImportPopover").close();
        },
    

        

    onShipRatePress:function(){
        var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
        var shipToCountry = ShipNowDataModel.getProperty("/ShipToAddress/Country");
        var shipToAddressLine1 = ShipNowDataModel.getProperty("/ShipToAddress/StreetName");
        var shipToCity = ShipNowDataModel.getProperty("/ShipToAddress/CityName");
        var shipToZipCode = ShipNowDataModel.getProperty("/ShipToAddress/PostalCode");
        var shipToState = ShipNowDataModel.getProperty("/ShipToAddress/CityName");
        var shipToCompanyName = ShipNowDataModel.getProperty("/ShipToAddress/BusinessPartnerName1");
        var shipToContactName = ShipNowDataModel.getProperty("/ShipToAddress/FullName");
        var shipToAddressLine2 = ShipNowDataModel.getProperty("/ShipToAddress/HouseNumber");
        var shipToEmail = ShipNowDataModel.getProperty("/ShipToAddress/EMAIL");
        var shipToPhone = ShipNowDataModel.getProperty("/ShipToAddress/PhoneNumber");
        var ShipNowPackTable = oController.getView().byId("idShipNowPackTable");
        var oTableItemsLength = ShipNowPackTable.getBinding("rows").iLength;

        if(shipToCountry === "" || shipToCountry === undefined){
            MessageBox.warning("Please Enter Ship To Country");
        }else if(shipToCountry !== "" && shipToAddressLine1 === ""){
            MessageBox.warning("Please Enter Address Line 1");
        }else if(shipToCountry !== "" && shipToAddressLine1 !== "" && shipToCity === ""){
            MessageBox.warning("Please Enter Ship To City");
        }else if(shipToCountry !== "" && shipToAddressLine1 !== "" && shipToCity !== "" && shipToZipCode === ""){
            MessageBox.warning("Please Enter Ship To ZipCode");
        }else if(shipToCountry !== "" && shipToAddressLine1 !== "" && shipToCity !== "" && shipToZipCode !== "" && shipToState === ""){
            MessageBox.warning("Please Enter Ship To State");
        }else if(shipToCountry !== "" && shipToAddressLine1 !== "" && shipToCity !== "" && shipToZipCode !== "" && shipToState !== "" && shipToCompanyName === ""){
            MessageBox.warning("Please Enter Ship To Company Name");
        }else if(shipToCountry !== "" && shipToAddressLine1 !== "" && shipToCity !== "" && shipToZipCode !== "" && shipToState !== "" && shipToCompanyName !== "" && shipToContactName === ""){
            MessageBox.warning("Please Enter Ship To Contact Name");
        }else if(shipToCountry !== "" && shipToAddressLine1 !== "" && shipToCity !== "" && shipToZipCode !== "" && shipToState !== "" && shipToCompanyName !== "" && shipToContactName !== "" && shipToEmail === ""){
            MessageBox.warning("Please Enter Ship To Email");
        }else if(shipToCountry !== "" && shipToAddressLine1 !== "" && shipToCity !== "" && shipToZipCode !== "" && shipToState !== "" && shipToCompanyName !== "" && shipToContactName !== "" && shipToEmail !== "" && shipToPhone === ""){
            MessageBox.warning("Please Enter Ship To Phone No");
        }else if(shipToCountry !== "" && shipToAddressLine1 !== "" && shipToCity !== "" && shipToZipCode !== "" && shipToState !== "" && shipToCompanyName !== "" && shipToContactName !== "" && shipToEmail !== "" && shipToPhone !== "" && oTableItemsLength <= 0){
            MessageBox.warning("Please create package");
        }else{
           
            var getShipRatePromise = new Promise((resolve, reject) => {
                oController.onShipRateRequest(resolve, reject, "ShipRates");
            });
        }        
    },
    onShipRateRequest:function(resolve, reject, sRequestFrom){
        var oEshipjetModel  = oController.getOwnerComponent().getModel("eshipjetModel");
        var oShipDataModel  = oController.getView().getModel("ShipNowDataModel");  
       
        var oPayload = {
            "HeaderInfo": {
                "FeederSystem": "Manual",
                "DocumentNumber": oEshipjetModel.getProperty("/commonValues/sapDeliveryNumber"),
                "DocumentType": "Delivery Order",
                "ShipDate": "2024-10-29T09:08:36.962Z",
                "CreatedDate": "2024-10-29T09:08:36.962Z",
                "ShipmentType": "Manual",
                "Location": "1001",
                "ERP": "Manual",
                "TotalWeight": "020"
            },
            "Shipper": {
                "COMPANY": "Eshipjet Software Inc.",
                "CONTACT": "Steve Marsh",
                "ADDRESS_LINE1": "5717 Legacy",
                "ADDRESS_LINE2": "Suite 250",
                "ADDRESS_LINE3": null,
                "CITY": "Plano",
                "STATE": "TX",
                "ZIPCODE": "75024",
                "COUNTRY": "US",
                "PHONE": "(888) 464 2360",
                "EMAIL": "info@eshipjet.ai"
            },
            "ShipTo": {
                "COMPANY": oShipDataModel.getProperty("/ShipToAddress/FullName"),
                "CONTACT": oShipDataModel.getProperty("/ShipToAddress/BusinessPartnerName1"),
                "ADDRESS_LINE1": oShipDataModel.getProperty("/ShipToAddress/StreetName"),
                "ADDRESS_LINE2": "Suite 250",
                "ADDRESS_LINE3": null,
                "CITY": oShipDataModel.getProperty("/ShipToAddress/CityName"),
                "STATE": oShipDataModel.getProperty("/ShipToAddress/Region"),
                "ZIPCODE": oShipDataModel.getProperty("/ShipToAddress/PostalCode"),
                "COUNTRY": oShipDataModel.getProperty("/ShipToAddress/Country"),
                "PHONE": oShipDataModel.getProperty("/ShipToAddress/PhoneNumber"),
                "EMAIL": "info@eshipjet.ai",
                "TAXID": null
            },
            "SoldTo": {
                "COMPANY": "",
                "CONTACT": "",
                "ADDRESS_LINE1": "",
                "ADDRESS_LINE2": "",
                "ADDRESS_LINE3": "",
                "CITY": "",
                "STATE": "",
                "ZIPCODE": "",
                "COUNTRY": "",
                "PHONE": "",
                "EMAIL": ""
            },
            "Packages": [
                {
                    "ItemsInfo": [
                        {
                            "ItemNo": "OPF12346",
                            "ProductNo": "OPF12346",
                            "Description": "Oakley Square plastic",
                            "IsDG": false,
                            "UnitCost": "131",
                            "UnitWeight": "1",
                            "Dimension": "",
                            "HTSCode": "900410",
                            "ECCN": "",
                            "UN": "",
                            "Class": 50,
                            "NMFC": "",
                            "Category": "",
                            "IsSerial": null,
                            "IsBatch": null,
                            "IsStackable": null,
                            "IsActive": true,
                            "LocationId": "",
                            "id": 1,
                            "Sno": 1,
                            "Quantity": 15,
                            "Partial": 15,
                            "Balance": 15
                        }
                    ],
                    "SpecialServices": {},
                    "Weightunits": "LBS",
                    "DimensionUnits": "IN",
                    "Sno": 1,
                    "HU": 1371,
                    "Weight": "11",
                    "Dimension": "5x5x5",
                    "PackageSpecialServiceTyeps": []
                }
            ],
            "ShipmentLevelServices": {},
            "ShipmentLevelSpecialServices": {},
            "id": 86,
            "items": [],
            "ShipmentSpecialServiceTypes": [],
            "InternationalDetails": {
                "ItemInfo": [
                    {
                        "ItemNo": "",
                        "ProductNo": "",
                        "Description": "",
                        "IsDG": null,
                        "UnitCost": "",
                        "UnitWeight": "",
                        "Dimension": "",
                        "HTSCode": "",
                        "ECCN": "",
                        "UN": "",
                        "Class": "",
                        "NMFC": "",
                        "Category": "",
                        "IsSerial": null,
                        "IsBatch": null,
                        "IsStackable": null,
                        "IsActive": true,
                        "LocationId": "1001",
                        "id": 1,
                        "Sno": 1,
                        "Quantity": null,
                        "Partial": 1,
                        "Balance": null,
                        "UOM": null
                    }
                ],
                "termsofShipment": "",
                "reasonforExport": "",
                "customDecVal": "",
                "documentsContentType": "",
                "iNTDutiesTaxes": "",
                "dutiesAccountnumber": "",
                "bookingConfirmnumber": "",
                "B13AFilingOption": "",
                "Permitnumber": "",
                "ITN": "",
                "compliStatement": "",
                "payorCountryCode": ""
            },
            "CarrierDetails": [
                {
                    "Carrier": "FedEx",
                    "ServiceName": "",
                    "PaymentType": "Sender",
                    "ShippingAccount": "740561073",
                    "BillingAccount": "",
                    "BillingZipCode": "",
                    "Reference1": "",
                    "Reference2": "",
                    "Reference3": "",
                    "Reference4": "",
                    "Note": "",
                    "UserId": "l70c717f3eaf284dc9af42169e93874b6e",
                    "Password": "7f271bf486084e8f8073945bb7e6a020",
                    "LocationId": "1001",
                    "Account": "740561073"
                },
                {
                    "Carrier": "RL",
                    "ServiceName": "",
                    "PaymentType": "Sender",
                    "ShippingAccount": "",
                    "BillingAccount": "",
                    "BillingCountry": "",
                    "BillingZipCode": "",
                    "Reference1": "",
                    "Reference2": "",
                    "Reference3": "",
                    "Reference4": "",
                    "Note": "",
                    "UserId": "test",
                    "Password": "test",
                    "AccessKey": "ItO0YzFzIxZ1Q0MWQtZWNlZi00MDVkLTgxYzNGNiQlMzMTkTC"
                },
                {
                    "Carrier": "ABFS",
                    "ServiceName": "",
                    "PaymentType": "Sender",
                    "ShippingAccount": "B24W72",
                    "BillingAccount": "",
                    "BillingCountry": "",
                    "BillingZipCode": "",
                    "Reference1": "",
                    "Reference2": "",
                    "Reference3": "",
                    "Reference4": "",
                    "Note": "",
                    "UserId": "ABFESHIPJET",
                    "Password": "Legacy!@3",
                    "AccessKey": "JVG9SX85"
                },
                {
                    "Carrier": "UPS",
                    "ServiceName": "",
                    "PaymentType": "Sender",
                    "ShippingAccount": "B24W72",
                    "BillingAccount": "",
                    "BillingCountry": "",
                    "BillingZipCode": "",
                    "Reference1": "EWM17-CU02",
                    "Reference2": "",
                    "Reference3": "",
                    "Reference4": "",
                    "Note": "",
                    "UserId": "6ljUpEbuu1OlOk7ow932lsxXHISUET0WKjTn59GzQ5MRdEbA",
                    "Password": "ioZmsfcbrzlWfGh7wGMhqHL6sY4EAaKzZObullipni0cEGJGChjFmGpkcdCWQynK",
                    "AccessKey": ""
                },
                {
                    "Carrier": "USPS",
                    "ShippingAccount": "3087617",
                    "PaymentType": "Sender",
                    "BillingAccount": "",
                    "BillingCountry": "",
                    "BillingZipCode": "",
                    "Note": "",
                    "Reference1": "",
                    "Reference2": "",
                    "Reference3": "",
                    "Reference4": "",
                    "ServiceName": "Priority",
                    "costCenter": "",
                    "PoNo": "",
                    "InvoiceNo": "",
                    "UserId": "3087617",
                    "Password": "October2024!",
                    "AccessKey": null
                },
                {
                    "Carrier": "dhl",
                    "ServiceName": "P",
                    "PaymentType": "Sender",
                    "ShippingAccount": "965278629",
                    "BillingAccount": "",
                    "BillingCountry": "",
                    "BillingZipCode": "",
                    "Reference1": "EWM17-CU02",
                    "Reference2": "test",
                    "Reference3": "",
                    "Reference4": "",
                    "Note": "",
                    "UserId": "apT2vB7mV1qR1b",
                    "Password": "U#3mO^1vY!5mT@0j",
                    "AccessKey": "",
                    "RefreshKey": ""
                }
            ],
            "ShipFrom": {
                "COMPANY": oShipDataModel.getProperty("/ShipFromAddress/ShipFromCOMPANY"),
                "CONTACT": oShipDataModel.getProperty("/ShipFromAddress/ShipFromCONTACT"),
                "ADDRESS_LINE1": oShipDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE1"),
                "ADDRESS_LINE2": oShipDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE2"),
                "ADDRESS_LINE3": oShipDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE3"),
                "CITY": oShipDataModel.getProperty("/ShipFromAddress/ShipFromCITY"),
                "STATE": oShipDataModel.getProperty("/ShipFromAddress/ShipFromSTATE"),
                "ZIPCODE": oShipDataModel.getProperty("/ShipFromAddress/ShipFromZIPCODE"),
                "COUNTRY": oShipDataModel.getProperty("/ShipFromAddress/ShipFromCOUNTRY"),
                "PHONE": oShipDataModel.getProperty("/ShipFromAddress/ShipFromPHONE"),
                "EMAIL": oShipDataModel.getProperty("/ShipFromAddress/ShipFromEMAIL")
            }
        };       
        oEshipjetModel.updateBindings(true);
        // var sPath = "https://eshipjet-stg-scpn-byargfehdgdtf8f3.francecentral-01.azurewebsites.net/Rateall "; 
        var sPath = "https://carrier-api-v1.eshipjet.site/rateall"
        $.ajax({
            url: sPath, // Replace with your API endpoint
            method: "POST",
            contentType: "application/json", // Set content type to JSON if sending JSON data
            data: JSON.stringify(oPayload),
            success: function (response) {          
                console.log("Success:", response);    
                resolve();          
                if(response && response.RateServices && response.RateServices.length > 0){
                    response.RateServices.map(function(Obj, idx){
                        Obj["discountFreight_Cal"] = (Obj.publishedFreight) - ((Obj.publishedFreight * 20 ) / 100) ;  
                    });
                    oEshipjetModel.setProperty("/shipNowShippingRates", response.RateServices);
                    if(sRequestFrom === "ShipRates"){
                        oController.onOpenShipNowShippinRateDialog();
                    }else{
                        var sKey = oEshipjetModel.getProperty("/commonValues/ShipNowShipMethodSelectedKey"), oCarrier = {};
                        if(sKey !== "ABFS"){
                            
                            var sServiceKeyName = oEshipjetModel.getProperty("/carrierServiceName_dis");
                            if(response && response.RateServices &&  response.RateServices.length > 0){
                                response.RateServices.forEach(function(item, idx){
                                    if(sServiceKeyName === item.serviceName){
                                        oCarrier = item;
                                    }
                                })
                            }
                            oEshipjetModel.setProperty("/shipRateSelectItem", oCarrier);
                            let fuelAmount = (oCarrier && oCarrier.surCharges && oCarrier.surCharges.length > 0 ) ? oCarrier.surCharges[0].amount : "";
                            var aShippingCharges = [
                                { "description": "Freight Amount", "amount": parseInt(oCarrier.publishedFreight).toFixed(2), "currency": "USD" },
                                { "description": "Discount Amount", "amount": parseInt(oCarrier.discountFreight_Cal).toFixed(2), "currency": "USD" },
                                { "description": "Fuel", "amount": fuelAmount, "currency": "USD" }
                            ];
                            eshipjetModel.setProperty("/shippingCharges", aShippingCharges);
                            oEshipjetModel.setProperty("/commonValues/ShipNowShipMethodSelectedKey", oCarrier.Carrier);
                            oEshipjetModel.setProperty("/commonValues/ShipNowShipsrvNameSelectedKey", oCarrier.serviceCode);
                            oEshipjetModel.setProperty("/commonValues/ShipNowSelectedServiceName", oCarrier.serviceName);
                            oEshipjetModel.setProperty("/accountNumber", oCarrier.AccountNumber); 
                            oEshipjetModel.setProperty("/carrierServiceName_dis",oCarrier.serviceName);
                        }else{
                            var aShippingCharges = [
                                { "description": "Freight Amount", "amount": "100.00", "currency": "USD" },
                                { "description": "Discount Amount", "amount": "80.00", "currency": "USD" },
                                { "description": "Fuel", "amount": "10.00", "currency": "USD" }
                            ];
                            eshipjetModel.setProperty("/shippingCharges", aShippingCharges);
                        }
                        

                    }
                }
                // oController.onCloseBusyDialog();
            },
            error: function (oError) {
                // Handle error            
                reject();    
                var errMsg = JSON.parse(oError.responseText).error.message.value;
                sap.m.MessageBox.error(errMsg);
                oController.onCloseBusyDialog();
                
            }
        });
    },


    onRecentShipmentsItemPress:function(oEvent){
        var oCurrentObj = oEvent.getSource().getBindingContext("eshipjetModel").getObject();
        var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");

        // var aShippingCharges = [
        //     { "description": "Freight Amount", "amount": oCurrentObj.Freightamt, "currency": oCurrentObj.Waerk },
        //     { "description": "Discount Amount", "amount": oCurrentObj.Discountamt, "currency": oCurrentObj.Waerk },
        //     { "description": "Fuel", "amount": oCurrentObj.Fuel, "currency": oCurrentObj.Waerk }
        // ];
        // eshipjetModel.setProperty("/shippingCharges", aShippingCharges);
        // eshipjetModel.updateBindings(true);

        var sDocumentNumber = oCurrentObj.Vbeln;
        
        oController.getOwnerComponent().getModel("eshipjetModel").setProperty("/commonValues/sapDeliveryNumber",sDocumentNumber);
        eshipjetModel.setProperty("/commonValues/shipNowGetBtn", true);
        oController.onShipNowGetPress();
        oController.onRecentShipmentClosePress();
    },


    onOpenShipNowShippinRateDialog:function(){    
        var oView = oController.getView();
        if (!oController.byId("_IDGenShipNowShppindRateDialog")) {
            Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShippingRates",
                controller: this // Pass the controller for binding
            }).then(function (oShippingDialog) {
                oView.addDependent(oShippingDialog);
                oShippingDialog.open();                
            });
        } else {
            this.byId("_IDGenShipNowShppindRateDialog").open(); 
        }
    },
    onCloseShipNowShippinRateDialog:function(){
        oController.byId("_ShippingRateTableId").removeSelections();
        this.byId("_IDGenShipNowShppindRateDialog").close();        
    },
    onPickCarrierSubmit:function(){
        var oTable  = oController.byId("_ShippingRateTableId");
        var oEshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
        var aSelectedItems = oTable.getSelectedItems();
        var oCarrier = oTable.getSelectedItem().getBindingContext("eshipjetModel").getObject();
        // var RecentShipmentSet = oEshipjetModel.getData().RecentShipmentSet;
        // RecentShipmentSet[RecentShipmentSet.length-1]["Carrier"] = oCarrier.Carrier;
        // RecentShipmentSet["Carrier"] = oCarrier;
        oEshipjetModel.setProperty("/shipRateSelectItem", oCarrier);
        oEshipjetModel.updateBindings(true);
        
        if(aSelectedItems && aSelectedItems.length > 0){
            oController.oSelectObj = aSelectedItems[0].getBindingContext("eshipjetModel").getObject(); 
            oEshipjetModel.setProperty("/commonValues/ShipNowShipMethodSelectedKey", oController.oSelectObj.Carrier);
            oEshipjetModel.setProperty("/commonValues/ShipNowShipsrvNameSelectedKey", oController.oSelectObj.serviceCode);
            oEshipjetModel.setProperty("/commonValues/ShipNowSelectedServiceName", oController.oSelectObj.serviceName);
            oEshipjetModel.setProperty("/accountNumber", oController.oSelectObj.AccountNumber); 
            oEshipjetModel.setProperty("/carrierServiceName_dis",oController.oSelectObj.serviceName);                    
        }
        oController.onCloseShipNowShippinRateDialog();
    },
    onPressCloseShipNow: function() {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("ShipRequestLabel"); // Replace with your actual route name
    },
    onViewNowPressBackToShipNow: function(oEvent){
        var oCurrentObj = oEvent.getSource().getBindingContext("eshipjetModel").getObject();
        var sKey = "ShipNow";      
        eshipjetModel.setProperty("/commonValues/sapDeliveryNumber",""); //80000001
        var oToolPage = this.byId("toolPage");
        oToolPage.setSideExpanded(false);
        eshipjetModel.setProperty("/shippingCharges",[]);
        eshipjetModel.setProperty("/shippingDocuments",[]);
        eshipjetModel.setProperty("/HandlingUnitItems",[]);
        eshipjetModel.setProperty("/HandlingUnits",[]);
        eshipjetModel.setProperty("/shippingDocuments",[]);
        // oController._handleDisplayShipNowPackTable();
        if (sKey === "ShipNow") {
            eshipjetModel.setProperty("/commonValues/toolPageHeader", false);
            eshipjetModel.setProperty("/commonValues/allViewsFooter", false);
            eshipjetModel.setProperty("/commonValues/shipNowViewFooter", true);
            eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
            eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
            eshipjetModel.setProperty("/showDarkThemeSwitch", false);
            eshipjetModel.setProperty("/commonValues/darkTheme", false);
            document.body.classList.remove("dark-theme");
            eshipjetModel.setProperty("/commonValues/shipNowGetBtn", true);
            oController.onPackSectionEmptyRows();
        }
        eshipjetModel.setProperty("/SideNavigation", false);
        this.byId("pageContainer").to(this.getView().createId(sKey));

        var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
            var shipFromObj = {
                "ShipFromCONTACT": oCurrentObj.FromContact,
                "ShipFromCOMPANY": oCurrentObj.FromCompany,
                "ShipFromPHONE": oCurrentObj.FromPhone,
                "ShipFromEMAIL": oCurrentObj.Emailaddress,
                "ShipFromCITY": oCurrentObj.Fromcity,
                "ShipFromSTATE": oCurrentObj.FromRegion,
                "ShipFromCOUNTRY": oCurrentObj.FromCountry,
                "ShipFromZIPCODE": oCurrentObj.FromPostalcode,
                "ShipFromADDRESS_LINE1": oCurrentObj.FromStreet,
                "ShipFromADDRESS_LINE2": oCurrentObj.FromStreet2,
                "ShipFromADDRESS_LINE3": ""
            };
            var shipToObj = {
                "FullName": oCurrentObj.RecContact,
                "BusinessPartnerName1": oCurrentObj.RecCompany,
                "PhoneNumber": oCurrentObj.RecPhone,
                "EMAIL": oCurrentObj.Emailaddress,
                "CityName": oCurrentObj.RecCity,
                "Region": oCurrentObj.RecRegion,
                "Country": oCurrentObj.RecCountry,
                "PostalCode": oCurrentObj.RecPostalcode,
                "StreetName": oCurrentObj.RecAddress1,
                "HouseNumber": oCurrentObj.RecAddress2,
                "ShipFromADDRESS_LINE3": ""
            };
            // var oBusinessPartner = {
            //     PartnerType: oCurrentObj.PartnerType || "",
            //     PartnerType: oCurrentObj.RecPartnerType || "", 
            //     Kunner: oCurrentObj.Kunnr || "",
            //     BusinessPartnerName1: oCurrentObj.RecCompany || "",
            //     FullName: oCurrentObj.RecContact || "",
            //     StreetName: oCurrentObj.RecAddress1 || "",
            //     HouseNumber: oCurrentObj.RecAddress2 || "", // if using Address Line 2
            //     CityName: oCurrentObj.RecCity || "",
            //     Region: oCurrentObj.RecRegion || "",
            //     PostalCode: oCurrentObj.RecPostalcode || "",
            //     Country: oCurrentObj.RecCountry || "",
            //     PhoneNumber: oCurrentObj.RecPhone || "",
            //     email: oCurrentObj.Emailaddress || ""
            // };
            // eshipjetModel.setProperty("/BusinessPartners", [oBusinessPartner]);

            ShipNowDataModel.setProperty("/ShipFromAddress", shipFromObj);
            ShipNowDataModel.setProperty("/ShipToAddress", shipToObj);

            

    },
    // add onAddAddPaymentTypes popover changes start
    onAddAddDangerousGoodsPress: function (oEvent) {
        var oButton = oEvent.getSource(),
            oView = this.getView();
        if (!this._AddDangerousGoodsPopover) {
            this._AddDangerousGoodsPopover = Fragment.load({
                id: oView.getId(),
                name: "com.eshipjet.zeshipjet.view.fragments.AddDangerousGoodsPopover",
                controller: this
            }).then(function (oAddDangerousGoodsPopover) {
                oView.addDependent(oAddDangerousGoodsPopover);
                return oAddDangerousGoodsPopover;
            });
        }
        this._AddDangerousGoodsPopover.then(function (oAddDangerousGoodsPopover) {
            oAddDangerousGoodsPopover.openBy(oButton);
        });
    },
    AddDangerousGoodsClosePress: function () {
        this.byId("idAddDangerousGoodsPopover").close();
    },
    AddDangerousGoodsCancelPopover: function () {
        this.byId("idAddDangerousGoodsPopover").close();
    },

    AddDangerousGoodsSelectPopover: function () {
        this.byId("idAddDangerousGoodsPopover").close();
    },

    onOpenSAPDeliveryList:function(oEvent){
        var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pShipNowSAPDeliveryPopover) {
                this._pShipNowSAPDeliveryPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SAPDeliveryList",
                    controller: this
                }).then(function (oShipNowSAPDeliveryPopover) {
                    oView.addDependent(oShipNowSAPDeliveryPopover);
                    return oShipNowSAPDeliveryPopover;
                });
            }
            this._pShipNowSAPDeliveryPopover.then(function (oShipNowSAPDeliveryPopover) {
                oShipNowSAPDeliveryPopover.openBy(oButton);
            });
        },

        onSAPDeliveryNoSelect:function(oEvent){
            var oSelectedItem = oEvent.getParameter("listItem").getTitle();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            eshipjetModel.setProperty("/SAPDeliveryNo", oSelectedItem);
            var oShipNowSAPDeliveryPopover = this.byId("idSAPDeliveryPopover"); // For fragments use `this.byId`
            if (oShipNowSAPDeliveryPopover) {
                oShipNowSAPDeliveryPopover.close();
            }
        },

        onObtainProofOfDeliveryPress:function(oEvent){
            var TrackingNumberTableRows = eshipjetModel.getProperty("/TrackingNumberTableRows");
            var sFilePath, oLink, sDownloadFileName; 
            if(TrackingNumberTableRows.CarrierCode.toUpperCase() === "UPS"){    
                sFilePath = "https://eshipjet-products-dev.s3.us-east-1.amazonaws.com/Tracking+_+UPS+-+India.pdf";			
                sDownloadFileName = "UPS_Tracking.pdf";             
            }else if(TrackingNumberTableRows.CarrierCode.toUpperCase() === "FEDEX"){
                sFilePath = "https://eshipjet-products-dev.s3.us-east-1.amazonaws.com/Fedex+POD.pdf";
                sDownloadFileName = "FedEx_Tracking.pdf";
            }   
            oLink = document.createElement("a");
            oLink.href = sFilePath;
            oLink.target = "_blank";
            oLink.download = sDownloadFileName; // Set the downloaded filename
            document.body.appendChild(oLink);
            oLink.click();
            document.body.removeChild(oLink);             
        },
        onOpenValidateAddressDialog: function() {
            var oView = this.getView();
            var ShipNowDataModel =  oController.getView().getModel("ShipNowDataModel");
            var eshipjetModel =  oController.getView().getModel("eshipjetModel");

            var that = this;
            var idServiceName = oController.getView().byId("idServiceName");
            var carrier = eshipjetModel.getProperty("/commonValues/ShipNowShipMethodSelectedKey");
            var id,password,accountNumber;
            if(carrier && carrier.toUpperCase() === "UPS"){
                id = "6ljUpEbuu1OlOk7ow932lsxXHISUET0WKjTn59GzQ5MRdEbA";
                password = "ioZmsfcbrzlWfGh7wGMhqHL6sY4EAaKzZObullipni0cEGJGChjFmGpkcdCWQynK";
                accountNumber = "B24W72";
            }else if(carrier && carrier.toUpperCase() === "FEDEX"){
                 id = "l70c717f3eaf284dc9af42169e93874b6e";
                 password = "7f271bf486084e8f8073945bb7e6a020";
                 accountNumber = "740561073";
            }else if(carrier && carrier.toUpperCase() === "DHL"){
                 id = "apT2vB7mV1qR1b";
                 password = "U#3mO^1vY!5mT@0j";
            }else if(carrier && carrier.toUpperCase() === "USPS"){
                id = "3087617";
                password = "October2024!";
            }else if(carrier && carrier.toUpperCase() === "ABFS"){
                id = "ABFESHIPJET";
                password = "Legacy!@3";
            }

        
            var fnCallAddressValidationAPI = function() {
                var oPayload = {
                    "ShipTo": {
                        "COMPANY": ShipNowDataModel.getProperty("/ShipToAddress/BusinessPartnerName1"),
                        "CONTACT": ShipNowDataModel.getProperty("/ShipToAddress/FullName"),
                        "ADDRESS_LINE1": ShipNowDataModel.getProperty("/ShipToAddress/StreetName"),
                        "ADDRESS_LINE2": ShipNowDataModel.getProperty("/ShipToAddress/HouseNumber"),
                        "ADDRESS_LINE3": "",
                        "AddressType": ShipNowDataModel.getProperty("/ShipToAddress/LocationType"),
                        "CITY": ShipNowDataModel.getProperty("/ShipToAddress/CityName"),
                        "STATE": ShipNowDataModel.getProperty("/ShipToAddress/Region"),
                        "ZIPCODE":ShipNowDataModel.getProperty("/ShipToAddress/PostalCode"),
                        "COUNTRY": ShipNowDataModel.getProperty("/ShipToAddress/Country"),
                        "PHONE": ShipNowDataModel.getProperty("/ShipToAddress/PhoneNumber"),
                        "EMAIL": ShipNowDataModel.getProperty("/ShipToAddress/EMAIL"),
                    },
                    "CarrierDetails": {
                        // "Carrier": carrier,
                        // "ServiceName": idServiceName.getSelectedItem().getText(),
                        // "PaymentType": eshipjetModel.getProperty("/CarrierDetails/PaymentType"),
                        // "ShippingAccount":accountNumber,
                        // "UserId": id,
                        // "Password": password,
                        "Carrier": "FedEx",
                        "ServiceName": "FEDEX_GROUND",
                        "PaymentType": "Sender",
                        "ShippingAccount": "740561073",
                        "UserId": "l70c717f3eaf284dc9af42169e93874b6e",
                        "Password": "7f271bf486084e8f8073945bb7e6a020"
                    }
                };
        
                $.ajax({
                    url: "https://drivemedical-carrier-api-v1.eshipjet.site/AddressValidation",
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(oPayload),
                    success: function(oResponse) {
                        console.log("API Success:", oResponse);
                         // Get the existing model or create one
                            var oModel = that.getView().getModel("ShipNowDataModel");
                            if (!oModel) {
                                oModel = new sap.ui.model.json.JSONModel();
                                that.getView().setModel(oModel, "ShipNowDataModel");
                            }
                            // Set the VerifiedAddress part of the model
                            oModel.setProperty("/VerifiedAddress", oResponse.VerifiedAddress);
                           // COMPANY
                            var oEnterCompany = oController.byId("idEnteredCOMPANY");
                            var EnterCompany = oEnterCompany.getText();

                            var oVerifiedCompany = oController.byId("idVerifiedCOMPANY");
                            var VerifiedCompany = oVerifiedCompany.getText();

                            oEnterCompany.removeStyleClass("mismatch");
                            oVerifiedCompany.removeStyleClass("mismatch");
                            oEnterCompany.removeStyleClass("normal");
                            oVerifiedCompany.removeStyleClass("normal");

                            if (EnterCompany === VerifiedCompany) {
                                oEnterCompany.addStyleClass("normal");
                                oVerifiedCompany.addStyleClass("normal");
                            } else {
                                oEnterCompany.addStyleClass("mismatch");
                                oVerifiedCompany.addStyleClass("mismatch");
                            }

                            // STREET
                            var oEnterStreet = oController.byId("idEnteredStreet");
                            var EnterStreet = oEnterStreet.getText();

                            var oVerifiedStreet = oController.byId("idVerifiedStreet");
                            var VerifiedStreet = oVerifiedStreet.getText();

                            oEnterStreet.removeStyleClass("mismatch");
                            oVerifiedStreet.removeStyleClass("mismatch");
                            oEnterStreet.removeStyleClass("normal");
                            oVerifiedStreet.removeStyleClass("normal");

                            if (EnterStreet === VerifiedStreet) {
                                oEnterStreet.addStyleClass("normal");
                                oVerifiedStreet.addStyleClass("normal");
                            } else {
                                oEnterStreet.addStyleClass("mismatch");
                                oVerifiedStreet.addStyleClass("mismatch");
                            }

                            // CITY
                            var oEnterCity = oController.byId("idEnteredCity");
                            var EnterCity = oEnterCity.getText();

                            var oVerifiedCity = oController.byId("idVerifiedCity");
                            var VerifiedCity = oVerifiedCity.getText();

                            oEnterCity.removeStyleClass("mismatch");
                            oVerifiedCity.removeStyleClass("mismatch");
                            oEnterCity.removeStyleClass("normal");
                            oVerifiedCity.removeStyleClass("normal");

                            if (EnterCity === VerifiedCity) {
                                oEnterCity.addStyleClass("normal");
                                oVerifiedCity.addStyleClass("normal");
                            } else {
                                oEnterCity.addStyleClass("mismatch");
                                oVerifiedCity.addStyleClass("mismatch");
                            }

                            
                    },
                    error: function(err) {
                        sap.m.MessageToast.show("Address validation failed.");
                    }
                });
            };
            // var oModel = this.getView().getModel("ShipNowDataModel");

            // var oEntered = oModel.getProperty("/ShipToAddress");
            // var oVerified = oModel.getProperty("/VerifiedAddress");
            
            // oModel.setProperty("/UI/IsDifferentCompany", oEntered?.BusinessPartnerName1 !== oVerified?.COMPANY);
            // oModel.setProperty("/UI/IsDifferentStreet", oEntered?.StreetName !== oVerified?.ADDRESS_LINE1);
            // oModel.setProperty("/UI/IsDifferentCity", oEntered?.CityName !== oVerified?.CITY);
            

        
            if (!this.byId("addressVerificationDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.SpecialOptions.ValidateAddressDialog",
                    controller: this
                }).then(function(oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                    fnCallAddressValidationAPI(); // Call API after dialog opens
                });
            } else {
                this.byId("addressVerificationDialog").open();
                fnCallAddressValidationAPI(); // Call API immediately
            }
        },
        onCloseValidateAddressDialog: function() {
            this.byId("addressVerificationDialog").close();
        },

        onUpdateValidateAddressDialog: function () {
            var oModel = this.getView().getModel("ShipNowDataModel");
            var oVerified = oModel.getProperty("/VerifiedAddress");
        
            if (oVerified) {
                oModel.setProperty("/ShipToAddress/BusinessPartnerName1", oVerified.COMPANY || "");
                oModel.setProperty("/ShipToAddress/StreetName", oVerified.ADDRESS_LINE1 || "");
                oModel.setProperty("/ShipToAddress/CityName", oVerified.CITY || "");
        
                sap.m.MessageToast.show("Ship To Address updated from verified address.");
                this.onCloseValidateAddressDialog();
            } else {
                sap.m.MessageToast.show("Verified address not found.");
            }
        },


        getManifestHeaderForScanShip:function(){
            oController.onOpenBusyDialog();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var sDeveliveryNumber = eshipjetModel.getProperty("/sShipAndScan");
            var ManifestSrvModel = oController.getOwnerComponent().getModel("ManifestSrvModel");
            var aFilters = [
                new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sDeveliveryNumber)
            ];

            ManifestSrvModel.read("/EshipjetManfestSet",{
                filters: aFilters,
                success:function(response){
                    // var Labelurls = []
                    // response.results.forEach(function(item, idx){
                    //     Labelurls.push({"Labelurl" : item.Labelurl});
                    // });
                    // response.results[0]["Labelurl"] = Labelurls;
                    eshipjetModel.setProperty("/scanShipTableData2", response.results);
                    eshipjetModel.setProperty("/sShipAndScan", "");
                    oController.onCloseBusyDialog();
                },
                error: function(error){
                    MessageBox.warning(error.responseText);
                    oController.onCloseBusyDialog();
                }
            });
        },

        onScanShipViewPressBackToShipNow:function(oEvent){
            var oCurrentObj = oEvent.getSource().getBindingContext("eshipjetModel").getObject();
            var sKey = "ShipNow";      
            eshipjetModel.setProperty("/commonValues/sapDeliveryNumber",""); //80000001
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(false);
            eshipjetModel.setProperty("/shippingCharges",[]);
            eshipjetModel.setProperty("/shippingDocuments",[]);
            eshipjetModel.setProperty("/HandlingUnitItems",[]);
            eshipjetModel.setProperty("/HandlingUnits",[]);
            eshipjetModel.setProperty("/shippingDocuments",[]);
            eshipjetModel.setProperty("/commonValues/toolPageHeader", false);
            eshipjetModel.setProperty("/commonValues/allViewsFooter", false);
            eshipjetModel.setProperty("/commonValues/shipNowViewFooter", true);
            eshipjetModel.setProperty("/commonValues/createShipReqViewFooter", false);
            eshipjetModel.setProperty("/commonValues/routingGuidFooter", false);
            eshipjetModel.setProperty("/showDarkThemeSwitch", false);
            eshipjetModel.setProperty("/commonValues/darkTheme", false);
            document.body.classList.remove("dark-theme");
            eshipjetModel.setProperty("/commonValues/shipNowGetBtn", true);
            oController.onPackSectionEmptyRows();

            eshipjetModel.setProperty("/SideNavigation", false);
            this.byId("pageContainer").to(this.getView().createId(sKey));


            var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
            var shipFromObj = {
                "ShipFromCONTACT": oCurrentObj.FromContact,
                "ShipFromCOMPANY": oCurrentObj.FromCompany,
                "ShipFromPHONE": oCurrentObj.FromPhone,
                "ShipFromEMAIL": oCurrentObj.Emailaddress,
                "ShipFromCITY": oCurrentObj.Fromcity,
                "ShipFromSTATE": oCurrentObj.FromRegion,
                "ShipFromCOUNTRY": oCurrentObj.FromCountry,
                "ShipFromZIPCODE": oCurrentObj.FromPostalcode,
                "ShipFromADDRESS_LINE1": oCurrentObj.FromStreet,
                "ShipFromADDRESS_LINE2": oCurrentObj.FromStreet2,
                "ShipFromADDRESS_LINE3": ""
            };
            var shipToObj = {
                "FullName": oCurrentObj.RecContact,
                "BusinessPartnerName1": oCurrentObj.RecCompany,
                "PhoneNumber": oCurrentObj.RecPhone,
                "EMAIL": oCurrentObj.Emailaddress,
                "CityName": oCurrentObj.RecCity,
                "Region": oCurrentObj.RecRegion,
                "Country": oCurrentObj.RecCountry,
                "PostalCode": oCurrentObj.RecPostalcode,
                "StreetName": oCurrentObj.RecAddress1,
                "HouseNumber": oCurrentObj.RecAddress2,
                "ShipFromADDRESS_LINE3": ""
            };
            ShipNowDataModel.setProperty("/ShipFromAddress", shipFromObj);
            ShipNowDataModel.setProperty("/ShipToAddress", shipToObj);

            eshipjetModel.setProperty("/commonValues/ShipNowShipMethodSelectedKey", oCurrentObj.Carriertype);
            eshipjetModel.setProperty("/commonValues/ShipNowShipsrvNameSelectedKey", oCurrentObj.CarrierDesc);
            eshipjetModel.setProperty("/accountNumber", oCurrentObj.Accountnumber);
        }
        
        
        
        
    });
});
