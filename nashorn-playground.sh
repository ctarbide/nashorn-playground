#!/bin/sh
set -eu
thispath=`perl -MCwd=realpath -le'print(realpath(\$ARGV[0]))' -- "${0}"`
if [ -d "${thispath%*.sh}" ]; then
    dir=${thispath%*.sh}
else
    dir=${thispath%/*}/target
fi
. "${dir}/config.inc.sh"
PATH="${JAVA_HOME}/bin:${PATH}" CLASSPATH="${dir}/classes:`cat "${dir}/mdep.classpath"`" \
    exec java org.openjdk.nashorn.tools.Shell "$@"
