import re
import os
from shutil import copy2


def fix_page_urls(page_path, title):
    # read the file
    with open(page_path, 'r') as f:
        index_page = f.read()

        # fix styles ref
        style_link_fix = re.sub(
            r'(href=")(.+?(?:\.css|\.ico))(")',
            r'\g<1>/static/\g<2>\g<3>',
            index_page
        )

        # fix script src
        script_src_fix = re.sub(
            r'(src=")(.+?\.js)(")',
            r'\g<1>/static/\g<2>\g<3>',
            style_link_fix
        )

        title_fix = re.sub(
            r'(<title>.+</title>)',
            rf'<title>{title}</title>',
            script_src_fix
        )

        # load static folder name
        new_content = script_src_fix

    # re-write the file
    with open(page_path, 'w') as f:
        f.write(new_content)


def move_files(angular_dist_path, python_flask_path, app_title):
    # copy static files
    for file in os.listdir(angular_dist_path):
        src = os.path.join(angular_dist_path, file)
        dest = os.path.join(python_flask_path, 'static', file)
        try:
            if os.path.isfile(src):
                copy2(src, dest)
            else:
                copytree(src, dest)
        except Exception as e:
            print(e)

    # move html to templates
    index_page_path_src = os.path.join(python_flask_path, 'static', 'index.html')
    index_page_path_dist = os.path.join(python_flask_path, 'templates', 'index.html')
    os.rename(index_page_path_src, index_page_path_dist)

    # fix the index page links
    fix_page_urls(index_page_path_dist, app_title)


if __name__ == '__main__':
    move_files(
        angular_dist_path='path/to/angular/dist',
        python_flask_path='path/to/flask_root',
        app_title='App Title'
    )
