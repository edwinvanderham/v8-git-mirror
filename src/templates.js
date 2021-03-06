// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called from a desugaring in the parser.

var $getTemplateCallSite;

(function() {

"use strict";

%CheckIsBootstrapping();

var callSiteCache = new global.Map;
var mapGetFn = global.Map.prototype.get;
var mapSetFn = global.Map.prototype.set;


function SameCallSiteElements(rawStrings, other) {
  var length = rawStrings.length;
  var other = other.raw;

  if (length !== other.length) return false;

  for (var i = 0; i < length; ++i) {
    if (rawStrings[i] !== other[i]) return false;
  }

  return true;
}


function GetCachedCallSite(siteObj, hash) {
  var obj = %_CallFunction(callSiteCache, hash, mapGetFn);

  if (IS_UNDEFINED(obj)) return;

  var length = obj.length;
  for (var i = 0; i < length; ++i) {
    if (SameCallSiteElements(siteObj, obj[i])) return obj[i];
  }
}


function SetCachedCallSite(siteObj, hash) {
  var obj = %_CallFunction(callSiteCache, hash, mapGetFn);
  var array;

  if (IS_UNDEFINED(obj)) {
    array = new InternalArray(1);
    array[0] = siteObj;
    %_CallFunction(callSiteCache, hash, array, mapSetFn);
  } else {
    obj.push(siteObj);
  }

  return siteObj;
}


$getTemplateCallSite = function(siteObj, rawStrings, hash) {
  var cached = GetCachedCallSite(rawStrings, hash);

  if (!IS_UNDEFINED(cached)) return cached;

  %AddNamedProperty(siteObj, "raw", %ObjectFreeze(rawStrings),
      READ_ONLY | DONT_ENUM | DONT_DELETE);

  return SetCachedCallSite(%ObjectFreeze(siteObj), hash);
}

})();
