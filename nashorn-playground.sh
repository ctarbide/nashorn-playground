#!/bin/sh
set -eu
thispath=`perl -MCwd=realpath -le'print(realpath(\$ARGV[0]))' -- "${0}"`

if [ -d "${thispath%*.sh}" ]; then
    dir=${thispath%*.sh}
else
    dir=${thispath%/*}/target
fi

if [ -r "${dir}/config.inc.sh" ]; then
    . "${dir}/config.inc.sh"
elif [ -r "${thispath%*.sh}.jar" ]; then
    if command -v rlwrap >/dev/null 2>&1; then
        exec rlwrap java -jar "${thispath%*.sh}.jar" "$@"
    else
        exec java -jar "${thispath%*.sh}.jar" "$@"
    fi
fi

PATH=${JAVA_HOME}/bin:${PATH}
CLASSPATH=${dir}/classes:`cat "${dir}/mdep.classpath"`
export CLASSPATH

if command -v rlwrap >/dev/null 2>&1; then
    exec rlwrap java org.openjdk.nashorn.tools.Shell "$@"
else
    exec java org.openjdk.nashorn.tools.Shell "$@"
fi
