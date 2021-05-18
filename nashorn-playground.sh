#!/bin/sh
set -eu
thispath=`perl -MCwd=realpath -le'print(realpath(\$ARGV[0]))' -- "${0}"`
thisprog=${thispath##*/}
. "${thispath%*.sh}/config.inc.sh"
classpath_file=${thispath%*.sh}/mdep.classpath
target_classes=${thispath%*.sh}/classes
PATH="${JAVA_HOME}/bin:${PATH}" CLASSPATH="${target_classes}:`cat "${classpath_file}"`" \
    exec java org.openjdk.nashorn.tools.Shell "$@"
