"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = extract;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _ora = _interopRequireDefault(require("ora"));

var _babel = _interopRequireDefault(require("./babel"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var DEFAULT_EXTRACTORS = [_babel.default];

function extract(_x, _x2, _x3) {
  return _extract.apply(this, arguments);
}

function _extract() {
  _extract = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(filename, targetPath, options) {
    var _options$extractors;

    var extractorsToExtract, _iterator, _step, e, ext, spinner;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            extractorsToExtract = (_options$extractors = options.extractors) !== null && _options$extractors !== void 0 ? _options$extractors : DEFAULT_EXTRACTORS;
            _iterator = _createForOfIteratorHelper(extractorsToExtract);
            _context.prev = 2;

            _iterator.s();

          case 4:
            if ((_step = _iterator.n()).done) {
              _context.next = 26;
              break;
            }

            e = _step.value;
            ext = e;

            if (typeof e === "string") {
              // in case of the user using require.resolve in their extractors, we require that module
              ext = require(e);
            }

            if (ext.default) {
              ext = ext.default;
            }

            if (ext.match(filename)) {
              _context.next = 11;
              break;
            }

            return _context.abrupt("continue", 24);

          case 11:
            spinner = void 0;
            if (options.verbose) spinner = (0, _ora.default)().start(filename);
            _context.prev = 13;
            _context.next = 16;
            return ext.extract(filename, targetPath, options);

          case 16:
            _context.next = 22;
            break;

          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](13);

            if (options.verbose && spinner) {
              spinner.fail(_context.t0.message);
            } else {
              console.error("Cannot process file ".concat(_context.t0.message));
            }

            return _context.abrupt("return", true);

          case 22:
            if (options.verbose && spinner) spinner.succeed();
            return _context.abrupt("return", true);

          case 24:
            _context.next = 4;
            break;

          case 26:
            _context.next = 31;
            break;

          case 28:
            _context.prev = 28;
            _context.t1 = _context["catch"](2);

            _iterator.e(_context.t1);

          case 31:
            _context.prev = 31;

            _iterator.f();

            return _context.finish(31);

          case 34:
            return _context.abrupt("return", false);

          case 35:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[2, 28, 31, 34], [13, 18]]);
  }));
  return _extract.apply(this, arguments);
}