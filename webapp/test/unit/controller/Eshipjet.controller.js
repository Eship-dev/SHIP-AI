/*global QUnit*/

sap.ui.define([
	"comeshipjet/zeshipjet/controller/Eshipjet.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Eshipjet Controller");

	QUnit.test("I should test the Eshipjet controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
