import re
import json
from difflib import SequenceMatcher

PROBLEM_CHARS = r'[\[=\+/&<>;:!\\|*^\'"\?%$@)(_\,\.\t\r\n0-9-—\]]'


class LocationParser:
    Cities = None
    Cities_Details = None

    @staticmethod
    def load_locations(cities_json):
        if LocationParser.Cities is None:
            with open(cities_json, 'r', encoding='utf-8') as cities_file:
                LocationParser.Cities = json.loads(cities_file.read())

    @staticmethod
    def load_locations_details(cities_json):
        if LocationParser.Cities_Details is None:
            with open(cities_json, 'r', encoding='utf-8') as cities_file:
                LocationParser.Cities_Details = json.loads(cities_file.read())

    @staticmethod
    def get_words(text):
        """
        returns a list of words
        """
        text = re.sub(PROBLEM_CHARS, '', text)
        return map(lambda s: s.strip(), text.split(' '))

    @staticmethod
    def check_and_get_location(word, similarity_ratio=0.8):
        """
        returns the exact locations name or possible location name if there was a match, else returns None

        Note:
        ----
        This ratio value helps getting the real locations and some predicted ones if the 2 keys are available
        Real Locations have ratio >= 0.8
        Ratio of 0.6 gets us some predicted locations:
        example:
            --> word = saw
            --> k1 = s, k2 = a
            --> Cities['s']['a'] = [..., 'Sawfar']
            --> SequenceMatcher(None, 'saw', 'Sawfar').ratio() >= 0.6
            --> predicted location = 'Sawfar'
        """
        if len(word) < 2 or LocationParser.Cities is None:
            return None

        word = word.lower()
        k1 = word[0]
        k2 = word[1]
        possible_city = None
        if k1 in LocationParser.Cities and k2 in LocationParser.Cities[k1]:
            city_list = LocationParser.Cities[k1][k2]
            for city in city_list:
                city_lowercase = city.lower()
                if word == city_lowercase:
                    return city
                if SequenceMatcher(None, word, city_lowercase).ratio() >= similarity_ratio:
                    possible_city = city
        return possible_city

    @staticmethod
    def get_locations(text, similarity_ratio=0.8):
        """
        returns a sorted list of locations in the provided text with the their frequencies
        """
        if LocationParser.Cities is None:
            return []

        words = LocationParser.get_words(text)
        locations = {}
        for word in words:
            location = LocationParser.check_and_get_location(word, similarity_ratio)
            if location:
                if word not in locations:
                    locations[location] = 0
                locations[location] += 1
        return sorted(locations.items(), key=lambda l: l[1], reverse=True)

    @staticmethod
    def get_location_aliases(location):
        location_data = LocationParser.Cities_Details[location]
        res = []
        if location_data['latin']:
            res += location_data['latin']
        if location_data['non-latin']:
            res += location_data['non-latin']
        return list({r for r in res})
