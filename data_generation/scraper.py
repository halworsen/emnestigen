"""
    scraper.py
"""

import json
import re
import requests
from bs4 import BeautifulSoup as BS

# Thrown by the scraper when it fails to parse the master list of all courses
class CourseListParseError(Exception):
    pass

class CourseScraper:
    """
        Helper class for scraping and storing
        scraped data about the list of all courses
    """

    # Regex for pulling course name and code from some text
    # Very broad, but there's a lot of crazy course names and codes...
    course_regex = r"(.+)\s\((.+)\)"

    # Only matches one code at a time, so it has to be run multiple times
    # Or use findall. Which we do
    course_code_regex = r"([A-Ø]+[0-9-]+)"

    # Regex for grabbing replacement course code numerals, i.e.
    # TDT4200/4205 and the likes
    code_numeral_regex = r"/([0-9-]+)"

    def __init__(self, list_url, course_url_base):
        self.courses_url = list_url
        self.course_url_base = course_url_base

        # Pre-compile the regex patterns
        self.course_pattern = re.compile(self.course_regex)
        self.course_code_pattern = re.compile(self.course_code_regex)
        self.code_numeral_regex = re.compile(self.code_numeral_regex)

        # Dict that maps course codes to more extensive information about the course
        self.course_info = {}

    def get_courses(self):
        """
            :return courses: A list of tuples with a course name and a course code
        """

        return self.courses

    def get_course_info(self, course_code):
        """
            :return info: A dictionary of information about the given course
        """

        return self.course_info[course_code]

    def scrape_course_list(self):
        """
            Scrapes the course list and populates the courses list
        """

        try:
            # Get the page with the list of all courses
            response = requests.get(self.courses_url)
            response.raise_for_status()

            soup = BS(response.text, "html.parser")

            # Look for the unordered list of all courses
            tag = soup.find("ul", class_="allCourses")
            # Get all the links to the course pages
            links = tag.find_all("a")

            for link in links:
                # Extract the text, parse it and store it in our list of courses
                course_text = link.text

                match = self.course_pattern.match(course_text)
                # Shouldn't fail. If it did, our regex is bad or the parsing was bad
                if not match:
                    raise CourseListParseError(f"course name parsing failed for: {course_text}")

                # Add a basic entry to the course info with the course's name
                course_name = match.group(1)
                course_code = match.group(2)
                self.course_info[course_code] = {"name": course_name}

        except Exception as err:
            # We just want to catch the exception to indicate non-success
            # not to suppress the exception. So raise it again
            raise err

    def mentioned_courses(self, text, ignored_codes=[]):
        """
            Goes through the text and looks for course codes

            :param text: The text to search in
            :param course_code: A list of course codes to ignore when looking for codes
            :return codes: A list of all course codes mentioned in the text
        """

        # Try to find course codes in the required knowledge section
        # Checks if each matched course code is in our list of course codes
        # If it isn't we assume it's an error
        courses = [
            c for c in self.course_code_pattern.findall(text)
            if not c in ignored_codes and c in self.course_info
        ]
        # Split by the course codes we found
        split_text = self.course_code_pattern.split(text)

        base_code = ""
        for blurb in split_text:
            # If we encounter a code that was captured by our "normal" regex...
            if blurb in courses:
                base_code = blurb
                continue

            # The next blurb should begin on a /
            # We only look for codes before the next space
            first_word = blurb.split(" ")[0]
            if not first_word:
                continue

            if base_code and first_word[0] == "/":
                # Find all numerals directly after slashes
                matches = self.code_numeral_regex.findall(first_word)
                # ??? how
                if not matches:
                    continue

                # For each numeral, we slice out the last part of the code and insert the
                # numeral found after the slash
                for code_numeral in matches:
                    courses.append(f"{base_code[:-len(code_numeral)]}{code_numeral}")

                base_code = ""

        return courses

    def mentioned_courses_by_name(self, text, ignored_codes=[]):
        """
            Goes through the text and looks for courses by name

            :return codes: A list of all course codes mentioned by course name in the text
        """

        # Now try to match against names to catch the courses that weren't mentioned by code
        # Keep it in a separate list because there are separate courses with the same name
        # So this is uncertain
        courses = []
        for code, info in self.course_info.items():
            # Make sure the course wasn't already found by searching for course codes
            if info["name"] in text and not code in ignored_codes:
                courses.append(code)

        return courses

    def scrape_course(self, course_code):
        """
            Scrapes the course's info page and constructs a course object
            based on the information found there

            :param course_code: The course code for the course to scrape info about
        """

        try:
            response = requests.get(f'{self.course_url_base}{course_code}', timeout=5)
            response.raise_for_status()

            soup = BS(response.text, "html.parser")

            course_info = self.course_info[course_code] if course_code in self.course_info else {}

            # Find what knowledge is REQUIRED
            required_knowledge = soup.find("p", "content-required-knowledge")
            if required_knowledge:
                blurb = required_knowledge.text.replace("\n", " ")
                course_info["required_knowledge"] = blurb

                required_courses = self.mentioned_courses(blurb, [course_code])
                course_info["required_courses"] = required_courses

                course_info["required_courses_uncertain"] = self.mentioned_courses_by_name(blurb, required_courses)

            # Find what knowledge is recommended
            recommended_knowledge = soup.find("p", "content-recommended-knowledge")
            if recommended_knowledge:
                blurb = recommended_knowledge.text.replace("\n", " ")
                course_info["recommended_knowledge"] = blurb

                recommended_courses = self.mentioned_courses(blurb, [course_code])
                course_info["recommended_courses"] = recommended_courses

                course_info["recommended_courses_uncertain"] = self.mentioned_courses_by_name(blurb, recommended_courses)

            self.course_info[course_code] = course_info

        except Exception as err:
            # For timeouts, keep retrying
            if isinstance(err, requests.Timeout):
                print("Request timed out, retrying...")
                self.scrape_course(course_code)

                return

            # Same story as in the course list scraper
            raise err

    def dump_data(self, file_name):
        """
            Retrieves the list of all courses and scrapes
            each course for extended information

            Then it dumps it all as a JSON file in the given filename

            :param filename: The name of the file to store the scraped data in
        """

        # First, fetch a list of all courses
        print("Scraping course list...")
        self.scrape_course_list()
        print(f"Successfully fetched {len(self.course_info)} courses.")
        print("Scraping information about each course, this will take a while...")

        # Now scrape info from every single course
        progress = 0
        goal = len(self.course_info)
        for code in self.course_info.keys():
            progress += 1
            print(f"Scraping info about {code} in ({round((progress / goal) * 100, 1)}%)")
            self.scrape_course(code)

        # Store the scraped data in a JSON file
        with open(file_name, "w") as file:
            json.dump(self.course_info, file)

if __name__ == "__main__":
    cs = CourseScraper("https://www.ntnu.no/studier/emnesok/-/course_list/listall", "https://www.ntnu.no/studier/emner/")
    cs.dump_data("course_data.json")
