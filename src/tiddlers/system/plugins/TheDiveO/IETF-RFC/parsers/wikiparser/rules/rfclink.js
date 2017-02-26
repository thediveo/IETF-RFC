/*\
created: 20170226200053042
type: application/javascript
title: $:/plugins/TheDiveO/IETF-RFC/parsers/wikiparser/rules/rfclink.js
tags:
modifier: TheDiveo
modified: 20170226201831575
creator: TheDiveo
module-type: wikirule
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Describe our wikiparser rule for handling inline RFC links.
exports.name = "rfclink";
exports.types = {inline: true};

// Initialize this rule with the proper matching expression.
exports.init = function(parser) {
	this.parser = parser;
	// the regexp to match
	this.matchRegExp = /\bRFC([\* ])([0-9]{4,5})/mg;
};

// The matching expression triggered, so we've found an
// RFC reference. Depending on the exact style of RFC ref
// we return a macro call to either the <<rfc>> or <<rfcs>>
// (short form) macros.
exports.parse = function() {
	// Get all the details of the match
    var mode = this.match[1];
	var rfcNum = this.match[2];
	// Move past the macro call
	this.parser.pos = this.matchRegExp.lastIndex;
    // Return either a macro call to the normal RFC link form
    // or the short RFC link form.
	return [{
		type: "macrocall",
		name: (mode == "*") ? "rfcs" : "rfc",
		params: [{value: rfcNum}]
	}];
};

})();
