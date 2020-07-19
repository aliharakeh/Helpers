import re
import json
from difflib import SequenceMatcher

PROBLEM_CHARS = r'[\[=\+/&<>;:!\\|*^\'"\?%$@)(_\,\.\t\r\n0-9-—\]]'
ARABIC_REGEX = '[\u0621-\u064A]+'

"""
TODO:
-----
    - fix Cities Data to have the cities lists sorted
    - update this code and use binary search when searching
    - add a decorator for if Cities or Cities_Details are None (optional)
"""


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
    def get_words(text, max_words_in_an_element=5):
        """
        returns a list of words cleaned from any problem char. \n
        PROBLEM_CHARS = '[\[=\+/&<>;:!\\|*^\'"\?%$@)(_\,\.\t\r\n0-9-—\]]'
        """
        text = re.sub(PROBLEM_CHARS, '', text)
        words = text.split()
        word_count = len(words)

        result = []
        for i in range(word_count):
            for j in range(max_words_in_an_element):
                if i + j < word_count:
                    result.append(" ".join(words[i: i + j + 1]))

        return result

    @staticmethod
    def get_possible_locations(first_letter, second_letter):
        """
        returns a list of locations that match any of the following conditions: \n
        - locations that starts with first_letter & second_letter
        - locations that starts with first_letter but not with second_letter
        - [] if nothing starts with the first letter
        """
        if first_letter in LocationParser.Cities:
            level_1_data = LocationParser.Cities[first_letter]

            # locations that starts with first_letter & second_letter
            if second_letter and second_letter in level_1_data:
                return level_1_data[second_letter]

            # locations that starts with first_letter but not with second_letter
            else:
                res = []
                for locations in level_1_data.values():
                    res += locations
                return res

        # nothing starts with the first letter
        else:
            return []

    @staticmethod
    def get_location(word, similarity_ratio=0.8):
        """
        returns the exact location name or the best predicted/possible location name if there was any match,
        else returns None
        """
        if len(word) < 2 or LocationParser.Cities is None:
            return None

        # initialize
        word = word.lower()
        best_predicted_location = (None, None)

        # check possible locations
        locations = LocationParser.get_possible_locations(word[0], word[1])
        for location in locations:
            location_lower = location.lower()

            # check exact location name
            if word == location_lower:
                return location

            # check similarity ratio
            local_similarity_ratio = SequenceMatcher(None, word, location_lower).ratio()
            same_word_count = word.count(' ') == location.count(' ')

            if same_word_count and local_similarity_ratio >= similarity_ratio:
                if not best_predicted_location[0] or local_similarity_ratio > best_predicted_location[1]:
                    best_predicted_location = (location, local_similarity_ratio)

        return best_predicted_location[0]

    @staticmethod
    def get_locations(text, similarity_ratio=0.8):
        """
        returns a descending sorted list of location tuples containing the location name and its frequency
        found in the provided text
        """
        if LocationParser.Cities is None:
            return []

        # get words list
        words = LocationParser.get_words(text)
        locations = {}

        # check if any word refers to a location
        for word in words:
            location = LocationParser.get_location(word, similarity_ratio)

            # add the location to the possible locations if it matches any location data
            if location:
                if location not in locations:
                    locations[location] = 0
                locations[location] += 1

        # return a descending sorted list of tuples containing the location name and it's frequency
        return sorted(locations.items(), key=lambda l: l[1], reverse=True)

    @staticmethod
    def get_location_details(location):
        # get location data
        location_data = LocationParser.Cities_Details.get(location, {})

        # if location is not found, check if it refers to a location and get its data
        if not location_data:
            location = LocationParser.get_location(location)
            return LocationParser.Cities_Details.get(location, {})

        return location_data

    @staticmethod
    def get_location_aliases(location):
        """
        returns the other aliases of a location
        """
        location_data = LocationParser.get_location_details(location)

        # combine the aliases
        res = []
        latin = location_data.get('latin', [])
        non_latin = location_data.get('non-latin', [])
        if latin:
            res += latin
        if non_latin:
            res += non_latin

        # return unique aliases
        return list({r for r in res})

    @staticmethod
    def get_arabic_alias(location):
        aliases = LocationParser.get_location_aliases(location)
        for alias in aliases:
            if re.search(ARABIC_REGEX, alias):
                return alias


if __name__ == '__main__':
    # from twitter_config import CITIES_JSON, CITIES_DETAILS_JSON
    #
    # LocationParser.load_locations(CITIES_JSON)
    # LocationParser.load_locations_details(CITIES_DETAILS_JSON)
    #
    l = LocationParser.get_locations('Hello, I\'m from baabda where Aakkar el Aatiqa live in beirut and beirut')
    for x, f in l:
        print(LocationParser.get_arabic_alias(x))
