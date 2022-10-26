"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extract = extract;
exports.collect = collect;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _chalk = _interopRequireDefault(require("chalk"));

var R = _interopRequireWildcard(require("ramda"));

var _utils = require("./utils");

var _extractors = _interopRequireDefault(require("./extractors"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Merge origins for messages found in different places. All other attributes
 * should be the same (raise an error if defaults are different).
 */
function mergeMessage(msgId, prev, next) {
  if (prev.message && next.message && prev.message !== next.message) {
    throw new Error("Encountered different default translations for message ".concat(_chalk.default.yellow(msgId)) + "\n".concat(_chalk.default.yellow((0, _utils.prettyOrigin)(prev.origin)), " ").concat(prev.message) + "\n".concat(_chalk.default.yellow((0, _utils.prettyOrigin)(next.origin)), " ").concat(next.message));
  }

  return _objectSpread(_objectSpread({}, next), {}, {
    message: prev.message || next.message,
    origin: R.concat(prev.origin, next.origin)
  });
}

function extract(_x, _x2) {
  return _extract.apply(this, arguments);
}

function _extract() {
  _extract = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(srcPaths, targetPath) {
    var options,
        _options$ignore,
        ignore,
        ignorePattern,
        _iterator,
        _step,
        _loop,
        _ret,
        _args2 = arguments;

    return _regenerator.default.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            options = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : {};
            _options$ignore = options.ignore, ignore = _options$ignore === void 0 ? [] : _options$ignore;
            ignorePattern = ignore.length ? new RegExp(ignore.join("|"), "i") : null;
            _iterator = _createForOfIteratorHelper(srcPaths);
            _context2.prev = 4;
            _loop = /*#__PURE__*/_regenerator.default.mark(function _loop() {
              var srcFilename, subdirs;
              return _regenerator.default.wrap(function _loop$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      srcFilename = _step.value;

                      if (!(!_fs.default.existsSync(srcFilename) || ignorePattern && ignorePattern.test(srcFilename))) {
                        _context.next = 3;
                        break;
                      }

                      return _context.abrupt("return", "continue");

                    case 3:
                      if (!_fs.default.statSync(srcFilename).isDirectory()) {
                        _context.next = 8;
                        break;
                      }

                      subdirs = _fs.default.readdirSync(srcFilename).sort().map(function (filename) {
                        return _path.default.join(srcFilename, filename);
                      });
                      _context.next = 7;
                      return extract(subdirs, targetPath, options);

                    case 7:
                      return _context.abrupt("return", "continue");

                    case 8:
                      _context.next = 10;
                      return (0, _extractors.default)(srcFilename, targetPath, options);

                    case 10:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _loop);
            });

            _iterator.s();

          case 7:
            if ((_step = _iterator.n()).done) {
              _context2.next = 14;
              break;
            }

            return _context2.delegateYield(_loop(), "t0", 9);

          case 9:
            _ret = _context2.t0;

            if (!(_ret === "continue")) {
              _context2.next = 12;
              break;
            }

            return _context2.abrupt("continue", 12);

          case 12:
            _context2.next = 7;
            break;

          case 14:
            _context2.next = 19;
            break;

          case 16:
            _context2.prev = 16;
            _context2.t1 = _context2["catch"](4);

            _iterator.e(_context2.t1);

          case 19:
            _context2.prev = 19;

            _iterator.f();

            return _context2.finish(19);

          case 22:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, null, [[4, 16, 19, 22]]);
  }));
  return _extract.apply(this, arguments);
}

function collect(buildDir) {
  return _fs.default.readdirSync(buildDir).sort().map(function (filename) {
    var filepath = _path.default.join(buildDir, filename);

    if (_fs.default.lstatSync(filepath).isDirectory()) {
      return collect(filepath);
    }

    if (!filename.endsWith(".json")) return;

    try {
      return JSON.parse(_fs.default.readFileSync(filepath).toString());
    } catch (e) {
      return {};
    }
  }).filter(Boolean).reduce(function (catalog, messages) {
    return R.mergeWithKey(mergeMessage, catalog, messages);
  }, {});
}