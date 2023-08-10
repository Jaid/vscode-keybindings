"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
// @ts-nocheck
var core_1 = require("@actions/core");
var path_1 = require("path");
var read_file_json_1 = require("read-file-json");
var key_counter_1 = require("key-counter");
var to_yaml_1 = require("./lib/to-yaml");
// import {fileURLToPath} from 'url'
// const dirName = path.dirname(fileURLToPath(import.meta.url))
// const toYaml = await import(path.resolve(dirName, 'lib', 'toYaml.js'))
var ExclusionRule = /** @class */ (function () {
    function ExclusionRule(input) {
        if (typeof input === 'string') {
            this.value = input;
            this.type = 'static';
        }
        if (input instanceof RegExp) {
            this.value = input;
            this.type = 'regex';
        }
        if (Array.isArray(input)) {
            if (input[0] === 'command') {
                this.value = input[1];
                this.type = 'command';
            }
        }
    }
    ExclusionRule.prototype.test = function (keystrokeObject) {
        if (this.type === 'static') {
            return keystrokeObject.key === this.value;
        }
        if (this.type === 'regex') {
            return this.value.test(keystrokeObject.key);
        }
        if (this.type === 'command') {
            return keystrokeObject.command === this.value;
        }
    };
    ExclusionRule.prototype.getTitle = function () {
        if (this.type === 'static') {
            return this.value;
        }
        if (this.type === 'regex') {
            return this.value.source;
        }
        if (this.type === 'command') {
            return "command ".concat(this.value);
        }
    };
    return ExclusionRule;
}());
var excludedKeystrokes = [
    /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)(up|left|right|down)$/,
    /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)(pageup|pagedown)$/,
    /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)(end|home)$/,
    /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)backspace$/,
    /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)delete$/,
    /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)tab$/,
    /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)enter$/,
    /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)escape$/,
    /^(|(ctrl|alt|shift|ctrl\+alt|shift\+alt|ctrl\+shift|ctrl\+shift\+alt)\+)space$/,
    'ctrl+a',
    'ctrl+c',
    'ctrl+v',
    'ctrl+z',
    'ctrl+f',
    'ctrl+shift+z',
    'ctrl+shift+f',
    'ctrl+w',
    'ctrl+x',
    ['command', 'editor.action.refactor']
].map(function (input) { return new ExclusionRule(input); });
var github = JSON.parse(process.env.github);
var jsonPath = path_1["default"].resolve(github.workspace, 'src', 'global.jsonc');
var data = await read_file_json_1["default"]["default"](jsonPath);
var result = [];
var excluded = [];
var exclusionCounter = new key_counter_1["default"]["default"];
var keystrokeCounter = new key_counter_1["default"]["default"];
for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
    var entry = data_1[_i];
    var isIncluded = true;
    for (var _a = 0, excludedKeystrokes_1 = excludedKeystrokes; _a < excludedKeystrokes_1.length; _a++) {
        var excludedKeystroke = excludedKeystrokes_1[_a];
        if (excludedKeystroke.test(entry)) {
            isIncluded = false;
            excluded.push(entry);
            exclusionCounter.feed(excludedKeystroke.getTitle());
            break;
        }
    }
    if (!isIncluded) {
        continue;
    }
    result.push(__assign(__assign({}, entry), { command: "-".concat(entry.command) }));
}
core_1["default"].info("Loaded ".concat(Object.keys(data).length, " global keybindings from ").concat(jsonPath));
core_1["default"].info("Included ".concat(result.length, ", excluded ").concat(data.length - result.length));
core_1["default"].startGroup('YAML output (keystrokes to delete)');
core_1["default"].info((0, to_yaml_1["default"])(result));
core_1["default"].endGroup();
core_1["default"].startGroup('Excluded (keystrokes to keep)');
core_1["default"].info("Excluded ".concat(excluded.length, " keybindings"));
core_1["default"].info((0, to_yaml_1["default"])(exclusionCounter.toObjectSortedByValues()));
core_1["default"].info((0, to_yaml_1["default"])(excluded));
core_1["default"].endGroup();
var keystrokeList = Object.entries(keystrokeCounter.toObjectSortedByValues()).map(function (_a) {
    var key = _a[0], value = _a[1];
    return {
        key: key,
        value: value,
        keystrokes: data.filter(function (entry) { return entry.key === key; })
    };
});
keystrokeList.reverse();
for (var _b = 0, keystrokeList_1 = keystrokeList; _b < keystrokeList_1.length; _b++) {
    var entry = keystrokeList_1[_b];
    core_1["default"].startGroup("Keystroke ".concat(entry.key, " (").concat(entry.value, ")"));
    core_1["default"].info((0, to_yaml_1["default"])(entry.keystrokes));
    core_1["default"].endGroup();
}
