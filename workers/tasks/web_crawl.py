from celery import shared_task
from selenium import webdriver
from bs4 import BeautifulSoup

from selenium.webdriver.firefox.options import Options

def scrape_website_in_depth(url, depth=1, driver=None):
  """Scrapes a website in depth, recursively following all of the linked pages.

  Args:
    url: The URL of the website to scrape.
    depth: The maximum depth to scrape.
    driver: An optional WebDriver object. If this argument is omitted, a new WebDriver object will be created.

  Returns:
    A list of all of the scraped pages.
  """

  pages = []

  if driver is None:
    options = Options()
    driver = webdriver.Remote(command_executor="http://localhost:4444/wd/hub", options=options)

  # Navigate to the URL to scrape.
  driver.get(url)

  # Get the text of the current page.
  page_source = driver.page_source

  # Parse the HTML of the current page.
  soup = BeautifulSoup(page_source, 'lxml')

  # Extract all of the unique URLs from the current page.
  unique_urls = []
  for link in soup.find_all('a'):
    if link['href'] not in unique_urls:
      unique_urls.append(link['href'])

  # If the depth has not been reached, recursively scrape all of the linked pages.
  if depth > 1:
    for unique_url in unique_urls:
      pages.extend(scrape_website_in_depth(unique_url, depth - 1, driver))

    # call pdf data source endpoint from here
  pages.append(soup.get_text())

  return pages


@shared_task
def web_crawl(url):
    # Implement your web crawling logic here
    return scrape_website_in_depth(url, 15)