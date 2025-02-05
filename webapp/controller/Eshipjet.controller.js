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
        oController, oResourceBundle;
    const SortOrder = CoreLibrary.SortOrder;

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
        },

        _handleRouteMatched:function(){
            var oEshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            oEshipjetModel.setProperty("/pickupDate", new Date());
            // first parameter is font name, second parameter is collection name, third parameter is font-family and the last parameter is the code point in Unicode
            
        },

        onItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var sKey = oItem.getKey();
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            eshipjetModel.setSizeLimit(9999999);
            eshipjetModel.setProperty("/sapDeliveryNumber",""); //80000001
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(false);
            eshipjetModel.setProperty("/shippingCharges",[]);
            eshipjetModel.setProperty("/shippingDocuments",[]);
            eshipjetModel.setProperty("/HandlingUnitItems",[]);
            eshipjetModel.setProperty("/HandlingUnits",[]);
            eshipjetModel.setProperty("/shippingDocuments",[]);
            if (sKey === "ShipperCopilot") {
                var obj = {
                    "messages": [],
                    "listState": false,
                    "iconState": true
                }
                const oShipperCopilotModel = new JSONModel(obj);
                this.getView().setModel(oShipperCopilotModel, "ShipperCopilotModel");
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", true);
                eshipjetModel.setProperty("/darkTheme", true);
                document.body.classList.remove("dark-theme");
            } else if (sKey === "ScanShip") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", true);
                eshipjetModel.setProperty("/darkTheme", true);
                document.body.classList.remove("dark-theme");
                this._handleDisplayScanShipTable();
            } else if (sKey === "Orders") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
                document.body.classList.remove("dark-theme");
                // this._handleDisplayOrdersTable();
            } else if (sKey === "ShipRequestLabel") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
                document.body.classList.remove("dark-theme");
                // this._handleDisplayShipReqTable();
            } else if (sKey === "ShipNow") {
                var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
                ShipNowDataModel.setProperty("/ShipFromAddress", "");
                ShipNowDataModel.setProperty("/ShipToAddress", "");
                eshipjetModel.setProperty("/allViewsFooter", false);
                eshipjetModel.setProperty("/shipNowViewFooter", true);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
                document.body.classList.remove("dark-theme");
                var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
                ShipNowDataModel.setProperty("/ShipFromAddress", "");
                ShipNowDataModel.setProperty("/ShipToAddress", "");
                // this._handleDisplayShipNowProductsTable();
                // this._handleDisplayShipNowHandlingUnitTable();
            } else if (sKey === "QuoteNow") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", true);
                eshipjetModel.setProperty("/darkTheme", true);
                document.body.classList.remove("dark-theme");
            } else if (sKey === "TrackNow") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
                document.body.classList.remove("dark-theme");
                this._handleDisplayTrackNowTable();
            } else if (sKey === "Manifest") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
                document.body.classList.remove("dark-theme");
                this._handleDisplayManifestTable();
            } else if (sKey === "AESDirect") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
                document.body.classList.remove("dark-theme");
            } else if (sKey === "Dashboard") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
                document.body.classList.remove("dark-theme");
            } else if (sKey === "Reports") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
                document.body.classList.remove("dark-theme");
            } else if (sKey === "BatchShip") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
                document.body.classList.remove("dark-theme");
                this._handleDisplayBatchShipTable();
            } else if (sKey === "RoutingGuide") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
                document.body.classList.remove("dark-theme");
                // this._handleDisplayRoutingGuideTable();
            } else if (sKey === "FeightAuditAnalysis") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
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
                    // sLabel = aLabel[0].encodedLabel;
                    // var dataUrl = "data:image/png;base64," + sLabel;
                    sLabel = aLabel[0].docName;
                    var dataUrl = "https://eshipjetsatge.blob.core.windows.net/shipping-labels/" + sLabel
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
            var that = this;
            var obj = {
                "message": sMessage // Match DeliveryNo in the message if needed
            }
            var sPath = "https://eshipjet-demo-srv-hvacbxf0fqapdpgd.francecentral-01.azurewebsites.net/copilot/v1/bot/process";

            const oShipperCopilotModel = this.getView().getModel("ShipperCopilotModel");
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

        onShipNowClosePress:function(){
            var sKey = "Dashboard";
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            eshipjetModel.setSizeLimit(9999999);
            eshipjetModel.setProperty("/sapDeliveryNumber",""); //80000001
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(false);
            eshipjetModel.setProperty("/shippingCharges",[]);
            eshipjetModel.setProperty("/shippingDocuments",[]);
            eshipjetModel.setProperty("/HandlingUnitItems",[]);
            eshipjetModel.setProperty("/HandlingUnits",[]);
            eshipjetModel.setProperty("/shippingDocuments",[]);
            if (sKey === "Dashboard") {
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
                document.body.classList.remove("dark-theme");
            }
            eshipjetModel.setProperty("/SideNavigation", false);
            this.byId("pageContainer").to(this.getView().createId(sKey));
        },


        onShipNowPress: function () {
            var that = this;
            BusyIndicator.show();
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            var oShipNowDataModel = this.getOwnerComponent().getModel("ShipNowDataModel");
            var sapDeliveryNumber = eshipjetModel.getProperty("/sapDeliveryNumber");
            var DocumentNumber = eshipjetModel.getProperty("/HeaderInfo/DocumentNumber");
            var ShipDate =  eshipjetModel.getProperty("/HeaderInfo/ShipDate");
            var ShipFromCONTACT = eshipjetModel.getProperty("/ShipFrom/CONTACT");
            var ShipFromADDRESS_LINE1 = eshipjetModel.getProperty("/ShipFrom/ADDRESS_LINE1");            
           
            var ShipFromLocationType = eshipjetModel.getData().ShipFrom.LocationType;
          
            var ShipToLocationType = eshipjetModel.getData().ShipTo.LocationType;
            var PackagesQuantity = eshipjetModel.getData().Packages.Quantity;
            var Dimension = eshipjetModel.getData().Packages.Dimension;
            var Weight = eshipjetModel.getData().Packages.Weight;
            var ShipToLocationType = eshipjetModel.getData().Packages.LocationType;
                        
            var obj = {
                "HeaderInfo": {
                    "BillOfLading" : sapDeliveryNumber,
                    "FeederSystem": "Ship Request / Label",
                    "DocumentType": "Delivery Number",
                    "ShipDate": "2025-01-03T11:41:20.053Z",
                    "CreatedDate": "2025-01-03T11:40:30.619Z",
                    "DocumentNumber": "DN000004115",
                    "Location": "1001",
                    "ShipmentType": "Business",
                    "Status": "Open",
                    "requester": "",
                    "category": "P1",
                    "Requester": "Myself",
                    "IsDutiable": false,
                    "CreatedUser": "info@eshipjet.ai",
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
                "CarrierDetails": {
                    "Carrier": "FedEx",
                    "ShippingAccount": "740561073",
                    "PaymentType": "Sender",
                    "BillingAccount": "",
                    "BillingCountry": "",
                    "BillingZipCode": "",
                    "Note": "",
                    "Reference1": "",
                    "Reference2": "",
                    "Reference3": "",
                    "Reference4": "",
                    "ServiceName": "FEDEX_2_DAY",
                    "costCenter": "",
                    "PoNo": "",
                    "InvoiceNo": "",
                    "CarrierType": "Parcel",
                    "UserId": "l70c717f3eaf284dc9af42169e93874b6e",
                    "Password": "7f271bf486084e8f8073945bb7e6a020",
                    "AccessKey": "",
                    "ConnectionType": "API",
                    "CostCenterName": "Cost Center 2",
                    "ShipURL": "",
                    "TrackURL": "",
                    "RateURL": "",
                    "ShipToCountry": "",
                    "VoidURL": "",
                    "ShipfromCountry": "",
                    "ERPCarrierID": "FedEx",
                    "LocationId": "1001",
                    "MeterId": ""
                },
                "ShipFrom": {
                    "COMPANY": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCOMPANY"),
                    "CONTACT": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCONTACT"),
                    "ADDRESS_LINE1": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE1"),
                    "ADDRESS_LINE2": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE2"),
                    "ADDRESS_LINE3": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE3"),
                    "CITY": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCITY"),
                    "STATE": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromSTATE"),
                    "ZIPCODE": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromZIPCODE"),
                    "COUNTRY": "US",//oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCOUNTRY"),
                    "PHONE": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromPHONE"),
                    "EMAIL":  oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromEMAIL"),
                    "AddressType": "",
                    "TAXID": "",
                    "VAT": "",
                    "EORI": "",
                    "LocationType": ""
                },
                "ShipTo": {
                    "CreatedUser": "info@eshipjet.ai",
                    "UpdatedUser": "info@eshipjet.ai",
                    "CreatedDate": "2024-11-26T00:14:05.385Z",
                    "UpdatedDate": "2024-11-26T00:14:05.385Z",
                    "emailPriority": "Low",
                    "IsActive": true,
                    "RFIDTag": false,
                    "CONTACT": oShipNowDataModel.getProperty("/ShipToAddress/FullName"),
                    "COMPANY": oShipNowDataModel.getProperty("/ShipToAddress/BusinessPartnerName1"),
                    "PHONE": oShipNowDataModel.getProperty("/ShipToAddress/PhoneNumber"),
                    "EMAIL": "steve@nvidia.com",
                    "ADDRESS_LINE1": oShipNowDataModel.getProperty("/ShipToAddress/StreetName"),
                    "ADDRESS_LINE2": oShipNowDataModel.getProperty("/ShipToAddress/HouseNumber"),
                    "CITY": oShipNowDataModel.getProperty("/ShipToAddress/CityName"),
                    "STATE": oShipNowDataModel.getProperty("/ShipToAddress/Region"),
                    "ZIPCODE":  oShipNowDataModel.getProperty("/ShipToAddress/PostalCode"),
                    "COUNTRY": oShipNowDataModel.getProperty("/ShipToAddress/Country"),
                    "AddressCategory": "Shipping Address",
                    "AddressType": "Residential",
                    "id": 87,
                    "TAXID": "",
                    "VAT": "",
                    "EORI": "",
                    "LocationType": ""
                },
                "InternationalDetails": {
                    "ItemInfo": [
                        {
                            "HU": 12813,
                            "ItemNo": "P8001",
                            "ProductNo": "P8001",
                            "Description": "Calculators",
                            "IsDG": "",
                            "UnitCost": "13.5",
                            "UnitWeight": "12.3",
                            "HTSCode": "980012",
                            "ECCN": "ECCN",
                            "UN": "",
                            "Class": "50",
                            "NMFC": "",
                            "Category": "",
                            "IsSerial": "",
                            "IsBatch": "",
                            "IsStackable": "",
                            "IsActive": true,
                            "LocationId": "",
                            "id": 1,
                            "Sno": 1,
                            "Quantity": "4",
                            "Partial": 4,
                            "Balance": "",
                            "UOM": "LB",
                            "Harmonized": "980012",
                            "LicenseNo": "12345",
                            "CountryofMFR": "US",
                            "Currency": "USD"
                        }
                    ],
                    "TermsofShipment": "DDU",
                    "dutiesAccountnumber": "",
                    "B13AFilingOption": "",
                    "Permitnumber": "",
                    "ITN": "",
                    "iNTDutiesTaxes": "RECIPIENT",
                    "PayorZipCode": "",
                    "ITNXTNSEDEEI": "",
                    "ATLASMRN": "",
                    "IncoTermLocation": "",
                    "CustomDecValCurrency": "",
                    "DutiesAccount": "",
                    "payorCountryCode": "",
                    "ShipFromTax": "",
                    "bookingConfirmnumber": "",
                    "ShipToTax": "",
                    "ReasonforExport": "SOLD",
                    "FreightForwarderTax": "",
                    "Permit": "",
                    "CustomDecVal": "54.000",
                    "compliStatement": "",
                    "documentsContentType": "",
                    "InvoiceNumber": "DN000004303"
                },
                "Packages": [
                    {
                        "ItemsInfo": [
                            {
                                "ItemNo": "P8001",
                                "ProductNo": "P8001",
                                "Description": "Calculators",
                                "IsDG": false,
                                "UnitCost": "13.5",
                                "UnitWeight": "12.3",
                                "Dimension": "5X3X2",
                                "HTSCode": "980012",
                                "ECCN": "ECCN",
                                "UN": "",
                                "Class": "50",
                                "NMFC": "",
                                "Category": "",
                                "IsSerial": null,
                                "IsBatch": null,
                                "IsStackable": null,
                                "IsActive": true,
                                "LocationId": "",
                                "id": 17,
                                "Sno": 1,
                                "Quantity": "4",
                                "Partial": "4",
                                "Balance": 0,
                                "CountryofMFR": "US",
                                "Currency": "USD",
                                "LicenseNo": "12345",
                                "UOM": "LB"
                            }
                        ],
                        "SpecialServices": {
                        },
                        "Weightunits": "LB",
                        "DimensionUnits": "",
                        "Sno": 1,
                        "HU": 12357,
                        "Weight": "49.20",
                        "Dimension": "5X3X2",
                        "PackageSpecialServiceTyeps": [
                        ]
                    }
                ],
                "Shipper": {
                    "COMPANY": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCOMPANY"),
                    "CONTACT": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCONTACT"),
                    "ADDRESS_LINE1": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE1"),
                    "ADDRESS_LINE2": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE2"),
                    "ADDRESS_LINE3": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromADDRESS_LINE3"),
                    "CITY": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCITY"),
                    "STATE": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromSTATE"),
                    "ZIPCODE": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromZIPCODE"),
                    "COUNTRY": "US",//oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromCOUNTRY"),
                    "PHONE": oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromPHONE"),
                    "EMAIL":  oShipNowDataModel.getProperty("/ShipFromAddress/ShipFromEMAIL"),
                    "TAXID": "",
                    "VAT": "",
                    "EORI": "",
                    "LocationType": ""
                },
                "SoldTo": {
                    "COMPANY": "Nvidia",
                    "CONTACT": "Steve",
                    "ADDRESS_LINE1": "6621 Betlam St",
                    "ADDRESS_LINE2": "Betlam",
                    "CITY": "Fremont",
                    "STATE": "CA",
                    "ZIPCODE": "94538",
                    "COUNTRY": "US",
                    "PHONE": "9999999999",
                    "EMAIL": "steve@nvidia.com",
                    "TAXID": "",
                    "VAT": "",
                    "EORI": "",
                    "LocationType": ""
                },
                "ShipmentLevelServices": {
                },
                "CompanyId": "CP000000001",
                "id": 4115
            };

            //var sPath = "https://eshipjet-demo-srv-hvacbxf0fqapdpgd.francecentral-01.azurewebsites.net/copilot/v1/bot/process";
           // var sPath = "https://eshipjet-stg-scpn-byargfehdgdtf8f3.francecentral-01.azurewebsites.net/dhl";
            var sPath = "https://eshipjet-stg-scpn-byargfehdgdtf8f3.francecentral-01.azurewebsites.net/FedEx";
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: sPath,
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(obj),
                    success: function (response) {
                        resolve(response);
                        console.log("Success:", response);
                        if(response && response.status === "Success"){
                            sap.m.MessageBox.success("Shipment processed successfully");
                            if(response && response.shippingCharges && response.shippingCharges.length > 0 ){
                                eshipjetModel.setProperty("/shippingCharges", response.shippingCharges);
                            }
                            if(response && response.shippingDocuments && response.shippingDocuments.length > 0 ){
                                eshipjetModel.setProperty("/shippingDocuments", response.shippingDocuments);
                            }
                            //post to manifest service
                            // oController.getManifestData(response);
                            oController.ApiOutboundDeliverySrvData(response);
                            oController.FreightQuoteUpdatedSrvData();
                        }else if(response && response.status === "Error"){
                            var sError = "Shipment process failed reasons:\n";
                            if(response && response.Errors && response.Errors.length > 0){
                                response.Errors.forEach(function(item){
                                    sError = sError + item+"\n";
                                });                               
                            }
                            sap.m.MessageBox.error(sError);
                        }                       
                        BusyIndicator.hide();
                    },
                    error: function (error) {
                        reject(error);
                        console.log("Error:", error);
                        BusyIndicator.hide();
                    }
                });
            });
        },


        getManifestData:function(response){
            var ManifestSrvModel = oController.getOwnerComponent().getModel("ManifestSrvModel");
            // ManifestSrvModel.read("/EshipjetManfestSet", {
            //     success:function(oSuc){

            //     },
            //     error:function(oErr){

            //     }
            // })


            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"); 
            var sDeveliveryNumber = eshipjetModel.getProperty("/sapDeliveryNumber");

            var plant = response.ShipTo.COMPANY.split(" ")[1]
            var ShipDate = `/Date(${new Date(response.HeaderInfo.ShipDate).getTime()})/`
            var Createddate = `/Date(${new Date(response.HeaderInfo.CreatedDate).getTime()})/`

            var hours = 2;
            var minutes = 30;
            var seconds = 45;
            var TimeAdded = `PT${String(hours).padStart(2, '0')}H${String(minutes).padStart(2, '0')}M${String(seconds).padStart(2, '0')}S`;

            var Residentialdel;
            if(response.ShipTo === "Residential"){
                Residentialdel = true;
            }else{
                Residentialdel = false;
            }

            var obj = 
            {
                "Vbeln": "80000001",
                "Posnr": "000010",
                "Plant": "1710",
                "TimeAdded": "PT00H00M00S",
                "Pkgcount": "00001",
                "Totalpkg": "00001",
                "HandlingUnit": "1",
                "SalesOrder": "34455",
                "PurchaseOrder": "233",
                "TrackingNumber": "890000890",
                "Mastertracking": "890000890",
                "PackageWeight": "10.000",
                "Chargweight": "10.000",
                "CarrierCode": "FEDEX",
                "Carriertype": "FEDEX",
                "CarrierDesc": "FEDEX",
                "Paymentcode": "SENDER",
                "Shipperacct": "4577788",
                "Dimensions": "10X10X19",
                "Codamount": "100.000",
                "Freightamt": "40.000",
                "Discountamt": "40.000",
                "Saturdaydel": false,
                "Residentialdel": false,
                "Priorityalert": false,
                "Satpickup": false,
                "Insidedel": false,
                "Insidepickup": false,
                "Liftgate": false,
                "Hold": false,
                "Dghazmat": false,
                "CancDt": null,
                "CancTim": "PT00H00M00S",
                "PodDate": null,
                "PodTime": "PT00H00M00S",
                "PodCurrentdate": null,
                "PodCurrenttime": "PT00H00M00S",
                "PodPickupdate": null,
                "PodPickuptime": "PT00H00M00S",
                "CodFlag": false,
                "Closeout": false,
                "ExpDelDate": null,
                "Upsoffline": false,
                "ArrivalNotification": false,
                "Bsoflag": false,
                "Documents": false,
                "LimitedAccess": false,
                "Fedexonerate": false,
                "Tpc": false,
                "Scandate": null,
                "Scantime": "PT00H00M00S",
                "EtaDate": null,
                "EtaTime": "PT00H00M00S",
                "Crossdock": false,
                "CrossdockRecdate": null,
                "CrossdockRectime": "PT00H00M00S",
                "CrossdockShipdate": null,
                "CrossdockShiptime": "PT00H00M00S",
                "Ddo": false,
                "Isc": false,
                "WecloseDate": null,
                "WecloseTime": "PT00H00M00S",
                "Appointment": false,
            };

            ManifestSrvModel.create("/EshipjetManfestSet", obj, {
                success:function(oRes){

                },
                error(oErr){

                }
            });
        },

        onShipNowGetPress: async function () {
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"); 
            var sDeveliveryNumber = eshipjetModel.getProperty("/sapDeliveryNumber");
            oController.oBusyDialog = new sap.m.BusyDialog({});     
            let myPromise = new Promise(function(myResolve, myReject) {
                oController.shipNowData(sDeveliveryNumber, "ShipNow", myResolve);                                                    
            });           
            myPromise.then(
                function(value) {
                    //resolved
                },
                function(error) {
                   // myDisplayer(error);
                }
            );
        },
        shipNowData:function(sDeveliveryNumber ,sFromMenu, myResolve){
            var oDeliveryModel = oController.getView().getModel("OutBoundDeliveryModel");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");           
            var oHandlingUnitModel = oController.getView().getModel("HandlingUnitModel");           
            var sPath = "/A_OutbDeliveryHeader('"+ sDeveliveryNumber +"')/to_DeliveryDocumentPartner";
            if(sDeveliveryNumber && sDeveliveryNumber.length >= 8){
                oController.oBusyDialog.open();

                var path = "/A_OutbDeliveryHeader('"+ sDeveliveryNumber +"')"
                oDeliveryModel.read(path,{
                    urlParameters: {
                        "$expand": "to_DeliveryDocumentItem,to_DeliveryDocumentPartner"
                    },
                    success:function(oData){
                        oController.etag = oData.__metadata.etag;
                        oController.oBusyDialog.close();
                    },
                    error: function(oErr){
                        oController.oBusyDialog.close();
                    }
                });

                oController.oBusyDialog.open();
                oDeliveryModel.read(sPath,{
                    // urlParameters: {
                    //     "$expand": "to_DeliveryDocumentItem,to_DeliveryDocumentPartner"
                    // },
                    success:function(oData){
                        oController.oBusyDialog.close();
                        if(oData){                      
                            oController._getShipToAddress(oData.results, sDeveliveryNumber, sFromMenu);
                        }
                        myResolve();
                    },
                    error: function(oErr){
                        oController.oBusyDialog.close();
                        var err = oErr;
                        myResolve();
                    }
                });
                var oFilter, aHandlingUnits = [];
                oFilter = [];
                oFilter.push(new Filter("HandlingUnitReferenceDocument", "EQ", sDeveliveryNumber));
                oHandlingUnitModel.read("/HandlingUnit",{
                    filters: oFilter,
                    success:function(oData){
                        oController.oBusyDialog.close();
                        if(oData && oData.results && oData.results.length > 0){
                            for(var i = 0; i < oData.results.length; i++){
                                oData.results[i]["SerialNumber"] = i + 1;
                                aHandlingUnits.push(oData.results[i]);
                            }
                            eshipjetModel.setProperty("/HandlingUnits", aHandlingUnits);
                            oController.getHandlingUnit(aHandlingUnits);
                        }
                    },
                    error: function(oErr){
                        var err = oErr;
                        oController.oBusyDialog.close();
                    }
                });
                var aOutBoundDelveryFilter = [], aProductTable = [];
                aOutBoundDelveryFilter.push(new Filter("DeliveryDocument", "EQ", sDeveliveryNumber));
                oDeliveryModel.read("/A_OutbDeliveryItem",{
                    filters: aOutBoundDelveryFilter,
                    success:function(oData){
                        oController.oBusyDialog.close();
                        if(oData && oData.results && oData.results.length > 0){
                            for(var i = 0; i < oData.results.length; i++){
                                oData.results[i]["SerialNumber"] = i+1;
                                aProductTable.push(oData.results[i]);
                            }
                            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
                            eshipjetModel.setProperty("/pickAddProductTable",aProductTable);
                            oController.getSalesOrder(aProductTable);
                        }
                    },
                    error: function(oErr){
                        var err = oErr;
                        oController.oBusyDialog.close();
                    }
                });            
            }
        },
        getHandlingUnit:function(aHanlingUnits){
            var that = this;
            var oView = oController.getView();
            var oHandlingUnitModel = this.getView().getModel("HandlingUnitModel");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var sPath = "", aFilters = [] ;
            for (var i = 0; i < aHanlingUnits.length; i++) {               
                aFilters.push(new Filter("HandlingUnitReferenceDocument", "EQ", aHanlingUnits[i].HandlingUnitReferenceDocument));              
            }
            oHandlingUnitModel.read("/HandlingUnitItem",{
                filters: aFilters,
                success:function(oData){
                    oController.oBusyDialog.close();
                    if(oData && oData.results && oData.results.length > 0){
                        var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
                        eshipjetModel.setProperty("/HandlingUnitItems",oData.results);
                        var oShipNowHandlingUnitTable = oView.byId("idShipNowHandlingUnitTable");
                        if(oShipNowHandlingUnitTable){
                            oShipNowHandlingUnitTable.setModel(eshipjetModel);
                            oShipNowHandlingUnitTable.bindRows("/HandlingUnitItems");
                        }
                    }
                },
                error: function(oErr){
                    var err = oErr;
                    oController.oBusyDialog.close();
                }
            });
        },
        getSalesOrder:function(aProductTable){
            var oSalesOrderModel = oController.getOwnerComponent().getModel("SalesOrderModel");
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var sPath = "", aFilters = [] ;
            for (var i = 0; i < aProductTable.length; i++) {               
                aFilters.push(new Filter("SalesOrder", "EQ", aProductTable[i].ReferenceSDDocument));              
            }
            oSalesOrderModel.read("/A_SalesOrderItem",{
                filters: aFilters,
                success:function(oData){
                    oController.oBusyDialog.close();
                    if(oData && oData.results && oData.results.length > 0){
                        eshipjetModel.setProperty("/SalesOrderItems",oData.results);
                    }
                },
                error: function(oErr){
                    var err = oErr;
                    oController.oBusyDialog.close();
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
                                    currentValue.data["PartnerType"]  = "ShipFrom";
                                }else if(index == 1){
                                    currentValue.data["PartnerType"]  = "Shipper";
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
                                "ShipFromCOUNTRY": "United States",
                                "ShipFromZIPCODE": "75024",
                                "ShipFromADDRESS_LINE1": "5717 Legacy",
                                "ShipFromADDRESS_LINE2": "Suite 250",
                                "ShipFromADDRESS_LINE3": ""
                            };
                            oShipNowModel.setProperty("/ShipFromAddress",Obj);
                            oShipNowModel.setProperty("/ShipToAddress",aBusinessPartnerTable[1]);
                            eshipjetModel.setProperty("/BusinessPartners",aBusinessPartnerTable);
                            eshipjetModel.setProperty("/InternationalDetails/shipFromTaxNo",aBusinessPartnerTable[0].TaxJurisdiction);
                            oShipNowModel.updateBindings(true);
                            eshipjetModel.updateBindings(true);
                        }
                    resolve();             
                }, error: function(oErr){
                    resolve();
                    oController.oBusyDialog.close();
                    console.log(oErr);
                }});                
            });  
            Promise.all([promise1]).then((values) => {
                if(sFromMenu === "ScanAndShip"){
                    oController.onShipNowPress();
                }    
            });            
        },
        onShipNowCodEditPress:function(){
            var oView = this.getView();
            if (!this.byId("idCodEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.CodEditDialog",
                    controller: this // Pass the controller for binding
                }).then(function (oCodEditDialog) {
                    oView.addDependent(oCodEditDialog);
                    oCodEditDialog.open();
                });
            } else {
                this.byId("idCodEditDialog").open(); // Open existing dialog
            }

            
        },

        onCodEditDialogCancelPress: function () {
            this.byId("idCodEditDialog").close();
        },

        onBrokerSelectEditPress: function () {
            var oView = this.getView();
            if (!this.byId("idBrokerSelectEditDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.BrokerSelectEditDialog",
                    controller: this // Pass the controller for binding
                }).then(function (oBrokerSelectEditDialog) {
                    oView.addDependent(oBrokerSelectEditDialog);
                    oBrokerSelectEditDialog.open();
                });
            } else {
                this.byId("idBrokerSelectEditDialog").open(); // Open existing dialog
            }
        },

        onBrokerSelectEditDialogClosePress: function () {
            this.byId("idBrokerSelectEditDialog").close();
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
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            const oTable = oView.byId("idShipNowProductTable");
            oTable.setModel(eshipjetModel);
            var ShipNowProductsTableColumns = eshipjetModel.getData().ShipNowProductsTableColumns;
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
                            that.handleDownArrowPress(oEvent);
                        }
                    });
                    var Btn2 = new sap.m.Button({
                        icon: "sap-icon://delete", type: "Transparent",
                        press: function (oEvent) {
                            that.handleDownArrowPress(oEvent);
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
            var ShipNowHandlingUnitTableColumns = eshipjetModel.getData().ShipNowHandlingUnitTableColumns;
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
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
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
            var oView = this.getView()
            var oShipNowHandlingUnitTable = oView.byId("myShipNowHandlingUnitColumnSelectId");
            var eshipjetModel = oView.getModel("eshipjetModel");
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
            var aFilters = [];
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
            var that = this;
            const oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel"), columnName, label, oTemplate, oHboxControl;
            var scanShipTableData = eshipjetModel.getData().scanShipTableData;
            var ScanShipTableDataModel = new JSONModel(scanShipTableData);
            oController.getOwnerComponent().setModel(ScanShipTableDataModel, "ScanShipTableDataModel");
            var oTable = oView.byId("idScanAndShipTable");
            
            var ScanShipTableDataModel = oController.getOwnerComponent().getModel("ScanShipTableDataModel");
            oTable.setModel(ScanShipTableDataModel);
            var columns = ScanShipTableDataModel.getData().columns;
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
            var oScanTableModel = oController.getOwnerComponent().getModel("eshipjetModel");
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
            this._handleDisplayScanShipTable();
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
            BusyIndicator.show();
            var eShipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            const sUserMessage = eShipjetModel.getProperty("/sShipAndScan");
            if (!sUserMessage) {
                MessageToast.show("Please Enter Request ID.");
                BusyIndicator.hide();
                return;
            }
             let myPromise = new Promise(function(myResolve, myReject) {
                // "Producing Code" (May take some time)
                oController.shipNowData(sUserMessage, "ScanAndShip", myResolve);                                     
                });                
                // "Consuming Code" (Must wait for a fulfilled Promise)
                myPromise.then(
                  function(value) { 
                    eShipjetModel.setProperty("/sShipAndScan","");
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
                                BusyIndicator.hide();
                                resolve(response);
                                console.log("Success:", response);
                            }
                            },
                            error: function (error) {
                                // Handle error
                                BusyIndicator.hide();
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
                    ]
                },
                dataSource: rows,
                fileName: 'Shipment_Dataq',
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
                // this._handleDisplayShipReqTable();
                var sKey = "ShipRequestLabel";
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                this.byId("pageContainer").to(this.getView().createId(sKey));
            } else if (tileTitle === "Ship Now") {
                var sKey = "ShipNow";
                eshipjetModel.setProperty("/allViewsFooter", false);
                eshipjetModel.setProperty("/shipNowViewFooter", true);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                this.byId("pageContainer").to(this.getView().createId(sKey));
                var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
                ShipNowDataModel.setProperty("/ShipFromAddress", "");
                ShipNowDataModel.setProperty("/ShipToAddress", "");
            } else if (tileTitle === "Track Now") {
                this._handleDisplayTrackNowTable();
                var sKey = "TrackNow";
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
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
            eshipjetModel.setProperty("/routingGuidFooter", true);
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
                eshipjetModel.setProperty("/allViewsFooter", true);
                eshipjetModel.setProperty("/shipNowViewFooter", false);
                eshipjetModel.setProperty("/createShipReqViewFooter", false);
                eshipjetModel.setProperty("/routingGuidFooter", false);
                eshipjetModel.setProperty("/showDarkThemeSwitch", false);
                eshipjetModel.setProperty("/darkTheme", false);
                document.body.classList.remove("dark-theme");
                // this._handleDisplayShipReqTable();
            }
            eshipjetModel.setProperty("/SideNavigation", false);
            this.byId("pageContainer").to(this.getView().createId(sKey));

        },

        _handleDisplayShipReqTable: function () {
            var that = this;
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
                    var minWidth = "130px";
                }
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
                        width: minWidth,
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
            oTable.bindRows("/ShipReqRows");
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
            eshipjetModel.setProperty("/allViewsFooter", false);
            eshipjetModel.setProperty("/shipNowViewFooter", false);
            eshipjetModel.setProperty("/routingGuidFooter", false);
            eshipjetModel.setProperty("/createShipReqViewFooter", true);
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
                "shipMethod": "FedEx",
                "ServiceName": "FedEx 2Day",
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
            this._handleDisplayTrackNowTable();
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

        // Batch Ship Changes Starts

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

        onOpenRecentShipmentPopover: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            var sPath = oEvent.getSource().getId().split("--");
            var btnId = sPath[sPath.length - 1];
            eshipjetModel.setProperty("/RecentShipmentTab", btnId);
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


        onFeightAuditAnalysisFilterPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
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
        handlePopoverListItemPress: function (oEvent) {
            var oHeader = $(".sapTntToolHeader.sapMTBStandard");
            oHeader.removeClass("customHeaderStyle");
            
            var oSrc = oEvent.getSource();
            var oView = oController.getView();
            var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
            eshipjetModel.setProperty("/allViewsFooter", true);
            eshipjetModel.setProperty("/shipNowViewFooter", false);
            eshipjetModel.setProperty("/createShipReqViewFooter", false);
            eshipjetModel.setProperty("/routingGuidFooter", false);

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
        ShipNowPickAnAddressPopoverPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            var ShipNowDataModel = this.getView().getModel("ShipNowDataModel");
            var sPath = oEvent.getSource().getId().split("--");
            var btnId = sPath[sPath.length - 1];
            ShipNowDataModel.setProperty("/shipNowBtnId", btnId);
            if (!this._AddPickPopover) {
                this._AddPickPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShipNowPickAnAddressPopover",
                    controller: this
                }).then(function (oAddPickPopover) {
                    oView.addDependent(oAddPickPopover);
                    return oAddPickPopover;
                });
            }
            this._AddPickPopover.then(function (oAddPickPopover) {
                oAddPickPopover.openBy(oButton);
            });
        },
        onShipNowPickAnAddressCancelPress: function () {
            this.byId("idShipNowPickAnAddressPopover").close();
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
            oController.byId("idShipNowPickAnAddressPopover").close();
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
            oController.byId("idShipToPickAnAddressPopover").close();
        },

        ShipToPickAnAddressPopoverPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();
            var ShipNowDataModel = this.getView().getModel("ShipNowDataModel");
            var sPath = oEvent.getSource().getId().split("--");
            var btnId = sPath[sPath.length - 1];
            ShipNowDataModel.setProperty("/shipNowBtnId", btnId);
            if (!this._ShipToAddPickPopover) {
                this._ShipToAddPickPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.eshipjet.zeshipjet.view.fragments.ShipNow.ShipToPickAnAddressPopover",
                    controller: this
                }).then(function (oShipToAddPickPopover) {
                    oView.addDependent(oShipToAddPickPopover);
                    return oShipToAddPickPopover;
                });
            }
            this._ShipToAddPickPopover.then(function (oShipToAddPickPopover) {
                oShipToAddPickPopover.openBy(oButton);
            });
        },
        onShipToPickAnAddressCancelPress: function () {
            this.byId("idShipToPickAnAddressPopover").close();
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
            oController.byId("idShipToPickAnAddressPopover").close();
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

            if(ShipToAddress.FullName === "" || ShipToAddress.FullName === undefined){
                MessageBox.warning("Contact Name is required.");
            }else if(ShipToAddress.FullName !== "" && oTableLength === 0) {
                MessageBox.warning("At least one row must have all required fields (Product Code,Product Description, Quantity, Unit Weight).");
            }else{
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
            }
        },

        FreightQuoteUpdatedSrvData:function(){
            var ShipperDataUpdateSrvModel = oController.getOwnerComponent().getModel("ShipperDataUpdateSrvModel");
            var oPayload = {
                "Delivery": "80000017",
                "Carrier": "UPS",
                "SerName": "",
                "TotPack": "",
                "Currency": "",
                "PubFrt": "30.00",
                "DiscFrt": "0.00",
                // "DEL": "",
                "ShipDate": "/Date(1517875200000)/",
                "ItemSet": [
                  {
                    "Delivery": "80000017",
                    "DelItem": "10",
                    "HandUnit": "101",
                    "Weight": "10",
                    "WeightUnit": "KG",
                    "Dimension": "1X1X1",
                    "Tracking": "1ZXXXXXXX"
                  },
                  {
                    "Delivery": "80000017",
                    "DelItem": "20",
                    "HandUnit": "102",
                    "Weight": "20",
                    "WeightUnit": "KG",
                    "Dimension": "1X1X1",
                    "Tracking": "1ZXXXXXXX"
                  }
                ]
              };
              ShipperDataUpdateSrvModel.create("/HeaderSet", oPayload, {
                success: function(oResponse) {
                    sap.m.MessageToast.show("FreightQuote Updated successful!");
                },
                error: function(oError) {
                    var errMsg = JSON.parse(oError.responseText).error.message.value
                    sap.m.MessageBox.error(errMsg);
                }
            });
        },

        ApiOutboundDeliverySrvData:function(response){
            var BillOfLading = response.HeaderInfo.BillOfLading;
            var eshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
            var sapDeliveryNumber = eshipjetModel.getProperty("/sapDeliveryNumber");
            var OutBoundDeliveryModel = oController.getOwnerComponent().getModel("OutBoundDeliveryModel");
            var payload = { "BillOfLading" : BillOfLading };
            var mHeaders = {
                "accept": "application/json",
                "content-type": "application/json",
                "If-Match": oController.etag
            }

            OutBoundDeliveryModel.update("/A_OutbDeliveryHeader('" + sapDeliveryNumber + "')", payload, {
                headers: mHeaders,
                success: function(oResponse) {
                    sap.m.MessageToast.show("OutBoundDelivery Updated successful!");
                },
                error: function(oError) {
                    var errMsg = JSON.parse(oError.responseText).error.message.value
                    sap.m.MessageBox.error(errMsg);
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

        onPressAddProduct: function () {
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


        handleAddProductRowPress:function(oEvent){
            var oSelectedObj = oEvent.getSource().getBindingContext().getObject();
            var ShipReqTableDataModel = this.getView().getModel("ShipReqTableDataModel");
            var CreateShipReqRowsData = ShipReqTableDataModel.getData().CreateShipReqRows;
            CreateShipReqRowsData.push(oSelectedObj);
            ShipReqTableDataModel.updateBindings(true);
            for(var i=0; i<CreateShipReqRowsData.length; i++){
                CreateShipReqRowsData[i]["#"] = i+1;
                ShipReqTableDataModel.updateBindings(true);
            }
            oController._handleDisplayCreateShipReqTable();
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


        onShopNowShipMethodTypeChange : function(oEvent){

            var eshipjetModel =  this.getOwnerComponent().getModel("eshipjetModel");
            var ShipNowShipMethodSelectedKey =  eshipjetModel.getData().ShipNowShipMethodSelectedKey;
            if (ShipNowShipMethodSelectedKey === "FedEx"){
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", true );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );

            }else if(ShipNowShipMethodSelectedKey === "DHL"){
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", true );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
                
            }else if(ShipNowShipMethodSelectedKey === "FastFarwarder"){
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", true );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );

             }else if(ShipNowShipMethodSelectedKey === "Other"){

                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", true );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "UPS"){

                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", true );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "USPS"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", true );
             }else if(ShipNowShipMethodSelectedKey === "Gander & White"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "ABF"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false  );
             }else if(ShipNowShipMethodSelectedKey === "ARTEX Fine Art Services"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "ATLAS Fine Art"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "Brinks Fine Art"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "Crown Fine Art"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "DTDC"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "FedEx Freight"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "Fine Art Shippers"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "JPMorgan Chase Internal"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "Malca-Amit"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "Movi Group"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "RL"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
             }else if(ShipNowShipMethodSelectedKey === "The Armory"){
                
                eshipjetModel.setProperty("/shipNowGanderWhiteSelect", false );
                eshipjetModel.setProperty("/shipNowABFSelect", false );
                eshipjetModel.setProperty("/shipNowARTEXFineArtSrvSelect", false );
                eshipjetModel.setProperty("/shipNowATLASFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowBrinksFineArtSelect", false );
                eshipjetModel.setProperty("/shipNowCrownFineArtSelect", false ); 
                eshipjetModel.setProperty("/shipNowDHLSelect", false );
                eshipjetModel.setProperty("/shipNowDTDCSelect", false );
                eshipjetModel.setProperty("/shipNowFedExSelect", false );
                eshipjetModel.setProperty("/shipNowFastFarwarderSelect", false );
                eshipjetModel.setProperty("/shipNowFedExFreightSelect", false );
                eshipjetModel.setProperty("/shipNowJPMorganChaseInternalSelect", false );
                eshipjetModel.setProperty("/shipNowMalca-AmitSelect", false );
                eshipjetModel.setProperty("/shipNowMoviGroupSelect", false );
                eshipjetModel.setProperty("/shipNowOtherSelect", false );
                eshipjetModel.setProperty("/shipNowRLSelect", false );
                eshipjetModel.setProperty("/shipNowTheArmorySelect", false );
                eshipjetModel.setProperty("/shipNowUPSSelect", false );
                eshipjetModel.setProperty("/shipNowUSPSSelect", false );
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
         AddIMportRolesPress: function (oEvent) {
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
        this.byId("idAddImportAddressBookPopover").close();
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
    onLTLClassesImportClosePress: function () {
        this.byId("idLTLClassesImportPopover").close();
    },
    onLTLClassesCloseFinishImportingPress: function () {
        this.byId("idLTLClassesImportPopover").close();
    },
    onShipRatePress:function(){
        oController.onShipRateRequest();         
    },
    onShipRateRequest:function(){
        var oEshipjetModel = this.getOwnerComponent().getModel("eshipjetModel");
        var oPayload = {
            "HeaderInfo": {
                "FeederSystem": "Manual",
                "DocumentNumber": oEshipjetModel.getData().sapDeliveryNumber,
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
                "COMPANY": "Vinay Inc co",
                "CONTACT": "John Williams",
                "ADDRESS_LINE1": "4232 Balandre Ln",
                "ADDRESS_LINE2": "Suite 250",
                "ADDRESS_LINE3": null,
                "CITY": "McKinney",
                "STATE": "CA",
                "ZIPCODE": "94538",
                "COUNTRY": "US",
                "PHONE": "4088380699",
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
                    "Carrier": "ABF",
                    "ServiceName": "07",
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
            }
        };
        var RecentShipmentSet = oEshipjetModel.getData().RecentShipmentSet;
        RecentShipmentSet.push(oPayload);
        oEshipjetModel.updateBindings(true);
        var sPath = "https://eshipjet-stg-scpn-byargfehdgdtf8f3.francecentral-01.azurewebsites.net/Rateall "; 
        oController.oBusyDialog.open();       
        $.ajax({
            url: sPath, // Replace with your API endpoint
            method: "POST",
            contentType: "application/json", // Set content type to JSON if sending JSON data
            data: JSON.stringify(oPayload),
            success: function (response) {
                oController.oBusyDialog.close();
                // Handle successful response               
                console.log("Success:", response);
                if(response && response.RateServices && response.RateServices.length > 0){
                    oEshipjetModel.setProperty("/shipNowShippingRates", response.RateServices);
                    oController.onOpenShipNowShippinRateDialog();
                }
            },
            error: function (error) {
                // Handle error                
                console.log("Error:", error);
                oController.oBusyDialog.close();
            }
        });
    },

    onRecentShipmentsItemPress:function(oEvent){
        var oCurrentObj = oEvent.getSource().getBindingContext("eshipjetModel").getObject();
        var eshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
        var ShipNowDataModel = oController.getView().getModel("ShipNowDataModel");
        eshipjetModel.setProperty("/sapDeliveryNumber", oCurrentObj.HeaderInfo.DocumentNumber);
        eshipjetModel.setProperty("/pickupDate", oCurrentObj.HeaderInfo.CreatedDate);
        eshipjetModel.setProperty("/HeaderInfo/ShipDate", oCurrentObj.HeaderInfo.ShipDate);

        ShipNowDataModel.setProperty("/ShipFromAddress/ShipFromCONTACT", oCurrentObj.ShipFrom.CONTACT);
        ShipNowDataModel.setProperty("/ShipFromAddress/ShipFromADDRESS_LINE1", oCurrentObj.ShipFrom.ADDRESS_LINE1);
        ShipNowDataModel.setProperty("/ShipFromAddress/ShipFromCITY", oCurrentObj.ShipFrom.CITY);
        ShipNowDataModel.setProperty("/ShipFromAddress/ShipFromSTATE", oCurrentObj.ShipFrom.STATE);
        ShipNowDataModel.setProperty("/ShipFromAddress/ShipFromEMAIL", oCurrentObj.ShipFrom.EMAIL);
        ShipNowDataModel.setProperty("/ShipFromAddress/ShipFromCOMPANY", oCurrentObj.ShipFrom.CONTACT);
        ShipNowDataModel.setProperty("/ShipFromAddress/ShipFromADDRESS_LINE2", oCurrentObj.ShipFrom.ADDRESS_LINE2);
        ShipNowDataModel.setProperty("/ShipFromAddress/ShipFromZIPCODE", oCurrentObj.ShipFrom.ZIPCODE);
        ShipNowDataModel.setProperty("/ShipFromAddress/ShipFromCOUNTRY", oCurrentObj.ShipFrom.COUNTRY);
        ShipNowDataModel.setProperty("/ShipFromAddress/ShipFromPHONE", oCurrentObj.ShipFrom.PHONE);

        ShipNowDataModel.setProperty("/ShipToAddress/FullName", oCurrentObj.ShipFrom.CONTACT);
        ShipNowDataModel.setProperty("/ShipToAddress/StreetName", oCurrentObj.ShipFrom.ADDRESS_LINE1);
        ShipNowDataModel.setProperty("/ShipToAddress/CityName", oCurrentObj.ShipFrom.CITY);
        ShipNowDataModel.setProperty("/ShipToAddress/Region", oCurrentObj.ShipFrom.STATE);
        ShipNowDataModel.setProperty("/ShipTo/EMAIL", oCurrentObj.ShipFrom.EMAIL);
        ShipNowDataModel.setProperty("/ShipToAddress/BusinessPartnerName1", oCurrentObj.ShipFrom.CONTACT);
        ShipNowDataModel.setProperty("/ShipToAddress/HouseNumber", oCurrentObj.ShipFrom.ADDRESS_LINE2);
        ShipNowDataModel.setProperty("/ShipToAddress/PostalCode", oCurrentObj.ShipFrom.ZIPCODE);
        ShipNowDataModel.setProperty("/ShipToAddress/Country", oCurrentObj.ShipFrom.COUNTRY);
        ShipNowDataModel.setProperty("/ShipToAddress/PhoneNumber", oCurrentObj.ShipFrom.PHONE);

        eshipjetModel.setProperty("/ShipNowShipMethodSelectedKey", oCurrentObj.Carrier);

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
    onPickCarrierSubmit:function(oEvent){
        var oTable  = oController.byId("_ShippingRateTableId");
        var oEshipjetModel = oController.getOwnerComponent().getModel("eshipjetModel");
        var aSelectedItems = oTable.getSelectedItems();

        var oCarrier = oTable.getSelectedItem().getBindingContext("eshipjetModel").getObject();
        var RecentShipmentSet = oEshipjetModel.getData().RecentShipmentSet;
        RecentShipmentSet[RecentShipmentSet.length-1]["Carrier"] = oCarrier.Carrier;
        // RecentShipmentSet["Carrier"] = oCarrier;
        oEshipjetModel.updateBindings(true);
        var oSelectObj;
        if(aSelectedItems && aSelectedItems.length > 0){
            oSelectObj = aSelectedItems[0].getBindingContext("eshipjetModel").getObject(); 
            oEshipjetModel.setProperty("/ShipNowShipMethodSelectedKey", oSelectObj.Carrier);
            oEshipjetModel.setProperty("/ShipNowShipsrvNameSelectedKey", oSelectObj.serviceCode);
            oEshipjetModel.setProperty("/accountNumber", oSelectObj.AccountNumber);                     
        }
        oController.onCloseShipNowShippinRateDialog();
    },
    onPressCloseShipNow: function() {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("ShipRequestLabel"); // Replace with your actual route name
    }
    
    });
});
