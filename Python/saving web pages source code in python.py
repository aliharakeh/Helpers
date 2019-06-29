import requests

""" request a and read its content and return a response object containing its info """
# res = requests.get('https://automatetheboringstuff.com/files/rj.txt')
""" print the res variable type """
# print(type(res))
""" check the status of the request you sent """
# print(res.status_code == requests.codes.ok)
""" get the length of the page content (how many chars in it... i.e how many bytes) """
# print(len(res.text))
""" print first 250 char from the page """
# print(res.text[:250])

"""
    The URL goes to a text web page for the entire play of Romeo and Juliet.
    You can tell that the request for this web page succeeded by checking the status_code attribute of the Response object.
    If it is equal to the value of requests.codes.ok, then everything went fine ❶.
    (Incidentally, the status code for “OK” in the HTTP protocol is 200. You may already be familiar with the 404 status code for “Not Found.”)
    If the request succeeded, the downloaded web page is stored as a string in the Response object’s text variable.
    This variable holds a large string of the entire play; the call to len(res.text) shows you that it is more than 178,000 characters long.
    Finally, calling print(res.text[:250]) displays only the first 250 characters.
"""

""" Checking for errors """
# res = requests.get('http://inventwithpython.com/page_that_does_not_exist')
# try:
#    # raises an exception only if request status is not ok (i.e status code == 200)
#    res.raise_for_status()
# except Exception as exc:
#    print('There was a problem: %s' % (exc))


""" Saving Downloaded Files to the Hard Drive (downloads the source code of any page) """
# res = requests.get('https://automatetheboringstuff.com/files/rj.txt')
# res.raise_for_status()
""" alwayse open a file to write to in write binary mode """
# pageFile = open('RomeoAndJuliet.txt', 'wb')
""" use the res.iter_content(bytes) method to copy content to file, usually 100,000 is a good value to use """
# for chunk in res.iter_content(100000):
#    pageFile.write(chunk)
# pageFile.close()
"""
    To review, here’s the complete process for downloading and saving a file:
    1- Call requests.get() to download the file.
    2- Call open() with 'wb' to create a new file in write binary mode.
    3- Loop over the Response object’s iter_content() method.
    4- Call write() on each iteration to write the content to the file.
    5- Call close() to close the file.
"""

