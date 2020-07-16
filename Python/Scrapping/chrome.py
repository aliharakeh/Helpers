from selenium import webdriver
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import time


class ChromeManager:
    def __init__(self, driver_path, headless=False, window_size='1200x600'):
        _options = webdriver.ChromeOptions()
        _options.add_argument(f'window-size={window_size}')
        if headless:
            _options.add_argument('headless')
        self._driver = webdriver.Chrome(driver_path, options=_options)
        print('[INFO] Driver loaded!')

    def _wait_for_element(self, element_value, element_type, timeout):
        try:
            element_present = EC.presence_of_element_located((element_type, element_value))
            WebDriverWait(self._driver, timeout).until(element_present)
            print('[INFO] Page loaded!')
            return True

        except TimeoutException:
            print('[INFO] Timed out waiting for page to load!')
            return False

    def load_page(self, url, wait_element_selector='body', wait_element_type=By.CSS_SELECTOR, wait_timeout=10,
                  max_tries=5):
        self._driver.get(url)
        try_count = 0
        page_loaded = False
        while try_count < max_tries:
            page_loaded = self._wait_for_element(wait_element_selector, wait_element_type, wait_timeout)
            if page_loaded:
                return page_loaded
            try_count += 1
        return page_loaded

    def get_elements(self, css_selector):
        return self._driver.find_elements_by_css_selector(css_selector)

    def get_element(self, css_selector):
        try:
            return self._driver.find_element_by_css_selector(css_selector)
        except NoSuchElementException:
            return None

    def click_element(self, selector, delay_after_click=2):
        try:
            self._driver.find_element_by_css_selector(selector).click()
            print('[INFO] Click!')
            return 1

        except Exception as e:
            print(f'[ERROR]: {e}!')
            return 0

        finally:
            if delay_after_click:
                time.sleep(delay_after_click)

    def scroll_page(self, scroll_count=10, scroll_till_end=False, scroll_delay_sec=3, external_func=False):
        """
        external_func=True example:
        --------------------------
        for _ in self._cm.scroll_page(scroll_till_end=True, external_func=True):
            elements = self._cm.get_elements('div')
            ...

        OR
        ==

        for _ in self._cm.scroll_page(scroll_count=5, external_func=True):
            elements = self._cm.get_elements('div')
            ...
        """

        def _scroll_generator():
            # define initial page height for 'while' loop
            last_height = self._driver.execute_script("return document.body.scrollHeight")
            scrolls = 0
            is_end_reached = False

            while True:

                # apply scroll function if available
                if external_func:
                    print('Running External Code...')
                    yield is_end_reached

                # scroll page
                self._driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

                # define how many seconds to wait while dynamic page content loads
                time.sleep(scroll_delay_sec)

                # increment scroll count
                scrolls += 1

                # get new height
                new_height = self._driver.execute_script("return document.body.scrollHeight")

                # stop conditions
                is_end_reached = new_height == last_height
                is_scroll_count_reached = scrolls == scroll_count
                stop_condition = is_end_reached if scroll_till_end else (is_scroll_count_reached or is_end_reached)
                if stop_condition:
                    break
                else:
                    last_height = new_height

            yield is_end_reached

        if external_func:
            return _scroll_generator()
        else:
            return next(_scroll_generator())

    def get_page_source(self):
        return self._driver.page_source

    def set_value(self, selector, value):
        element = self.get_element(selector)
        if element:
            element.clear()
            element.send_keys(value)

    def get_value(self, selector):
        e = self.get_element(selector)
        if e:
            return e.text
        return None

    def close(self):
        self._driver.close()
