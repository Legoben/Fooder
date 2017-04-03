from flask import Flask, render_template, redirect, request, url_for, jsonify
import requests
import json
import os
import sys


def set_yelp_token():
    data = {"grant_type": "client_credentials", "client_id": app.config['yelp_id'],
            "client_secret": app.config['yelp_secret']}

    resp = requests.post("https://api.yelp.com/oauth2/token", data=data)
    app.config['yelp_token'] = resp.json()["access_token"]


app = Flask(__name__)
debug = False

if (os.path.isfile("config.json")):
    conf = json.loads(open("config.json").read())
    for key in conf:
        app.config[key] = conf[key]
    debug = True
else:
    req = ["yelp_id", "yelp_secret", "maps_key"]
    for key in req:
        val = os.environ.get(key, None)
        if val == None:
            sys.exit("Missing config: " + key)
        app.config[key] = val

if 'yelp_token' not in app.config:
    set_yelp_token()


@app.route('/')
def home_page():
    return render_template("index.html")


def get_locs(params):
    headers = {"Authorization": "Bearer " + app.config['yelp_token']}
    resp = requests.get("https://api.yelp.com/v3/businesses/search", headers=headers, params=params)
    data = resp.json()
    offset = 1

    while offset * 50 < 150 and offset * 50 < data['total']:  # can fetch 1000 max
        params['offset'] = offset * 50
        resp = requests.get("https://api.yelp.com/v3/businesses/search", headers=headers, params=params)
        offset += 1
        data['businesses'].extend(resp.json()['businesses'])

    return data


@app.route("/swipe", methods=("GET", "POST"))
def swipe_page():
    if request.method != 'POST':
        return redirect(url_for("home_page"))

    params = {
        "term": "food",
        "limit": 50,
        "open_now": True
    }

    if "zip" in request.form:
        params['location'] = request.form['zip']
    elif "lat" in request.form and "lon" in request.form:
        params['latitude'] = request.form['lat']
        params['longitude'] = request.form['lon']
    else:
        return redirect(url_for("home_page"))

    locs = get_locs(params)
    return render_template("swipe.html", json=json.dumps(locs), maps_key=app.config['maps_key'])


@app.route("/getreviews/<review_id>", methods=("GET", "POST"))
def get_review(review_id):
    headers = {"Authorization": "Bearer " + app.config['yelp_token']}
    resp = requests.get("https://api.yelp.com/v3/businesses/" + review_id + "/reviews", headers=headers)
    return jsonify(resp.json())


if __name__ == '__main__':
    print("starting app")
    app.run(port=os.environ.get("PORT", 5050), debug=debug)
