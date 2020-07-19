from bs4 import BeautifulSoup
import requests
import json


class SourceType:
    URL = 'url'
    HTML = 'html'
    BS4 = 'bs4'


class BeautifulSoupScrap:
    __source = None
    __source_type = None

    @staticmethod
    def __get_source_type(source):
        if isinstance(source, BeautifulSoup):
            return SourceType.BS4
        if isinstance(source, str):
            if 'http' in source:
                return SourceType.URL
            else:
                return SourceType.HTML
        return None

    @staticmethod
    def set_source(source):
        """
        set the scrapping content source.\n
        a source can be:\n
        - bs4 >>> BeautifulSoup(html, 'html.parser')
        - url >>> 'http://....'
        - html >>> '<html>....</html' or '<any-tag>...</any-tag>' or ...
        """
        BeautifulSoupScrap.__source = source
        BeautifulSoupScrap.__source_type = BeautifulSoupScrap.__get_source_type(source)

    @staticmethod
    def get_bs4(source=None):
        """
        returns a bs4 object or None from a source.\n
        a source can be:\n
        - bs4 >>> BeautifulSoup(html, 'html.parser')
        - url >>> 'http://....'
        - html >>> '<html>....</html' or '<any-tag>...</any-tag>' or ...
        """
        if not source:
            source = BeautifulSoupScrap.__source
            source_type = BeautifulSoupScrap.__source_type
        else:
            source_type = BeautifulSoupScrap.__get_source_type(source)

        if not source_type:
            return None
        if source_type == SourceType.BS4:
            return source
        if source_type == SourceType.URL:
            return BeautifulSoup(requests.get(source).content, 'html.parser')
        if source_type == SourceType.HTML:
            return BeautifulSoup(source, 'html.parser')

    @staticmethod
    def get_attributes(element):
        return {
            **element.attrs,  # all tag attributes, class, id, value, type, data-toggle, ...etc
            'text': element.get_text()
        }

    @staticmethod
    def get_element(css_selector, source=None, attributes=False):
        """
        returns the first element found in the global source or any provided source.\n
        None if no source is provided.\n
        a source can be:\n
        - bs4 >>> BeautifulSoup(html, 'html.parser')
        - url >>> 'http://....'
        - html >>> '<html>....</html' or '<any-tag>...</any-tag>' or ...
        """
        element = BeautifulSoupScrap.get_bs4(source).select_one(css_selector)
        if element and attributes:
            return BeautifulSoupScrap.get_attributes(element)
        return element

    @staticmethod
    def get_elements(css_selector, source=None, attributes=False):
        """
        returns a list of elements found in the global source or any provided source.\n
        [] if no source (bs4-html-url) is provided.\n
        a source can be:\n
        - bs4 >>> BeautifulSoup(html, 'html.parser')
        - url >>> 'http://....'
        - html >>> '<html>....</html' or '<any-tag>...</any-tag>' or ...
        """
        elements = BeautifulSoupScrap.get_bs4(source).select(css_selector)
        if elements and attributes:
            return [BeautifulSoupScrap.get_attributes(e) for e in elements]
        return elements

    @staticmethod
    def save_as_json(filename, elements_list):
        with open(f'{filename}.json', 'w', encoding='utf8') as file:
            file.write(json.dumps(elements_list, indent=2, ensure_ascii=False))

    @staticmethod
    def get_page_source(url):
        """
        returns a page's html content
        """
        return requests.get(url).content


if __name__ == '__main__':
    els = BeautifulSoupScrap.get_elements('a', source='http://www.fallingrain.com/world/LE/')
    # BeautifulSoupScrap.save_as_json('bs4_test', els)
    for el in els:
        print(el)
        print('-----------------------------------')
