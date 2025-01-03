sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/eshipjet/zeshipjet/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("com.eshipjet.zeshipjet.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            sap.ui.core.IconPool.addIcon('dashboard_icon', 'customfont', 'icomoon', 'e900');
            sap.ui.core.IconPool.addIcon('menuIcon', 'customfont', 'icomoon', 'e907');
            sap.ui.core.IconPool.addIcon('order_icon', 'customfont', 'icomoon', 'e908');
            sap.ui.core.IconPool.addIcon('quickship_icon', 'customfont', 'icomoon', 'e90f');
            sap.ui.core.IconPool.addIcon('quotenow', 'customfont', 'icomoon', 'e910');
            sap.ui.core.IconPool.addIcon('returns_icon', 'customfont', 'icomoon', 'e911');
            sap.ui.core.IconPool.addIcon('shipnow_icon', 'customfont', 'icomoon', 'e912');
            sap.ui.core.IconPool.addIcon('ShipperCopilate', 'customfont', 'icomoon', 'e913');
            sap.ui.core.IconPool.addIcon('shiprequest_icon', 'customfont', 'icomoon', 'e91c');
            sap.ui.core.IconPool.addIcon('track_icon', 'customfont', 'icomoon', 'e91d');
            sap.ui.core.IconPool.addIcon('batchship_icon', 'customfont', 'icomoon', 'e91e');

            // enable routing
            this.getRouter().initialize();
        }
    });
});