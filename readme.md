## Fooder

My idea was to use the Yelp API to create Fooder - Tinder for finding the best places to eat. Fooder allows users to narrow their search by selecting which elements of a restaurant that they dislike. They can also select a restaurant and either navigate to it using Google maps, or save it for later and keep swiping. I often find that when I’m not really in the mood for something in particular, it really helps when someone suggests certain restaurants to me, and I can narrow them down from there. Fooder aims to fill that role.

#### Setup instructions:
1. Fooder was created for and tested with Python3
2. Install Flask, Gunicorn, and Requests with `pip3 install -r requirements.txt`
3. Add config
    i. If dev environment, create a file called config.json, in it fill in `yelp_id`, `yelp_secret`, and `maps_key` to values gotten from the Yelp Fusion API and Google Maps API, respectively.
    ii. For production, the above variables can be set as environment variables (along with `PORT`)
4. Run the server using `python3 app.py`, or in production using `gunicorn app:app`.

#### Some technologies used 
- Yelp Fusion API
- Google Maps Iframe API
- Flask
- Vue.js
- jQuery
- Bootsrap
- SweetAlert


Web URL: http://fooder.helloben.co/
(Some browsers require SSL for geolocation: https://yelp-fooder.herokuapp.com/)

GitHub URL: https://github.com/Legoben/Fooder
