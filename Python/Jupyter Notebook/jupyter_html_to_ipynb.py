import json
from Scrapping.beautiful_soup import BeautifulSoupScrap as BSC

"""
    from Scrapping.beautiful_soup import BeautifulSoupScrap as BSC
    This is the BeautifulSoup Helper Class that I wrote, yuo can find it on my github repo Helper/Python/Scrapping
"""


def get_data(html):
    cells = BSC.get_elements('div.inner_cell > div', source=html, attributes=True)

    notebook = {
        'nbformat': 4,
        'nbformat_minor': 2,
        'cells': [],
        'metadata': {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            }
        }
    }

    for cell in cells:
        cell_type = 'markdown' if 'rendered_html' in cell['class'] else 'code'
        nb_cell = {
            'metadata': {},
            'source': [cell['text']],
            'cell_type': cell_type
        }
        if cell_type == 'code':
            nb_cell['outputs'] = []
            nb_cell['execution_count'] = None

        notebook['cells'].append(nb_cell)
    return notebook


if __name__ == '__main__':
    with open('D:\\Desktop\GitHub\\Helpers\\Python\\Pandas\Pandas_Introduction.html', 'r') as f:
        html = f.read()

    notebook = get_data(html)

    # print(notebook['cells'])

    with open('Python_MANOVA.ipynb', 'w') as jynotebook:
        jynotebook.write(json.dumps(notebook))
