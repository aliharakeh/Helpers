from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.remote.webelement import WebElement
from twitter_config import TWEET
import re


def _get_attribute(tweet_element: WebElement, selector, attribute_name):
    try:
        e = tweet_element.find_element_by_css_selector(selector)
        return e.get_attribute(attribute_name) if attribute_name != 'text' else e.text
    except NoSuchElementException:
        return None


def parse_tweet(tweet_element, dict_=True):
    tweet_text = _get_attribute(tweet_element, TWEET['text'], 'text')

    tweet_tags = []
    if tweet_text:
        tags = re.findall(TWEET['tags'], tweet_text)
        tweet_tags = list({tag for tag in tags})

    data = {
        'username': _get_attribute(tweet_element, TWEET['username'], 'text'),
        # 'user-link': _get_attribute(tweet_element, TWEET['user-link'], 'href'),
        'time': _get_attribute(tweet_element, TWEET['time'], 'text'),
        'text': tweet_text,
        'tags': tweet_tags,
        # 'innerHTML': tweet_element.get_attribute('innerHTML')
    }
    if dict_:
        return data
    return list(data.values())
