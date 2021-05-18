# -*- mode:org; coding:utf-8-unix -*-

#+STARTUP: indent

* Build

#+begin_src sh
  mvn compile
#+end_src


** Test

#+begin_src sh
  ./nashorn-playground.sh -strict nashorn-example.js -- arg1 arg2
#+end_src


* Distribute

#+begin_src sh
  mvn package
#+end_src


** Test

#+begin_src sh
  java -jar target/nashorn-playground.jar -strict nashorn-example.js -- arg1 arg2
#+end_src
