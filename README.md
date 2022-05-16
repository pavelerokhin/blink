# BlinkGallery

![give a star to the project](./etc/header.png)

A lightweight JS gallery. Current version: 1.0.0
## Features
 - upload all the photos and prevent downloading the photos or dragging them,
you can set a custom cursor (or no cursor at all),
 - changes photos on mouse move event;

## Ongoing features
 - add the library to NPM,
 - add control button for on-click image changing,

## Installation
Copy the` Blink.js` file to your project and import it with a <script> tag.

## Parameters
You can pass to the Blink Gallery's class constructor the following parameters:
 * requested parameters:
   * `containerId` - id (!) of a div element in DOM that will contain the gallery. String, requested
   * `imgUrls` - an array of URLs to the images to publish in the gallery. An array of strings. Requested
 * optional parameters:
   * `caption` - a single row of text, placed under the gallery. String
   * `changeEvent` - event for change pictures ("mousemove", "click", "timer"). String, default: mousemove
   * `timer` - if the change event is "timer", set the time interval in milliseconds. Number, default: 1000
   * `style` - an object that defines the styling of the gallery, has the following fields:
   * `cursorUrl` - URL to the custom cursor image, which will appear on hover of the gallery. String
   * `imgCentered` - if true, the images will be centred. Boolean, default: false
   * `height` - a height in px or per cent. String
   * `width` - width in px or per cent. String
   * `href` - a link ref, opens on click on the gallery. String

## Usage
See the example.html file
E.g.:


```
<body>
  <div id="blink"></div>

  <script src="Blink.js"></script>
  <script>
      const blinkGallery1_1 = new Blink({
        containerId: "blink",
        imgUrls: ["url/to/1.jpg","url/to/2.jpg"],
        caption: "standard Blink gallery with picture change on mousemove",
      });
      blink.show();
  </script>
</body>
```
