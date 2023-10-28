from selenium import webdriver
from urllib.parse import urlparse, urljoin
from collections import deque

from selenium.webdriver.common.by import By


def recursive_scraper(root_url, max_pages):
    visited_links = set()
    links_to_visit = deque()

    # Initialize the WebDriver (Firefox)
    firefox_options = webdriver.FirefoxOptions()

    firefox_options.add_argument('--headless')
    driver = webdriver.Remote(
        command_executor='http://selenium:4444/wd/hub',
        options=firefox_options
    )

    # Remove trailing slashes from the root URL
    root_url = root_url.rstrip('/')

    # Add the root URL to the queue
    links_to_visit.append(root_url)

    while links_to_visit and len(visited_links) < max_pages:
        current_url = links_to_visit.popleft()

        # Check if the URL has already been visited
        if current_url in visited_links:
            continue

        try:
            driver.get(current_url)

            # Print the current URL for observation
            print("Visiting:", current_url)

            # Extract information from the current page here
            # For example, you can use driver.page_source and BeautifulSoup

            # Add the current URL to the visited set
            visited_links.add(current_url)

            # Extract all links on the current page
            sublinks = [a.get_attribute('href') for a in driver.find_elements(By.TAG_NAME, "a")]

            # Filter and enqueue sublinks with the same domain, and without in-page anchors
            for link in sublinks:
                if not link or link.startswith("#"):
                    continue  # Skip empty or in-page anchor links

                # Remove trailing slashes from the link
                link = link.rstrip('/')

                parsed_link = urlparse(link)
                parsed_root_url = urlparse(root_url)

                if parsed_link.netloc == parsed_root_url.netloc:
                    absolute_link = urljoin(root_url, link)

                    # Check if the link is not already visited and is valid
                    if absolute_link not in visited_links and absolute_link not in links_to_visit:
                        print("Found sublink:", absolute_link)
                        links_to_visit.append(absolute_link)

        except Exception as e:
            print(f"Error visiting {current_url}: {str(e)}")

    # Clean up and close the WebDriver
    driver.quit()


# # Example usage
# root_url = 'https://opencopilot.so'
# max_pages = 10
# recursive_scraper(root_url, max_pages)
