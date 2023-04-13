
Build: mvn compile

REPL: ./nashorn-playground.sh

Test: ./nashorn-playground.sh -strict nashorn-example.js -- arg1 arg2

Distribute: mvn package

REPL jar: java -jar target/nashorn-playground.jar

Test jar: java -jar target/nashorn-playground.jar -strict nashorn-example.js -- arg1 arg2
