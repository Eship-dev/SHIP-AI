sap.ui.define([
    "com/eshipjet/zeshipjet/controller/BaseController"
  ], function(BaseController) {
    "use strict";
  
    return BaseController.extend("com.eshipjet.zeshipjet.controller.Dashboard", {
    
      onInit: function() {
        // nothing special if you don't need
      },
  
      handlePopoverListItemPress: function(oEvent) {
        const oCurrObj = oEvent.getSource().getBindingContext().getObject();
        if (oCurrObj && oCurrObj.name === "Locations") {
          this.loadFragmentPage(
            "com.eshipjet.zeshipjet.view.fragments.Locations",
            "Locations",
            "_oLocationsPage",
            this.byId("pageContainer"),
            function(oFragment){
              this._displayTables(
                oFragment.byId("_IDLocationTable").getId(),
                "LocationTableColumns",
                "LocationTableRows",
                "Locations"
              );
            }.bind(this)
          );
        }
      }
    });
  });
  