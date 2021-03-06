(function(root, factory) {
  var Immutable;
  if (typeof define === 'function' && define.amd) {
    return define(['immutable', 'exports'], function(Immutable, exports) {
      return root.Fallout = factory(root, exports, Immutable);
    });
  } else if (typeof exports !== 'undefined') {
    Immutable = require('immutable');
    return factory(root, exports, Immutable);
  } else {
    return root.Fallout = factory(root, {}, root.Immutable);
  }
})(this, function(root, Fallout, Immutable) {
  Fallout.Immutable = Immutable;
  Fallout.Store = (function() {
    function _Class() {
      this.data = Immutable.Map();
      this.listeners = [];
    }

    _Class.prototype.emitChange = function() {
      var i, len, listener, ref, results;
      ref = this.listeners;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        listener = ref[i];
        results.push(listener.call(this));
      }
      return results;
    };

    _Class.prototype.observe = function(handler) {
      if (!(this.listeners.indexOf(handler) >= 0)) {
        return this.listeners.push(handler);
      }
    };

    _Class.prototype.ignore = function(handler) {
      var index;
      index = this.listeners.indexOf(handler);
      if (!(index >= 0)) {
        return;
      }
      return this.listeners.splice(index, 1);
    };

    _Class.prototype.checkOut = function() {
      return this.data.toJS();
    };

    _Class.prototype.checkIn = function(newData) {
      this.data = this.data.mergeDeep(newData);
      return this.emitChange();
    };

    return _Class;

  })();
  Fallout.store = new Fallout.Store();
  Fallout.actions = {};
  Fallout.defineActionSet = function(name, params) {
    Fallout.actions[name] = params;
    return Fallout.actions[name].store = Fallout.store;
  };
  Fallout.Mixin = {
    componentWillMount: function() {
      var name, ref, results, selector;
      this.actions = Fallout.actions;
      ref = this._falloutWatchSelectors();
      results = [];
      for (name in ref) {
        selector = ref[name];
        results.push(this._updateStateFromFallout(name, Fallout.store.data.getIn(selector)));
      }
      return results;
    },
    componentDidMount: function() {
      return Fallout.store.observe(this.onFalloutStoreChange);
    },
    componentWillUnmount: function() {
      return Fallout.store.ignore(this.onFalloutStoreChange);
    },
    onFalloutStoreChange: function() {
      var name, ref, results, selector, storeValue;
      ref = this._falloutWatchSelectors();
      results = [];
      for (name in ref) {
        selector = ref[name];
        storeValue = Fallout.store.data.getIn(selector);
        if (this.state["_" + name] !== storeValue) {
          results.push(this._updateStateFromFallout(name, storeValue));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    _falloutWatchSelectors: function() {
      var selectors;
      if (this.watch != null) {
        return selectors = typeof this.watch === 'function' ? this.watch() : this.watch;
      } else {
        return {};
      }
    },
    _updateStateFromFallout: function(name, value) {
      var newState;
      newState = {};
      if ((value != null) && (value.toJS != null)) {
        newState[name] = value.toJS();
      } else {
        newState[name] = value;
      }
      newState["_" + name] = value;
      return this.setState(newState);
    }
  };
  return Fallout;
});
