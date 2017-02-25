/*\
created: 20170225164337992
creator: TheDiveO
title: $:/plugins/TheDiveO/IETF-RFC/tiddlerdeserializer/rfcxml.js
tags:
modified: 20170225164946987
modifier: TheDiveO
type: application/javascript
module-type: tiddlerdeserializer
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var DOMParser = $tw.browser ? window.DOMParser : require("$:/plugins/tiddlywiki/xmldom/dom-parser").DOMParser;

$tw.utils.registerFileType("application/x-bibtex","utf8",".bib");

exports["application/x-rfc-index"] = function(text,fields) {
};

})();
