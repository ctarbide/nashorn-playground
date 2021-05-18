/*  -*- mode: js; coding:utf-8-unix -*-
(progn
  (require 'ansi-color)
  (defun colorize-compilation-buffer ()
    (ansi-color-apply-on-region compilation-filter-start (point)))
  (add-hook 'compilation-filter-hook 'colorize-compilation-buffer))

(setq compile-command "./nashorn-playground.sh -strict nashorn-example.js -- arg1 arg2")

(local-set-key (kbd "C-c C-c") 'recompile)
*/

var System = Java.type("java.lang.System");
var Example = Java.type("com.acme.labs.Example");

System.out.println(Example.getValue());
print(Example.getValue());

var LogManager = Java.type('org.apache.logging.log4j.LogManager');
var LogManager_getLogger = LogManager['getLogger(String)'];

var LOG = LogManager_getLogger("nashorn-example.js");

LOG.trace("testing: {}", 'trace message');
LOG.debug("testing: {}", 'debug message');
LOG.info("testing: {}", 'info message');
LOG.warn("testing: {}", 'warn message');

Array.prototype.slice.call(arguments).forEach(function(v, idx){
    LOG.debug("arg[{}]: {}", idx|0, v);
});

// https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
(function(){
    function list() {
        return Array.prototype.slice.call(arguments);
    }

    var list1 = list(1, 2, 3); // [1, 2, 3]
    LOG.debug('list1: {}', Java.to(list1));
}());

// https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
(function(){
    var unboundSlice = Array.prototype.slice;
    var slice = Function.prototype.call.bind(unboundSlice);

    function list() {
        return slice(arguments);
    }

    var list1 = list(1, 2, 3); // [1, 2, 3]
    LOG.debug('list1: {}', Java.to(list1));
}());
