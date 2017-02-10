from flask import Flask, request
from flask_restful import Resource, Api
from skimage.filters import threshold_adaptive
import numpy as np
import requests, cv2, os

app = Flask(__name__)
api = Api(app)

class AdaptiveThresholding(Resource):
    def post(self):
        data = request.get_json() # url, [offset]
        img_name = data['url'].split('/')[-1][:10] + '.png'
        filter_offset = data.get('offset', None)
        filter_offset = int(filter_offset) if filter_offset else 30
        response = requests.get(data['url'])
        img = np.asarray(bytearray(response.content))
        img = cv2.imdecode(img, cv2.IMREAD_COLOR)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img = threshold_adaptive(img, 251, offset=filter_offset)
        img = img.astype("uint8") * 255
        cv2.imwrite(img_name, img)
        return {'url': os.getcwd() + '\\' + img_name}

api.add_resource(AdaptiveThresholding, '/')
app.run(port=5000, debug=True)
