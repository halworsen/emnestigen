"""
    scraper.py
"""

import pickle
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
    course_regex = r'(.+)\s\((.+)\)'

    # Only matches one code at a time, so it has to be run multiple times
    # Or use findall. Which we do
    course_code_regex = r'[A-Ø]+[0-9-/]+'

    def __init__(self, list_url, course_url_base):
        self.courses_url = list_url
        self.course_url_base = course_url_base

        # Pre-compile the regex patterns
        self.course_pattern = re.compile(self.course_regex)
        self.course_code_pattern = re.compile(self.course_code_regex)

        # List of tuples of the form (coursename, coursecode)
        self.courses = []
        # List of ONLY course codes
        self.course_codes = []

        # Dict that maps course codes to more extensive information about the course
        self.course_infos = {}

    def get_courses(self):
        """
            :return courses: A list of tuples with a course name and a course code
        """

        return self.courses

    def get_course_info(self, course_code):
        """
            :return info: A dictionary of information about the given course
        """

        return self.course_infos[course_code]

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

                # Add a tuple with the course info to the list of courses
                self.courses.append((match.group(1), match.group(2)))
                self.course_codes.append(match.group(2))

        except Exception as err:
            # We just want to catch the exception to indicate non-success
            # not to suppress the exception. So raise it again
            raise err

    def scrape_course(self, course_code):
        """
            Scrapes the course's info page and constructs a course object
            based on the information found there

            :param course_code: The course code for the course to scrape info about
        """

        try:
            response = requests.get(f'{self.course_url_base}{course_code}')
            response.raise_for_status()

            soup = BS(response.text, "html.parser")

            course_info = {}

            # Find what knowledge is REQUIRED
            required_knowledge = soup.find("p", "content-required-knowledge")
            if required_knowledge:
                course_info["required_knowledge"] = required_knowledge.text

                # Try to find course codes in the required knowledge section
                # We do some checks if each matched course code is in our list of course codes
                # If it isn't we assume it's an error

                # / and whitespace are trimmed off the end
                required_courses = [
                    c.strip("/ ") for c in self.course_code_pattern.findall(required_knowledge.text)
                    if c.strip("/ ") != course_code and c.strip("/ ") in self.course_codes
                ]

                course_info["required_courses"] = required_courses

                # Now try to match against names to catch the courses that weren't mentioned by code
                # Keep it in a separate list because there are separate courses with the same name
                # So this is uncertain
                required_courses_uncertain = []
                for course in self.courses:
                    # Make sure the course wasn't already found by searching for course codes
                    if course[0] in required_knowledge.text and not course[1] in required_courses:
                        required_courses_uncertain.append(course[1])
                course_info["required_courses_uncertain"] = required_courses_uncertain

            # Find what knowledge is recommended
            recommended_knowledge = soup.find("p", "content-recommended-knowledge")
            if recommended_knowledge:
                course_info["recommended_knowledge"] = recommended_knowledge.text

                # Same as above but for recommended knowledge
                recommended_courses = [
                    c.strip("/ ") for c in self.course_code_pattern.findall(recommended_knowledge.text)
                    if c.strip("/ ") != course_code and c.strip("/ ") in self.course_codes
                ]

                course_info["recommended_courses"] = recommended_courses

                recommended_courses_uncertain = []
                for course in self.courses:
                    # Make sure the course wasn't already found by searching for course codes
                    if course[0] in recommended_knowledge.text and not course[1] in recommended_courses:
                        recommended_courses_uncertain.append(course[1])
                course_info["recommended_courses_uncertain"] = recommended_courses_uncertain

            self.course_infos[course_code] = course_info

        except Exception as err:
            # Same story as in the course list scraper
            raise err

    def get_info(self):
        """
            Retrieves the list of all courses and scrapes
            each course for extended information
        """

        # First, fetch a list of all courses
        self.scrape_course_list()
        print(f"Successfully fetched {len(self.courses)} courses.")
        print("Scraping information about each course, this will take a while...")

        # Now scrape info from every single course
        progress = 0
        goal = len(self.courses)
        for course in self.courses:
            progress += 1
            print(f"Scraping info about {course[1]} ({round((progress / goal) * 100, 1)}%)")

            self.scrape_course(course[1])
            self.course_infos[course[1]]["name"] = course[0]

        # Store the scraped data in a pickled file
        with open("course_data.p", "wb") as file:
            pickle.dump(self.course_infos, file)

if __name__ == "__main__":
    cs = CourseScraper("https://www.ntnu.no/studier/emnesok/-/course_list/listall", "https://www.ntnu.no/studier/emner/")
    cs.get_info()
