"use strict";

// export default class Blink {
class Blink {
  /* pass to the constructor the following parameters:
     REQUESTED PARAMETERS:
        containerId - id (!) of a div element in DOM that will contain the gallery. String, requested
        imgUrls - array of URLs to the images to publish in the gallery. Array of strings, requested
     OPTIONAL PARAMETERS:
        caption - a single row of text, placed under the gallery. String
        changeEvent - event for change pictures ("mousemove", "click", "timer"). String, default: mousemove
        timer - if change event is timer, set the time interval im milliseconds. Number, default: 1000
        style.cursorUrl - url to the custom cursor image, which will appear on hover of the gallery. String
        style.imgCentered - if true, the images will be centered. Boolean, default: false
        style.height - height in px or percent. String
        style.width - width in px or percent. String
        href - a link ref, opens on click on the gallery. String
  */
  constructor({
    containerId,
    imgUrls,
    caption = "",
    changeEvent = "mousemove",
    timer = 1000,
    href = "",
    style = {
      cursorUrl: "",
      imgCentered: false,
      height: "",
      width: "",
    },
  }) {
    // tests
    if (containerId.length == 0) {
      console.info(
        "no Blink gallery's container has been set, no gallery will be initialized"
      );
      return;
    }
    if (imgUrls.length == 0) {
      console.info(
        `no Blink gallery's photos urls have been set, no gallery (with ID '${containerId}') will be initialized`
      );
      return;
    }

    const alloudEvents = ["mousemove", "click", "timer"];
    if (alloudEvents.indexOf(changeEvent) == -1) {
      console.info(
        `requested cvhange event '${changeEvent}' is not supported by Blink gallery`
      );
      return;
    }

    if (
      style.height.slice(style.height.length - 1) != "%" &&
      style.height.length > 2 &&
      style.height.slice(style.height.length - 2) != "px"
    ) {
      console.info(
        "height (style parameter) should be a number with px or % suffix"
      );
      return;
    }

    if (
      style.height.slice(style.height.length - 1) != "%" &&
      style.height.length > 2 &&
      style.height.slice(style.height.length - 2) != "px"
    ) {
      console.info(
        "width (style parameter) should be a number with px or % suffix"
      );
      return;
    }

    // fields
    this.changeEvent = changeEvent;
    this.galleryContainer = null;
    this.galleryContainerCX = 0;
    this.galleryContainerCY = 0;
    this.imgs = [];
    this.minHeightGalleryContainer = Infinity;
    this.minWidthGalleryContainer = Infinity;
    this.style = style;
    this.timer = timer;
    this.urls = imgUrls;
    this.visibleImageIndex = 0;

    // pointer to the instance of the gallery
    let that = this;

    // get gallery container from the DOM
    try {
      this.galleryContainer = document.querySelector("#" + containerId);
      if (!this.galleryContainer) {
        throw new Error("no container in DOM");
      }
    } catch (e) {
      console.error(e);
      throw new Error(
        `no Blink gallery's container with ID "${containerId}" has been found in DOM`
      );
    }

    // gallery styling
    this.setGalleryContainerStyle();
    let rectangle = this.galleryContainer.getBoundingClientRect();
    this.galleryContainerCX = rectangle.left + rectangle.width * 0.5;
    this.galleryContainerCY = rectangle.top + rectangle.height * 0.5;

    // append link if needed
    if (href) {
      that.galleryContainer.setAttribute("onclick", `location.href='${href}'`);
    }
    // set the coursor
    if (this.style.cursorUrl) {
      that.galleryContainer.style.cursor = `url("${this.style.cursorUrl}"), auto`;
    }

    this.appendImagesContainer();

    if (caption) {
      this.appendCaption(caption);
    }

    this.urls.forEach((url, i) => {
      let img = document.createElement("img");
      img.style.position = "absolute";
      that.setImgProperties(img, url);
      that.setImgStyle(img, i);
      // that.getMinMearuresOfGallery(img);
      that.imgsContainer.appendChild(img);
      that.imgs.push(img);
    });
  }

  appendCaption(caption) {
    let captionContainer = document.createElement("div");
    captionContainer.classList.add("caption_container");
    let galleryCaption = document.createElement("p");
    galleryCaption.classList.add("caption");
    galleryCaption.innerText = caption;

    captionContainer.appendChild(galleryCaption);
    this.galleryContainer.appendChild(captionContainer);
  }

  appendImagesContainer() {
    this.imgsContainer = document.createElement("div");
    this.imgsContainer.classList.add("images_container");
    this.imgsContainer.style.cssText = `
      overflow: hidden;
      position: relative;
      `;
    this.galleryContainer.appendChild(this.imgsContainer);
  }

  calculateVisiblePicClick(mouseMoveEvent) {
    return mouseMoveEvent.clientX / this.galleryContainer.offsetWidth > 0.5
      ? 1
      : -1;
  }

  calculateVisiblePicMousemove(mouseMoveEvent) {
    let rect = mouseMoveEvent.target.getBoundingClientRect();
    return Math.abs(
      Math.floor(
        this.imgs.length *
          ((mouseMoveEvent.clientX - rect.left) /
            this.galleryContainer.offsetWidth)
      )
    );
  }

  centerImage(img) {
    let rectangle = img.getBoundingClientRect();
    let x = this.galleryContainerCX - rectangle.width * 0.5;
    let y = this.galleryContainerCY - rectangle.height * 0.5;
    this.img.style.cssText = `
      left: ${x}px;
      position: absolute; 
      top: ${y}px;
      `;
  }

  getMinMearuresOfGallery(img) {
    if (img.naturalHeight < this.minHeightGalleryContainer) {
      this.minHeightGalleryContainer = img.naturalHeight;
    }
    if (img.naturalWidth < this.minWidthGalleryContainer) {
      this.minWidthGalleryContainer = img.naturalWidth;
    }
  }

  async preloadImages() {
    for (let img of this.imgs) {
      const image = new Image();
      const preload = (src) =>
        new Promise((r) => {
          image.onload = r;
          image.onerror = r;
          image.src = src;
        });

      // Preload an image
      await preload(img.src);
      this.getMinMearuresOfGallery(image);
    }
  }

  setGalleryContainerStyle() {
    this.galleryContainer.innerHTML = "";
    this.galleryContainer.style.cssText = `
      display: flex; 
      flex-direction: column;
      overflow: hidden;
      userSelect: none;
    `;
  }

  setGalleryHeightAndWidth() {
    function getSize(measure) {
      return measure.slice(0, measure.length - getSuffix(measure).length);
    }

    function getSuffix(measure) {
      if (measure.slice(measure.length - 1) == "%") {
        return "%";
      }
      return "px";
    }

    function setHeightWidthImgAndGalleryContainers(mh, mw) {
      that.galleryContainer.style.height = mh;
      that.imgsContainer.style.minHeight = mh;
      that.galleryContainer.style.width = mw;
      that.imgsContainer.style.maxWidth = mw;
    }

    var that = this;

    if (!this.style.height && !this.style.width) {
      let mh = `${this.minHeightGalleryContainer}px`;
      let mw = `${this.minWidthGalleryContainer}px`;
      setHeightWidthImgAndGalleryContainers(mh, mw);

      return;
    }

    let ratio = this.minHeightGalleryContainer / this.minWidthGalleryContainer;

    let [heightCalculated, heightSuffix] = this.style.height
      ? [getSize(this.style.height), getSuffix(this.style.height)]
      : [
          Math.floor(getSize(this.style.width) * ratio),
          getSuffix(this.style.width),
        ];

    let mh = heightCalculated + heightSuffix;

    let [widthCalculated, widthSuffix] = this.style.width
      ? [getSize(this.style.width), getSuffix(this.style.width)]
      : [
          Math.floor(getSize(this.style.height) / ratio),
          getSuffix(this.style.height),
        ];

    let mw = widthCalculated + widthSuffix;
    setHeightWidthImgAndGalleryContainers(mh, mw);

    // adjust imgage height
    this.imgs.forEach((i) => {
      i.setAttribute("height", heightCalculated);
      i.setAttribute("width", widthCalculated);
    });
  }

  setImgProperties(img, url) {
    img.setAttribute("src", `${url}`);
    img.setAttribute("draggable", "false");
  }

  setImgStyle(img, i) {
    // at the init, only the firs photo is visible
    img.style.cssText = `
      background-color: transparent;
      display: block;
      height: auto;
      pointer-events: none;
      position: absolute;
      user-select: none;
      width: 100%;
    `;

    // center image if needed
    if (this.style.imgCentered) {
      this.centerImage(img);
    }
    if (i != 0) {
      img.style.display = "none";
    }
  }

  showVisibleImage() {
    if (this.visibleImageIndex >= this.imgs.length) {
      this.visibleImageIndex = 0;
    } else if (this.visibleImageIndex < 0) {
      this.visibleImageIndex = this.imgs.length - 1;
    }

    this.imgs.forEach((img, i) => {
      let display = i == this.visibleImageIndex ? "block" : "none";
      img.style.display = display;
    });
  }

  showNextImageClick(event) {
    const shift = this.calculateVisiblePicClick(event);
    this.visibleImageIndex += shift;

    this.showVisibleImage();
  }

  showNextImageMousemove(event) {
    this.visibleImageIndex = this.calculateVisiblePicMousemove(event);
    this.showVisibleImage();
  }

  showNextImageTimer() {
    this.visibleImageIndex++;
    this.showVisibleImage();
  }

  async init() {
    await this.preloadImages();
    this.setGalleryHeightAndWidth();

    if (this.changeEvent == "mousemove") {
      this.galleryContainer.addEventListener(this.changeEvent, (e) =>
        this.showNextImageMousemove(e)
      );
    }
    if (this.changeEvent == "click") {
      this.galleryContainer.addEventListener(this.changeEvent, (e) =>
        this.showNextImageClick(e)
      );
    }
    if (this.changeEvent == "timer") {
      setInterval(this.showNextImageTimer.bind(this), this.timer);
    }
  }
}
