"""
    create_courses.py
"""

import pickle
from course import Course

def create_courses(file_name):
    """
        Turns the given pickled file into course objects

        :param file_name: The file name containing all the course data
    """

    course_data = None
    with open(file_name, "rb") as file:
        course_data = pickle.load(file)

    # Store the course objects in a dict for ease of access
    all_courses = {}
    # First, create all the objects
    for code, info in course_data.items():
        course = Course(info["name"], code)
        all_courses[code] = course

    # Now establish the requirements and recommendations between all courses
    # We also set the "raw" requirement blurbs here
    for code, info in course_data.items():
        course = all_courses[code]

        if "required_knowledge" in info:
            course.set_required_knowledge(info["required_knowledge"])
        if "recommended_knowledge" in info:
            course.set_recommended_knowledge(info["recommended_knowledge"])

        if "required_courses" in info:
            for req_code in info["required_courses"]:
                req_course = all_courses[req_code]
                if not req_course:
                    raise ValueError(f"course list didn't contain {req_code}")

                course.add_required_course(req_course)

        if "required_courses_uncertain" in info:
            for req_code in info["required_courses_uncertain"]:
                req_course = all_courses[req_code]
                if not req_course:
                    raise ValueError(f"course list didn't contain {req_code}")

                course.add_required_course(req_course, True)

        if "recommended_courses" in info:
            for rec_code in info["recommended_courses"]:
                rec_course = all_courses[rec_code]
                if not rec_course:
                    raise ValueError(f"course list didn't contain {rec_code}")

                course.add_recommended_course(rec_course)

        if "recommended_courses_uncertain" in info:
            for rec_code in info["recommended_courses_uncertain"]:
                rec_course = all_courses[rec_code]
                if not rec_course:
                    raise ValueError(f"course list didn't contain {rec_code}")

                course.add_recommended_course(rec_course, True)

    return all_courses
