from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse

from fastapi.middleware.cors import CORSMiddleware

from PIL import Image

import io


app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def home():

    return {
        "status":"running"
    }




@app.post("/convert")
async def convert(
    image: UploadFile = File(...),
    format: str = Form("jpg")
):


    print(
        "FILE:",
        image.filename
    )


    print(
        "FORMAT:",
        format
    )



    data = await image.read()



    img = Image.open(
        io.BytesIO(data)
    )



    print(
        "ORIGINAL:",
        img.format
    )



    format = format.lower()



    output = io.BytesIO()



    if format in ["jpg","jpeg"]:

        img = img.convert("RGB")

        img.save(
            output,
            "JPEG",
            quality=95
        )


        media="image/jpeg"



    elif format=="png":


        img.save(
            output,
            "PNG"
        )


        media="image/png"



    elif format=="webp":


        img.save(
            output,
            "WEBP",
            quality=95
        )


        media="image/webp"



    elif format=="gif":


        img.save(
            output,
            "GIF"
        )


        media="image/gif"



    else:


        return {
            "error":
            "Unsupported format"
        }



    output.seek(0)



    return StreamingResponse(
        output,
        media_type=media
    )