"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _commander = _interopRequireDefault(require("commander"));

var _jsYaml = _interopRequireDefault(require("js-yaml"));

var _jsdom = require("jsdom");

var _react = _interopRequireDefault(require("react"));

var _server = _interopRequireDefault(require("react-dom/server"));

var _luxon = require("luxon");

var _htmlPdf = _interopRequireDefault(require("html-pdf"));

var _d3Format = require("d3-format");

var _frFR = _interopRequireDefault(require("d3-format/locale/fr-FR"));

var _markdownToJsx = _interopRequireDefault(require("markdown-to-jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

(0, _d3Format.formatDefaultLocale)(_frFR.default);

_commander.default.version('0.1.0').option('-o, --output-dir <output-dir>', 'Output Directory').option('-c, --client <client>', 'Customer').option('-d, --debug', 'Debug mode').parse(process.argv);

if (!_commander.default.client) _commander.default.client = 'HUM';

var html = _fs.default.readFileSync('./base.html');

var provider = _jsYaml.default.safeLoad(_fs.default.readFileSync('./data/provider.yaml'), 'utf8');

var clients = _jsYaml.default.safeLoad(_fs.default.readFileSync('./data/clients.yaml'), 'utf8');

var items = _jsYaml.default.safeLoad(_fs.default.readFileSync('./data/items.yaml'), 'utf8');

var invoices = _jsYaml.default.safeLoad(_fs.default.readFileSync('./data/invoices.yaml'), 'utf8') || [];

var sprites = _fs.default.readdirSync('./images/sprites/').filter(function (path) {
  return path.endsWith('.png');
});

var randomId = Math.floor(Math.random() * (sprites.length - 1));
var randomSprite = "file://".concat(__dirname, "/images/sprites/").concat(sprites[randomId]);

var dateArray = _luxon.DateTime.local().toISO().split('T')[0].split('-');

var client = clients[_commander.default.client];
var id = invoices.length + 1;
var number = invoices.reduce(function (acc, invoice) {
  if (invoice.clientCode === client.code) return acc + 1;
  return acc;
}, 1);
var label = [].concat(_toConsumableArray(dateArray.slice(0, 2)), [client.code, "F".concat(number)]).join('_');
var invoice = {
  id: id,
  label: label,
  date: dateArray.reverse().join('/'),
  clientCode: client.code,
  priceHT: items.reduce(function (acc, _ref) {
    var unitPrice = _ref.unitPrice,
        quantity = _ref.quantity;
    return acc + unitPrice * quantity;
  }, 0)
};
invoices.push(invoice);

function getFullName(_ref2) {
  var firstName = _ref2.firstName,
      familyName = _ref2.familyName;
  return "".concat(firstName, " ").concat(familyName);
}

var Client = function Client(_ref3) {
  var name = _ref3.name,
      address = _ref3.address,
      zip = _ref3.zip,
      city = _ref3.city;
  return _react.default.createElement("section", {
    className: "client"
  }, _react.default.createElement("div", {
    className: "name"
  }, name), _react.default.createElement("div", {
    className: "address"
  }, address), _react.default.createElement("div", {
    className: "city"
  }, "".concat(zip, " ").concat(city)));
};

var Invoice = function Invoice(_ref4) {
  var id = _ref4.id,
      label = _ref4.label,
      date = _ref4.date;
  return _react.default.createElement("section", {
    className: "invoice"
  }, _react.default.createElement("div", {
    className: "date"
  }, _react.default.createElement("span", null, "Date"), date), _react.default.createElement("div", {
    className: "id"
  }, _react.default.createElement("span", null, "Facture n\xBA"), id), _react.default.createElement("div", {
    className: "label"
  }, _react.default.createElement("span", null, "Label"), label));
};

var Header = function Header(_ref5) {
  var description = _ref5.description,
      rest = _objectWithoutProperties(_ref5, ["description"]);

  return _react.default.createElement("header", null, _react.default.createElement("div", null, getFullName(rest)), _react.default.createElement("div", {
    className: "description"
  }, "{ ".concat(description, " }")));
};

function formatPrice(price) {
  return (0, _d3Format.format)("($,.2f")(price);
}

var Items = function Items(_ref6) {
  var items = _ref6.items;

  var Headers = function Headers() {
    return _react.default.createElement("h2", {
      className: "headers"
    }, _react.default.createElement("div", {
      className: "description"
    }, "Description"), _react.default.createElement("div", {
      className: "price"
    }, "Prix unitaire"), _react.default.createElement("div", {
      className: "quantity"
    }, "Quantit\xE9"), _react.default.createElement("div", {
      className: "price"
    }, "Prix"));
  };

  var myItems = items.map(function (_ref7, i) {
    var description = _ref7.description,
        unitPrice = _ref7.unitPrice,
        quantity = _ref7.quantity;
    return _react.default.createElement("div", {
      className: "item",
      key: i
    }, _react.default.createElement(_markdownToJsx.default, {
      className: "description"
    }, description), _react.default.createElement("div", {
      className: "price"
    }, formatPrice(unitPrice)), _react.default.createElement("div", {
      className: "quantity"
    }, quantity), _react.default.createElement("div", {
      className: "price"
    }, formatPrice(unitPrice * quantity)));
  });
  var totalHT = items.reduce(function (acc, _ref8) {
    var unitPrice = _ref8.unitPrice,
        quantity = _ref8.quantity;
    return acc + unitPrice * quantity;
  }, 0);
  var vat = 0;
  var totalTTC = totalHT * (1 + vat);

  var Totals = function Totals() {
    return _react.default.createElement("div", {
      className: "totals"
    }, _react.default.createElement("div", {
      className: "ht"
    }, _react.default.createElement("div", null, "Total HT"), _react.default.createElement("div", {
      className: "price"
    }, formatPrice(totalHT))), _react.default.createElement("div", {
      className: "taxes ".concat(!vat && 'zero')
    }, _react.default.createElement("div", null, "TVA"), _react.default.createElement("div", {
      className: "vat"
    }, vat || 'Exonérée')), _react.default.createElement("div", {
      className: "ttc"
    }, _react.default.createElement("div", null, "Total TTC"), _react.default.createElement("div", {
      className: "price"
    }, formatPrice(totalTTC))));
  };

  return _react.default.createElement("section", {
    className: "items"
  }, _react.default.createElement(Headers, null), myItems, _react.default.createElement(Totals, null));
};

var Payment = function Payment(_ref9) {
  var bank = _ref9.bank,
      iban = _ref9.iban,
      bic = _ref9.bic;
  return _react.default.createElement("section", {
    className: "payment"
  }, _react.default.createElement("h2", null, "Conditions de paiement"), _react.default.createElement("div", {
    className: "conditions"
  }, "\xC0 r\xE9ception de la pr\xE9sente facture, par virement aux coordonn\xE9es bancaires suivantes:"), _react.default.createElement("div", {
    className: "bankDetails"
  }, _react.default.createElement("div", {
    className: "name"
  }, bank), _react.default.createElement("div", {
    className: "iban"
  }, _react.default.createElement("span", null, "IBAN"), iban), _react.default.createElement("div", {
    className: "bic"
  }, _react.default.createElement("span", null, "BIC"), bic)), _react.default.createElement("div", {
    className: "delay"
  }, "Tout paiement diff\xE9r\xE9 entra\xEEne l'application d'un int\xE9r\xEAt de retard au taux de 15% annuel et d'une indemnit\xE9 forfaitaire de 40 \u20AC. Le paiement anticip\xE9 ne donne droit \xE0 aucun escompte. Les acomptes factur\xE9s ne sont pas des arrhes et ne permettent pas de renoncer au march\xE9."));
};

var Provider = function Provider(_ref10) {
  var description = _ref10.description,
      email = _ref10.email,
      phone = _ref10.phone,
      address = _ref10.address,
      zip = _ref10.zip,
      city = _ref10.city,
      siret = _ref10.siret,
      names = _objectWithoutProperties(_ref10, ["description", "email", "phone", "address", "zip", "city", "siret"]);

  return _react.default.createElement("div", {
    className: "provider"
  }, _react.default.createElement("div", {
    className: "name"
  }, "".concat(getFullName(names), " \n { ").concat(description, " }")), _react.default.createElement("div", {
    className: "siret"
  }, _react.default.createElement("span", null, "SIRET"), siret), _react.default.createElement("div", {
    className: "email"
  }, email), _react.default.createElement("div", {
    className: "phone"
  }, phone), _react.default.createElement("div", {
    className: "address"
  }, "".concat(address, " ").concat(zip, " ").concat(city)));
};

var Footer = function Footer(_ref11) {
  var provider = _ref11.provider,
      invoice = _ref11.invoice;
  return _react.default.createElement("div", null, _react.default.createElement("div", {
    className: "image"
  }, _react.default.createElement("img", {
    src: randomSprite,
    alt: "pokemon"
  })), _react.default.createElement(Provider, provider), _react.default.createElement("footer", null, _react.default.createElement("div", null, getFullName(provider)), _react.default.createElement("div", null, invoice.label), _react.default.createElement("div", null, "Facture n\xBA ".concat(invoice.id))));
};

var Facture = function Facture(_ref12) {
  var provider = _ref12.provider,
      client = _ref12.client,
      items = _ref12.items,
      invoice = _ref12.invoice;
  return _react.default.createElement(_react.default.Fragment, null, _react.default.createElement(Header, provider), _react.default.createElement("main", {
    className: "main"
  }, _react.default.createElement(Client, client), _react.default.createElement(Invoice, invoice), _react.default.createElement(Items, {
    items: items
  }), _react.default.createElement(Payment, provider.bankDetails)), _react.default.createElement(Footer, {
    provider: provider,
    invoice: invoice
  }));
};

var dom = new _jsdom.JSDOM(html, {
  resources: 'usable'
});
var document = dom.window.document;
document.body.innerHTML = _server.default.renderToStaticMarkup(_react.default.createElement(Facture, {
  provider: provider,
  items: items,
  client: client,
  invoice: invoice
}));
var options = {
  format: 'A4' // footer: {
  //   contents: {
  //     height: '10px',
  //     default: ReactDOMServer.renderToStaticMarkup(<Footer provider={provider} invoice={invoice} />),
  //   }
  // },

};

_fs.default.writeFileSync('./index.html', dom.serialize());

if (!_commander.default.debug) _fs.default.writeFileSync('./data/invoices.yaml', _jsYaml.default.safeDump(invoices));
var path = _commander.default.outputDir || '.';

_htmlPdf.default.create(dom.serialize(), options).toFile("".concat(path, "/").concat(label, ".pdf"), function (err, res) {
  if (err) return console.log(err);
  console.log(res);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzeCJdLCJuYW1lcyI6WyJsb2NhbGUiLCJwcm9ncmFtIiwidmVyc2lvbiIsIm9wdGlvbiIsInBhcnNlIiwicHJvY2VzcyIsImFyZ3YiLCJjbGllbnQiLCJodG1sIiwiZnMiLCJyZWFkRmlsZVN5bmMiLCJwcm92aWRlciIsInlhbWwiLCJzYWZlTG9hZCIsImNsaWVudHMiLCJpdGVtcyIsImludm9pY2VzIiwic3ByaXRlcyIsInJlYWRkaXJTeW5jIiwiZmlsdGVyIiwicGF0aCIsImVuZHNXaXRoIiwicmFuZG9tSWQiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJsZW5ndGgiLCJyYW5kb21TcHJpdGUiLCJfX2Rpcm5hbWUiLCJkYXRlQXJyYXkiLCJEYXRlVGltZSIsImxvY2FsIiwidG9JU08iLCJzcGxpdCIsImlkIiwibnVtYmVyIiwicmVkdWNlIiwiYWNjIiwiaW52b2ljZSIsImNsaWVudENvZGUiLCJjb2RlIiwibGFiZWwiLCJzbGljZSIsImpvaW4iLCJkYXRlIiwicmV2ZXJzZSIsInByaWNlSFQiLCJ1bml0UHJpY2UiLCJxdWFudGl0eSIsInB1c2giLCJnZXRGdWxsTmFtZSIsImZpcnN0TmFtZSIsImZhbWlseU5hbWUiLCJDbGllbnQiLCJuYW1lIiwiYWRkcmVzcyIsInppcCIsImNpdHkiLCJJbnZvaWNlIiwiSGVhZGVyIiwiZGVzY3JpcHRpb24iLCJyZXN0IiwiZm9ybWF0UHJpY2UiLCJwcmljZSIsIkl0ZW1zIiwiSGVhZGVycyIsIm15SXRlbXMiLCJtYXAiLCJpIiwidG90YWxIVCIsInZhdCIsInRvdGFsVFRDIiwiVG90YWxzIiwiUGF5bWVudCIsImJhbmsiLCJpYmFuIiwiYmljIiwiUHJvdmlkZXIiLCJlbWFpbCIsInBob25lIiwic2lyZXQiLCJuYW1lcyIsIkZvb3RlciIsIkZhY3R1cmUiLCJiYW5rRGV0YWlscyIsImRvbSIsIkpTRE9NIiwicmVzb3VyY2VzIiwiZG9jdW1lbnQiLCJ3aW5kb3ciLCJib2R5IiwiaW5uZXJIVE1MIiwiUmVhY3RET01TZXJ2ZXIiLCJyZW5kZXJUb1N0YXRpY01hcmt1cCIsIm9wdGlvbnMiLCJmb3JtYXQiLCJ3cml0ZUZpbGVTeW5jIiwic2VyaWFsaXplIiwiZGVidWciLCJzYWZlRHVtcCIsIm91dHB1dERpciIsInBkZiIsImNyZWF0ZSIsInRvRmlsZSIsImVyciIsInJlcyIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxtQ0FBb0JBLGFBQXBCOztBQUVBQyxtQkFDR0MsT0FESCxDQUNXLE9BRFgsRUFFR0MsTUFGSCxDQUVVLCtCQUZWLEVBRTJDLGtCQUYzQyxFQUdHQSxNQUhILENBR1UsdUJBSFYsRUFHbUMsVUFIbkMsRUFJR0EsTUFKSCxDQUlVLGFBSlYsRUFJeUIsWUFKekIsRUFLR0MsS0FMSCxDQUtTQyxPQUFPLENBQUNDLElBTGpCOztBQU9BLElBQUksQ0FBQ0wsbUJBQVFNLE1BQWIsRUFDRU4sbUJBQVFNLE1BQVIsR0FBaUIsS0FBakI7O0FBRUYsSUFBTUMsSUFBSSxHQUFHQyxZQUFHQyxZQUFILENBQWdCLGFBQWhCLENBQWI7O0FBQ0EsSUFBTUMsUUFBUSxHQUFHQyxnQkFBS0MsUUFBTCxDQUFjSixZQUFHQyxZQUFILENBQWdCLHNCQUFoQixDQUFkLEVBQXVELE1BQXZELENBQWpCOztBQUNBLElBQU1JLE9BQU8sR0FBR0YsZ0JBQUtDLFFBQUwsQ0FBY0osWUFBR0MsWUFBSCxDQUFnQixxQkFBaEIsQ0FBZCxFQUFzRCxNQUF0RCxDQUFoQjs7QUFDQSxJQUFNSyxLQUFLLEdBQUdILGdCQUFLQyxRQUFMLENBQWNKLFlBQUdDLFlBQUgsQ0FBZ0IsbUJBQWhCLENBQWQsRUFBb0QsTUFBcEQsQ0FBZDs7QUFDQSxJQUFNTSxRQUFRLEdBQUdKLGdCQUFLQyxRQUFMLENBQWNKLFlBQUdDLFlBQUgsQ0FBZ0Isc0JBQWhCLENBQWQsRUFBdUQsTUFBdkQs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Q0E7QUFDQTs7QUFQWSxDQUFkOztBQVVBdEYsWUFBR3VGLGFBQUgsQ0FBaUIsY0FBakIsRUFBaUNYLEdBQUcsQ0FBQ1ksU0FBSixFQUFqQzs7QUFFQSxJQUFJLENBQUNoRyxtQkFBUWlHLEtBQWIsRUFDRXpGLFlBQUd1RixhQUFILENBQWlCLHNCQUFqQixFQUF5Q3BGLGdCQUFLdUYsUUFBTCxDQUFjbkYsUUFBZCxDQUF6QztBQUVGLElBQU1JLElBQUksR0FBR25CLG1CQUFRbUcsU0FBUixJQUFxQixHQUFsQzs7QUFFQUMsaUJBQUlDLE1BQUosQ0FBV2pCLEdBQUcsQ0FBQ1ksU0FBSixFQUFYLEVBQTRCSCxPQUE1QixFQUFxQ1MsTUFBckMsV0FBK0NuRixJQUEvQyxjQUF1RHFCLEtBQXZELFdBQW9FLFVBQVUrRCxHQUFWLEVBQWVDLEdBQWYsRUFBb0I7QUFDdEYsTUFBSUQsR0FBSixFQUFTLE9BQU9FLE9BQU8sQ0FBQ0MsR0FBUixDQUFZSCxHQUFaLENBQVA7QUFDVEUsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVlGLEdBQVo7QUFDRCxDQUhEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwcm9ncmFtIGZyb20gJ2NvbW1hbmRlcic7XG5pbXBvcnQgeWFtbCBmcm9tICdqcy15YW1sJztcbmltcG9ydCB7IEpTRE9NIH0gZnJvbSAnanNkb20nO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTVNlcnZlciBmcm9tICdyZWFjdC1kb20vc2VydmVyJztcbmltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSAnbHV4b24nO1xuaW1wb3J0IHBkZiBmcm9tICdodG1sLXBkZic7XG5cbmltcG9ydCB7IGZvcm1hdCwgZm9ybWF0RGVmYXVsdExvY2FsZSB9IGZyb20gJ2QzLWZvcm1hdCc7XG5pbXBvcnQgbG9jYWxlIGZyb20gJ2QzLWZvcm1hdC9sb2NhbGUvZnItRlInO1xuaW1wb3J0IE1hcmtkb3duIGZyb20gJ21hcmtkb3duLXRvLWpzeCc7XG5cbmZvcm1hdERlZmF1bHRMb2NhbGUobG9jYWxlKTtcblxucHJvZ3JhbVxuICAudmVyc2lvbignMC4xLjAnKVxuICAub3B0aW9uKCctbywgLS1vdXRwdXQtZGlyIDxvdXRwdXQtZGlyPicsICdPdXRwdXQgRGlyZWN0b3J5JylcbiAgLm9wdGlvbignLWMsIC0tY2xpZW50IDxjbGllbnQ+JywgJ0N1c3RvbWVyJylcbiAgLm9wdGlvbignLWQsIC0tZGVidWcnLCAnRGVidWcgbW9kZScpXG4gIC5wYXJzZShwcm9jZXNzLmFyZ3YpO1xuXG5pZiAoIXByb2dyYW0uY2xpZW50KVxuICBwcm9ncmFtLmNsaWVudCA9ICdIVU0nO1xuXG5jb25zdCBodG1sID0gZnMucmVhZEZpbGVTeW5jKCcuL2Jhc2UuaHRtbCcpO1xuY29uc3QgcHJvdmlkZXIgPSB5YW1sLnNhZmVMb2FkKGZzLnJlYWRGaWxlU3luYygnLi9kYXRhL3Byb3ZpZGVyLnlhbWwnKSwgJ3V0ZjgnKTtcbmNvbnN0IGNsaWVudHMgPSB5YW1sLnNhZmVMb2FkKGZzLnJlYWRGaWxlU3luYygnLi9kYXRhL2NsaWVudHMueWFtbCcpLCAndXRmOCcpO1xuY29uc3QgaXRlbXMgPSB5YW1sLnNhZmVMb2FkKGZzLnJlYWRGaWxlU3luYygnLi9kYXRhL2l0ZW1zLnlhbWwnKSwgJ3V0ZjgnKTtcbmNvbnN0IGludm9pY2VzID0geWFtbC5zYWZlTG9hZChmcy5yZWFkRmlsZVN5bmMoJy4vZGF0YS9pbnZvaWNlcy55YW1sJyksICd1dGY4JykgfHwgW107XG5cbmNvbnN0IHNwcml0ZXMgPSBmcy5yZWFkZGlyU3luYygnLi9pbWFnZXMvc3ByaXRlcy8nKS5maWx0ZXIocGF0aCA9PiBwYXRoLmVuZHNXaXRoKCcucG5nJykpO1xuY29uc3QgcmFuZG9tSWQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoc3ByaXRlcy5sZW5ndGggLSAxKSk7XG5cbmNvbnN0IHJhbmRvbVNwcml0ZSA9IGBmaWxlOi8vJHtfX2Rpcm5hbWV9L2ltYWdlcy9zcHJpdGVzLyR7c3ByaXRlc1tyYW5kb21JZF19YDtcblxuY29uc3QgZGF0ZUFycmF5ID0gRGF0ZVRpbWUubG9jYWwoKS50b0lTTygpLnNwbGl0KCdUJylbMF0uc3BsaXQoJy0nKTtcblxuY29uc3QgY2xpZW50ID0gY2xpZW50c1twcm9ncmFtLmNsaWVudF07XG5cbmNvbnN0IGlkID0gaW52b2ljZXMubGVuZ3RoICsgMTtcbmNvbnN0IG51bWJlciA9IGludm9pY2VzLnJlZHVjZSgoYWNjLCBpbnZvaWNlKSA9PiB7XG4gIGlmIChpbnZvaWNlLmNsaWVudENvZGUgPT09IGNsaWVudC5jb2RlKVxuICAgIHJldHVybiBhY2MgKyAxO1xuICByZXR1cm4gYWNjO1xufSwgMSk7XG5cbmNvbnN0IGxhYmVsID0gWy4uLmRhdGVBcnJheS5zbGljZSgwLCAyKSwgY2xpZW50LmNvZGUsIGBGJHtudW1iZXJ9YF0uam9pbignXycpO1xuXG5jb25zdCBpbnZvaWNlID0ge1xuICBpZCxcbiAgbGFiZWwsXG4gIGRhdGU6IGRhdGVBcnJheS5yZXZlcnNlKCkuam9pbignLycpLFxuICBjbGllbnRDb2RlOiBjbGllbnQuY29kZSxcbiAgcHJpY2VIVDogaXRlbXMucmVkdWNlKChhY2MsIHsgdW5pdFByaWNlLCBxdWFudGl0eSB9KSA9PiBhY2MgKyB1bml0UHJpY2UgKiBxdWFudGl0eSwgMClcbn07XG5cbmludm9pY2VzLnB1c2goaW52b2ljZSk7XG5cbmZ1bmN0aW9uIGdldEZ1bGxOYW1lKHsgZmlyc3ROYW1lLCBmYW1pbHlOYW1lIH0pIHtcbiAgcmV0dXJuIGAke2ZpcnN0TmFtZX0gJHtmYW1pbHlOYW1lfWA7XG59XG5cbmNvbnN0IENsaWVudCA9ICh7IG5hbWUsIGFkZHJlc3MsIHppcCwgY2l0eSB9KSA9PiAoXG4gIDxzZWN0aW9uIGNsYXNzTmFtZT0nY2xpZW50Jz5cbiAgICA8ZGl2IGNsYXNzTmFtZT0nbmFtZSc+eyBuYW1lIH08L2Rpdj5cbiAgICA8ZGl2IGNsYXNzTmFtZT0nYWRkcmVzcyc+eyBhZGRyZXNzIH08L2Rpdj5cbiAgICA8ZGl2IGNsYXNzTmFtZT0nY2l0eSc+eyBgJHt6aXB9ICR7Y2l0eX1gIH08L2Rpdj5cbiAgPC9zZWN0aW9uPlxuKTtcblxuY29uc3QgSW52b2ljZSA9ICh7IGlkLCBsYWJlbCwgZGF0ZSB9KSA9PiB7XG4gIHJldHVybiAoXG4gICAgPHNlY3Rpb24gY2xhc3NOYW1lPSdpbnZvaWNlJz5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdkYXRlJz5cbiAgICAgICAgPHNwYW4+RGF0ZTwvc3Bhbj5cbiAgICAgICAge2RhdGV9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdpZCc+XG4gICAgICAgIDxzcGFuPkZhY3R1cmUgbsK6PC9zcGFuPlxuICAgICAgICB7IGlkIH1cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9J2xhYmVsJz5cbiAgICAgICAgPHNwYW4+TGFiZWw8L3NwYW4+XG4gICAgICAgIHsgbGFiZWwgfVxuICAgICAgPC9kaXY+XG4gICAgPC9zZWN0aW9uPlxuICApXG59O1xuXG5jb25zdCBIZWFkZXIgPSAoeyBkZXNjcmlwdGlvbiwgLi4uIHJlc3R9KSA9PiAoXG4gIDxoZWFkZXI+XG4gICAgPGRpdj57IGdldEZ1bGxOYW1lKHJlc3QpIH08L2Rpdj5cbiAgICA8ZGl2IGNsYXNzTmFtZT0nZGVzY3JpcHRpb24nPnsgYHsgJHtkZXNjcmlwdGlvbn0gfWAgfTwvZGl2PlxuICA8L2hlYWRlcj5cbik7XG5cbmZ1bmN0aW9uIGZvcm1hdFByaWNlKHByaWNlKSB7XG4gIHJldHVybiBmb3JtYXQoXCIoJCwuMmZcIikocHJpY2UpO1xufVxuXG5jb25zdCBJdGVtcyA9ICh7IGl0ZW1zIH0pID0+IHtcbiAgY29uc3QgSGVhZGVycyA9ICgpID0+IChcbiAgICA8aDIgY2xhc3NOYW1lPSdoZWFkZXJzJz5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdkZXNjcmlwdGlvbic+RGVzY3JpcHRpb248L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdwcmljZSc+UHJpeCB1bml0YWlyZTwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9J3F1YW50aXR5Jz5RdWFudGl0w6k8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdwcmljZSc+UHJpeDwvZGl2PlxuICAgIDwvaDI+XG4gICk7XG5cbiAgY29uc3QgbXlJdGVtcyA9IGl0ZW1zLm1hcCgoeyBkZXNjcmlwdGlvbiwgdW5pdFByaWNlLCBxdWFudGl0eSB9LCBpKSA9PiAoXG4gICAgPGRpdiBjbGFzc05hbWU9J2l0ZW0nIGtleT17IGkgfT5cbiAgICAgIDxNYXJrZG93biBjbGFzc05hbWU9J2Rlc2NyaXB0aW9uJz5cbiAgICAgICAgeyBkZXNjcmlwdGlvbiB9XG4gICAgICA8L01hcmtkb3duPlxuICAgICAgPGRpdiBjbGFzc05hbWU9J3ByaWNlJz57IGZvcm1hdFByaWNlKHVuaXRQcmljZSkgfTwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9J3F1YW50aXR5Jz57IHF1YW50aXR5IH08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdwcmljZSc+eyBmb3JtYXRQcmljZSh1bml0UHJpY2UgKiBxdWFudGl0eSkgfTwvZGl2PlxuICAgIDwvZGl2PlxuICApKTtcblxuICBjb25zdCB0b3RhbEhUID0gaXRlbXMucmVkdWNlKChhY2MsIHsgdW5pdFByaWNlLCBxdWFudGl0eSB9KSA9PiBhY2MgKyB1bml0UHJpY2UgKiBxdWFudGl0eSwgMCk7XG4gIGNvbnN0IHZhdCA9IDA7XG4gIGNvbnN0IHRvdGFsVFRDID0gdG90YWxIVCAqICgxICsgdmF0KTtcblxuICBjb25zdCBUb3RhbHMgPSAoKSA9PiAoXG4gICAgPGRpdiBjbGFzc05hbWU9J3RvdGFscyc+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT0naHQnPlxuICAgICAgICA8ZGl2PlRvdGFsIEhUPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwcmljZSc+eyBmb3JtYXRQcmljZSh0b3RhbEhUKSB9PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdGF4ZXMgJHshdmF0ICYmICd6ZXJvJ31gfT5cbiAgICAgICAgPGRpdj5UVkE8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J3ZhdCc+eyB2YXQgfHwgJ0V4b27DqXLDqWUnIH08L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9J3R0Yyc+XG4gICAgICAgIDxkaXY+VG90YWwgVFRDPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwcmljZSc+eyBmb3JtYXRQcmljZSh0b3RhbFRUQykgfTwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvbiBjbGFzc05hbWU9J2l0ZW1zJz5cbiAgICAgIDxIZWFkZXJzIC8+XG4gICAgICB7IG15SXRlbXMgfVxuICAgICAgPFRvdGFscyAvPlxuICAgIDwvc2VjdGlvbj5cbiAgKTtcbn07XG5cbmNvbnN0IFBheW1lbnQgPSAoeyBiYW5rLCBpYmFuLCBiaWN9KSA9PiAoXG4gIDxzZWN0aW9uIGNsYXNzTmFtZT0ncGF5bWVudCc+XG4gICAgPGgyPkNvbmRpdGlvbnMgZGUgcGFpZW1lbnQ8L2gyPlxuICAgIDxkaXYgY2xhc3NOYW1lPSdjb25kaXRpb25zJz5cbiAgICAgIMOAIHLDqWNlcHRpb24gZGUgbGEgcHLDqXNlbnRlIGZhY3R1cmUsIHBhciB2aXJlbWVudCBhdXggY29vcmRvbm7DqWVzIGJhbmNhaXJlcyBzdWl2YW50ZXM6XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzc05hbWU9J2JhbmtEZXRhaWxzJz5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPSduYW1lJz57IGJhbmsgfTwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9J2liYW4nPjxzcGFuPklCQU48L3NwYW4+eyBpYmFuIH08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdiaWMnPjxzcGFuPkJJQzwvc3Bhbj57IGJpYyB9PC9kaXY+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzc05hbWU9J2RlbGF5Jz5cbiAgICAgIFRvdXQgcGFpZW1lbnQgZGlmZsOpcsOpIGVudHJhw65uZSBsJ2FwcGxpY2F0aW9uIGQndW4gaW50w6lyw6p0IGRlIHJldGFyZCBhdSB0YXV4IGRlIDE1JSBhbm51ZWwgZXQgZCd1bmUgaW5kZW1uaXTDqVxuICAgICAgZm9yZmFpdGFpcmUgZGUgNDAg4oKsLiBMZSBwYWllbWVudCBhbnRpY2lww6kgbmUgZG9ubmUgZHJvaXQgw6AgYXVjdW4gZXNjb21wdGUuXG4gICAgICBMZXMgYWNvbXB0ZXMgZmFjdHVyw6lzIG5lIHNvbnQgcGFzIGRlcyBhcnJoZXMgZXQgbmUgcGVybWV0dGVudCBwYXMgZGUgcmVub25jZXIgYXUgbWFyY2jDqS5cbiAgICA8L2Rpdj5cbiAgPC9zZWN0aW9uPlxuKTtcblxuY29uc3QgUHJvdmlkZXIgPSAoe1xuICBkZXNjcmlwdGlvbiwgZW1haWwsIHBob25lLCBhZGRyZXNzLCB6aXAsIGNpdHksIHNpcmV0LCAuLi5uYW1lc1xufSkgPT4gKFxuICA8ZGl2IGNsYXNzTmFtZT0ncHJvdmlkZXInPlxuICAgIDxkaXYgY2xhc3NOYW1lPSduYW1lJz57IGAke2dldEZ1bGxOYW1lKG5hbWVzKX0gXFxuIHsgJHsgZGVzY3JpcHRpb24gfSB9YCB9PC9kaXY+XG4gICAgPGRpdiBjbGFzc05hbWU9J3NpcmV0Jz48c3Bhbj5TSVJFVDwvc3Bhbj57IHNpcmV0IH08L2Rpdj5cbiAgICA8ZGl2IGNsYXNzTmFtZT0nZW1haWwnPnsgZW1haWwgfTwvZGl2PlxuICAgIDxkaXYgY2xhc3NOYW1lPSdwaG9uZSc+eyBwaG9uZSB9PC9kaXY+XG4gICAgPGRpdiBjbGFzc05hbWU9J2FkZHJlc3MnPnsgYCR7YWRkcmVzc30gJHt6aXB9ICR7Y2l0eX1gIH08L2Rpdj5cbiAgPC9kaXY+XG4pO1xuXG5jb25zdCBGb290ZXIgPSAoeyBwcm92aWRlciwgaW52b2ljZSB9KSA9PiAoXG4gIDxkaXY+XG4gICAgPGRpdiBjbGFzc05hbWU9J2ltYWdlJz5cbiAgICAgIDxpbWcgc3JjPXtyYW5kb21TcHJpdGV9IGFsdD0ncG9rZW1vbicgLz5cbiAgICA8L2Rpdj5cbiAgICA8UHJvdmlkZXIgey4uLnByb3ZpZGVyfSAvPlxuICAgIDxmb290ZXI+XG4gICAgICA8ZGl2PnsgZ2V0RnVsbE5hbWUocHJvdmlkZXIpIH08L2Rpdj5cbiAgICAgIDxkaXY+e2ludm9pY2UubGFiZWx9PC9kaXY+XG4gICAgICA8ZGl2PntgRmFjdHVyZSBuwrogJHtpbnZvaWNlLmlkfWB9PC9kaXY+XG4gICAgPC9mb290ZXI+XG4gIDwvZGl2PlxuKTtcblxuY29uc3QgRmFjdHVyZSA9ICh7IHByb3ZpZGVyLCBjbGllbnQsIGl0ZW1zLCBpbnZvaWNlIH0pID0+IChcbiAgPD5cbiAgICA8SGVhZGVyIHsgLi4ucHJvdmlkZXIgfSAvPlxuICAgIDxtYWluIGNsYXNzTmFtZT0nbWFpbic+XG4gICAgICA8Q2xpZW50IHsgLi4uY2xpZW50IH0gLz5cbiAgICAgIDxJbnZvaWNlIHsgLi4uaW52b2ljZSB9IC8+XG4gICAgICA8SXRlbXMgaXRlbXM9eyBpdGVtcyB9IC8+XG4gICAgICA8UGF5bWVudCB7IC4uLnByb3ZpZGVyLmJhbmtEZXRhaWxzIH0gLz5cbiAgICA8L21haW4+XG4gICAgPEZvb3RlciBwcm92aWRlcj17cHJvdmlkZXJ9IGludm9pY2U9e2ludm9pY2V9IC8+XG4gIDwvPlxuKTtcblxuXG5jb25zdCBkb20gPSBuZXcgSlNET00oaHRtbCwgeyByZXNvdXJjZXM6ICd1c2FibGUnfSk7XG5jb25zdCBkb2N1bWVudCA9IGRvbS53aW5kb3cuZG9jdW1lbnQ7XG5cbmRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gUmVhY3RET01TZXJ2ZXIucmVuZGVyVG9TdGF0aWNNYXJrdXAoXG4gIDxGYWN0dXJlIHByb3ZpZGVyPXtwcm92aWRlcn0gaXRlbXM9e2l0ZW1zfSBjbGllbnQ9e2NsaWVudH0gaW52b2ljZT17aW52b2ljZX0gLz5cbik7XG5cbnZhciBvcHRpb25zID0ge1xuICBmb3JtYXQ6ICdBNCcsXG4gIC8vIGZvb3Rlcjoge1xuICAvLyAgIGNvbnRlbnRzOiB7XG4gIC8vICAgICBoZWlnaHQ6ICcxMHB4JyxcbiAgLy8gICAgIGRlZmF1bHQ6IFJlYWN0RE9NU2VydmVyLnJlbmRlclRvU3RhdGljTWFya3VwKDxGb290ZXIgcHJvdmlkZXI9e3Byb3ZpZGVyfSBpbnZvaWNlPXtpbnZvaWNlfSAvPiksXG4gIC8vICAgfVxuICAvLyB9LFxufTtcblxuZnMud3JpdGVGaWxlU3luYygnLi9pbmRleC5odG1sJywgZG9tLnNlcmlhbGl6ZSgpKTtcblxuaWYgKCFwcm9ncmFtLmRlYnVnKVxuICBmcy53cml0ZUZpbGVTeW5jKCcuL2RhdGEvaW52b2ljZXMueWFtbCcsIHlhbWwuc2FmZUR1bXAoaW52b2ljZXMpKTtcblxuY29uc3QgcGF0aCA9IHByb2dyYW0ub3V0cHV0RGlyIHx8ICcuJztcblxucGRmLmNyZWF0ZShkb20uc2VyaWFsaXplKCksIG9wdGlvbnMpLnRvRmlsZShgJHtwYXRofS8ke2xhYmVsfS5wZGZgLCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgaWYgKGVycikgcmV0dXJuIGNvbnNvbGUubG9nKGVycik7XG4gIGNvbnNvbGUubG9nKHJlcyk7XG59KTtcbiJdfQ==