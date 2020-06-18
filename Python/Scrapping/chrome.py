from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import time


class ChromeManager:
    def __init__(self, driver_path='chromedriver', headless=False, window_size='1200x600'):
        _options = webdriver.ChromeOptions()
        _options.add_argument(f'window-size={window_size}')
        if headless:
            _options.add_argument('headless')
        self._driver = webdriver.Chrome(driver_path, options=_options)
        print('[INFO] Driver loaded...')

    def _wait_for_element(self, element_value, element_type, timeout):
        try:
            element_present = EC.presence_of_element_located((element_type, element_value))
            WebDriverWait(self._driver, timeout).until(element_present)
            print('[INFO] Page loaded')
            return True

        except TimeoutException:
            print('[INFO] Timed out waiting for page to load')
            return False

    def load_page(self, url, wait_element_value, wait_element_type=By.CSS_SELECTOR, wait_timeout=10):
        self._driver.get(url)
        return self._wait_for_element(wait_element_value, wait_element_type, wait_timeout)

    def get_elements(self, selector):
        return self._driver.find_elements_by_css_selector(selector)

    def click_element(self, selector, sleep_after_click=2):
        try:
            self._driver.find_element_by_css_selector(selector).click()
            print('[INFO] Click...')
            return 1

        except Exception as e:
            print(f'[ERROR]: {e}')
            return 0

        finally:
            if sleep_after_click:
                time.sleep(sleep_after_click)
