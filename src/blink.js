"use strict";

// export default class Blink {
class Blink {
  /* pass to the constructor the following parameters:
     REQUESTED PARAMETERS:
        containerId - id (!) of a div element in DOM that will contain the gallery. String, requested
        imgUrls - array of URLs to the images to publish in the gallery. Array of strings, requested
     OPTIONAL PARAMETERS:
        caption - a single row of text, placed under the gallery. String
        style.cursorUrl - url to the custom cursor image, which will appear on hover of the gallery. String
        style.imgCentered - if true, the images will be centered. Boolean, default: false
        style.height - height 
        style.width
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
      that.setImgProperties(img, url);
      that.setImgStyle(img, i);
      that.getMinMearuresOfGallery(img);
      that.imgsContainer.appendChild(img);
      that.imgs.push(img);
    });

    this.setGalleryHeightAndWidth();
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
      display: block; 
      overflow:hidden; 
      position: relative; 
      height: 100%;
      width:100%;
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
    if (this.style.height) {
      this.galleryContainer.style.height = this.style.height;
    } else {
      this.galleryContainer.style.height =
        this.minHeightGalleryContainer + "px";
    }

    if (this.style.width) {
      this.galleryContainer.style.width = this.style.width;
    } else {
      this.galleryContainer.style.width = this.minWidthGalleryContainer + "px";
    }
  }

  setImgProperties(img, url) {
    img.classList.add("img");
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

  init() {
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
