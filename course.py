"""
    course.py
"""

class Course:
    """
        Represents a NTNU course
    """

    def __init__(self, name, code):
        self.name = name
        self.code = code
        self.req_knowledge = ""
        self.rec_knowledge = ""

        # A list of other course objects which are required in order to take this course
        self.required_courses = []
        self.required_courses_uncertain = []

        # A list of other course objects which are recommended to have taken before this course
        self.recommended_courses = []
        self.recommended_courses_uncertain = []

    def __str__(self):
        return f"{self.code} - {self.name}"

    def set_required_knowledge(self, req_knowledge):
        self.req_knowledge = req_knowledge

    def set_recommended_knowledge(self, rec_knowledge):
        self.rec_knowledge = rec_knowledge

    def add_required_course(self, course, uncertain=False):
        if not isinstance(course, Course):
            raise ValueError("expected a Course object")

        if uncertain:
            self.required_courses_uncertain.append(course)
        else:
            self.required_courses.append(course)

    def add_recommended_course(self, course, uncertain=False):
        if not isinstance(course, Course):
            raise ValueError("expected a Course object")

        if uncertain:
            self.recommended_courses_uncertain.append(course)
        else:
            self.recommended_courses.append(course)
