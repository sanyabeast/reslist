# reslist

```
+res|
    +output
        <empty folder>
    +shaders
        wow.frag
        flame.vect
    +layouts
        kek.html
        lol.html
    +images
        logo.png
+src|
    +modules
        MyApp.js
    main.js
index.html
package.json
...
reslist.config.json <=== 
```

```json
{
  "dirSeparator" : ".",
  "filePrefix" : "::",
  "tasks" : {
    "res/shaders" : {
      "outputJSON" : "res/output/shaders.json",
      "extensions" : ["vert", "frag"],
      "readFile" : "true",
      "extensionInName" : "true"
    },
    "res/layouts" : {
      "outputJSON" : "res/layouts.json",
      "extensions" : ["html"],
      "readFile" : "true",
    	"extensionInName" : "false",
      "trim" : "true"
    },
    "res/graphics" : {
      "outputJSON" : "res/graphics.json",
      "extensions" : ["svg", "jpg", "png"],
      "readFile" : "false",
    	"noName" : "false",
    	"extensionInName" : "true"
    }
  }
}

```

```
node ./node_modules/reslist/reslist reslist.config.json
```

```
+res|
    +output
        shaders.json <===
        images.json
        layouts.json
    +shaders
        wow.frag
        flame.vect
    +layouts
        kek.html
        lol.html
    +images
        logo.png
+src|
    +modules
        MyApp.js
    main.js
index.html
package.json
reslist.config.json
```

```json
{
    "content": {
        "res.shaders::wow.frag": "uniform vec3 color;\r\nunifo ... ",
        "res.shaders::flame.vert": "uniform vec3 color;\r\nunifo ... "
    },
    "size": 136,
    "total": 1
}

```
