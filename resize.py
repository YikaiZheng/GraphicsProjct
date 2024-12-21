from PIL import Image
img = Image.open('./public/manual.png')
img=img.resize((800,450))
img.save('./public/manual.png')