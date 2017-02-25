/*\
created: 20170225164337992
type: application/javascript
title: $:/plugins/TheDiveO/IETF-RFC/tiddlerdeserializer/rfcxml.js
tags:
modifier: TheDiveO
modified: 20170225205748234
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

// Tag used to identify RFC data tiddlers
var RFCDataTag = "[[RFC Data]]";

// Do not change these locations.
var RFCDataLocation = RFCIndexDataLocation + "/rfc/"

$tw.utils.registerFileType("application/x-rfc-index","utf8",".rfcindex");

// Given a document ID (in parameter docid) of an RFC, return the RFC number.
// In case the docid does not references an RFC, then the (invalid) RFC
// number 0000 is returned instead.
function parseRfcNum(docid) {
  if (docid.substring(0, 3) == "RFC") {
    return docid.substring(3);
  } else
    return "0000";
};

// Retrieve the value of a child element. If the element does not exist,
// then the default value (defValue) is returned. If the element exists
// multiple times, then only the value of its first occurence is returned.
function getElementValue(entry, elementName, defValue) {
  var el = entry.getElementsByTagName(elementName);
  if (el.length > 0) {
    // always return content of first element
    return el[0].childNodes[0].nodeValue;
  } else {
    return defValue;
  }
}

// Retrieve the abstract and convert it into TW5 markup. The abstract
// consists of a sequence of paragraph (p) elements.
function getAbstract(entry) {
  var ab = entry.getElementsByTagName("abstract");
  var mu = "";
  if (ab.length > 0) {
    $tw.utils.each(entry.getElementsByTagName("p"), function(p) {
      var s = p.childNodes[0].nodeValue;
      // replace pseudo ASCII en-dashes with proper TW5 wiki markup
      s = s.replace(/ - /gi, " -- ");
      // ToDo: RFC references

      // add this paragraph
      mu = mu + s + "\n\n";
    });
  }
  return mu;
}

//
function getRfcList(entry, elementName) {
  var el = entry.getElementsByTagName(elementName);
  if (el.length > 0) {
    // Process the sequence of doc-id child elements; we only
    // use the first parent element and ignore any (invalid)
    // additional parent.
    var refs = el[0].getElementsByTagName("doc-id");
    var r = [];
    $tw.utils.each(refs, function(docid) {
      r.push(parseRfcNum(docid.childNodes[0].nodeValue));
    });
    return r.join(" ");
  }
  return "";
}

// The RFC Index importer itself, which is a TW5 tiddler deserializer that works
// on an XML RFC index file.
exports["application/x-rfc-index"] = function(text, fields) {
  var rfcidx = new DOMParser().parseFromString(text, "text/xml");
  var results = [];

  // Iterate over all RFC entry elements in the RFC index.
  $tw.utils.each(rfcidx.getElementsByTagName("rfc-entry"), function(rfcentry) {
    // Get the RFC document ID, and extract the RFC number from it.
    var docid = getElementValue(rfcentry, "doc-id", "");
    var rfcnum = parseRfcNum(docid);

    // Get the (potentially lengthy) RFC title. Clean up some ASCII glitches
    // by guessing the intended TW5 markup.
    var rfctitle = getElementValue(rfcentry, "title", "");
    // replace ASCII pseudo en-dashes with proper TW5 wiki markup
    rfctitle = rfctitle.replace(/ - /gi, " -- ");

    var updates = getRfcList(rfcentry, "updates");
    var updatedby = getRfcList(rfcentry, "updated-by");
    var obsoletes = getRfcList(rfcentry, "obsoletes");
    var obsoletedby = getRfcList(rfcentry, "obsoleted-by");

    var errurl = getElementValue(rfcentry, "errata-url", "");

    // Get and process the abstract into TW5 markup.
    var abstract = getAbstract(rfcentry);

    // Finally push a tiddler for this RFC into the result import list.
	var tid = {
      title: RFCDataLocation + rfcnum,
      text: abstract,
      tags: RFCDataTag,
      "rfc-title": rfctitle,
      "rfc-num": rfcnum,
      "rfc-errata-url": errurl,
      "rfc-updates": updates,
      "rfc-updated-by": updatedby,
      "rfc-obsoletes": obsoletes,
      "rfc-obsoleted-by": obsoletedby
    };
    results.push(tid);
  });

  return results;
};

})();
