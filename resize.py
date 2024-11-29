from PIL import Image
img = Image.open('./public/sunflowers_puresky.jpg')
img=img.resize((1024,512))
img.save('./public/sky_1K.jpg')