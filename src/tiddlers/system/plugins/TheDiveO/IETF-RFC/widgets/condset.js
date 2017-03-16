/*\
created: 20170316101051162
title: $:/plugins/TheDiveO/IETF-RFC/widgets/condset.js
tags:
modified: 20170316104347065
type: application/javascript
module-type: widget
\*/
/*
 <$condset
   name= name of variable to be set
   check= value to check against list
   list= list of matching values
   matchValue= value to set when there's a match
   nonmatchValue= value to set when there's no match
*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

// Widget constructor; make sure to properly initialize new widget instances.
var CondSetWidget = function(parseTreeNode, options) {
	this.initialise(parseTreeNode, options);
};

// Inherit all the good stuff from the base Widget class.
CondSetWidget.prototype = new Widget();

// Render this widget into the DOM: this means computing first all
// attribute value (resolving text references, et cetera), setting
// a variable (our main reason d'être) and which has no visible effect,
// and then finally rendering all our children (widgets, markup).
CondSetWidget.prototype.render = function(parent, nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	this.renderChildren(parent, nextSibling);
};

// Compute the internal state of the widget
CondSetWidget.prototype.execute = function() {
	// Get our parameters; these are already computed at this stage,
    // that is, text references are resolved, et cetera.
	this.setName = this.getAttribute("name", "currentTiddler");
  	this.setCheck = this.getAttribute("check", "");
	this.setList = this.getAttribute("list", "");
	this.setMatchValue = this.getAttribute("matchValue", "");
	this.setNonMatchValue = this.getAttribute("nonmatchValue", "");
  	// The cond logic
  	var list = $tw.utils.parseStringArray(this.setList);
    this.setValue = (list && list.indexOf(this.setCheck) !== -1)
      ? this.setMatchValue : this.setNonMatchValue;
	// Set context variable
	this.setVariable(this.setName, this.getValue(), this.parseTreeNode.params);
	// Construct the child widgets
	this.makeChildWidgets();
};

// Get the value to be assigned
CondSetWidget.prototype.getValue = function() {
	return this.setValue;
};

// Selectively refreshes the widget if needed. Returns true if the widget or
// any of its children needed re-rendering
CondSetWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if (changedAttributes.name
        || changedAttributes.check
        || changedAttributes.list
        || changedAttributes.matchValue
        || changedAttributes.nonmatchValue) {
		this.refreshSelf();
		return true;
	} else {
		return this.refreshChildren(changedTiddlers);
	}
};

// That's it: export the widget class with its corresponding widget name.
// Remember that widget names always get their dollar sign prefixed
// automatically in the TW5 markup parser.
exports.condset = CondSetWidget;

})();
