# sphere
This is the Sphere Application, it is made to be a user's frondend for Xashub series product.

# Setup
```
git clone git@github.com:onexas2023/sphere.git
cd sphere
npm ci
```

# About development
Clean project build (./build/*) and bundle(./bundle/*)
```
npm run clean
```

Bundle to server js for dev then put in ./bundle/* and watch source files change
```
npm run bundle-res <package>
npm run bundle-watch <package>
```
package is sphere(default)

Run server js and watch js files change
```
npm run server-watch
```

# About testcases
```
npm run test
npm run test-nocover
```

# About production

Bundle to server js for prod in ./bundle/*
```
npm run bundle-res <package>
npm run bundle <package>
```
package is sphere(default)

Run server js
```
npm run server
or
npm run start
```

# About release to repository
Build to package js then put in ./build/*
```
npm run build-res
npm run build

cd build/<package>
npm publish
```

# How to kill the server

kill server via description
```
ps -ef|grep node
find the `node server-main.js`
kill -9 [PID]
```

kill the port via port
```
lsof -i tcp:[port]
kill - [PID]
```
