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
], function (Device, Controller, JSONModel, Popover, Button, library, MessageToast, BusyIndicator, Dialog, DateFormat, Fragment, Spreadsheet, formatter, Filter, FilterOperator, CoreLibrary) {
    "use strict";

    var ButtonType = library.ButtonType,
        PlacementType = library.PlacementType,
        oController, oResourceBundle;
    const SortOrder = CoreLibrary.SortOrder;

    return Controller.extend("com.eshipjet.zeshipjet.controller.Orders", {
        Formatter: formatter,
        onInit: function () {
            // oController._handleDisplayOrdersTable();
        },

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
    });
});
