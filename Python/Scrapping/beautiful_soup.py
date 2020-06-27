from bs4 import BeautifulSoup
import requests
import json


class BeautifulSoupScrap:

    @staticmethod
    def get_page_source(url):
        return requests.get(url).content

    @staticmethod
    def get_bs4_from_html(html):
        return BeautifulSoup(html, 'html.parser')

    @staticmethod
    def get_bs4_from_url(url):
        return BeautifulSoupScrap.get_bs4_from_html(BeautifulSoupScrap.get_page_source(url))

    @staticmethod
    def get_elements_from_bs4(bs4, css_selector, single_element=False):
        elements = bs4.select(css_selector)
        data = []

        if len(elements) == 0:
            return None if single_element else []

        for e in elements:
            data.append({
                **e.attrs,  # all tag attributes
                'text': e.get_text()
            })
        return data[0] if single_element else data

    @staticmethod
    def get_elements_from_url(page_url, css_selector, single_element=False):
        bs4 = BeautifulSoupScrap.get_bs4_from_url(page_url)
        return BeautifulSoupScrap.get_elements_from_bs4(bs4, css_selector, single_element=single_element)

    @staticmethod
    def save_as_json(filename, elements_list):
        with open(f'{filename}.json', 'w', encoding='utf8') as file:
            file.write(json.dumps(elements_list, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    els = BeautifulSoupScrap.get_elements_from_url('http://www.fallingrain.com/world/LE/', 'a')
    BeautifulSoupScrap.save_as_json('bs4_test', els)
    for el in els:
        print(el)
        print('-----------------------------------')
