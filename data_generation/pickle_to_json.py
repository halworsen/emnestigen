import json
import pickle
import sys

if __name__ == "__main__":
    data = None
    with open("course_data.p", "rb") as file:
        data = pickle.load(file)

    print(sys.argv[1][:-2])
    with open("{}.json".format(sys.argv[1][:-2]), "w+") as file:
        json.dump(data, file)
