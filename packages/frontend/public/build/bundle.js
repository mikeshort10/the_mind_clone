
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.24.1 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(10, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(9, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(8, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 256) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 1536) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [routes, location, base, basepath, url, $$scope, $$slots];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.24.1 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 2,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[1],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 530) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[1],
    		/*routeProps*/ ctx[2]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
    					dirty & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 8) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(1, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(2, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		$$slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * A link action that can be added to <a href=""> tags rather
     * than using the <Link> component.
     *
     * Example:
     * ```html
     * <a href="/post/{postId}" use:link>{post.title}</a>
     * ```
     */
    function link(node) {
      function onClick(event) {
        const anchor = event.currentTarget;

        if (
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event)
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /* src/Tailwind.svelte generated by Svelte v3.24.1 */

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tailwind> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tailwind", $$slots, []);
    	return [];
    }

    class Tailwind extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwind",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Button.svelte generated by Svelte v3.24.1 */

    const file = "src/components/Button.svelte";

    function create_fragment$3(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "text-white px-3 py-2 border rounded bg-blue-400 svelte-1d6b8gf");
    			add_location(button, file, 8, 0, 88);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					prevent_default(function () {
    						if (is_function(/*onClick*/ ctx[0])) /*onClick*/ ctx[0].apply(this, arguments);
    					}),
    					false,
    					true,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { onClick } = $$props;
    	const writable_props = ["onClick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Button", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("onClick" in $$props) $$invalidate(0, onClick = $$props.onClick);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ onClick });

    	$$self.$inject_state = $$props => {
    		if ("onClick" in $$props) $$invalidate(0, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onClick, $$scope, $$slots];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { onClick: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onClick*/ ctx[0] === undefined && !("onClick" in props)) {
    			console.warn("<Button> was created without expected prop 'onClick'");
    		}
    	}

    	get onClick() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Input.svelte generated by Svelte v3.24.1 */

    const file$1 = "src/components/Input.svelte";

    // (9:0) {#if id && label}
    function create_if_block$1(ctx) {
    	let div;
    	let label_1;
    	let t0;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[4]);
    			t1 = space();
    			input = element("input");
    			attr_dev(label_1, "for", /*id*/ ctx[3]);
    			attr_dev(label_1, "class", "text-center text-gray-800");
    			add_location(label_1, file$1, 10, 4, 164);
    			attr_dev(input, "class", "border text-center rounded py-1");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[0]);
    			input.value = /*value*/ ctx[2];
    			add_location(input, file$1, 11, 4, 234);
    			attr_dev(div, "class", "flex flex-col w-full pb-2");
    			add_location(div, file$1, 9, 2, 120);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label_1);
    			append_dev(label_1, t0);
    			append_dev(div, t1);
    			append_dev(div, input);

    			if (!mounted) {
    				dispose = listen_dev(
    					input,
    					"keyup",
    					function () {
    						if (is_function(/*onChange*/ ctx[1])) /*onChange*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*label*/ 16) set_data_dev(t0, /*label*/ ctx[4]);

    			if (dirty & /*id*/ 8) {
    				attr_dev(label_1, "for", /*id*/ ctx[3]);
    			}

    			if (dirty & /*placeholder*/ 1) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[0]);
    			}

    			if (dirty & /*value*/ 4 && input.value !== /*value*/ ctx[2]) {
    				prop_dev(input, "value", /*value*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(9:0) {#if id && label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let if_block = /*id*/ ctx[3] && /*label*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*id*/ ctx[3] && /*label*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { placeholder = "" } = $$props,
    		{ onChange } = $$props,
    		{ value = "" } = $$props,
    		{ id } = $$props,
    		{ label } = $$props;

    	const writable_props = ["placeholder", "onChange", "value", "id", "label"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Input", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    		if ("onChange" in $$props) $$invalidate(1, onChange = $$props.onChange);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("label" in $$props) $$invalidate(4, label = $$props.label);
    	};

    	$$self.$capture_state = () => ({ placeholder, onChange, value, id, label });

    	$$self.$inject_state = $$props => {
    		if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    		if ("onChange" in $$props) $$invalidate(1, onChange = $$props.onChange);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("label" in $$props) $$invalidate(4, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [placeholder, onChange, value, id, label];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			placeholder: 0,
    			onChange: 1,
    			value: 2,
    			id: 3,
    			label: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onChange*/ ctx[1] === undefined && !("onChange" in props)) {
    			console.warn("<Input> was created without expected prop 'onChange'");
    		}

    		if (/*id*/ ctx[3] === undefined && !("id" in props)) {
    			console.warn("<Input> was created without expected prop 'id'");
    		}

    		if (/*label*/ ctx[4] === undefined && !("label" in props)) {
    			console.warn("<Input> was created without expected prop 'label'");
    		}
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/FormGroup.svelte generated by Svelte v3.24.1 */

    const file$2 = "src/components/FormGroup.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "w-full px-5 pt-5 flex items-stretch flex-col");
    			add_location(div, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FormGroup> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FormGroup", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class FormGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormGroup",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/views/StartPage.svelte generated by Svelte v3.24.1 */
    const file$3 = "src/views/StartPage.svelte";

    // (31:4) <FormGroup>
    function create_default_slot_5(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				id: "name",
    				label: "Name",
    				placeholder: "Pepe Silvia",
    				value: /*name*/ ctx[0],
    				onChange: /*handleChangeName*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty & /*name*/ 1) input_changes.value = /*name*/ ctx[0];
    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(31:4) <FormGroup>",
    		ctx
    	});

    	return block;
    }

    // (47:6) <Button onClick={joinGame}>
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Join Game");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(47:6) <Button onClick={joinGame}>",
    		ctx
    	});

    	return block;
    }

    // (40:4) <FormGroup>
    function create_default_slot_3(ctx) {
    	let input;
    	let t;
    	let button;
    	let current;

    	input = new Input({
    			props: {
    				id: "join-game",
    				label: "Join Game with Code",
    				placeholder: "Game Code",
    				value: /*code*/ ctx[1],
    				onChange: /*handleChangeCode*/ ctx[5]
    			},
    			$$inline: true
    		});

    	button = new Button({
    			props: {
    				onClick: /*joinGame*/ ctx[3],
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    			t = space();
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty & /*code*/ 2) input_changes.value = /*code*/ ctx[1];
    			input.$set(input_changes);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(40:4) <FormGroup>",
    		ctx
    	});

    	return block;
    }

    // (50:4) <FormGroup>
    function create_default_slot_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "OR";
    			attr_dev(p, "class", "text-center");
    			add_location(p, file$3, 50, 6, 1221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(50:4) <FormGroup>",
    		ctx
    	});

    	return block;
    }

    // (55:6) <Button onClick={createGame}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Create Game");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(55:6) <Button onClick={createGame}>",
    		ctx
    	});

    	return block;
    }

    // (54:4) <FormGroup>
    function create_default_slot(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				onClick: /*createGame*/ ctx[2],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(54:4) <FormGroup>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let formgroup0;
    	let t0;
    	let formgroup1;
    	let t1;
    	let formgroup2;
    	let t2;
    	let formgroup3;
    	let current;

    	formgroup0 = new FormGroup({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	formgroup1 = new FormGroup({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	formgroup2 = new FormGroup({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	formgroup3 = new FormGroup({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(formgroup0.$$.fragment);
    			t0 = space();
    			create_component(formgroup1.$$.fragment);
    			t1 = space();
    			create_component(formgroup2.$$.fragment);
    			t2 = space();
    			create_component(formgroup3.$$.fragment);
    			attr_dev(div0, "class", "border-2 rounded-lg shadow flex flex-col justify-center items-center\n    w-full md:w-1/4 p-10");
    			add_location(div0, file$3, 27, 2, 657);
    			attr_dev(div1, "class", "flex flex-col justify-center items-center h-screen");
    			add_location(div1, file$3, 26, 0, 590);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(formgroup0, div0, null);
    			append_dev(div0, t0);
    			mount_component(formgroup1, div0, null);
    			append_dev(div0, t1);
    			mount_component(formgroup2, div0, null);
    			append_dev(div0, t2);
    			mount_component(formgroup3, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const formgroup0_changes = {};

    			if (dirty & /*$$scope, name*/ 257) {
    				formgroup0_changes.$$scope = { dirty, ctx };
    			}

    			formgroup0.$set(formgroup0_changes);
    			const formgroup1_changes = {};

    			if (dirty & /*$$scope, code*/ 258) {
    				formgroup1_changes.$$scope = { dirty, ctx };
    			}

    			formgroup1.$set(formgroup1_changes);
    			const formgroup2_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				formgroup2_changes.$$scope = { dirty, ctx };
    			}

    			formgroup2.$set(formgroup2_changes);
    			const formgroup3_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				formgroup3_changes.$$scope = { dirty, ctx };
    			}

    			formgroup3.$set(formgroup3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formgroup0.$$.fragment, local);
    			transition_in(formgroup1.$$.fragment, local);
    			transition_in(formgroup2.$$.fragment, local);
    			transition_in(formgroup3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formgroup0.$$.fragment, local);
    			transition_out(formgroup1.$$.fragment, local);
    			transition_out(formgroup2.$$.fragment, local);
    			transition_out(formgroup3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(formgroup0);
    			destroy_component(formgroup1);
    			destroy_component(formgroup2);
    			destroy_component(formgroup3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { name } = $$props, { updateName } = $$props, { emit } = $$props;
    	let code;

    	const createGame = () => {
    		emit("CREATE_GAME", { playerName: name });
    	};

    	const joinGame = () => {
    		emit("JOIN_GAME", { playerName: name, code });
    	};

    	const handleChangeName = e => {
    		updateName(e.target.value);
    	};

    	const handleChangeCode = e => {
    		$$invalidate(1, code = e.target.value);
    	};

    	const writable_props = ["name", "updateName", "emit"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StartPage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("StartPage", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("updateName" in $$props) $$invalidate(6, updateName = $$props.updateName);
    		if ("emit" in $$props) $$invalidate(7, emit = $$props.emit);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		updateName,
    		emit,
    		navigate,
    		link,
    		Button,
    		Input,
    		FormGroup,
    		code,
    		createGame,
    		joinGame,
    		handleChangeName,
    		handleChangeCode
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("updateName" in $$props) $$invalidate(6, updateName = $$props.updateName);
    		if ("emit" in $$props) $$invalidate(7, emit = $$props.emit);
    		if ("code" in $$props) $$invalidate(1, code = $$props.code);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		code,
    		createGame,
    		joinGame,
    		handleChangeName,
    		handleChangeCode,
    		updateName,
    		emit
    	];
    }

    class StartPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { name: 0, updateName: 6, emit: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StartPage",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<StartPage> was created without expected prop 'name'");
    		}

    		if (/*updateName*/ ctx[6] === undefined && !("updateName" in props)) {
    			console.warn("<StartPage> was created without expected prop 'updateName'");
    		}

    		if (/*emit*/ ctx[7] === undefined && !("emit" in props)) {
    			console.warn("<StartPage> was created without expected prop 'emit'");
    		}
    	}

    	get name() {
    		throw new Error("<StartPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<StartPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateName() {
    		throw new Error("<StartPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateName(value) {
    		throw new Error("<StartPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get emit() {
    		throw new Error("<StartPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set emit(value) {
    		throw new Error("<StartPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const createConnection = () => io("http://localhost:3000");

    const configureSocket = () => {
        const socket = createConnection();
        socket.on("CLIENT_ERROR", ({ error }) => {
            console.error(error);
        });
        return socket;
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var _function = createCommonjsModule(function (module, exports) {
    /**
     * @since 2.0.0
     */
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.bindTo_ = exports.bind_ = exports.hole = exports.pipe = exports.untupled = exports.tupled = exports.absurd = exports.decrement = exports.increment = exports.tuple = exports.flow = exports.flip = exports.constVoid = exports.constUndefined = exports.constNull = exports.constFalse = exports.constTrue = exports.constant = exports.not = exports.unsafeCoerce = exports.identity = void 0;
    /**
     * @since 2.0.0
     */
    function identity(a) {
        return a;
    }
    exports.identity = identity;
    /**
     * @since 2.0.0
     */
    exports.unsafeCoerce = identity;
    /**
     * @since 2.0.0
     */
    function not(predicate) {
        return function (a) { return !predicate(a); };
    }
    exports.not = not;
    /**
     * @since 2.0.0
     */
    function constant(a) {
        return function () { return a; };
    }
    exports.constant = constant;
    /**
     * A thunk that returns always `true`
     *
     * @since 2.0.0
     */
    exports.constTrue = function () {
        return true;
    };
    /**
     * A thunk that returns always `false`
     *
     * @since 2.0.0
     */
    exports.constFalse = function () {
        return false;
    };
    /**
     * A thunk that returns always `null`
     *
     * @since 2.0.0
     */
    exports.constNull = function () {
        return null;
    };
    /**
     * A thunk that returns always `undefined`
     *
     * @since 2.0.0
     */
    exports.constUndefined = function () {
        return;
    };
    /**
     * A thunk that returns always `void`
     *
     * @since 2.0.0
     */
    exports.constVoid = function () {
        return;
    };
    // TODO: remove in v3
    /**
     * Flips the order of the arguments of a function of two arguments.
     *
     * @since 2.0.0
     */
    function flip(f) {
        return function (b, a) { return f(a, b); };
    }
    exports.flip = flip;
    function flow(ab, bc, cd, de, ef, fg, gh, hi, ij) {
        switch (arguments.length) {
            case 1:
                return ab;
            case 2:
                return function () {
                    return bc(ab.apply(this, arguments));
                };
            case 3:
                return function () {
                    return cd(bc(ab.apply(this, arguments)));
                };
            case 4:
                return function () {
                    return de(cd(bc(ab.apply(this, arguments))));
                };
            case 5:
                return function () {
                    return ef(de(cd(bc(ab.apply(this, arguments)))));
                };
            case 6:
                return function () {
                    return fg(ef(de(cd(bc(ab.apply(this, arguments))))));
                };
            case 7:
                return function () {
                    return gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))));
                };
            case 8:
                return function () {
                    return hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments))))))));
                };
            case 9:
                return function () {
                    return ij(hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))))));
                };
        }
        return;
    }
    exports.flow = flow;
    /**
     * @since 2.0.0
     */
    function tuple() {
        var t = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            t[_i] = arguments[_i];
        }
        return t;
    }
    exports.tuple = tuple;
    /**
     * @since 2.0.0
     */
    function increment(n) {
        return n + 1;
    }
    exports.increment = increment;
    /**
     * @since 2.0.0
     */
    function decrement(n) {
        return n - 1;
    }
    exports.decrement = decrement;
    /**
     * @since 2.0.0
     */
    function absurd(_) {
        throw new Error('Called `absurd` function which should be uncallable');
    }
    exports.absurd = absurd;
    /**
     * Creates a tupled version of this function: instead of `n` arguments, it accepts a single tuple argument.
     *
     * @example
     * import { tupled } from 'fp-ts/function'
     *
     * const add = tupled((x: number, y: number): number => x + y)
     *
     * assert.strictEqual(add([1, 2]), 3)
     *
     * @since 2.4.0
     */
    function tupled(f) {
        return function (a) { return f.apply(void 0, a); };
    }
    exports.tupled = tupled;
    /**
     * Inverse function of `tupled`
     *
     * @since 2.4.0
     */
    function untupled(f) {
        return function () {
            var a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                a[_i] = arguments[_i];
            }
            return f(a);
        };
    }
    exports.untupled = untupled;
    function pipe(a, ab, bc, cd, de, ef, fg, gh, hi, ij) {
        switch (arguments.length) {
            case 1:
                return a;
            case 2:
                return ab(a);
            case 3:
                return bc(ab(a));
            case 4:
                return cd(bc(ab(a)));
            case 5:
                return de(cd(bc(ab(a))));
            case 6:
                return ef(de(cd(bc(ab(a)))));
            case 7:
                return fg(ef(de(cd(bc(ab(a))))));
            case 8:
                return gh(fg(ef(de(cd(bc(ab(a)))))));
            case 9:
                return hi(gh(fg(ef(de(cd(bc(ab(a))))))));
            case 10:
                return ij(hi(gh(fg(ef(de(cd(bc(ab(a)))))))));
        }
        return;
    }
    exports.pipe = pipe;
    /**
     * Type hole simulation
     *
     * @since 2.7.0
     */
    exports.hole = absurd;
    /**
     * @internal
     */
    exports.bind_ = function (a, name, b) {
        var _a;
        return Object.assign({}, a, (_a = {}, _a[name] = b, _a));
    };
    /**
     * @internal
     */
    exports.bindTo_ = function (name) { return function (b) {
        var _a;
        return (_a = {}, _a[name] = b, _a);
    }; };
    });

    var Option = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.apS = exports.bind = exports.bindTo = exports.getRefinement = exports.exists = exports.elem = exports.option = exports.MonadThrow = exports.Witherable = exports.Traversable = exports.Filterable = exports.Compactable = exports.Extend = exports.Alternative = exports.Alt = exports.Foldable = exports.Monad = exports.Applicative = exports.Functor = exports.getMonoid = exports.getLastMonoid = exports.getFirstMonoid = exports.getApplyMonoid = exports.getApplySemigroup = exports.getOrd = exports.getEq = exports.getShow = exports.URI = exports.wilt = exports.wither = exports.sequence = exports.traverse = exports.partitionMap = exports.partition = exports.filterMap = exports.filter = exports.separate = exports.compact = exports.reduceRight = exports.reduce = exports.foldMap = exports.extend = exports.duplicate = exports.throwError = exports.zero = exports.alt = exports.flatten = exports.chainFirst = exports.chain = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.map = exports.mapNullable = exports.getOrElse = exports.getOrElseW = exports.toUndefined = exports.toNullable = exports.fold = exports.fromEither = exports.getRight = exports.getLeft = exports.tryCatch = exports.fromPredicate = exports.fromNullable = exports.some = exports.none = exports.isNone = exports.isSome = void 0;

    // -------------------------------------------------------------------------------------
    // guards
    // -------------------------------------------------------------------------------------
    /**
     * Returns `true` if the option is an instance of `Some`, `false` otherwise
     *
     * @example
     * import { some, none, isSome } from 'fp-ts/Option'
     *
     * assert.strictEqual(isSome(some(1)), true)
     * assert.strictEqual(isSome(none), false)
     *
     * @category guards
     * @since 2.0.0
     */
    exports.isSome = function (fa) { return fa._tag === 'Some'; };
    /**
     * Returns `true` if the option is `None`, `false` otherwise
     *
     * @example
     * import { some, none, isNone } from 'fp-ts/Option'
     *
     * assert.strictEqual(isNone(some(1)), false)
     * assert.strictEqual(isNone(none), true)
     *
     * @category guards
     * @since 2.0.0
     */
    exports.isNone = function (fa) { return fa._tag === 'None'; };
    // -------------------------------------------------------------------------------------
    // constructors
    // -------------------------------------------------------------------------------------
    /**
     * @category constructors
     * @since 2.0.0
     */
    exports.none = { _tag: 'None' };
    /**
     * @category constructors
     * @since 2.0.0
     */
    exports.some = function (a) { return ({ _tag: 'Some', value: a }); };
    /**
     * Constructs a new `Option` from a nullable type. If the value is `null` or `undefined`, returns `None`, otherwise
     * returns the value wrapped in a `Some`
     *
     * @example
     * import { none, some, fromNullable } from 'fp-ts/Option'
     *
     * assert.deepStrictEqual(fromNullable(undefined), none)
     * assert.deepStrictEqual(fromNullable(null), none)
     * assert.deepStrictEqual(fromNullable(1), some(1))
     *
     * @category constructors
     * @since 2.0.0
     */
    function fromNullable(a) {
        return a == null ? exports.none : exports.some(a);
    }
    exports.fromNullable = fromNullable;
    function fromPredicate(predicate) {
        return function (a) { return (predicate(a) ? exports.some(a) : exports.none); };
    }
    exports.fromPredicate = fromPredicate;
    /**
     * Transforms an exception into an `Option`. If `f` throws, returns `None`, otherwise returns the output wrapped in
     * `Some`
     *
     * @example
     * import { none, some, tryCatch } from 'fp-ts/Option'
     *
     * assert.deepStrictEqual(
     *   tryCatch(() => {
     *     throw new Error()
     *   }),
     *   none
     * )
     * assert.deepStrictEqual(tryCatch(() => 1), some(1))
     *
     * @category constructors
     * @since 2.0.0
     */
    function tryCatch(f) {
        try {
            return exports.some(f());
        }
        catch (e) {
            return exports.none;
        }
    }
    exports.tryCatch = tryCatch;
    /**
     * Returns an `E` value if possible
     *
     * @category constructors
     * @since 2.0.0
     */
    function getLeft(ma) {
        return ma._tag === 'Right' ? exports.none : exports.some(ma.left);
    }
    exports.getLeft = getLeft;
    /**
     * Returns an `A` value if possible
     *
     * @category constructors
     * @since 2.0.0
     */
    function getRight(ma) {
        return ma._tag === 'Left' ? exports.none : exports.some(ma.right);
    }
    exports.getRight = getRight;
    /**
     * @category constructors
     * @since 2.0.0
     */
    exports.fromEither = function (ma) { return (ma._tag === 'Left' ? exports.none : exports.some(ma.right)); };
    // -------------------------------------------------------------------------------------
    // destructors
    // -------------------------------------------------------------------------------------
    /**
     * Takes a default value, a function, and an `Option` value, if the `Option` value is `None` the default value is
     * returned, otherwise the function is applied to the value inside the `Some` and the result is returned.
     *
     * @example
     * import { some, none, fold } from 'fp-ts/Option'
     * import { pipe } from 'fp-ts/function'
     *
     * assert.strictEqual(
     *   pipe(
     *     some(1),
     *     fold(() => 'a none', a => `a some containing ${a}`)
     *   ),
     *   'a some containing 1'
     * )
     *
     * assert.strictEqual(
     *   pipe(
     *     none,
     *     fold(() => 'a none', a => `a some containing ${a}`)
     *   ),
     *   'a none'
     * )
     *
     * @category destructors
     * @since 2.0.0
     */
    function fold(onNone, onSome) {
        return function (ma) { return (exports.isNone(ma) ? onNone() : onSome(ma.value)); };
    }
    exports.fold = fold;
    /**
     * Extracts the value out of the structure, if it exists. Otherwise returns `null`.
     *
     * @example
     * import { some, none, toNullable } from 'fp-ts/Option'
     * import { pipe } from 'fp-ts/function'
     *
     * assert.strictEqual(
     *   pipe(
     *     some(1),
     *     toNullable
     *   ),
     *   1
     * )
     * assert.strictEqual(
     *   pipe(
     *     none,
     *     toNullable
     *   ),
     *   null
     * )
     *
     * @category destructors
     * @since 2.0.0
     */
    function toNullable(ma) {
        return exports.isNone(ma) ? null : ma.value;
    }
    exports.toNullable = toNullable;
    /**
     * Extracts the value out of the structure, if it exists. Otherwise returns `undefined`.
     *
     * @example
     * import { some, none, toUndefined } from 'fp-ts/Option'
     * import { pipe } from 'fp-ts/function'
     *
     * assert.strictEqual(
     *   pipe(
     *     some(1),
     *     toUndefined
     *   ),
     *   1
     * )
     * assert.strictEqual(
     *   pipe(
     *     none,
     *     toUndefined
     *   ),
     *   undefined
     * )
     *
     * @category destructors
     * @since 2.0.0
     */
    function toUndefined(ma) {
        return exports.isNone(ma) ? undefined : ma.value;
    }
    exports.toUndefined = toUndefined;
    /**
     * Less strict version of [`getOrElse`](#getOrElse).
     *
     * @category destructors
     * @since 2.6.0
     */
    exports.getOrElseW = function (onNone) { return function (ma) { return (exports.isNone(ma) ? onNone() : ma.value); }; };
    /**
     * Extracts the value out of the structure, if it exists. Otherwise returns the given default value
     *
     * @example
     * import { some, none, getOrElse } from 'fp-ts/Option'
     * import { pipe } from 'fp-ts/function'
     *
     * assert.strictEqual(
     *   pipe(
     *     some(1),
     *     getOrElse(() => 0)
     *   ),
     *   1
     * )
     * assert.strictEqual(
     *   pipe(
     *     none,
     *     getOrElse(() => 0)
     *   ),
     *   0
     * )
     *
     * @category destructors
     * @since 2.0.0
     */
    exports.getOrElse = exports.getOrElseW;
    // -------------------------------------------------------------------------------------
    // combinators
    // -------------------------------------------------------------------------------------
    /**
     * This is `chain` + `fromNullable`, useful when working with optional values
     *
     * @example
     * import { some, none, fromNullable, mapNullable } from 'fp-ts/Option'
     * import { pipe } from 'fp-ts/function'
     *
     * interface Employee {
     *   company?: {
     *     address?: {
     *       street?: {
     *         name?: string
     *       }
     *     }
     *   }
     * }
     *
     * const employee1: Employee = { company: { address: { street: { name: 'high street' } } } }
     *
     * assert.deepStrictEqual(
     *   pipe(
     *     fromNullable(employee1.company),
     *     mapNullable(company => company.address),
     *     mapNullable(address => address.street),
     *     mapNullable(street => street.name)
     *   ),
     *   some('high street')
     * )
     *
     * const employee2: Employee = { company: { address: { street: {} } } }
     *
     * assert.deepStrictEqual(
     *   pipe(
     *     fromNullable(employee2.company),
     *     mapNullable(company => company.address),
     *     mapNullable(address => address.street),
     *     mapNullable(street => street.name)
     *   ),
     *   none
     * )
     *
     * @category combinators
     * @since 2.0.0
     */
    function mapNullable(f) {
        return function (ma) { return (exports.isNone(ma) ? exports.none : fromNullable(f(ma.value))); };
    }
    exports.mapNullable = mapNullable;
    // -------------------------------------------------------------------------------------
    // non-pipeables
    // -------------------------------------------------------------------------------------
    var map_ = function (fa, f) { return (exports.isNone(fa) ? exports.none : exports.some(f(fa.value))); };
    var ap_ = function (fab, fa) { return (exports.isNone(fab) ? exports.none : exports.isNone(fa) ? exports.none : exports.some(fab.value(fa.value))); };
    var chain_ = function (ma, f) { return (exports.isNone(ma) ? exports.none : f(ma.value)); };
    var reduce_ = function (fa, b, f) { return (exports.isNone(fa) ? b : f(b, fa.value)); };
    var foldMap_ = function (M) { return function (fa, f) { return (exports.isNone(fa) ? M.empty : f(fa.value)); }; };
    var reduceRight_ = function (fa, b, f) { return (exports.isNone(fa) ? b : f(fa.value, b)); };
    var traverse_ = function (F) { return function (ta, f) {
        return exports.isNone(ta) ? F.of(exports.none) : F.map(f(ta.value), exports.some);
    }; };
    var alt_ = function (fa, that) { return (exports.isNone(fa) ? that() : fa); };
    var filter_ = function (fa, predicate) {
        return exports.isNone(fa) ? exports.none : predicate(fa.value) ? fa : exports.none;
    };
    var filterMap_ = function (ma, f) { return (exports.isNone(ma) ? exports.none : f(ma.value)); };
    var extend_ = function (wa, f) { return (exports.isNone(wa) ? exports.none : exports.some(f(wa))); };
    var partition_ = function (fa, predicate) {
        return {
            left: filter_(fa, function (a) { return !predicate(a); }),
            right: filter_(fa, predicate)
        };
    };
    var partitionMap_ = function (fa, f) { return exports.separate(map_(fa, f)); };
    var wither_ = function (F) { return function (fa, f) {
        return exports.isNone(fa) ? F.of(exports.none) : f(fa.value);
    }; };
    var wilt_ = function (F) { return function (fa, f) {
        var o = map_(fa, function (a) {
            return F.map(f(a), function (e) { return ({
                left: getLeft(e),
                right: getRight(e)
            }); });
        });
        return exports.isNone(o)
            ? F.of({
                left: exports.none,
                right: exports.none
            })
            : o.value;
    }; };
    // -------------------------------------------------------------------------------------
    // pipeables
    // -------------------------------------------------------------------------------------
    /**
     * @category Functor
     * @since 2.0.0
     */
    exports.map = function (f) { return function (fa) { return map_(fa, f); }; };
    /**
     * Apply a function to an argument under a type constructor.
     *
     * @category Apply
     * @since 2.0.0
     */
    exports.ap = function (fa) { return function (fab) { return ap_(fab, fa); }; };
    /**
     * Combine two effectful actions, keeping only the result of the first.
     *
     * @category Apply
     * @since 2.0.0
     */
    exports.apFirst = function (fb) { return function (fa) {
        return ap_(map_(fa, function (a) { return function () { return a; }; }), fb);
    }; };
    /**
     * Combine two effectful actions, keeping only the result of the second.
     *
     * @category Apply
     * @since 2.0.0
     */
    exports.apSecond = function (fb) { return function (fa) {
        return ap_(map_(fa, function () { return function (b) { return b; }; }), fb);
    }; };
    /**
     * @category Applicative
     * @since 2.7.0
     */
    exports.of = exports.some;
    /**
     * Composes computations in sequence, using the return value of one computation to determine the next computation.
     *
     * @category Monad
     * @since 2.0.0
     */
    exports.chain = function (f) { return function (ma) { return chain_(ma, f); }; };
    /**
     * Composes computations in sequence, using the return value of one computation to determine the next computation and
     * keeping only the result of the first.
     *
     * @category Monad
     * @since 2.0.0
     */
    exports.chainFirst = function (f) { return function (ma) {
        return chain_(ma, function (a) { return map_(f(a), function () { return a; }); });
    }; };
    /**
     * @category Monad
     * @since 2.0.0
     */
    exports.flatten = function (mma) { return chain_(mma, _function.identity); };
    /**
     * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
     * types of kind `* -> *`.
     *
     * In case of `Option` returns the left-most non-`None` value.
     *
     * @example
     * import * as O from 'fp-ts/Option'
     * import { pipe } from 'fp-ts/function'
     *
     * assert.deepStrictEqual(
     *   pipe(
     *     O.some('a'),
     *     O.alt(() => O.some('b'))
     *   ),
     *   O.some('a')
     * )
     * assert.deepStrictEqual(
     *   pipe(
     *     O.none,
     *     O.alt(() => O.some('b'))
     *   ),
     *   O.some('b')
     * )
     *
     * @category Alt
     * @since 2.0.0
     */
    exports.alt = function (that) { return function (fa) { return alt_(fa, that); }; };
    /**
     * @category Alternative
     * @since 2.7.0
     */
    exports.zero = function () { return exports.none; };
    /**
     * @category MonadThrow
     * @since 2.7.0
     */
    exports.throwError = function () { return exports.none; };
    /**
     * @category Extend
     * @since 2.0.0
     */
    exports.duplicate = function (wa) { return extend_(wa, _function.identity); };
    /**
     * @category Extend
     * @since 2.0.0
     */
    exports.extend = function (f) { return function (ma) { return extend_(ma, f); }; };
    /**
     * @category Foldable
     * @since 2.0.0
     */
    exports.foldMap = function (M) {
        var foldMapM = foldMap_(M);
        return function (f) { return function (fa) { return foldMapM(fa, f); }; };
    };
    /**
     * @category Foldable
     * @since 2.0.0
     */
    exports.reduce = function (b, f) { return function (fa) { return reduce_(fa, b, f); }; };
    /**
     * @category Foldable
     * @since 2.0.0
     */
    exports.reduceRight = function (b, f) { return function (fa) {
        return reduceRight_(fa, b, f);
    }; };
    /**
     * @category Compactable
     * @since 2.0.0
     */
    exports.compact = exports.flatten;
    var defaultSeparate = { left: exports.none, right: exports.none };
    /**
     * @category Compactable
     * @since 2.0.0
     */
    exports.separate = function (ma) {
        var o = map_(ma, function (e) { return ({
            left: getLeft(e),
            right: getRight(e)
        }); });
        return exports.isNone(o) ? defaultSeparate : o.value;
    };
    /**
     * @category Filterable
     * @since 2.0.0
     */
    exports.filter = function (predicate) { return function (fa) { return filter_(fa, predicate); }; };
    /**
     * @category Filterable
     * @since 2.0.0
     */
    exports.filterMap = function (f) { return function (fa) {
        return filterMap_(fa, f);
    }; };
    /**
     * @category Filterable
     * @since 2.0.0
     */
    exports.partition = function (predicate) { return function (fa) { return partition_(fa, predicate); }; };
    /**
     * @category Filterable
     * @since 2.0.0
     */
    exports.partitionMap = function (f) { return function (fa) { return partitionMap_(fa, f); }; };
    /**
     * @category Traversable
     * @since 2.6.3
     */
    exports.traverse = function (F) {
        var traverseF = traverse_(F);
        return function (f) { return function (ta) { return traverseF(ta, f); }; };
    };
    /**
     * @category Traversable
     * @since 2.6.3
     */
    exports.sequence = function (F) { return function (ta) {
        return exports.isNone(ta) ? F.of(exports.none) : F.map(ta.value, exports.some);
    }; };
    /**
     * @category Witherable
     * @since 2.6.5
     */
    exports.wither = function (F) {
        var witherF = wither_(F);
        return function (f) { return function (ta) { return witherF(ta, f); }; };
    };
    /**
     * @category Witherable
     * @since 2.6.5
     */
    exports.wilt = function (F) {
        var wiltF = wilt_(F);
        return function (f) { return function (ta) { return wiltF(ta, f); }; };
    };
    // -------------------------------------------------------------------------------------
    // instances
    // -------------------------------------------------------------------------------------
    /**
     * @category instances
     * @since 2.0.0
     */
    exports.URI = 'Option';
    /**
     * @category instances
     * @since 2.0.0
     */
    function getShow(S) {
        return {
            show: function (ma) { return (exports.isNone(ma) ? 'none' : "some(" + S.show(ma.value) + ")"); }
        };
    }
    exports.getShow = getShow;
    /**
     * @example
     * import { none, some, getEq } from 'fp-ts/Option'
     * import { eqNumber } from 'fp-ts/Eq'
     *
     * const E = getEq(eqNumber)
     * assert.strictEqual(E.equals(none, none), true)
     * assert.strictEqual(E.equals(none, some(1)), false)
     * assert.strictEqual(E.equals(some(1), none), false)
     * assert.strictEqual(E.equals(some(1), some(2)), false)
     * assert.strictEqual(E.equals(some(1), some(1)), true)
     *
     * @category instances
     * @since 2.0.0
     */
    function getEq(E) {
        return {
            equals: function (x, y) { return x === y || (exports.isNone(x) ? exports.isNone(y) : exports.isNone(y) ? false : E.equals(x.value, y.value)); }
        };
    }
    exports.getEq = getEq;
    /**
     * The `Ord` instance allows `Option` values to be compared with
     * `compare`, whenever there is an `Ord` instance for
     * the type the `Option` contains.
     *
     * `None` is considered to be less than any `Some` value.
     *
     *
     * @example
     * import { none, some, getOrd } from 'fp-ts/Option'
     * import { ordNumber } from 'fp-ts/Ord'
     *
     * const O = getOrd(ordNumber)
     * assert.strictEqual(O.compare(none, none), 0)
     * assert.strictEqual(O.compare(none, some(1)), -1)
     * assert.strictEqual(O.compare(some(1), none), 1)
     * assert.strictEqual(O.compare(some(1), some(2)), -1)
     * assert.strictEqual(O.compare(some(1), some(1)), 0)
     *
     * @category instances
     * @since 2.0.0
     */
    function getOrd(O) {
        return {
            equals: getEq(O).equals,
            compare: function (x, y) { return (x === y ? 0 : exports.isSome(x) ? (exports.isSome(y) ? O.compare(x.value, y.value) : 1) : -1); }
        };
    }
    exports.getOrd = getOrd;
    /**
     * `Apply` semigroup
     *
     * | x       | y       | concat(x, y)       |
     * | ------- | ------- | ------------------ |
     * | none    | none    | none               |
     * | some(a) | none    | none               |
     * | none    | some(a) | none               |
     * | some(a) | some(b) | some(concat(a, b)) |
     *
     * @example
     * import { getApplySemigroup, some, none } from 'fp-ts/Option'
     * import { semigroupSum } from 'fp-ts/Semigroup'
     *
     * const S = getApplySemigroup(semigroupSum)
     * assert.deepStrictEqual(S.concat(none, none), none)
     * assert.deepStrictEqual(S.concat(some(1), none), none)
     * assert.deepStrictEqual(S.concat(none, some(1)), none)
     * assert.deepStrictEqual(S.concat(some(1), some(2)), some(3))
     *
     * @category instances
     * @since 2.0.0
     */
    function getApplySemigroup(S) {
        return {
            concat: function (x, y) { return (exports.isSome(x) && exports.isSome(y) ? exports.some(S.concat(x.value, y.value)) : exports.none); }
        };
    }
    exports.getApplySemigroup = getApplySemigroup;
    /**
     * @category instances
     * @since 2.0.0
     */
    function getApplyMonoid(M) {
        return {
            concat: getApplySemigroup(M).concat,
            empty: exports.some(M.empty)
        };
    }
    exports.getApplyMonoid = getApplyMonoid;
    /**
     * Monoid returning the left-most non-`None` value
     *
     * | x       | y       | concat(x, y) |
     * | ------- | ------- | ------------ |
     * | none    | none    | none         |
     * | some(a) | none    | some(a)      |
     * | none    | some(a) | some(a)      |
     * | some(a) | some(b) | some(a)      |
     *
     * @example
     * import { getFirstMonoid, some, none } from 'fp-ts/Option'
     *
     * const M = getFirstMonoid<number>()
     * assert.deepStrictEqual(M.concat(none, none), none)
     * assert.deepStrictEqual(M.concat(some(1), none), some(1))
     * assert.deepStrictEqual(M.concat(none, some(1)), some(1))
     * assert.deepStrictEqual(M.concat(some(1), some(2)), some(1))
     *
     * @category instances
     * @since 2.0.0
     */
    function getFirstMonoid() {
        return {
            concat: function (x, y) { return (exports.isNone(x) ? y : x); },
            empty: exports.none
        };
    }
    exports.getFirstMonoid = getFirstMonoid;
    /**
     * Monoid returning the right-most non-`None` value
     *
     * | x       | y       | concat(x, y) |
     * | ------- | ------- | ------------ |
     * | none    | none    | none         |
     * | some(a) | none    | some(a)      |
     * | none    | some(a) | some(a)      |
     * | some(a) | some(b) | some(b)      |
     *
     * @example
     * import { getLastMonoid, some, none } from 'fp-ts/Option'
     *
     * const M = getLastMonoid<number>()
     * assert.deepStrictEqual(M.concat(none, none), none)
     * assert.deepStrictEqual(M.concat(some(1), none), some(1))
     * assert.deepStrictEqual(M.concat(none, some(1)), some(1))
     * assert.deepStrictEqual(M.concat(some(1), some(2)), some(2))
     *
     * @category instances
     * @since 2.0.0
     */
    function getLastMonoid() {
        return {
            concat: function (x, y) { return (exports.isNone(y) ? x : y); },
            empty: exports.none
        };
    }
    exports.getLastMonoid = getLastMonoid;
    /**
     * Monoid returning the left-most non-`None` value. If both operands are `Some`s then the inner values are
     * concatenated using the provided `Semigroup`
     *
     * | x       | y       | concat(x, y)       |
     * | ------- | ------- | ------------------ |
     * | none    | none    | none               |
     * | some(a) | none    | some(a)            |
     * | none    | some(a) | some(a)            |
     * | some(a) | some(b) | some(concat(a, b)) |
     *
     * @example
     * import { getMonoid, some, none } from 'fp-ts/Option'
     * import { semigroupSum } from 'fp-ts/Semigroup'
     *
     * const M = getMonoid(semigroupSum)
     * assert.deepStrictEqual(M.concat(none, none), none)
     * assert.deepStrictEqual(M.concat(some(1), none), some(1))
     * assert.deepStrictEqual(M.concat(none, some(1)), some(1))
     * assert.deepStrictEqual(M.concat(some(1), some(2)), some(3))
     *
     * @category instances
     * @since 2.0.0
     */
    function getMonoid(S) {
        return {
            concat: function (x, y) { return (exports.isNone(x) ? y : exports.isNone(y) ? x : exports.some(S.concat(x.value, y.value))); },
            empty: exports.none
        };
    }
    exports.getMonoid = getMonoid;
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Functor = {
        URI: exports.URI,
        map: map_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Applicative = {
        URI: exports.URI,
        map: map_,
        ap: ap_,
        of: exports.of
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Monad = {
        URI: exports.URI,
        map: map_,
        ap: ap_,
        of: exports.of,
        chain: chain_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Foldable = {
        URI: exports.URI,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Alt = {
        URI: exports.URI,
        map: map_,
        alt: alt_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Alternative = {
        URI: exports.URI,
        map: map_,
        ap: ap_,
        of: exports.of,
        alt: alt_,
        zero: exports.zero
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Extend = {
        URI: exports.URI,
        map: map_,
        extend: extend_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Compactable = {
        URI: exports.URI,
        compact: exports.compact,
        separate: exports.separate
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Filterable = {
        URI: exports.URI,
        map: map_,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Traversable = {
        URI: exports.URI,
        map: map_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        traverse: traverse_,
        sequence: exports.sequence
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Witherable = {
        URI: exports.URI,
        map: map_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        traverse: traverse_,
        sequence: exports.sequence,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_,
        wither: wither_,
        wilt: wilt_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.MonadThrow = {
        URI: exports.URI,
        map: map_,
        ap: ap_,
        of: exports.of,
        chain: chain_,
        throwError: exports.throwError
    };
    // TODO: remove in v3
    /**
     * @category instances
     * @since 2.0.0
     */
    exports.option = {
        URI: exports.URI,
        map: map_,
        of: exports.of,
        ap: ap_,
        chain: chain_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        traverse: traverse_,
        sequence: exports.sequence,
        zero: exports.zero,
        alt: alt_,
        extend: extend_,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_,
        wither: wither_,
        wilt: wilt_,
        throwError: exports.throwError
    };
    // -------------------------------------------------------------------------------------
    // utils
    // -------------------------------------------------------------------------------------
    /**
     * Returns `true` if `ma` contains `a`
     *
     * @example
     * import { some, none, elem } from 'fp-ts/Option'
     * import { eqNumber } from 'fp-ts/Eq'
     *
     * assert.strictEqual(elem(eqNumber)(1, some(1)), true)
     * assert.strictEqual(elem(eqNumber)(2, some(1)), false)
     * assert.strictEqual(elem(eqNumber)(1, none), false)
     *
     * @since 2.0.0
     */
    function elem(E) {
        return function (a, ma) { return (exports.isNone(ma) ? false : E.equals(a, ma.value)); };
    }
    exports.elem = elem;
    /**
     * Returns `true` if the predicate is satisfied by the wrapped value
     *
     * @example
     * import { some, none, exists } from 'fp-ts/Option'
     * import { pipe } from 'fp-ts/function'
     *
     * assert.strictEqual(
     *   pipe(
     *     some(1),
     *     exists(n => n > 0)
     *   ),
     *   true
     * )
     * assert.strictEqual(
     *   pipe(
     *     some(1),
     *     exists(n => n > 1)
     *   ),
     *   false
     * )
     * assert.strictEqual(
     *   pipe(
     *     none,
     *     exists(n => n > 0)
     *   ),
     *   false
     * )
     *
     * @since 2.0.0
     */
    function exists(predicate) {
        return function (ma) { return (exports.isNone(ma) ? false : predicate(ma.value)); };
    }
    exports.exists = exists;
    /**
     * Returns a `Refinement` (i.e. a custom type guard) from a `Option` returning function.
     * This function ensures that a custom type guard definition is type-safe.
     *
     * ```ts
     * import { some, none, getRefinement } from 'fp-ts/Option'
     *
     * type A = { type: 'A' }
     * type B = { type: 'B' }
     * type C = A | B
     *
     * const isA = (c: C): c is A => c.type === 'B' // <= typo but typescript doesn't complain
     * const isA = getRefinement<C, A>(c => (c.type === 'B' ? some(c) : none)) // static error: Type '"B"' is not assignable to type '"A"'
     * ```
     *
     * @since 2.0.0
     */
    function getRefinement(getOption) {
        return function (a) { return exports.isSome(getOption(a)); };
    }
    exports.getRefinement = getRefinement;
    // -------------------------------------------------------------------------------------
    // do notation
    // -------------------------------------------------------------------------------------
    /**
     * @since 2.8.0
     */
    exports.bindTo = function (name) { return exports.map(_function.bindTo_(name)); };
    /**
     * @since 2.8.0
     */
    exports.bind = function (name, f) {
        return exports.chain(function (a) {
            return _function.pipe(f(a), exports.map(function (b) { return _function.bind_(a, name, b); }));
        });
    };
    // -------------------------------------------------------------------------------------
    // pipeable sequence S
    // -------------------------------------------------------------------------------------
    /**
     * @since 2.8.0
     */
    exports.apS = function (name, fb) {
        return _function.flow(exports.map(function (a) { return function (b) { return _function.bind_(a, name, b); }; }), exports.ap(fb));
    };
    });

    var Eq = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.eq = exports.Contravariant = exports.getMonoid = exports.eqDate = exports.getTupleEq = exports.getStructEq = exports.eqBoolean = exports.eqNumber = exports.eqString = exports.strictEqual = exports.eqStrict = exports.URI = exports.contramap = exports.fromEquals = void 0;
    // -------------------------------------------------------------------------------------
    // constructors
    // -------------------------------------------------------------------------------------
    /**
     * @category constructors
     * @since 2.0.0
     */
    function fromEquals(equals) {
        return {
            equals: function (x, y) { return x === y || equals(x, y); }
        };
    }
    exports.fromEquals = fromEquals;
    // -------------------------------------------------------------------------------------
    // pipeables
    // -------------------------------------------------------------------------------------
    /**
     * @category Contravariant
     * @since 2.0.0
     */
    exports.contramap = function (f) { return function (fa) { return contramap_(fa, f); }; };
    // -------------------------------------------------------------------------------------
    // instances
    // -------------------------------------------------------------------------------------
    var contramap_ = function (fa, f) { return fromEquals(function (x, y) { return fa.equals(f(x), f(y)); }); };
    /**
     * @category instances
     * @since 2.0.0
     */
    exports.URI = 'Eq';
    /**
     * @category instances
     * @since 2.5.0
     */
    exports.eqStrict = {
        // tslint:disable-next-line: deprecation
        equals: strictEqual
    };
    /**
     * Use `eqStrict` instead
     *
     * @since 2.0.0
     * @deprecated
     */
    function strictEqual(a, b) {
        return a === b;
    }
    exports.strictEqual = strictEqual;
    /**
     * @category instances
     * @since 2.0.0
     */
    exports.eqString = exports.eqStrict;
    /**
     * @category instances
     * @since 2.0.0
     */
    exports.eqNumber = exports.eqStrict;
    /**
     * @category instances
     * @since 2.0.0
     */
    exports.eqBoolean = exports.eqStrict;
    /**
     * @category instances
     * @since 2.0.0
     */
    function getStructEq(eqs) {
        return fromEquals(function (x, y) {
            for (var k in eqs) {
                if (!eqs[k].equals(x[k], y[k])) {
                    return false;
                }
            }
            return true;
        });
    }
    exports.getStructEq = getStructEq;
    /**
     * Given a tuple of `Eq`s returns a `Eq` for the tuple
     *
     * @example
     * import { getTupleEq, eqString, eqNumber, eqBoolean } from 'fp-ts/Eq'
     *
     * const E = getTupleEq(eqString, eqNumber, eqBoolean)
     * assert.strictEqual(E.equals(['a', 1, true], ['a', 1, true]), true)
     * assert.strictEqual(E.equals(['a', 1, true], ['b', 1, true]), false)
     * assert.strictEqual(E.equals(['a', 1, true], ['a', 2, true]), false)
     * assert.strictEqual(E.equals(['a', 1, true], ['a', 1, false]), false)
     *
     * @category instances
     * @since 2.0.0
     */
    function getTupleEq() {
        var eqs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            eqs[_i] = arguments[_i];
        }
        return fromEquals(function (x, y) { return eqs.every(function (E, i) { return E.equals(x[i], y[i]); }); });
    }
    exports.getTupleEq = getTupleEq;
    /**
     * @category instances
     * @since 2.0.0
     */
    exports.eqDate = {
        equals: function (x, y) { return x.valueOf() === y.valueOf(); }
    };
    var empty = {
        equals: function () { return true; }
    };
    /**
     * @category instances
     * @since 2.6.0
     */
    function getMonoid() {
        return {
            concat: function (x, y) { return fromEquals(function (a, b) { return x.equals(a, b) && y.equals(a, b); }); },
            empty: empty
        };
    }
    exports.getMonoid = getMonoid;
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Contravariant = {
        URI: exports.URI,
        contramap: contramap_
    };
    // TODO: remove in v3
    /**
     * @category instances
     * @since 2.0.0
     */
    exports.eq = exports.Contravariant;
    });

    var ReadonlyRecord = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readonlyRecord = exports.Witherable = exports.TraversableWithIndex = exports.Traversable = exports.FilterableWithIndex = exports.Filterable = exports.Compactable = exports.FoldableWithIndex = exports.Foldable = exports.FunctorWithIndex = exports.Functor = exports.URI = exports.separate = exports.compact = exports.reduceRight = exports.reduce = exports.partitionMap = exports.partition = exports.foldMap = exports.filterMap = exports.filter = exports.elem = exports.some = exports.every = exports.fromFoldableMap = exports.fromFoldable = exports.filterWithIndex = exports.filterMapWithIndex = exports.partitionWithIndex = exports.partitionMapWithIndex = exports.wilt = exports.wither = exports.sequence = exports.traverse = exports.traverseWithIndex = exports.singleton = exports.reduceRightWithIndex = exports.foldMapWithIndex = exports.reduceWithIndex = exports.map = exports.mapWithIndex = exports.empty = exports.lookup = exports.getMonoid = exports.getEq = exports.isSubrecord = exports.pop = exports.modifyAt = exports.updateAt = exports.deleteAt = exports.hasOwnProperty = exports.insertAt = exports.toUnfoldable = exports.toReadonlyArray = exports.collect = exports.keys = exports.isEmpty = exports.size = exports.getShow = exports.toRecord = exports.fromRecord = void 0;



    /**
     * @category constructors
     * @since 2.5.0
     */
    function fromRecord(r) {
        return Object.assign({}, r);
    }
    exports.fromRecord = fromRecord;
    /**
     * @category destructors
     * @since 2.5.0
     */
    function toRecord(r) {
        return Object.assign({}, r);
    }
    exports.toRecord = toRecord;
    /**
     * @category instances
     * @since 2.5.0
     */
    function getShow(S) {
        return {
            show: function (r) {
                var elements = collect(function (k, a) { return JSON.stringify(k) + ": " + S.show(a); })(r).join(', ');
                return elements === '' ? '{}' : "{ " + elements + " }";
            }
        };
    }
    exports.getShow = getShow;
    /**
     * Calculate the number of key/value pairs in a record
     *
     * @since 2.5.0
     */
    function size(r) {
        return Object.keys(r).length;
    }
    exports.size = size;
    /**
     * Test whether a record is empty
     *
     * @since 2.5.0
     */
    function isEmpty(r) {
        return Object.keys(r).length === 0;
    }
    exports.isEmpty = isEmpty;
    /**
     * @since 2.5.0
     */
    function keys(r) {
        return Object.keys(r).sort();
    }
    exports.keys = keys;
    /**
     * Map a record into an array
     *
     * @example
     * import {collect} from 'fp-ts/ReadonlyRecord'
     *
     * const x: { a: string, b: boolean } = { a: 'foo', b: false }
     * assert.deepStrictEqual(
     *   collect((key, val) => ({key: key, value: val}))(x),
     *   [{key: 'a', value: 'foo'}, {key: 'b', value: false}]
     * )
     *
     * @since 2.5.0
     */
    function collect(f) {
        return function (r) {
            // tslint:disable-next-line: readonly-array
            var out = [];
            for (var _i = 0, _a = keys(r); _i < _a.length; _i++) {
                var key = _a[_i];
                out.push(f(key, r[key]));
            }
            return out;
        };
    }
    exports.collect = collect;
    /**
     * @category destructors
     * @since 2.5.0
     */
    exports.toReadonlyArray = collect(function (k, a) { return [k, a]; });
    function toUnfoldable(U) {
        return function (r) {
            var arr = exports.toReadonlyArray(r);
            var len = arr.length;
            return U.unfold(0, function (b) { return (b < len ? Option.some([arr[b], b + 1]) : Option.none); });
        };
    }
    exports.toUnfoldable = toUnfoldable;
    function insertAt(k, a) {
        return function (r) {
            if (r[k] === a) {
                return r;
            }
            var out = Object.assign({}, r);
            out[k] = a;
            return out;
        };
    }
    exports.insertAt = insertAt;
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasOwnProperty(k, r) {
        return _hasOwnProperty.call(r === undefined ? this : r, k);
    }
    exports.hasOwnProperty = hasOwnProperty;
    function deleteAt(k) {
        return function (r) {
            if (!_hasOwnProperty.call(r, k)) {
                return r;
            }
            var out = Object.assign({}, r);
            delete out[k];
            return out;
        };
    }
    exports.deleteAt = deleteAt;
    /**
     * @since 2.5.0
     */
    function updateAt(k, a) {
        return function (r) {
            if (!hasOwnProperty(k, r)) {
                return Option.none;
            }
            if (r[k] === a) {
                return Option.some(r);
            }
            var out = Object.assign({}, r);
            out[k] = a;
            return Option.some(out);
        };
    }
    exports.updateAt = updateAt;
    /**
     * @since 2.5.0
     */
    function modifyAt(k, f) {
        return function (r) {
            if (!hasOwnProperty(k, r)) {
                return Option.none;
            }
            var out = Object.assign({}, r);
            out[k] = f(r[k]);
            return Option.some(out);
        };
    }
    exports.modifyAt = modifyAt;
    function pop(k) {
        var deleteAtk = deleteAt(k);
        return function (r) {
            var oa = lookup(k, r);
            return Option.isNone(oa) ? Option.none : Option.some([oa.value, deleteAtk(r)]);
        };
    }
    exports.pop = pop;
    function isSubrecord(E) {
        return function (me, that) {
            if (that === undefined) {
                var isSubrecordE_1 = isSubrecord(E);
                return function (that) { return isSubrecordE_1(that, me); };
            }
            for (var k in me) {
                if (!_hasOwnProperty.call(that, k) || !E.equals(me[k], that[k])) {
                    return false;
                }
            }
            return true;
        };
    }
    exports.isSubrecord = isSubrecord;
    function getEq(E) {
        var isSubrecordE = isSubrecord(E);
        return Eq.fromEquals(function (x, y) { return isSubrecordE(x)(y) && isSubrecordE(y)(x); });
    }
    exports.getEq = getEq;
    function getMonoid(S) {
        return {
            concat: function (x, y) {
                if (x === exports.empty) {
                    return y;
                }
                if (y === exports.empty) {
                    return x;
                }
                var keys = Object.keys(y);
                var len = keys.length;
                if (len === 0) {
                    return x;
                }
                var r = Object.assign({}, x);
                for (var i = 0; i < len; i++) {
                    var k = keys[i];
                    r[k] = _hasOwnProperty.call(x, k) ? S.concat(x[k], y[k]) : y[k];
                }
                return r;
            },
            empty: exports.empty
        };
    }
    exports.getMonoid = getMonoid;
    function lookup(k, r) {
        if (r === undefined) {
            return function (r) { return lookup(k, r); };
        }
        return _hasOwnProperty.call(r, k) ? Option.some(r[k]) : Option.none;
    }
    exports.lookup = lookup;
    /**
     * @since 2.5.0
     */
    exports.empty = {};
    function mapWithIndex(f) {
        return function (fa) { return mapWithIndex_(fa, f); };
    }
    exports.mapWithIndex = mapWithIndex;
    function map(f) {
        return mapWithIndex(function (_, a) { return f(a); });
    }
    exports.map = map;
    function reduceWithIndex(b, f) {
        return function (fa) { return reduceWithIndex_(fa, b, f); };
    }
    exports.reduceWithIndex = reduceWithIndex;
    function foldMapWithIndex(M) {
        var foldMapWithIndexM = foldMapWithIndex_(M);
        return function (f) { return function (fa) { return foldMapWithIndexM(fa, f); }; };
    }
    exports.foldMapWithIndex = foldMapWithIndex;
    function reduceRightWithIndex(b, f) {
        return function (fa) { return reduceRightWithIndex_(fa, b, f); };
    }
    exports.reduceRightWithIndex = reduceRightWithIndex;
    /**
     * Create a record with one key/value pair
     *
     * @category constructors
     * @since 2.5.0
     */
    function singleton(k, a) {
        var _a;
        return _a = {}, _a[k] = a, _a;
    }
    exports.singleton = singleton;
    function traverseWithIndex(F) {
        var traverseWithIndexF = traverseWithIndex_(F);
        return function (f) { return function (ta) { return traverseWithIndexF(ta, f); }; };
    }
    exports.traverseWithIndex = traverseWithIndex;
    function traverse(F) {
        var traverseWithIndexF = traverseWithIndex(F);
        return function (f) { return traverseWithIndexF(function (_, a) { return f(a); }); };
    }
    exports.traverse = traverse;
    function sequence(F) {
        return traverseWithIndex(F)(function (_, a) { return a; });
    }
    exports.sequence = sequence;
    /**
     * @category Witherable
     * @since 2.6.5
     */
    exports.wither = function (F) {
        var witherF = wither_(F);
        return function (f) { return function (ta) { return witherF(ta, f); }; };
    };
    /**
     * @category Witherable
     * @since 2.6.5
     */
    exports.wilt = function (F) {
        var wiltF = wilt_(F);
        return function (f) { return function (ta) { return wiltF(ta, f); }; };
    };
    function partitionMapWithIndex(f) {
        return function (fa) { return partitionMapWithIndex_(fa, f); };
    }
    exports.partitionMapWithIndex = partitionMapWithIndex;
    function partitionWithIndex(predicateWithIndex) {
        return function (fa) { return partitionWithIndex_(fa, predicateWithIndex); };
    }
    exports.partitionWithIndex = partitionWithIndex;
    function filterMapWithIndex(f) {
        return function (fa) { return filterMapWithIndex_(fa, f); };
    }
    exports.filterMapWithIndex = filterMapWithIndex;
    function filterWithIndex(predicateWithIndex) {
        return function (fa) { return filterWithIndex_(fa, predicateWithIndex); };
    }
    exports.filterWithIndex = filterWithIndex;
    function fromFoldable(M, F) {
        var fromFoldableMapM = fromFoldableMap(M, F);
        return function (fka) { return fromFoldableMapM(fka, _function.identity); };
    }
    exports.fromFoldable = fromFoldable;
    function fromFoldableMap(M, F) {
        return function (ta, f) {
            return F.reduce(ta, {}, function (r, a) {
                var _a = f(a), k = _a[0], b = _a[1];
                r[k] = _hasOwnProperty.call(r, k) ? M.concat(r[k], b) : b;
                return r;
            });
        };
    }
    exports.fromFoldableMap = fromFoldableMap;
    /**
     * @since 2.5.0
     */
    function every(predicate) {
        return function (r) {
            for (var k in r) {
                if (!predicate(r[k])) {
                    return false;
                }
            }
            return true;
        };
    }
    exports.every = every;
    /**
     * @since 2.5.0
     */
    function some(predicate) {
        return function (r) {
            for (var k in r) {
                if (predicate(r[k])) {
                    return true;
                }
            }
            return false;
        };
    }
    exports.some = some;
    function elem(E) {
        return function (a, fa) {
            if (fa === undefined) {
                var elemE_1 = elem(E);
                return function (fa) { return elemE_1(a, fa); };
            }
            for (var k in fa) {
                if (E.equals(fa[k], a)) {
                    return true;
                }
            }
            return false;
        };
    }
    exports.elem = elem;
    // -------------------------------------------------------------------------------------
    // non-pipeables
    // -------------------------------------------------------------------------------------
    var map_ = function (fa, f) { return mapWithIndex_(fa, function (_, a) { return f(a); }); };
    var mapWithIndex_ = function (fa, f) {
        var out = {};
        var keys = Object.keys(fa);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            out[key] = f(key, fa[key]);
        }
        return out;
    };
    var reduce_ = function (fa, b, f) { return reduceWithIndex_(fa, b, function (_, b, a) { return f(b, a); }); };
    var foldMap_ = function (M) {
        var foldMapWithIndexM = foldMapWithIndex_(M);
        return function (fa, f) { return foldMapWithIndexM(fa, function (_, a) { return f(a); }); };
    };
    var reduceRight_ = function (fa, b, f) { return reduceRightWithIndex_(fa, b, function (_, a, b) { return f(a, b); }); };
    var traverse_ = function (F) {
        var traverseWithIndexF = traverseWithIndex_(F);
        return function (ta, f) { return traverseWithIndexF(ta, function (_, a) { return f(a); }); };
    };
    var filter_ = function (fa, predicate) {
        return filterWithIndex_(fa, function (_, a) { return predicate(a); });
    };
    var filterMap_ = function (fa, f) { return filterMapWithIndex_(fa, function (_, a) { return f(a); }); };
    var partition_ = function (fa, predicate) {
        return partitionWithIndex_(fa, function (_, a) { return predicate(a); });
    };
    var partitionMap_ = function (fa, f) { return partitionMapWithIndex_(fa, function (_, a) { return f(a); }); };
    var reduceWithIndex_ = function (fa, b, f) {
        var out = b;
        var ks = keys(fa);
        var len = ks.length;
        for (var i = 0; i < len; i++) {
            var k = ks[i];
            out = f(k, out, fa[k]);
        }
        return out;
    };
    var foldMapWithIndex_ = function (M) { return function (fa, f) {
        var out = M.empty;
        var ks = keys(fa);
        var len = ks.length;
        for (var i = 0; i < len; i++) {
            var k = ks[i];
            out = M.concat(out, f(k, fa[k]));
        }
        return out;
    }; };
    var reduceRightWithIndex_ = function (fa, b, f) {
        var out = b;
        var ks = keys(fa);
        var len = ks.length;
        for (var i = len - 1; i >= 0; i--) {
            var k = ks[i];
            out = f(k, fa[k], out);
        }
        return out;
    };
    var partitionMapWithIndex_ = function (fa, f) {
        var left = {};
        var right = {};
        var keys = Object.keys(fa);
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var key = keys_2[_i];
            var e = f(key, fa[key]);
            switch (e._tag) {
                case 'Left':
                    left[key] = e.left;
                    break;
                case 'Right':
                    right[key] = e.right;
                    break;
            }
        }
        return {
            left: left,
            right: right
        };
    };
    var partitionWithIndex_ = function (fa, predicateWithIndex) {
        var left = {};
        var right = {};
        var keys = Object.keys(fa);
        for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
            var key = keys_3[_i];
            var a = fa[key];
            if (predicateWithIndex(key, a)) {
                right[key] = a;
            }
            else {
                left[key] = a;
            }
        }
        return {
            left: left,
            right: right
        };
    };
    var filterMapWithIndex_ = function (fa, f) {
        var r = {};
        var keys = Object.keys(fa);
        for (var _i = 0, keys_4 = keys; _i < keys_4.length; _i++) {
            var key = keys_4[_i];
            var optionB = f(key, fa[key]);
            if (Option.isSome(optionB)) {
                r[key] = optionB.value;
            }
        }
        return r;
    };
    var filterWithIndex_ = function (fa, predicateWithIndex) {
        var out = {};
        var changed = false;
        for (var key in fa) {
            if (_hasOwnProperty.call(fa, key)) {
                var a = fa[key];
                if (predicateWithIndex(key, a)) {
                    out[key] = a;
                }
                else {
                    changed = true;
                }
            }
        }
        return changed ? out : fa;
    };
    var traverseWithIndex_ = function (F) { return function (ta, f) {
        var ks = keys(ta);
        if (ks.length === 0) {
            return F.of(exports.empty);
        }
        var fr = F.of({});
        var _loop_1 = function (key) {
            fr = F.ap(F.map(fr, function (r) { return function (b) {
                r[key] = b;
                return r;
            }; }), f(key, ta[key]));
        };
        for (var _i = 0, ks_1 = ks; _i < ks_1.length; _i++) {
            var key = ks_1[_i];
            _loop_1(key);
        }
        return fr;
    }; };
    var wither_ = function (F) {
        var traverseF = traverse_(F);
        return function (wa, f) { return F.map(traverseF(wa, f), exports.compact); };
    };
    var wilt_ = function (F) {
        var traverseF = traverse_(F);
        return function (wa, f) { return F.map(traverseF(wa, f), exports.separate); };
    };
    // -------------------------------------------------------------------------------------
    // pipeables
    // -------------------------------------------------------------------------------------
    /**
     * @category Filterable
     * @since 2.5.0
     */
    exports.filter = function (predicate) { return function (fa) { return filter_(fa, predicate); }; };
    /**
     * @category Filterable
     * @since 2.5.0
     */
    exports.filterMap = function (f) { return function (fa) { return filterMap_(fa, f); }; };
    /**
     * @category Foldable
     * @since 2.5.0
     */
    exports.foldMap = function (M) {
        var foldMapM = foldMap_(M);
        return function (f) { return function (fa) { return foldMapM(fa, f); }; };
    };
    /**
     * @category Filterable
     * @since 2.5.0
     */
    exports.partition = function (predicate) { return function (fa) { return partition_(fa, predicate); }; };
    /**
     * @category Filterable
     * @since 2.5.0
     */
    exports.partitionMap = function (f) { return function (fa) { return partitionMap_(fa, f); }; };
    /**
     * @category Foldable
     * @since 2.5.0
     */
    exports.reduce = function (b, f) { return function (fa) {
        return reduce_(fa, b, f);
    }; };
    /**
     * @category Foldable
     * @since 2.5.0
     */
    exports.reduceRight = function (b, f) { return function (fa) { return reduceRight_(fa, b, f); }; };
    /**
     * @category Compactable
     * @since 2.5.0
     */
    exports.compact = function (fa) {
        var r = {};
        var keys = Object.keys(fa);
        for (var _i = 0, keys_5 = keys; _i < keys_5.length; _i++) {
            var key = keys_5[_i];
            var optionA = fa[key];
            if (Option.isSome(optionA)) {
                r[key] = optionA.value;
            }
        }
        return r;
    };
    /**
     * @category Compactable
     * @since 2.5.0
     */
    exports.separate = function (fa) {
        var left = {};
        var right = {};
        var keys = Object.keys(fa);
        for (var _i = 0, keys_6 = keys; _i < keys_6.length; _i++) {
            var key = keys_6[_i];
            var e = fa[key];
            switch (e._tag) {
                case 'Left':
                    left[key] = e.left;
                    break;
                case 'Right':
                    right[key] = e.right;
                    break;
            }
        }
        return {
            left: left,
            right: right
        };
    };
    // -------------------------------------------------------------------------------------
    // instances
    // -------------------------------------------------------------------------------------
    /**
     * @category instances
     * @since 2.5.0
     */
    exports.URI = 'ReadonlyRecord';
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Functor = {
        URI: exports.URI,
        map: map_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.FunctorWithIndex = {
        URI: exports.URI,
        map: map_,
        mapWithIndex: mapWithIndex_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Foldable = {
        URI: exports.URI,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.FoldableWithIndex = {
        URI: exports.URI,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        reduceWithIndex: reduceWithIndex_,
        foldMapWithIndex: foldMapWithIndex_,
        reduceRightWithIndex: reduceRightWithIndex_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Compactable = {
        URI: exports.URI,
        compact: exports.compact,
        separate: exports.separate
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Filterable = {
        URI: exports.URI,
        map: map_,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.FilterableWithIndex = {
        URI: exports.URI,
        map: map_,
        mapWithIndex: mapWithIndex_,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_,
        filterMapWithIndex: filterMapWithIndex_,
        filterWithIndex: filterWithIndex_,
        partitionMapWithIndex: partitionMapWithIndex_,
        partitionWithIndex: partitionWithIndex_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Traversable = {
        URI: exports.URI,
        map: map_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        traverse: traverse_,
        sequence: sequence
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.TraversableWithIndex = {
        URI: exports.URI,
        map: map_,
        mapWithIndex: mapWithIndex_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        reduceWithIndex: reduceWithIndex_,
        foldMapWithIndex: foldMapWithIndex_,
        reduceRightWithIndex: reduceRightWithIndex_,
        traverse: traverse_,
        sequence: sequence,
        traverseWithIndex: traverseWithIndex_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Witherable = {
        URI: exports.URI,
        map: map_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        traverse: traverse_,
        sequence: sequence,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_,
        wither: wither_,
        wilt: wilt_
    };
    // TODO: remove in v3
    /**
     * @category instances
     * @since 2.5.0
     */
    exports.readonlyRecord = {
        URI: exports.URI,
        map: map_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        traverse: traverse_,
        sequence: sequence,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_,
        mapWithIndex: mapWithIndex_,
        reduceWithIndex: reduceWithIndex_,
        foldMapWithIndex: foldMapWithIndex_,
        reduceRightWithIndex: reduceRightWithIndex_,
        filterMapWithIndex: filterMapWithIndex_,
        filterWithIndex: filterWithIndex_,
        partitionMapWithIndex: partitionMapWithIndex_,
        partitionWithIndex: partitionWithIndex_,
        traverseWithIndex: traverseWithIndex_,
        wither: wither_,
        wilt: wilt_
    };
    });

    var Record = createCommonjsModule(function (module, exports) {
    var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
        o["default"] = v;
    });
    var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.record = exports.Witherable = exports.TraversableWithIndex = exports.Traversable = exports.FilterableWithIndex = exports.Filterable = exports.Compactable = exports.FoldableWithIndex = exports.Foldable = exports.FunctorWithIndex = exports.Functor = exports.URI = exports.separate = exports.compact = exports.reduceRight = exports.reduce = exports.partitionMap = exports.partition = exports.foldMap = exports.filterMap = exports.filter = exports.elem = exports.some = exports.every = exports.fromFoldableMap = exports.fromFoldable = exports.filterWithIndex = exports.filterMapWithIndex = exports.partitionWithIndex = exports.partitionMapWithIndex = exports.wilt = exports.wither = exports.sequence = exports.traverse = exports.traverseWithIndex = exports.singleton = exports.reduceRightWithIndex = exports.foldMapWithIndex = exports.reduceWithIndex = exports.map = exports.mapWithIndex = exports.empty = exports.lookup = exports.getMonoid = exports.getEq = exports.isSubrecord = exports.pop = exports.modifyAt = exports.updateAt = exports.deleteAt = exports.hasOwnProperty = exports.insertAt = exports.toUnfoldable = exports.toArray = exports.collect = exports.keys = exports.isEmpty = exports.size = exports.getShow = void 0;
    var RR = __importStar(ReadonlyRecord);
    /* tslint:disable:readonly-array */
    // -------------------------------------------------------------------------------------
    // model
    // -------------------------------------------------------------------------------------
    /**
     * @since 2.0.0
     */
    exports.getShow = RR.getShow;
    /**
     * Calculate the number of key/value pairs in a record
     *
     * @since 2.0.0
     */
    exports.size = RR.size;
    /**
     * Test whether a record is empty
     *
     * @since 2.0.0
     */
    exports.isEmpty = RR.isEmpty;
    /**
     * @since 2.0.0
     */
    exports.keys = RR.keys;
    /**
     * Map a record into an array
     *
     * @example
     * import {collect} from 'fp-ts/Record'
     *
     * const x: { a: string, b: boolean } = { a: 'foo', b: false }
     * assert.deepStrictEqual(
     *   collect((key, val) => ({key: key, value: val}))(x),
     *   [{key: 'a', value: 'foo'}, {key: 'b', value: false}]
     * )
     *
     * @since 2.0.0
     */
    exports.collect = RR.collect;
    /**
     * @since 2.0.0
     */
    exports.toArray = RR.toReadonlyArray;
    function toUnfoldable(U) {
        return RR.toUnfoldable(U);
    }
    exports.toUnfoldable = toUnfoldable;
    function insertAt(k, a) {
        return RR.insertAt(k, a);
    }
    exports.insertAt = insertAt;
    /**
     * @since 2.0.0
     */
    exports.hasOwnProperty = RR.hasOwnProperty;
    function deleteAt(k) {
        return RR.deleteAt(k);
    }
    exports.deleteAt = deleteAt;
    /**
     * @since 2.0.0
     */
    exports.updateAt = RR.updateAt;
    /**
     * @since 2.0.0
     */
    exports.modifyAt = RR.modifyAt;
    function pop(k) {
        return RR.pop(k);
    }
    exports.pop = pop;
    // TODO: remove non-curried overloading in v3
    /**
     * Test whether one record contains all of the keys and values contained in another record
     *
     * @since 2.0.0
     */
    exports.isSubrecord = RR.isSubrecord;
    function getEq(E) {
        return RR.getEq(E);
    }
    exports.getEq = getEq;
    function getMonoid(S) {
        return RR.getMonoid(S);
    }
    exports.getMonoid = getMonoid;
    // TODO: remove non-curried overloading in v3
    /**
     * Lookup the value for a key in a record
     *
     * @since 2.0.0
     */
    exports.lookup = RR.lookup;
    /**
     * @since 2.0.0
     */
    exports.empty = {};
    function mapWithIndex(f) {
        return RR.mapWithIndex(f);
    }
    exports.mapWithIndex = mapWithIndex;
    function map(f) {
        return RR.map(f);
    }
    exports.map = map;
    function reduceWithIndex(b, f) {
        return RR.reduceWithIndex(b, f);
    }
    exports.reduceWithIndex = reduceWithIndex;
    function foldMapWithIndex(M) {
        return RR.foldMapWithIndex(M);
    }
    exports.foldMapWithIndex = foldMapWithIndex;
    function reduceRightWithIndex(b, f) {
        return RR.reduceRightWithIndex(b, f);
    }
    exports.reduceRightWithIndex = reduceRightWithIndex;
    /**
     * Create a record with one key/value pair
     *
     * @since 2.0.0
     */
    exports.singleton = RR.singleton;
    function traverseWithIndex(F) {
        return RR.traverseWithIndex(F);
    }
    exports.traverseWithIndex = traverseWithIndex;
    function traverse(F) {
        return RR.traverse(F);
    }
    exports.traverse = traverse;
    function sequence(F) {
        return RR.sequence(F);
    }
    exports.sequence = sequence;
    /**
     * @category Witherable
     * @since 2.6.5
     */
    exports.wither = RR.wither;
    /**
     * @category Witherable
     * @since 2.6.5
     */
    exports.wilt = RR.wilt;
    function partitionMapWithIndex(f) {
        return RR.partitionMapWithIndex(f);
    }
    exports.partitionMapWithIndex = partitionMapWithIndex;
    function partitionWithIndex(predicateWithIndex) {
        return RR.partitionWithIndex(predicateWithIndex);
    }
    exports.partitionWithIndex = partitionWithIndex;
    function filterMapWithIndex(f) {
        return RR.filterMapWithIndex(f);
    }
    exports.filterMapWithIndex = filterMapWithIndex;
    function filterWithIndex(predicateWithIndex) {
        return RR.filterWithIndex(predicateWithIndex);
    }
    exports.filterWithIndex = filterWithIndex;
    function fromFoldable(M, F) {
        return RR.fromFoldable(M, F);
    }
    exports.fromFoldable = fromFoldable;
    function fromFoldableMap(M, F) {
        return RR.fromFoldableMap(M, F);
    }
    exports.fromFoldableMap = fromFoldableMap;
    /**
     * @since 2.0.0
     */
    exports.every = RR.every;
    /**
     * @since 2.0.0
     */
    exports.some = RR.some;
    // TODO: remove non-curried overloading in v3
    /**
     * @since 2.0.0
     */
    exports.elem = RR.elem;
    // -------------------------------------------------------------------------------------
    // non-pipeables
    // -------------------------------------------------------------------------------------
    var map_ = RR.Functor.map;
    var mapWithIndex_ = RR.FunctorWithIndex.mapWithIndex;
    var reduce_ = RR.Foldable.reduce;
    var foldMap_ = RR.Foldable.foldMap;
    var reduceRight_ = RR.Foldable.reduceRight;
    var reduceWithIndex_ = RR.FoldableWithIndex.reduceWithIndex;
    var foldMapWithIndex_ = RR.FoldableWithIndex.foldMapWithIndex;
    var reduceRightWithIndex_ = RR.FoldableWithIndex.reduceRightWithIndex;
    var filter_ = RR.Filterable.filter;
    var filterMap_ = RR.Filterable.filterMap;
    var partition_ = RR.Filterable.partition;
    var partitionMap_ = RR.Filterable.partitionMap;
    var filterWithIndex_ = RR.FilterableWithIndex
        .filterWithIndex;
    var filterMapWithIndex_ = RR.FilterableWithIndex.filterMapWithIndex;
    var partitionWithIndex_ = RR.FilterableWithIndex
        .partitionWithIndex;
    var partitionMapWithIndex_ = RR.FilterableWithIndex.partitionMapWithIndex;
    var traverseWithIndex_ = RR.TraversableWithIndex
        .traverseWithIndex;
    var wither_ = RR.Witherable.wither;
    var wilt_ = RR.Witherable.wilt;
    var traverse_ = function (F) {
        var traverseF = traverse(F);
        return function (ta, f) { return traverseF(f)(ta); };
    };
    // -------------------------------------------------------------------------------------
    // pipeables
    // -------------------------------------------------------------------------------------
    /**
     * @category Filterable
     * @since 2.0.0
     */
    exports.filter = RR.filter;
    /**
     * @category Filterable
     * @since 2.0.0
     */
    exports.filterMap = RR.filterMap;
    /**
     * @category Foldable
     * @since 2.0.0
     */
    exports.foldMap = RR.foldMap;
    /**
     * @category Filterable
     * @since 2.0.0
     */
    exports.partition = RR.partition;
    /**
     * @category Filterable
     * @since 2.0.0
     */
    exports.partitionMap = RR.partitionMap;
    /**
     * @category Foldable
     * @since 2.0.0
     */
    exports.reduce = RR.reduce;
    /**
     * @category Foldable
     * @since 2.0.0
     */
    exports.reduceRight = RR.reduceRight;
    /**
     * @category Compactable
     * @since 2.0.0
     */
    exports.compact = RR.compact;
    /**
     * @category Compactable
     * @since 2.0.0
     */
    exports.separate = RR.separate;
    // -------------------------------------------------------------------------------------
    // instances
    // -------------------------------------------------------------------------------------
    /**
     * @category instances
     * @since 2.0.0
     */
    exports.URI = 'Record';
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Functor = {
        URI: exports.URI,
        map: map_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.FunctorWithIndex = {
        URI: exports.URI,
        map: map_,
        mapWithIndex: mapWithIndex_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Foldable = {
        URI: exports.URI,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.FoldableWithIndex = {
        URI: exports.URI,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        reduceWithIndex: reduceWithIndex_,
        foldMapWithIndex: foldMapWithIndex_,
        reduceRightWithIndex: reduceRightWithIndex_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Compactable = {
        URI: exports.URI,
        compact: exports.compact,
        separate: exports.separate
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Filterable = {
        URI: exports.URI,
        map: map_,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.FilterableWithIndex = {
        URI: exports.URI,
        map: map_,
        mapWithIndex: mapWithIndex_,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_,
        filterMapWithIndex: filterMapWithIndex_,
        filterWithIndex: filterWithIndex_,
        partitionMapWithIndex: partitionMapWithIndex_,
        partitionWithIndex: partitionWithIndex_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Traversable = {
        URI: exports.URI,
        map: map_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        traverse: traverse_,
        sequence: sequence
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.TraversableWithIndex = {
        URI: exports.URI,
        map: map_,
        mapWithIndex: mapWithIndex_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        reduceWithIndex: reduceWithIndex_,
        foldMapWithIndex: foldMapWithIndex_,
        reduceRightWithIndex: reduceRightWithIndex_,
        traverse: traverse_,
        sequence: sequence,
        traverseWithIndex: traverseWithIndex_
    };
    /**
     * @category instances
     * @since 2.7.0
     */
    exports.Witherable = {
        URI: exports.URI,
        map: map_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        traverse: traverse_,
        sequence: sequence,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_,
        wither: wither_,
        wilt: wilt_
    };
    // TODO: remove in v3
    /**
     * @category instances
     * @since 2.0.0
     */
    exports.record = {
        URI: exports.URI,
        map: map_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        traverse: traverse_,
        sequence: sequence,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_,
        mapWithIndex: mapWithIndex_,
        reduceWithIndex: reduceWithIndex_,
        foldMapWithIndex: foldMapWithIndex_,
        reduceRightWithIndex: reduceRightWithIndex_,
        filterMapWithIndex: filterMapWithIndex_,
        filterWithIndex: filterWithIndex_,
        partitionMapWithIndex: partitionMapWithIndex_,
        partitionWithIndex: partitionWithIndex_,
        traverseWithIndex: traverseWithIndex_,
        wither: wither_,
        wilt: wilt_
    };
    });

    var R = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), Record, {
        'default': Record,
        __moduleExports: Record
    }));

    const getTypedNone = () => Option.none;
    const findGameOwner = ({ players }) => {
        return Record.record.reduce(players, getTypedNone(), (acc, player) => {
            return player.gameOwner ? Option.some(player) : acc;
        });
    };
    const isGameOwner = (game, playerName) => {
        return _function.pipe(game, findGameOwner, Option.map((gameOwner) => gameOwner.playerName === playerName), Option.getOrElse(() => false));
    };

    /* src/views/WaitScreen.svelte generated by Svelte v3.24.1 */
    const file$4 = "src/views/WaitScreen.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i][0];
    	child_ctx[8] = list[i][1].playerName;
    	return child_ctx;
    }

    // (17:2) {:else}
    function create_else_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Invalid Game Code";
    			attr_dev(p, "class", "text-center text-red-500");
    			add_location(p, file$4, 17, 4, 458);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(17:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:2) {#if game}
    function create_if_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Waiting for Other Players";
    			attr_dev(p, "class", "text-center");
    			add_location(p, file$4, 15, 4, 391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(15:2) {#if game}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if game}
    function create_if_block$2(ctx) {
    	let t;
    	let show_if = isGameOwner(/*game*/ ctx[0], /*name*/ ctx[1]);
    	let if_block_anchor;
    	let current;
    	let each_value = Record.toArray(/*game*/ ctx[0].players);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block = show_if && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*R, game*/ 1) {
    				each_value = Record.toArray(/*game*/ ctx[0].players);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*game, name*/ 3) show_if = isGameOwner(/*game*/ ctx[0], /*name*/ ctx[1]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*game, name*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(22:4) {#if game}",
    		ctx
    	});

    	return block;
    }

    // (23:6) {#each R.toArray(game.players) as [_, { playerName }
    function create_each_block(ctx) {
    	let p;
    	let t_value = /*playerName*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$4, 23, 8, 637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*game*/ 1 && t_value !== (t_value = /*playerName*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(23:6) {#each R.toArray(game.players) as [_, { playerName }",
    		ctx
    	});

    	return block;
    }

    // (26:6) {#if isGameOwner(game, name)}
    function create_if_block_1$1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				onClick: /*start*/ ctx[3],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(26:6) {#if isGameOwner(game, name)}",
    		ctx
    	});

    	return block;
    }

    // (27:8) <Button onClick={start}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Start Game");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(27:8) <Button onClick={start}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let t2;
    	let div0;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*game*/ ctx[0]) return create_if_block_2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*game*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = `${/*code*/ ctx[2]}`;
    			t1 = space();
    			if_block0.c();
    			t2 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(h2, "class", "text-xl text-center");
    			add_location(h2, file$4, 13, 2, 330);
    			attr_dev(div0, "class", "text-center");
    			add_location(div0, file$4, 20, 2, 527);
    			add_location(div1, file$4, 12, 0, 322);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			if_block0.m(div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			if (if_block1) if_block1.m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, t2);
    				}
    			}

    			if (/*game*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*game*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { params } = $$props,
    		{ game } = $$props,
    		{ getGame } = $$props,
    		{ startGame } = $$props,
    		{ name } = $$props;

    	game || getGame(params.code);
    	const { code } = params;
    	const start = () => startGame(code);
    	const writable_props = ["params", "game", "getGame", "startGame", "name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WaitScreen> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("WaitScreen", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(4, params = $$props.params);
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    		if ("getGame" in $$props) $$invalidate(5, getGame = $$props.getGame);
    		if ("startGame" in $$props) $$invalidate(6, startGame = $$props.startGame);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		params,
    		game,
    		getGame,
    		startGame,
    		name,
    		Button,
    		isGameOwner,
    		R,
    		code,
    		start
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(4, params = $$props.params);
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    		if ("getGame" in $$props) $$invalidate(5, getGame = $$props.getGame);
    		if ("startGame" in $$props) $$invalidate(6, startGame = $$props.startGame);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [game, name, code, start, params, getGame, startGame];
    }

    class WaitScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			params: 4,
    			game: 0,
    			getGame: 5,
    			startGame: 6,
    			name: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WaitScreen",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[4] === undefined && !("params" in props)) {
    			console.warn("<WaitScreen> was created without expected prop 'params'");
    		}

    		if (/*game*/ ctx[0] === undefined && !("game" in props)) {
    			console.warn("<WaitScreen> was created without expected prop 'game'");
    		}

    		if (/*getGame*/ ctx[5] === undefined && !("getGame" in props)) {
    			console.warn("<WaitScreen> was created without expected prop 'getGame'");
    		}

    		if (/*startGame*/ ctx[6] === undefined && !("startGame" in props)) {
    			console.warn("<WaitScreen> was created without expected prop 'startGame'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<WaitScreen> was created without expected prop 'name'");
    		}
    	}

    	get params() {
    		throw new Error("<WaitScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<WaitScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get game() {
    		throw new Error("<WaitScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set game(value) {
    		throw new Error("<WaitScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGame() {
    		throw new Error("<WaitScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGame(value) {
    		throw new Error("<WaitScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get startGame() {
    		throw new Error("<WaitScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set startGame(value) {
    		throw new Error("<WaitScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<WaitScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<WaitScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const onGetGame = (socket, fn) => {
        const action = "GET_GAME";
        socket.on(action, fn);
        return (code) => {
            socket.emit(action, { code });
        };
    };

    const onStartGame = (socket, fn) => {
        const action = "START_GAME";
        socket.on(action, fn);
        return (code) => {
            socket.emit(action, { code });
        };
    };

    /* src/views/PlayScreen.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$5 = "src/views/PlayScreen.svelte";

    // (9:2) {:else}
    function create_else_block$2(ctx) {
    	let p;
    	let t_value = /*game*/ ctx[0].dealtCards[/*game*/ ctx[0].lastPlayedIndex] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$5, 9, 4, 144);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*game*/ 1 && t_value !== (t_value = /*game*/ ctx[0].dealtCards[/*game*/ ctx[0].lastPlayedIndex] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(9:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (7:2) {#if game.lastPlayedIndex === -1}
    function create_if_block_1$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Game Start";
    			add_location(p, file$5, 7, 4, 112);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(7:2) {#if game.lastPlayedIndex === -1}",
    		ctx
    	});

    	return block;
    }

    // (13:2) {#if hand}
    function create_if_block$3(ctx) {
    	let p;
    	let t_value = /*hand*/ ctx[1][0] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$5, 13, 4, 217);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hand*/ 2 && t_value !== (t_value = /*hand*/ ctx[1][0] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(13:2) {#if hand}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let t;

    	function select_block_type(ctx, dirty) {
    		if (/*game*/ ctx[0].lastPlayedIndex === -1) return create_if_block_1$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*hand*/ ctx[1] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			add_location(div, file$5, 5, 0, 66);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			}

    			if (/*hand*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { game } = $$props, { hand } = $$props;
    	console.log(hand);
    	const writable_props = ["game", "hand"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<PlayScreen> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PlayScreen", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    		if ("hand" in $$props) $$invalidate(1, hand = $$props.hand);
    	};

    	$$self.$capture_state = () => ({ game, hand });

    	$$self.$inject_state = $$props => {
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    		if ("hand" in $$props) $$invalidate(1, hand = $$props.hand);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [game, hand];
    }

    class PlayScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { game: 0, hand: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayScreen",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*game*/ ctx[0] === undefined && !("game" in props)) {
    			console_1.warn("<PlayScreen> was created without expected prop 'game'");
    		}

    		if (/*hand*/ ctx[1] === undefined && !("hand" in props)) {
    			console_1.warn("<PlayScreen> was created without expected prop 'hand'");
    		}
    	}

    	get game() {
    		throw new Error("<PlayScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set game(value) {
    		throw new Error("<PlayScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hand() {
    		throw new Error("<PlayScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hand(value) {
    		throw new Error("<PlayScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */

    const { console: console_1$1 } = globals;
    const file$6 = "src/App.svelte";

    // (67:6) {:else}
    function create_else_block$3(ctx) {
    	let playscreen;
    	let current;

    	playscreen = new PlayScreen({
    			props: {
    				game: /*game*/ ctx[1],
    				hand: /*hand*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(playscreen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(playscreen, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const playscreen_changes = {};
    			if (dirty & /*game*/ 2) playscreen_changes.game = /*game*/ ctx[1];
    			if (dirty & /*hand*/ 8) playscreen_changes.hand = /*hand*/ ctx[3];
    			playscreen.$set(playscreen_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(playscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(playscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(playscreen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(67:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (65:6) {#if game == null || game.status === 'join'}
    function create_if_block$4(ctx) {
    	let waitscreen;
    	let current;

    	waitscreen = new WaitScreen({
    			props: {
    				params: /*params*/ ctx[11],
    				game: /*game*/ ctx[1],
    				getGame: /*getGame*/ ctx[6],
    				name: /*name*/ ctx[2],
    				startGame: /*startGame*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(waitscreen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(waitscreen, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const waitscreen_changes = {};
    			if (dirty & /*params*/ 2048) waitscreen_changes.params = /*params*/ ctx[11];
    			if (dirty & /*game*/ 2) waitscreen_changes.game = /*game*/ ctx[1];
    			if (dirty & /*name*/ 4) waitscreen_changes.name = /*name*/ ctx[2];
    			waitscreen.$set(waitscreen_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(waitscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(waitscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(waitscreen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(65:6) {#if game == null || game.status === 'join'}",
    		ctx
    	});

    	return block;
    }

    // (64:4) <Route path="/:code" let:params>
    function create_default_slot_2$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*game*/ ctx[1] == null || /*game*/ ctx[1].status === "join") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(64:4) <Route path=\\\"/:code\\\" let:params>",
    		ctx
    	});

    	return block;
    }

    // (71:4) <Route path="/">
    function create_default_slot_1$1(ctx) {
    	let startpage;
    	let current;

    	startpage = new StartPage({
    			props: {
    				name: /*name*/ ctx[2],
    				updateName: /*updateName*/ ctx[5],
    				emit: /*emit*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(startpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(startpage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const startpage_changes = {};
    			if (dirty & /*name*/ 4) startpage_changes.name = /*name*/ ctx[2];
    			startpage.$set(startpage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(startpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(startpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(startpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(71:4) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (61:0) <Router {url}>
    function create_default_slot$2(ctx) {
    	let main;
    	let tailwind;
    	let t0;
    	let route0;
    	let t1;
    	let route1;
    	let current;
    	tailwind = new Tailwind({ $$inline: true });

    	route0 = new Route({
    			props: {
    				path: "/:code",
    				$$slots: {
    					default: [
    						create_default_slot_2$1,
    						({ params }) => ({ 11: params }),
    						({ params }) => params ? 2048 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(tailwind.$$.fragment);
    			t0 = space();
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			add_location(main, file$6, 61, 2, 1515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(tailwind, main, null);
    			append_dev(main, t0);
    			mount_component(route0, main, null);
    			append_dev(main, t1);
    			mount_component(route1, main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope, params, game, name, hand*/ 6158) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope, name*/ 4100) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tailwind.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tailwind.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(tailwind);
    			destroy_component(route0);
    			destroy_component(route1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(61:0) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope, name, game, hand*/ 4110) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	const socket = configureSocket();

    	const emit = (type, message) => {
    		socket.emit(type, message);
    	};

    	socket.on("CREATE_GAME", data => {
    		navigate(`/${data.code}`);
    	});

    	let game;
    	let name = window.sessionStorage.getItem("playerName") || "";
    	let hand;

    	const updateName = playerName => {
    		$$invalidate(2, name = playerName);
    		window.sessionStorage.setItem("playerName", playerName);
    	};

    	const updateGame = data => {
    		data.game && $$invalidate(1, game = data.game);
    	};

    	const setHand = data => {
    		console.log(data);
    		data.hand && $$invalidate(3, hand = data.hand.sort());
    	};

    	socket.on("JOIN_GAME", data => {
    		console.log("someone wants to play!");
    		updateGame(data);
    		navigate(`/${data.code}`);
    	});

    	socket.on("START_GAME", data => {
    		updateGame(data);
    		setHand(data);
    	});

    	const getGame = onGetGame(socket, updateGame);
    	const startGame = onStartGame(socket, updateGame);

    	socket && socket.on("connect", () => {
    		console.log("Connected!");
    	});

    	let { url = "" } = $$props;
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		navigate,
    		Tailwind,
    		StartPage,
    		configureSocket,
    		WaitScreen,
    		onGetGame,
    		onStartGame,
    		PlayScreen,
    		socket,
    		emit,
    		game,
    		name,
    		hand,
    		updateName,
    		updateGame,
    		setHand,
    		getGame,
    		startGame,
    		url
    	});

    	$$self.$inject_state = $$props => {
    		if ("game" in $$props) $$invalidate(1, game = $$props.game);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("hand" in $$props) $$invalidate(3, hand = $$props.hand);
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, game, name, hand, emit, updateName, getGame, startGame];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({ target: document.body });

    return app;

}());
//# sourceMappingURL=bundle.js.map
