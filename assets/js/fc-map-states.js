/* FirstCall map helper — paints served states + keeps city labels readable
 * above the shading. Loaded by index.html / locations.html alongside Leaflet.
 *
 * Approach:
 *   tilePane  (z=200)  → Voyager base tiles (NO LABELS)
 *   overlayPane (z=400) → states GeoJSON (served = green fill)
 *   fcLabelsPane (z=450) → Voyager labels-only tiles (non-interactive)
 *   markerPane (z=600) → branch pins (untouched)
 *
 * This keeps city/state names visible on top of shaded states without putting
 * any grid or pattern overlay on the map itself.
 */
(function () {
  "use strict";

  var STATE_NAMES = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
    MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
    MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
    NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
    ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
    RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
    TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
    WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia"
  };

  // States where FirstCall has service coverage but not (yet) a branch pin.
  // Combined with branch states from FC_LOCATIONS to produce the shaded set.
  var COVERAGE_STATES = ["OK", "MS", "AL", "TN", "KY", "CT"];

  var BASE_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png";
  var LABEL_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png";
  var BASE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" rel="noopener">CARTO</a>';
  var STATES_URL = "assets/data/us-states.geo.json";

  // Served states are derived from FC_LOCATIONS so the map stays in sync with
  // the directory. Pass an `extra` array to shade additional states that have
  // service coverage without a branch pin.
  function servedStateNames(branches, extra) {
    var set = Object.create(null);
    (branches || []).forEach(function (b) {
      if (b && b.state && STATE_NAMES[b.state]) set[STATE_NAMES[b.state]] = true;
    });
    (extra || []).forEach(function (code) {
      if (STATE_NAMES[code]) set[STATE_NAMES[code]] = true;
    });
    return set;
  }

  function stateStyle(isServed) {
    if (isServed) {
      return {
        fillColor: "#1A4120",
        fillOpacity: 0.58,
        color: "#0F2814",
        weight: 1.4,
        opacity: 0.9
      };
    }
    return {
      fillColor: "#000000",
      fillOpacity: 0,
      color: "#000000",
      weight: 0,
      opacity: 0
    };
  }

  // Replaces the previous single-tile base. Wires base + states + labels in
  // the correct stacking order so pins (added by the caller afterward) end up
  // visually on top.
  function addBaseAndStates(map, branches, opts) {
    opts = opts || {};

    // Labels pane sits above overlayPane (where GeoJSON renders).
    if (!map.getPane("fcLabelsPane")) {
      map.createPane("fcLabelsPane");
      var p = map.getPane("fcLabelsPane");
      p.style.zIndex = 450;
      p.style.pointerEvents = "none";
    }

    L.tileLayer(BASE_TILES, {
      subdomains: "abcd",
      maxZoom: 19,
      noWrap: true,
      bounds: [[-85, -180], [85, 180]],
      attribution: BASE_ATTR
    }).addTo(map);

    // Fire-and-forget — pins keep rendering even if the geojson fetch fails.
    var extra = opts.extraStates || COVERAGE_STATES;
    var served = servedStateNames(branches, extra);
    fetch(STATES_URL, { cache: "force-cache" })
      .then(function (r) { if (!r.ok) throw new Error("states " + r.status); return r.json(); })
      .then(function (geo) {
        L.geoJSON(geo, {
          interactive: false,
          smoothFactor: 0.5,
          style: function (feature) {
            return stateStyle(!!served[feature.properties && feature.properties.name]);
          }
        }).addTo(map);
      })
      .catch(function (err) {
        console.warn("[fc-map] states overlay failed:", err && err.message);
      });

    L.tileLayer(LABEL_TILES, {
      subdomains: "abcd",
      maxZoom: 19,
      noWrap: true,
      bounds: [[-85, -180], [85, 180]],
      pane: "fcLabelsPane",
      attribution: ""
    }).addTo(map);
  }

  window.FC_MAP = window.FC_MAP || {};
  window.FC_MAP.addBaseAndStates = addBaseAndStates;
})();
