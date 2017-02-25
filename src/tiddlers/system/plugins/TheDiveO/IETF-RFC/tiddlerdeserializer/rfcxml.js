/*\
created: 20170225164337992
type: application/javascript
title: $:/plugins/TheDiveO/IETF-RFC/tiddlerdeserializer/rfcxml.js
tags:
modifier: TheDiveO
modified: 20170225175524680
creator: TheDiveO
module-type: tiddlerdeserializer
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// When running in a browser, get the browser's DOM parser. Otherwise, such as when
// running on Node.js, use the xmldom DOM parser that is provided by the standard
// TiddlyWiki 5 plugin "xmldom".
var DOMParser = $tw.browser ? window.DOMParser : require("$:/plugins/tiddlywiki/xmldom/dom-parser").DOMParser;

// The (core) path where to put all the RFC index data tiddlers. Do not add a
// trailing slash "/" to this location (title).
var RFCIndexDataLocation = "$:/rfcindex";
// Do not change these locations.
var RFCDataLocation = RFCIndexDataLocation + "/rfc/"

$tw.utils.registerFileType("application/x-rfc-index","utf8",".rfcindex");

//
function parseRfcNum(docid) {
  if (docid.substring(0, 3) == "RFC") {
    return docid.substring(3);
  } else
    return "0000";
};

// The RFC Index importer itself, which is a TW5 tiddler deserializer that works
// on an XML RFC index file.
exports["application/x-rfc-index"] = function(text, fields) {
  var rfcidx = new DOMParser().parseFromString(text, "text/xml");
  var results = [];

  // Iterate over all RFC entry elements in the RFC index.
  $tw.utils.each(rfcidx.getElementsByTagName("rfc-entry"), function(rfcentry) {
    // Get the RFC document ID, and extract the RFC number from it.
    var docid = rfcentry.getElementsByTagName("doc-id")[0].childNodes[0].nodeValue;
    var rfcnum = parseRfcNum(docid);

    //
    var rfctitle = rfcentry.getElementsByTagName("title")[0].childNodes[0].nodeValue;

    // Check if there is an errata URL present.
    var el;
    var errurl = "";
    el = rfcentry.getElementsByTagName("errata-url");
	if (el.length > 0) {
      errurl = el[0].childNodes[0].nodeValue;
    }

    // Finally push a tiddler for this RFC into the result import list.
	var tid = {
      title: RFCDataLocation + rfcnum,
      tags: "RFC",
      "rfc-title": rfctitle,
      "rfc-num": rfcnum,
      "rfc-errata-url": errurl
    };
    results.push(tid);
  });

  return results;
};

})();
