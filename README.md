# Pahina Template
Boostratap 5 Starter Template with SaSS

# Requirements

* [node.js](https://nodejs.org/) make sure node.js is installed to your machince/pc
* [gulp.js](https://gulpjs.com/docs/en/getting-started/quick-start) make things easier install gulp cli
```
npm install --global gulp-cli
```

# Installation
* Clone the repository to your machine
```
git clone git@github.com:jahzlariosa/pahina-bs5-sass.git
```
* Inside the project run npm install to download all the dependencies
```
npm install
```
* Get the move the dependencies to the src folder
```
gulp get-assets
```
* Run the server and start coding
```
gulp start
```

# Config
## browserSyncOptions Edit gulpconfig.json
* Static development (Default)
```
"server": "./",
```
* Serving from a server environment
```
"proxy": "localhost:3000"
```
