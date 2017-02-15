from flask import Flask, request
from flask_restful import Resource, Api
from skimage import io
from skimage.color import rgb2gray
from skimage.filters import threshold_adaptive
import numpy as np
import os

app = Flask(__name__)
api = Api(app)

class AdaptiveThresholding(Resource):
    def post(self):
        data = request.get_json() # url, [offset]
        img_name = data['url'].split('/')[-1][:10] + '.png'
        filter_offset = data.get('offset', None)
        filter_offset = int(filter_offset) if filter_offset else 7
        img = io.imread(data['url'])
        img = rgb2gray(img) * 255
        img = threshold_adaptive(img, 251, offset=filter_offset)
        img = img.astype("uint8") * 255
        io.imsave(img_name, img)
        return {'url': os.getcwd() + '\\' + img_name}

api.add_resource(AdaptiveThresholding, '/')
app.run(port=5000, debug=True)
