from Scrapping.chrome import ChromeManager
from twitter_config import TWEETS, TWITTER_USER
from Twitter.tweet_parsing import parse_tweet
import json
import csv
from pprint import pprint


class TwitterScrapper:
    def __init__(self, chrome_manager=None, headless=False):
        self._cm: ChromeManager = chrome_manager if chrome_manager else ChromeManager(headless=headless)
        self._page_loaded = False
        self.twitter_page = None
        self.tweets = {}

    def load_page(self, twitter_page, max_tries=3, timeout=5):
        self.twitter_page = twitter_page
        self._page_loaded = self._cm.load_page(
            self.twitter_page,
            wait_timeout=timeout,
            max_tries=max_tries,
            wait_element_selector=TWEETS['css-selector']
        )

    def __save_tweet(self, tweet):
        """
        Tweet Details Choices:
        ---------------------
            - TweetParser.parse_tweet(tweet)
            - tweet.text
            - tweet.get_attribute('innerHTML')
            - tweet.get_attribute('outerHTML')
        * Note: Can be overridden when used in inheritance
        """
        details = parse_tweet(tweet)
        key = f'{details["username"]}_{details["time"]}'
        if key == 'None_None':
            key = f'{len(self.tweets)}_{key}'
        self.tweets[key] = details

    def get_some_tweets(self, tweets_count=100):
        if self._page_loaded:
            current_tweets_count = 0
            end_reached = False
            while current_tweets_count < tweets_count or end_reached:
                end_reached = self._cm.scroll_page(scroll_count=1)
                tweets = self._cm.get_elements(TWEETS['css-selector'])
                for tweet in tweets:
                    self.__save_tweet(tweet)
                    current_tweets_count += 1
                    if current_tweets_count == tweets_count:
                        break

    def get_all_tweets(self):
        if self._page_loaded:
            for _ in self._cm.scroll_page(scroll_till_end=True, external_func=True, scroll_delay_sec=5):
                tweets = self._cm.get_elements(TWEETS['css-selector'])
                for tweet in tweets:
                    self.__save_tweet(tweet)
                print(f'[INFO] Tweets = {len(self.tweets)}')

    def get_user_details(self, username):
        self.load_page(f'https://twitter.com/{username}')
        return {
            'username': self._cm.get_text(TWITTER_USER['username']),
            'display-name': self._cm.get_text(TWITTER_USER['display-name']),
            'description': self._cm.get_text(TWITTER_USER['description']),
            'joined': self._cm.get_text(TWITTER_USER['joined']),
            'following': self._cm.get_text(TWITTER_USER['following']),
            'followers': self._cm.get_text(TWITTER_USER['followers']),
            'place': self._cm.get_text(TWITTER_USER['place'])
        }

    def get_tweets(self, as_dict=False):
        if as_dict:
            return self.tweets
        return [list(tweet.values()) for tweet in self.tweets.values()]

    def display_tweets(self):
        tweets = self.tweets.values()
        for index, tweet in enumerate(tweets):
            print(f'[Tweet {index}]')
            print(tweet)

    def save_as_json(self, filename):
        with open(f'{filename}.json', 'w', encoding='utf-8') as file:
            file.write(json.dumps(self.tweets, indent=2, ensure_ascii=False))

    def save_as_csv(self, filename):
        with open(f'{filename}.csv', 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            keys = ['username', 'time', 'text', 'tags']
            writer.writerow(keys)
            for key, details in self.tweets.items():
                data = [details[k] for k in keys]
                writer.writerow(data)

    def __del__(self):
        try:
            self._cm.close()
        except:
            pass


if __name__ == '__main__':
    ts = TwitterScrapper()
    users = ['KingNothing313', 'lebanesebuddha']
    for user in users:
        pprint(ts.get_user_details(user))
