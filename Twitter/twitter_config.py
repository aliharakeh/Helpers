CHROME_DRIVER = 'D:\\Desktop\\GitHub\\M2-Project\\Scrapping\\chromedriver.exe'

TWITTER_USER = {
    'display-name': 'div#react-root div.css-1dbjc4n.r-1g94qm0 > div > div > div.css-1dbjc4n.r-1awozwy.r-18u37iz.r-dnmrzs > div > span:nth-child(1) > span',
    'username': 'div#react-root div.css-1dbjc4n.r-1g94qm0 > div > div > div.css-1dbjc4n.r-18u37iz.r-1wbh5a2 > div > span',
    'description': 'div#react-root div:nth-child(3) > div > div > span',
    'joined': 'div#react-root div:nth-child(4) > div > span:nth-child(2)',
    'following': 'div#react-root div.css-1dbjc4n.r-1mf7evn > a > span.css-901oao.css-16my406.r-1qd0xha.r-vw2c0b.r-ad9z0x.r-bcqeeo.r-qvutc0 > span',
    'followers': 'div#react-root div:nth-child(2) > a > span.css-901oao.css-16my406.r-1qd0xha.r-vw2c0b.r-ad9z0x.r-bcqeeo.r-qvutc0 > span',
    'place': 'div#react-root div:nth-child(4) > div > span:nth-child(1) > span > span'
}

TWEETS = {
    'css-selector': 'article',
}

TWEET = {
    'tags': r'(#\w+)',
    'username': 'div > div > div > div.css-1dbjc4n.r-18u37iz > div.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1mi0q7o > div:nth-child(1) > div > div > div.css-1dbjc4n.r-1d09ksm.r-18u37iz.r-1wbh5a2 > div.css-1dbjc4n.r-1wbh5a2.r-dnmrzs > a > div > div.css-1dbjc4n.r-18u37iz.r-1wbh5a2.r-1f6r7vd > div > span',
    'user-link': 'div > div > div > div.css-1dbjc4n.r-18u37iz > div.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1mi0q7o > div:nth-child(1) > div > div > div.css-1dbjc4n.r-1d09ksm.r-18u37iz.r-1wbh5a2 > div.css-1dbjc4n.r-1wbh5a2.r-dnmrzs > a',
    'time': 'div > div > div > div.css-1dbjc4n.r-18u37iz > div.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1mi0q7o > div:nth-child(1) > div > div > div.css-1dbjc4n.r-1d09ksm.r-18u37iz.r-1wbh5a2 > a > time',
    'text': 'div > div > div > div.css-1dbjc4n.r-18u37iz > div.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1mi0q7o > div:nth-child(2) > div:nth-child(1)'
}

PROBLEM_CHARS = r'[\[=\+/&<>;:!\\|*^\'"\?%$@)(_\,\.\t\r\n0-9-—\]]'

CITIES_JSON = 'D:\\Desktop\\GitHub\\M2-Project\\Locations\\cities.json'
CITIES_DETAILS_JSON = 'D:\\Desktop\\GitHub\\M2-Project\\Locations\\cities_details.json'
