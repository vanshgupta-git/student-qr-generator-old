/* =========================================================
   INTERN ID CARD GENERATOR
   Gift a Smile Foundation
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   =========================================================
   
   CHANGE THESE VALUES WHEN YOU WANT TO ADJUST THE DESIGN.

   All coordinates are based on the original template image.

   Your uploaded template:
   591 x 1004 pixels
   ========================================================= */

const CONFIG = {

    /* -----------------------------------------------------
       TEMPLATE
       ----------------------------------------------------- */

    templateSrc: "./assets/id_front.png",

    /*
     * Put the image you want on PDF page 2 here.
     *
     * Example:
     *
     * secondPageSrc: "./assets/back-side.png"
     *
     * OR:
     *
     * secondPageSrc: "https://example.com/image.png"
     */

    secondPageSrc: "./assets/id_back.png",


    /* -----------------------------------------------------
       CANVAS
       ----------------------------------------------------- */

    canvas: {
        width: 591,
        height: 1004
    },


    /* -----------------------------------------------------
       PHOTO
       -----------------------------------------------------

       The photo will be cropped into a circle.

       x/y = top-left position of photo box
       width/height = size of photo
       ----------------------------------------------------- */

    photo: {
        x: 150,
        y: 168,
        width: 291,
        height: 291
    },


    /* -----------------------------------------------------
       NAME
       -----------------------------------------------------

       Name will be:

       - uppercase
       - bold
       - centered
       - placed between photo and
         "SOCIAL IMPACT INTERN"
       ----------------------------------------------------- */

    name: {

        x: 295,

        /*
         * Baseline position.
         * Increase = move downward.
         * Decrease = move upward.
         */

        y: 535,

        fontSize: 40,

        fontFamily: "Arial",

        color: "#000000",

        align: "center",

        maxWidth: 500
    },


    /* -----------------------------------------------------
       INTERN ID
       -----------------------------------------------------

       Existing template already contains:

       INTERN ID:

       We only draw:

       NIVA-KIET-MBA-001

       after that text.
       ----------------------------------------------------- */

    internId: {

        x: 218,

        y: 665,

        fontSize: 28,

        fontFamily: "Arial",

        color: "#000000",

        align: "left"
    },


    /* -----------------------------------------------------
       QR CODE
       -----------------------------------------------------

       QR contains ONLY:

       NIVA-KIET-MBA-001
       ----------------------------------------------------- */

    qr: {

        x: 245,

        y: 870,

        width: 105,

        height: 105
    },


    /* -----------------------------------------------------
       INTERN ID FORMAT
       ----------------------------------------------------- */

    id: {

        prefix: "NIVA-KIET-MBA",

        digits: 3
    },


    /* -----------------------------------------------------
       GOOGLE APPS SCRIPT
       -----------------------------------------------------

       Put your deployed Apps Script Web App URL here.

       Example:

       https://script.google.com/macros/s/XXXXX/exec
       ----------------------------------------------------- */

    apiUrl: "https://script.google.com/macros/s/AKfycbxv9nhqUjctYSnol5me13aZnVANPLs3rkDZ7LfIzptiV0gyPu4iHdtruR0SSLsdnLdo/exec"
};


/* =========================================================
   2. GET HTML ELEMENTS
   ========================================================= */

const form =
    document.getElementById("registrationForm");

const imageInput =
    document.getElementById("userImage");

const fileName =
    document.getElementById("fileName");

const preview =
    document.getElementById("preview");

const nameInput =
    document.getElementById("name");

const canvas =
    document.getElementById("idCardCanvas");

const downloadContainer =
    document.getElementById("downloadContainer");

const ctx =
    canvas.getContext("2d");


/* =========================================================
   3. GLOBAL VARIABLES
   ========================================================= */

let selectedPhoto = null;

let generatedInternId = null;


/* =========================================================
   4. PHOTO UPLOAD
   ========================================================= */

imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (!file) {
        selectedPhoto = null;
        preview.style.display = "none";
        fileName.textContent = "No Photo Captured Yet";
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        imageInput.value = "";
        return;
    }

    selectedPhoto = file;
    fileName.textContent = file.name;

    // Use FileReader instead of createObjectURL — avoids
    // stale blob URLs on mobile after camera app switches focus.
    const reader = new FileReader();

    reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
    };

    reader.onerror = function () {
        alert("Unable to read the selected photo. Please try again.");
    };

    reader.readAsDataURL(file);
});


/* =========================================================
   5. FORM SUBMISSION
   ========================================================= */

form.addEventListener("submit", async function (event) {

    event.preventDefault();


    /* ---------------------------------------------
       Get form data
       --------------------------------------------- */

    const name =
        nameInput.value.trim();


    /* ---------------------------------------------
       Basic validation
       --------------------------------------------- */

    if (!name) {

        alert("Please enter the intern name.");

        return;
    }


    if (!selectedPhoto) {

        alert("Please capture/upload the intern photo.");

        return;
    }


    try {

        /* -----------------------------------------
           Disable button while processing
           ----------------------------------------- */

        const submitButton =
            form.querySelector("button[type='submit']");

        submitButton.disabled = true;

        submitButton.textContent =
            "Generating...";


        /* -----------------------------------------
           1. Generate next Intern ID
           ----------------------------------------- */

        generatedInternId =
            await getNextInternId(name);


        console.log(
            "Generated Intern ID:",
            generatedInternId
        );


        /* -----------------------------------------
           2. Generate QR
           ----------------------------------------- */

        const qrImage =
            await generateQRCode(
                generatedInternId
            );


        /* -----------------------------------------
           3. Load template
           ----------------------------------------- */

        const templateImage =
            await loadImage(
                CONFIG.templateSrc
            );


        /* -----------------------------------------
           4. Load intern photo
           ----------------------------------------- */

// preview.src is already a data URL (set via FileReader above),
// so we can reuse it directly instead of creating a new blob URL.
const internPhoto = await loadImage(preview.src);

        /* -----------------------------------------
           5. Draw complete ID card
           ----------------------------------------- */

        drawIDCard({

            templateImage: templateImage,

            internPhoto: internPhoto,

            qrImage: qrImage,

            name: name,

            internId: generatedInternId

        });


        /* -----------------------------------------
           6. Show download button
           ----------------------------------------- */

        showDownloadButton();


    } catch (error) {

        console.error(
            "ID generation error:",
            error
        );

        alert(
            error.message ||
            "Something went wrong while generating the ID."
        );

    } finally {

        const submitButton =
            form.querySelector("button[type='submit']");

        submitButton.disabled = false;

        submitButton.textContent =
            "Generate ID";
    }

});


/* =========================================================
   6. GET NEXT INTERN ID
   =========================================================

   Calls the deployed Google Apps Script Web App to get the
   next sequential Intern ID for the given name.
   ========================================================= */

async function getNextInternId(name) {

    const response =
        await fetch(
            CONFIG.apiUrl,
            {

                method: "POST",

                /*
                 * text/plain prevents the browser from
                 * sending a CORS preflight OPTIONS request.
                 *
                 * This works well with Google Apps Script.
                 */

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body: JSON.stringify({

                    action:
                        "generateInternId",

                    name:
                        name

                })
            }
        );


    if (!response.ok) {

        throw new Error(
            "Unable to connect to the ID server."
        );
    }


    const data =
        await response.json();


    if (!data.success) {

        throw new Error(
            data.message ||
            "Unable to generate Intern ID."
        );
    }


    return data.internId;
}


/* =========================================================
   7. LOAD IMAGE
   ========================================================= */

function loadImage(src) {

    return new Promise(
        function (resolve, reject) {

            const image =
                new Image();


            image.onload =
                function () {

                    resolve(image);

                };


            image.onerror =
                function () {

                    reject(
                        new Error(
                            "Unable to load image:\n" +
                            src
                        )
                    );

                };


            image.src = src;
        }
    );
}


/* =========================================================
   8. GENERATE QR CODE
   ========================================================= */

function generateQRCode(internId) {

    return new Promise(
        function (resolve, reject) {

            /*
             * Make sure QR library exists.
             */

            if (
                typeof QRCode ===
                "undefined"
            ) {

                reject(
                    new Error(
                        "QR Code library not loaded."
                    )
                );

                return;
            }


            /*
             * Create temporary QR container.
             */

            const qrContainer =
                document.createElement("div");


            qrContainer.style.position =
                "absolute";

            qrContainer.style.left =
                "-99999px";

            qrContainer.style.top =
                "-99999px";


            document.body.appendChild(
                qrContainer
            );


            /*
             * Generate QR.
             *
             * IMPORTANT:
             *
             * Only Intern ID is passed.
             */

            new QRCode(
                qrContainer,
                {

                    text: internId,

                    width: 500,

                    height: 500,

                    correctLevel:
                        QRCode.CorrectLevel.H

                }
            );


            /*
             * QRCode.js creates the QR asynchronously.
             */

            setTimeout(
                function () {

                    const qrCanvas =
                        qrContainer.querySelector(
                            "canvas"
                        );


                    if (!qrCanvas) {

                        document.body.removeChild(
                            qrContainer
                        );

                        reject(
                            new Error(
                                "QR generation failed."
                            )
                        );

                        return;
                    }


                    const qrDataUrl =
                        qrCanvas.toDataURL(
                            "image/png"
                        );


                    const qrImage =
                        new Image();


                    qrImage.onload =
                        function () {

                            document.body.removeChild(
                                qrContainer
                            );

                            resolve(qrImage);

                        };


                    qrImage.onerror =
                        function () {

                            document.body.removeChild(
                                qrContainer
                            );

                            reject(
                                new Error(
                                    "Unable to load QR image."
                                )
                            );

                        };


                    qrImage.src =
                        qrDataUrl;

                },
                100
            );

        }
    );
}


/* =========================================================
   9. DRAW COMPLETE ID CARD
   ========================================================= */

function drawIDCard({
    templateImage,
    internPhoto,
    qrImage,
    name,
    internId
}) {

    /* -----------------------------------------------------
       Set exact canvas dimensions
       ----------------------------------------------------- */

    canvas.width =
        CONFIG.canvas.width;

    canvas.height =
        CONFIG.canvas.height;


    /* -----------------------------------------------------
       Clear previous card
       ----------------------------------------------------- */

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* -----------------------------------------------------
       1. DRAW FIXED TEMPLATE
       ----------------------------------------------------- */

    ctx.drawImage(

        templateImage,

        0,
        0,

        CONFIG.canvas.width,
        CONFIG.canvas.height

    );


    /* -----------------------------------------------------
       2. DRAW CIRCULAR PHOTO
       ----------------------------------------------------- */

    drawCircularPhoto(
        internPhoto,
        CONFIG.photo.x,
        CONFIG.photo.y,
        CONFIG.photo.width,
        CONFIG.photo.height
    );


    /* -----------------------------------------------------
       3. DRAW INTERN NAME
       -----------------------------------------------------

       Example:

       Vansh Gupta

       becomes:

       VANSH GUPTA
       ----------------------------------------------------- */

    const formattedName =
        name.toUpperCase();


    drawCenteredText(
        formattedName,

        CONFIG.name.x,

        CONFIG.name.y,

        CONFIG.name.fontSize,

        CONFIG.name.fontFamily,

        CONFIG.name.color,

        CONFIG.name.maxWidth
    );


    /* -----------------------------------------------------
       4. DRAW INTERN ID
       -----------------------------------------------------

       Example:

       NIVA-KIET-MBA-001
       ----------------------------------------------------- */

    drawText(

        internId,

        CONFIG.internId.x,

        CONFIG.internId.y,

        CONFIG.internId.fontSize,

        CONFIG.internId.fontFamily,

        CONFIG.internId.color,

        CONFIG.internId.align

    );


    /* -----------------------------------------------------
       5. DRAW QR
       ----------------------------------------------------- */

    ctx.drawImage(

        qrImage,

        CONFIG.qr.x,

        CONFIG.qr.y,

        CONFIG.qr.width,

        CONFIG.qr.height

    );


    console.log(
        "ID card generated successfully."
    );
}


/* =========================================================
   10. DRAW CIRCULAR PHOTO
   ========================================================= */

function drawCircularPhoto(
    image,
    x,
    y,
    width,
    height
) {

    ctx.save();


    /*
     * Create circular clipping area.
     */

    ctx.beginPath();

    ctx.arc(

        x + width / 2,

        y + height / 2,

        Math.min(width, height) / 2,

        0,

        Math.PI * 2

    );

    ctx.closePath();

    ctx.clip();


    /*
     * Draw image using cover behaviour.
     *
     * This prevents stretching.
     */

    drawCoverImage(

        image,

        x,
        y,
        width,
        height

    );


    ctx.restore();
}


/* =========================================================
   11. DRAW COVER IMAGE
   ========================================================= */

function drawCoverImage(
    image,
    x,
    y,
    width,
    height
) {

    const imageRatio =
        image.width /
        image.height;


    const boxRatio =
        width /
        height;


    let sourceWidth;

    let sourceHeight;

    let sourceX;

    let sourceY;


    /*
     * Image wider than target.
     */

    if (
        imageRatio >
        boxRatio
    ) {

        sourceHeight =
            image.height;

        sourceWidth =
            image.height *
            boxRatio;

        sourceX =
            (image.width -
                sourceWidth) / 2;

        sourceY = 0;

    }

    /*
     * Image taller than target.
     */

    else {

        sourceWidth =
            image.width;

        sourceHeight =
            image.width /
            boxRatio;

        sourceX = 0;

        sourceY =
            (image.height -
                sourceHeight) / 2;
    }


    ctx.drawImage(

        image,

        sourceX,
        sourceY,

        sourceWidth,
        sourceHeight,

        x,
        y,
        width,
        height
    );
}


/* =========================================================
   12. DRAW TEXT
   ========================================================= */

function drawText(
    text,
    x,
    y,
    fontSize,
    fontFamily,
    color,
    align
) {

    ctx.font =
        `${fontSize}px ${fontFamily}`;

    ctx.fillStyle =
        color;

    ctx.textAlign =
        align;

    ctx.textBaseline =
        "alphabetic";


    ctx.fillText(
        text,
        x,
        y
    );
}


/* =========================================================
   13. DRAW CENTERED NAME
   ========================================================= */

function drawCenteredText(
    text,
    x,
    y,
    fontSize,
    fontFamily,
    color,
    maxWidth
) {

    let currentFontSize =
        fontSize;


    /*
     * Reduce font size automatically if
     * a very long name is entered.
     */

    while (
        currentFontSize > 16
    ) {

        ctx.font =
            `bold ${currentFontSize}px ${fontFamily}`;


        const textWidth =
            ctx.measureText(text).width;


        if (
            textWidth <= maxWidth
        ) {

            break;
        }


        currentFontSize--;
    }


    ctx.fillStyle =
        color;

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "alphabetic";


    ctx.fillText(
        text,
        x,
        y
    );
}


/* =========================================================
   14. SHOW DOWNLOAD BUTTON
   ========================================================= */

function showDownloadButton() {

    downloadContainer.innerHTML = "";


    const button =
        document.createElement("button");


    button.textContent =
        "Download ID Card PDF";


    button.type =
        "button";


    button.addEventListener(
        "click",
        downloadPDF
    );


    downloadContainer.appendChild(
        button
    );
}


/* =========================================================
   15. LOAD jsPDF
   ========================================================= */

function loadJsPDF() {

    return new Promise(
        function (resolve, reject) {

            /*
             * If already loaded,
             * don't load again.
             */

            if (
                window.jspdf &&
                window.jspdf.jsPDF
            ) {

                resolve();

                return;
            }


            const script =
                document.createElement("script");


            script.src =
                "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";


            script.onload =
                function () {

                    resolve();

                };


            script.onerror =
                function () {

                    reject(
                        new Error(
                            "Unable to load PDF library."
                        )
                    );

                };


            document.head.appendChild(
                script
            );
        }
    );
}


/* =========================================================
   16. DOWNLOAD PDF
   ========================================================= */

async function downloadPDF() {

    if (!generatedInternId) {

        alert(
            "Please generate an ID card first."
        );

        return;
    }


    try {

        /*
         * Load jsPDF.
         */

        await loadJsPDF();


        const {
            jsPDF
        } = window.jspdf;


        /*
         * -------------------------------------------------
         * PAGE 1
         * -------------------------------------------------
         *
         * Same aspect ratio as ID card.
         *
         * This prevents unnecessary blank space.
         * -------------------------------------------------
         */

        const pageWidth =
            210;


        const pageHeight =
            pageWidth *
            CONFIG.canvas.height /
            CONFIG.canvas.width;


        const pdf =
            new jsPDF({

                orientation:
                    "portrait",

                unit:
                    "mm",

                format: [
                    pageWidth,
                    pageHeight
                ],

                compress:
                    true

            });


        /*
         * Convert generated canvas to image.
         */

        const idCardImage =
            canvas.toDataURL(
                "image/png",
                1.0
            );


        /*
         * Put image exactly from
         * edge to edge.
         */

        pdf.addImage(

            idCardImage,

            "PNG",

            0,
            0,

            pageWidth,
            pageHeight,

            undefined,

            "FAST"

        );


        /* -------------------------------------------------
           PAGE 2
           ------------------------------------------------- */

        const secondImage =
            await loadImage(
                CONFIG.secondPageSrc
            );


        /*
         * Keep second image's
         * original aspect ratio.
         */

        const secondPageRatio =
            secondImage.width /
            secondImage.height;


        const secondPageHeight =
            pageWidth /
            secondPageRatio;


        /*
         * Create page exactly matching
         * the second image.
         */

        pdf.addPage(

            [
                pageWidth,
                secondPageHeight
            ],

            "portrait"

        );


        /*
         * Add second image without margins.
         */

        pdf.addImage(

            secondImage,

            "PNG",

            0,
            0,

            pageWidth,
            secondPageHeight,

            undefined,

            "FAST"

        );


        /* -------------------------------------------------
           SAVE
           ------------------------------------------------- */

        pdf.save(

            `${generatedInternId}-ID-Card.pdf`

        );


    } catch (error) {

        console.error(
            "PDF Error:",
            error
        );


        alert(
            error.message ||
            "Unable to create PDF."
        );
    }
}