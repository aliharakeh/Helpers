import re
import json
from fuzzywuzzy import fuzz
import jellyfish
import functools
from difflib import SequenceMatcher
import os

PROBLEM_CHARS = r'[\[=\+/&<>;:!\\|*^\'"\?%$@)(_\,\.\t\r\n0-9-—\]]'
ARABIC_REGEX = '[\u0621-\u064A]+'
EN_ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz123456789 \t\n'
LOCAL_DIR = os.path.dirname(__file__)
CITIES_FILE = 'cities.json'
CITIES_DETAILS_FILE = 'cities_details.json'


# decorator to load details data when needed only
def load_details(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            if not LocationFinder.Cities_Details:
                LocationFinder.load_locations_details()

            return func(*args, **kwargs)

        except FileNotFoundError:
            print('[Error]: Data File(s) Not Found!! Please Load Data Manually')

    return wrapper


class Methods:
    SEQUENCE = 'sequence'
    EDIT_DISTANCE = 'edit-distance'
    SOUND = 'sound'


class PredictionMethods:

    def __init__(self, a=None, b=None, method=Methods.EDIT_DISTANCE, accepted_ratio=80):
        self.a = a
        self.b = b
        self.accepted_ratio = accepted_ratio

        self.methods = {
            Methods.SOUND: self.by_sound,
            Methods.EDIT_DISTANCE: self.by_edit_distance,
            Methods.SEQUENCE: self.by_sequence
        }
        self.method = self.methods[method]

    def by_sound(self):
        a = jellyfish.soundex(self.a)
        b = jellyfish.soundex(self.b)
        similarity_ratio = fuzz.ratio(self.a, self.b)

        accepted_prediction = (a == b) and (similarity_ratio >= self.accepted_ratio)
        return similarity_ratio, accepted_prediction

    def by_edit_distance(self):
        partial_ratio = fuzz.partial_ratio(self.a, self.b)
        ratio = fuzz.ratio(self.a, self.b)
        similarity_ratio = (partial_ratio + ratio) / 2

        accepted_prediction = similarity_ratio >= self.accepted_ratio
        return similarity_ratio, accepted_prediction

    def by_sequence(self):
        similarity_ratio = SequenceMatcher(None, self.a, self.b).ratio() * 100
        count_a, count_b = self.a.count(' '), self.b.count(' ')
        count_ratio = (min(count_a, count_b) / max(count_a, count_b)) * 100

        accepted_prediction = count_ratio and (similarity_ratio >= self.accepted_ratio)
        return similarity_ratio, accepted_prediction

    def get_ratio(self):
        return self.method()


class LocationFinder:
    Cities = None
    Cities_Details = None

    def __init__(self):
        self.load_locations()

    @classmethod
    def load_locations(cls, cities_json=f'{LOCAL_DIR}\\{CITIES_FILE}'):
        if cls.Cities is None:
            with open(cities_json, 'r', encoding='utf-8') as cities_file:
                cls.Cities = json.loads(cities_file.read())

    @classmethod
    def load_locations_details(cls, cities_json=f'{LOCAL_DIR}\\{CITIES_DETAILS_FILE}'):
        if cls.Cities_Details is None:
            with open(cities_json, 'r', encoding='utf-8') as cities_file:
                cls.Cities_Details = json.loads(cities_file.read())

    @staticmethod
    def __is_english(word):
        for char in word:
            if char not in EN_ALPHANUMERIC:
                return False
        return True

    def __separate_languages(self, text):
        """
        cleans the text from any problem chars and return 2 lists each representing arabic and english words respectively. \n
        PROBLEM_CHARS = '[\[=\+/&<>;:!\\|*^\'"\?%$@)(_\,\.\t\r\n0-9-—\]]'
        """
        text = re.sub(PROBLEM_CHARS, '', text)
        words = text.split()
        en = []
        others = []
        for word in words:
            if self.__is_english(word):
                en.append(word)
            else:
                others.append(word)
        return en, others

    @classmethod
    def __get_location_details(cls, location):
        return cls.Cities_Details.get(location, None)

    @classmethod
    def get_locations(cls, lang=None):
        """
        return a list of locations.\n
        can be:
        - lang = None --> all locations
        - lang = 'en' --> locations in english
        - lang = 'ar' --> locations in arabic
        """
        res = []
        for k, v in cls.Cities.items():
            # exclude non english when lang == 'en'
            if (lang == 'en') and (k not in EN_ALPHANUMERIC):
                continue

            # exclude english when lang == 'ar'
            if (lang == 'ar') and (k in EN_ALPHANUMERIC):
                continue

            for k1, v1 in v.items():
                res += v1
        return res

    def search(self, keyword, lang=None, method=Methods.EDIT_DISTANCE, accepted_ratio=80):
        """
        returns a matched location `(location, match ratio)` if a match was found OR `(None, -1)` if nothing was found.\n
        Note: match ratio ranges from 0 to 100, where 100 is an exact match.
        """
        if len(keyword) <= 2:
            return None, -1

        # initialize
        keyword = keyword.lower()
        best_predicted = (None, -1)  # (location, similarity_ratio)
        prediction_method = PredictionMethods(a=keyword, method=method, accepted_ratio=accepted_ratio)

        # check possible locations
        locations = self.get_locations(lang=lang)
        for location in locations:
            # check exact location name
            if location == keyword:
                return location, 100

            prediction_method.b = location
            similarity_ratio, accepted_prediction = prediction_method.get_ratio()

            # conditions
            first_prediction = best_predicted[1] == -1
            better_prediction = similarity_ratio > best_predicted[1]

            # update prediction
            if accepted_prediction and (first_prediction or better_prediction):
                best_predicted = (location, similarity_ratio)

        return best_predicted

    def search_words(self, words, lang=None, method=Methods.EDIT_DISTANCE, accepted_ratio=80):
        """
        returns a list of matched locations `(location, match ratio)` for every word in the list provided. \n
        Note: match ratio ranges from 0 to 100, where 100 is an exact match.
        """
        locations = []
        for word in words:
            location = self.search(word, lang, method, accepted_ratio)
            if location[0]:
                locations.append(location)
        return locations

    def search_text(self, text, method=Methods.EDIT_DISTANCE, accepted_ratio=80):
        """
        returns a descending sorted list of matched locations `(location, match ratio)` that were found in the text. \n
        Use method={'en': Methods.SOUND, 'ar': Methods.EDIT_DISTANCE} for more different langs. \n
        Note: match ratio ranges from 0 to 100, where 100 is an exact match.
        """
        # get words list
        en, ar = self.__separate_languages(text)
        en_locations, ar_locations = [], []

        # methods
        if isinstance(method, dict):
            method_en = method['en']
            method_ar = method['ar']
        else:
            method_en = method_ar = method

        # predict locations
        if en:
            en_locations = self.search_words(en, 'en', method_en, accepted_ratio)

        if ar:
            ar_locations = self.search_words(ar, 'ar', method_ar, accepted_ratio)

        # combine results
        locations = [
            *en_locations,
            *ar_locations
        ]

        # return a descending sorted list of tuples containing the location name and it's frequency
        return sorted(locations, key=lambda l: l[1], reverse=True)

    @load_details
    def get_location_details(self, location, predict=False):
        """
        returns a location details
        Note: It predicts the location if no exact match was found.
        """
        # get location data
        location = location.lower()
        location_data = self.__get_location_details(location)

        # if location is not found, check if it refers to a location and get its data
        if not location_data and predict:
            lang, method = ('en', Methods.SOUND) if self.__is_english(location) else ('ar', Methods.EDIT_DISTANCE)
            location = self.search(location, lang=lang, method=method)
            return self.__get_location_details(location)

        return location_data

    @load_details
    def get_location_aliases(self, location, predict=False):
        """
        returns the other aliases of a location
        Note: It predicts the location if no exact match was found.
        """
        location_data = self.get_location_details(location, predict)
        if not location_data:
            return []

        # combine the aliases
        res = []
        latin = location_data.get('latin', None)
        non_latin = location_data.get('non-latin', None)
        if latin:
            res += latin
        if non_latin:
            res += non_latin

        # return unique aliases
        return list(set(res))

    @load_details
    def get_arabic_alias(self, location, predict=False):
        """
        returns the arabic aliases of a location.  \n
        Note: It predicts the location if no exact match was found.
        """
        aliases = self.get_location_aliases(location, predict)
        for alias in aliases:
            if re.search(ARABIC_REGEX, alias):
                return alias
        return None


if __name__ == '__main__':
    lf = LocationFinder()

    # print(len(lf.get_locations_list()))
    # print(len(lf.get_locations_list(lang='en')))
    # print(len(lf.get_locations_list(lang='ar')))

    # location = lf.search('beyrout', lang='en', method=Methods.SOUND)
    # print(location)
    # location = lf.search('البيروت', lang='ar')
    # print(location)

    # print(jellyfish.soundex('akka'))
    # print(jellyfish.soundex('akkar'))
    # print(fuzz.partial_ratio('aandkit', 'and'))
    # print(fuzz.ratio('aandkit', 'and'))
    # print(fuzz.partial_ratio('where', 'hereh'))
    # print(fuzz.ratio('where', 'hereh'))
    # print(fuzz.partial_ratio('akka', 'akkar'))
    # print(fuzz.ratio('akka', 'akkar'))

    # text = 'Hello, I\'m from baabda where Akka live in beirut and beyrut. من بيروت سلام للشويفات'
    # locations = lf.search_text(text, method={'en': Methods.SOUND, 'ar': Methods.EDIT_DISTANCE})
    # for l in locations:
    #     print(l)

    """
    Edit-Distance Results:
    ----------------------
    ('baabda', 100)
    ('beirut', 100)
    ('بيروت', 100)
    ('akkar', 94.5)
    ('beyrouth', 84.5)
    ('وطى سلام', 83.5)
    ('hereh', 80.0)
    ('aandkit', 80.0)
    
    Sound Results:
    --------------
    ('baabda', 100)
    ('beirut', 100)
    ('بيروت', 100)
    ('beyrouth', 86)
    ('سلم', 86)
    
    Mix: EN-Sound and AR-Edit-Distance:
    -----------------------------------
    ('baabda', 100)
    ('beirut', 100)
    ('بيروت', 100)
    ('akkar', 94.5)
    ('beyrouth', 86)
    ('وطى سلام', 83.5)
    """

    partial_ratio = fuzz.partial_ratio("تل أخضر", "تل الأخضر")
    ratio = fuzz.ratio("تل أخضر", "تل الأخضر")
    print(partial_ratio)
    print(ratio)
    m = PredictionMethods("تل أخضر", "تل الأخضر")
    print(m.get_ratio())
