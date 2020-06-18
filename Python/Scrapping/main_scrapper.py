from Scrapping.chrome import ChromeManager


class ScrappingFunctions:
    def __init__(self):
        self.sites_index = {
            'readlightnovel': self.read_light_novel_latest_chapters,
            'wuxiaworld': self.wuxia_world_latest_chapters
        }
        
    def get_latest_chapter(self, site_key, elements):
        return self.sites_index[site_key](elements)

    def read_light_novel_latest_chapters(self, elements):
        if len(elements) > 0:
            return elements[0].get_attribute('innerText').replace('Chapter: ', '')
        else:
            return None

    def wuxia_world_latest_chapters(self, elements):
        if len(elements) > 0:
            return elements[-1].get_attribute('innerText').replace('Chapter ', '').strip()
        else:
            return None


class ScrappingFactory:
    chrome_manager = None
    scrapping_sites = {
        'readlightnovel': {
            'css_selector': '.novel .novel-right .novel-details .novel-detail-item:nth-child(7) ul li:nth-child(1)',
            'element_to_wait_for': '.loaded'
        },
        'wuxiaworld': {
            'css_selector': '#chapters .panel:last-child .row:last-child a',
            'element_to_wait_for': '#chapters'
        }
    }
    scrapping_functions = None

    def __init__(self, driver_path='./chromedriver', headless=True):
        self.chrome_manager = ChromeManager(driver_path=driver_path, headless=headless)
        self.scrapping_functions = ScrappingFunctions()

    def get_novel_latest_chapter(self, novel_url):
        sites = list(self.scrapping_sites.keys())
        for site in sites:
            if site in novel_url:
                self.chrome_manager.load_page(novel_url, self.scrapping_sites[site]['element_to_wait_for'])
                elements = self.chrome_manager.get_elements(self.scrapping_sites[site]['css_selector'])
                latest_chapter = self.scrapping_functions.get_latest_chapter(site, elements)
                return latest_chapter

