"use strict";

export default class Blink {
  /* pass to the constructor the following parameters:
     REQUESTED PARAMETERS:
        containerId - id (!) of a div element in DOM that will contain the gallery. String, requested
        imgUrls - array of URLs to the images to publish in the gallery. Array of strings, requested
     OPTIONAL PARAMETERS:
        caption - a single row of text, placed under the gallery. String
        style.cursorUrl - url to the custom cursor image, which will appear on hover of the gallery. String
        imgCentered - if true, the images will be centered. Boolean, default: false
        href - a link ref, opens on click on the gallery. String
    */
  constructor({
    containerId = "",
    imgUrls = [],
    caption = "",
    href = "",
    style = {
      cursorUrl: "",
      imgCentered: false,
      height: "",
      width: "",
    },
  }) {
    debugger;
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

    // pointer to the instance of the gallery
    let that = this;
    // get gallery container
    this.galleryContainer = null;

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

    this.style = style;
    this.setGalleryContainerStyle();

    let rectangle = this.galleryContainer.getBoundingClientRect();
    this.galleryContainerCX = rectangle.left + rectangle.width * 0.5;
    this.galleryContainerCY = rectangle.top + rectangle.height * 0.5;

    // set the coursor
    if (this.style.cursorUrl) {
      that.galleryContainer.style.cursor = `url("${this.style.cursorUrl}"), auto`;
    }

    this.appendImagesContainer();

    if (caption) {
      this.appendCaption(caption);
    }

    // internalize parameter and future photos to the object
    this.urls = imgUrls;
    this.imgs = [];

    this.urls.forEach((url, i) => {
      let img = document.createElement("img");
      that.setImgProperties(img, url);
      that.setImgStyle(img, i);
      that.imgsContainer.appendChild(img);
      that.imgs.push(img);
    });

    if (href) {
      that.galleryContainer.setAttribute("onclick", `location.href='${href}'`);
    }
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

  calculateVisiblePic(mouseMoveEvent) {
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
    img.style.cssText = `
      left: ${x}px;
      position: absolute; 
      top: ${y}px;
      `;
  }

  setGalleryContainerStyle() {
    this.galleryContainer.innerHTML = "";
    this.galleryContainer.style.cssText = `
      display: flex; 
      flex-direction: column;
      overflow: hidden;
      userSelect: none;
      `;

    debugger;
    if (this.style.height) {
      this.galleryContainer.style.height = this.style.height + "px";
    } else {
      this.galleryContainer.style.height = "auto";
    }

    if (this.style.width) {
      this.galleryContainer.style.width = this.style.width + "px";
    } else {
      this.galleryContainer.style.width = "auto";
    }
  }

  setImgProperties(img, url) {
    img.classList.add("img");
    img.setAttribute("src", `${url}`);
    img.setAttribute("draggable", "false");
  }

  setImgStyle(img, i) {
    // at the init, only the firs photo is visible
    let display = i == 0 ? "block" : "none";
    img.style.cssText = `
      background-color: transparent;
      display: ${display};
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
  }

  showImageOnMousemove(event) {
    const visible = this.calculateVisiblePic(event);
    this.imgs.forEach((img, i) => {
      let display = i == visible ? "block" : "none";
      img.style.display = display;
    });
  }

  init() {
    this.galleryContainer.addEventListener("mousemove", (e) =>
      this.showImageOnMousemove(e)
    );
  }
}
